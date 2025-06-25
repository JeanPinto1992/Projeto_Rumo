import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient.js'
import './styles/dashboard-home.css'

export default function DashboardHome({ selectedMonth, selectedYear, viewMode }) {
  const [stats, setStats] = useState({})
  const [previousStats, setPreviousStats] = useState({})
  const [comparativeData, setComparativeData] = useState({})
  // Estados de loading removidos - carregamento silencioso
  const [scrollContainer, setScrollContainer] = useState(null)

  // Carregamento imediato sem debounce para experiência instantânea
  useEffect(() => {
    loadDashboardData()
  }, [selectedMonth, selectedYear, viewMode])

  const loadDashboardData = async () => {
    // Carregamento instantâneo sem delay
    try {
      const tables = ['administrativo', 'almoxarifado', 'faturamento', 'impostos', 'logistica', 'manutencao', 'rh_gastos_gerais', 'rh_custos_totais', 'rh_passivo_trabalhista']
      const newStats = {}
      const newPreviousStats = {}

      // Determinar período anterior para comparação
      let previousMonth, previousYear
      if (viewMode === 'yearly') {
        previousYear = selectedYear - 1
      } else {
        if (selectedMonth === 1) {
          previousMonth = 12
          previousYear = selectedYear - 1
        } else {
          previousMonth = selectedMonth - 1
          previousYear = selectedYear
        }
      }

      // Função para detectar último mês com dados no ano atual
      const detectLastMonthWithData = async (year) => {
        const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        
        // Verificar mês a mês de dezembro para janeiro
        for (let i = 11; i >= 0; i--) {
          const monthColumn = monthNames[i]
          
          // Verificar se existe algum dado neste mês em qualquer tabela
          for (const table of tables) {
            try {
              // Selecionar categoria apenas se a tabela for faturamento
              const selectColumns = table === 'faturamento' ? `${monthColumn}, categoria` : monthColumn
              
              let { data, error } = await supabase
                .from(table)
                .select(selectColumns)
                .eq('ano', year)
                .not(monthColumn, 'is', null)
                .gt(monthColumn, 0)
                .limit(1)

              if (error) {
                continue // Pula esta tabela se houver erro
              }

              // Para faturamento, aplicar o mesmo filtro usado nos cálculos principais
              if (table === 'faturamento' && data && data.length > 0) {
                const faturamentoData = data.filter(item => 
                  item.categoria && item.categoria.toUpperCase() === 'FATURAMENTO'
                )
                if (faturamentoData.length > 0) {
                  return i + 1 // Retorna 1-12 (janeiro = 1, dezembro = 12)
                }
              } else if (data && data.length > 0) {
                return i + 1 // Retorna 1-12 (janeiro = 1, dezembro = 12)
              }
            } catch (err) {
              // Continua para próxima tabela se houver erro
              continue
            }
          }
        }
        return 12 // Default para dezembro se não encontrar dados
      }

            // Detectar último mês com dados (apenas para comparação anual)
      // OTIMIZAÇÃO: Usar valor cached ou padrão para 2025 para acelerar
      let lastMonthWithData = 12
      if (viewMode === 'yearly' && selectedYear === 2025) {
        // Para 2025, usar mês atual como aproximação rápida
        const currentMonth = new Date().getMonth() + 1
        lastMonthWithData = currentMonth <= 12 ? currentMonth : 12
      } else if (viewMode === 'yearly' && selectedYear > 2025) {
        lastMonthWithData = await detectLastMonthWithData(selectedYear)
      }

      for (const table of tables) {
        try {
          if (viewMode === 'yearly') {
            // Carregar dados de todo o ano (soma de todos os meses)
            let { data, error } = await supabase
              .from(table)
              .select('Janeiro, Fevereiro, Marco, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro, ano, categoria')
              .eq('ano', selectedYear)

            // Para faturamento, filtrar apenas linhas "FATURAMENTO"
            if (table === 'faturamento' && data) {
              const faturamentoData = data.filter(item => 
                item.categoria && item.categoria.toUpperCase() === 'FATURAMENTO'
              )
              // Se não houver dados com categoria 'FATURAMENTO', usar todos os dados
              data = faturamentoData.length > 0 ? faturamentoData : data
            }

            if (error) {
              console.warn(`Erro ao carregar ${table}:`, error)
              newStats[table] = { total: 0, count: 0 }
            } else {
              const total = data.reduce((sum, item) => {
                // Para comparação anual justa, usar apenas meses até lastMonthWithData
                const allMonths = [
                  item.Janeiro, item.Fevereiro, item.Marco, item.Abril,
                  item.Maio, item.Junho, item.Julho, item.Agosto,
                  item.Setembro, item.Outubro, item.Novembro, item.Dezembro
                ]
                
                // Se é comparação anual e ano > 2024, usar apenas até lastMonthWithData
                const monthsToSum = (selectedYear > 2024) ? allMonths.slice(0, lastMonthWithData) : allMonths
                const monthlyTotal = monthsToSum.reduce((monthSum, monthValue) => monthSum + (parseFloat(monthValue) || 0), 0)
                
                return sum + monthlyTotal
              }, 0)
              
              newStats[table] = {
                total,
                count: data.length
              }
            }

            // Carregar dados do ano anterior para comparação (se não for 2024)
            if (selectedYear > 2024) {
              let { data: prevData, error: prevError } = await supabase
                .from(table)
                .select('Janeiro, Fevereiro, Marco, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro, ano, categoria')
                .eq('ano', previousYear)

              // Para faturamento, filtrar apenas linhas "FATURAMENTO"
              if (table === 'faturamento' && prevData) {
                const faturamentoData = prevData.filter(item => 
                  item.categoria && item.categoria.toUpperCase() === 'FATURAMENTO'
                )
                // Se não houver dados com categoria 'FATURAMENTO', usar todos os dados
                prevData = faturamentoData.length > 0 ? faturamentoData : prevData
              }

              if (!prevError && prevData) {
                const prevTotal = prevData.reduce((sum, item) => {
                  // Usar apenas os meses até lastMonthWithData para comparação justa
                  const monthsToCompare = [
                    item.Janeiro, item.Fevereiro, item.Marco, item.Abril,
                    item.Maio, item.Junho, item.Julho, item.Agosto,
                    item.Setembro, item.Outubro, item.Novembro, item.Dezembro
                  ].slice(0, lastMonthWithData)
                  
                  const monthlyTotal = monthsToCompare.reduce((monthSum, monthValue) => monthSum + (parseFloat(monthValue) || 0), 0)
                  return sum + monthlyTotal
                }, 0)
                
                newPreviousStats[table] = { total: prevTotal, count: prevData.length }
              }
            }
          } else {
            // Carregar dados de um mês específico
            const monthNames = {
              1: 'Janeiro', 2: 'Fevereiro', 3: 'Marco', 4: 'Abril', 
              5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
              9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
            }
            
            const monthColumn = monthNames[selectedMonth]

            let { data, error } = await supabase
              .from(table)
              .select(`${monthColumn}, ano, categoria`)
              .eq('ano', selectedYear)
              .not(monthColumn, 'is', null)

            // Para faturamento, filtrar apenas linhas "FATURAMENTO"
            if (table === 'faturamento' && data) {
              const faturamentoData = data.filter(item => 
                item.categoria && item.categoria.toUpperCase() === 'FATURAMENTO'
              )
              // Se não houver dados com categoria 'FATURAMENTO', usar todos os dados
              data = faturamentoData.length > 0 ? faturamentoData : data
            }

            if (error) {
              console.warn(`Erro ao carregar ${table}:`, error)
              newStats[table] = { total: 0, count: 0 }
            } else {
              const total = data.reduce((sum, item) => sum + (parseFloat(item[monthColumn]) || 0), 0)
              newStats[table] = {
                total,
                count: data.length
              }
            }

            // Carregar dados do mês anterior para comparação
            if (selectedMonth > 1 || (selectedMonth === 1 && selectedYear > 2024)) {
              const prevMonthColumn = monthNames[previousMonth]
              let { data: prevData, error: prevError } = await supabase
                .from(table)
                .select(`${prevMonthColumn}, ano, categoria`)
                .eq('ano', previousYear)
                .not(prevMonthColumn, 'is', null)

              // Para faturamento, filtrar apenas linhas "FATURAMENTO"
              if (table === 'faturamento' && prevData) {
                const faturamentoData = prevData.filter(item => 
                  item.categoria && item.categoria.toUpperCase() === 'FATURAMENTO'
                )
                // Se não houver dados com categoria 'FATURAMENTO', usar todos os dados
                prevData = faturamentoData.length > 0 ? faturamentoData : prevData
              }

              if (!prevError && prevData) {
                const prevTotal = prevData.reduce((sum, item) => sum + (parseFloat(item[prevMonthColumn]) || 0), 0)
                newPreviousStats[table] = { total: prevTotal, count: prevData.length }
              }
            }
          }
        } catch (err) {
          console.warn(`Erro ao processar ${table}:`, err)
          newStats[table] = { total: 0, count: 0 }
        }
      }

      setStats(newStats)
      setPreviousStats(newPreviousStats)
      
      // Calcular dados comparativos
      const newComparativeData = {}
      Object.keys(newStats).forEach(key => {
        if (newPreviousStats[key]) {
          const current = newStats[key].total
          const previous = newPreviousStats[key].total
          if (previous > 0) {
            const percentChange = ((current - previous) / previous) * 100
            newComparativeData[key] = {
              percentChange: percentChange,
              isIncrease: current > previous,
              lastMonthWithData: lastMonthWithData // Armazenar para uso na exibição
            }
          }
        }
      })
      setComparativeData(newComparativeData)

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    }
    // Loading removido - carregamento silencioso em background
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (comparative, small = false) => {
    if (!comparative) return null
    
    const { percentChange, isIncrease } = comparative
    const sign = isIncrease ? '+' : ''
    const color = isIncrease ? '#16a34a' : '#dc2626' // Verde ou vermelho
    const icon = isIncrease ? '↑' : '↓'
    
    return (
      <span style={{ 
        color, 
        fontSize: small ? '0.75rem' : '0.875rem', 
        fontWeight: '600',
        marginLeft: small ? '0' : '0.5rem',
        marginTop: small ? '0.125rem' : '0',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.125rem'
      }}>
        {icon} {sign}{percentChange.toFixed(1)}%
      </span>
    )
  }

  const departmentConfig = {
    administrativo: { name: 'Administrativo', icon: '📊', color: '#008dd0' },
    almoxarifado: { name: 'Almoxarifado', icon: '📦', color: '#95c6eb' },
    faturamento: { name: 'Faturamento', icon: '💰', color: '#4ba3d1' },
    impostos: { name: 'Impostos', icon: '📋', color: '#006ba3' },
    logistica: { name: 'Logística', icon: '🚛', color: '#005a8a' },
    manutencao: { name: 'Manutenção', icon: '🔧', color: '#004e75' },
    rh_gastos_gerais: { name: 'RH - Gastos Gerais', icon: '💰', color: '#8B5CF6' },
    rh_custos_totais: { name: 'RH - Custos Totais', icon: '📊', color: '#7C3AED' },
    rh_passivo_trabalhista: { name: 'RH - Passivo Trabalhista', icon: '⚖️', color: '#6D28D9' }
  }

  // Excluir faturamento (receita) e passivo trabalhista (não é gasto operacional) do total geral
  const totalGeral = Object.entries(stats)
    .filter(([key]) => key !== 'faturamento' && key !== 'rh_passivo_trabalhista')
    .reduce((sum, [, stat]) => sum + stat.total, 0)
  const totalRegistros = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0)
  
  // Obter total do faturamento
  const totalFaturamento = stats.faturamento ? stats.faturamento.total : 0
  
  // Calcular comparativo total
  const totalGeralPrevious = Object.entries(previousStats)
    .filter(([key]) => key !== 'faturamento' && key !== 'rh_passivo_trabalhista')
    .reduce((sum, [, stat]) => sum + stat.total, 0)
  
  const totalComparative = totalGeralPrevious > 0 ? {
    percentChange: ((totalGeral - totalGeralPrevious) / totalGeralPrevious) * 100,
    isIncrease: totalGeral > totalGeralPrevious
  } : null

  // Removido o loading que substitui toda a interface
  // Agora apenas os valores são atualizados, mantendo a estrutura

  // Mapear número do mês para nome em português
  const monthNames = {
    1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril', 
    5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
    9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
  }

  // Obter informações sobre o período de comparação
  const lastMonthWithData = Object.values(comparativeData)[0]?.lastMonthWithData || 12
  const lastMonthName = monthNames[lastMonthWithData]
  
  // Gerar título dinâmico baseado no período
  const getYearlyTitle = () => {
    if (selectedYear === 2024) {
      return `Total Anual ${selectedYear}`
    } else if (lastMonthWithData === 12) {
      return `Total Anual ${selectedYear}`
    } else {
      return `Jan-${lastMonthName} ${selectedYear}`
    }
  }

  const getPreviousPeriodTitle = () => {
    if (viewMode === 'yearly') {
      if (selectedYear === 2024) {
        return `Ano ${selectedYear}`
      } else if (lastMonthWithData === 12) {
        return `Ano ${selectedYear - 1}`
      } else {
        return `Jan-${lastMonthName} ${selectedYear - 1}`
      }
    } else {
      return totalComparative 
        ? (selectedMonth === 1 ? `Dez ${selectedYear - 1}` : `${monthNames[selectedMonth - 1]} ${selectedYear}`)
        : 'Sem dados anteriores'
    }
  }

  // Não substituir a interface durante loading - manter estrutura sempre visível
  // Se não há dados carregados ainda, mostrar estrutura com valores zerados
  const hasData = Object.keys(stats).length > 0
  
  // Dados padrão quando ainda não carregou
  const defaultStats = {
    administrativo: { total: 0, count: 0 },
    almoxarifado: { total: 0, count: 0 },
    faturamento: { total: 0, count: 0 },
    impostos: { total: 0, count: 0 },
    logistica: { total: 0, count: 0 },
    manutencao: { total: 0, count: 0 },
    rh_gastos_gerais: { total: 0, count: 0 },
    rh_custos_totais: { total: 0, count: 0 },
    rh_passivo_trabalhista: { total: 0, count: 0 }
  }
  
  // Usar dados reais se disponíveis, senão usar padrão
  const displayStats = hasData ? stats : defaultStats
  const displayTotalGeral = hasData ? totalGeral : 0
  const displayTotalRegistros = hasData ? totalRegistros : 0
  const displayTotalFaturamento = hasData ? totalFaturamento : 0
  const displayTotalGeralPrevious = hasData ? totalGeralPrevious : 0
  const displayComparativeData = hasData ? comparativeData : {}

  // Funções de scroll horizontal
  const scrollLeft = () => {
    if (scrollContainer) {
      // Scroll baseado na largura de um card + gap
      const cardWidth = 280 + 24 // 280px card + 1.5rem gap (24px)
      scrollContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainer) {
      // Scroll baseado na largura de um card + gap
      const cardWidth = 280 + 24 // 280px card + 1.5rem gap (24px)
      scrollContainer.scrollBy({ left: cardWidth, behavior: 'smooth' })
    }
  }

  return (
    <div className="dashboard-home">{/* Interface sempre visível - carregamento silencioso */}


      {/* Cards de Resumo */}
      <div className="summary-cards">
        <div className="summary-card total-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>{viewMode === 'yearly' ? getYearlyTitle() : `Total - ${monthNames[selectedMonth]} ${selectedYear}`}</h3>
            <p className="card-value">
              {formatCurrency(displayTotalGeral)}
              {hasData && totalComparative && formatPercentage(totalComparative)}
            </p>
            <span className="card-subtitle">{displayTotalRegistros} registros</span>
          </div>
        </div>

        <div className="summary-card avg-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>{viewMode === 'yearly' ? 'Período Anterior' : 'Período Anterior'}</h3>
            <p className="card-value">
              {displayTotalGeralPrevious > 0 ? formatCurrency(displayTotalGeralPrevious) : (hasData ? 'N/A' : formatCurrency(0))}
            </p>
            <span className="card-subtitle">
              {getPreviousPeriodTitle()}
            </span>
          </div>
        </div>

        <div className="summary-card departments-card">
          <div className="card-icon">🏢</div>
          <div className="card-content">
            <h3>Departamentos</h3>
            <p className="card-value">{Object.keys(displayStats).length}</p>
            <span className="card-subtitle">Áreas ativas</span>
          </div>
        </div>
      </div>

      {/* Grid de Departamentos com Scroll Horizontal */}
      <div className="departments-grid">
        <h2 className="section-title">
          <span className="title-icon">📊</span>
          Visão por Departamentos - {viewMode === 'yearly' ? getYearlyTitle() : `${monthNames[selectedMonth]} ${selectedYear}`}
        </h2>
        
        <div className="departments-scroll-container">
          <button className="scroll-arrow left" onClick={scrollLeft}>
            ←
          </button>
          
          <div className="departments-cards" ref={setScrollContainer}>
            {Object.entries(displayStats).map(([key, stat]) => {
              const config = departmentConfig[key]
              // Para faturamento (receita) e passivo trabalhista, não calcular porcentagem do total de gastos
              const percentage = (key === 'faturamento' || key === 'rh_passivo_trabalhista') ? 0 : (displayTotalGeral > 0 ? (stat.total / displayTotalGeral) * 100 : 0)
              
              return (
                <div key={key} className="department-card" style={{ '--department-color': config.color }}>
                  <div className="department-header">
                    <span className="department-icon">{config.icon}</span>
                    <h4 className="department-name">{config.name}</h4>
                  </div>
                  
                  <div className="department-stats">
                    <div className="stat-item">
                      <span className="stat-label">{viewMode === 'yearly' ? 'Total Anual' : 'Total Mensal'}</span>
                      <span className="stat-value">
                        {formatCurrency(stat.total || 0)}
                        {hasData && displayComparativeData[key] && key !== 'rh_passivo_trabalhista' && formatPercentage(displayComparativeData[key], true)}
                      </span>
                    </div>
                    
                    {key !== 'faturamento' && key !== 'rh_passivo_trabalhista' && (
                      <div className="stat-item">
                        <span className="stat-label">% do Total</span>
                        <span className="stat-value">{`${percentage.toFixed(1)}%`}</span>
                      </div>
                    )}
                    
                    {key !== 'faturamento' && key !== 'rh_passivo_trabalhista' && (
                      <div className="stat-item">
                        <span className="stat-label">% do Faturamento</span>
                        <span className="stat-value">{displayTotalFaturamento > 0 ? `${(((stat.total || 0) / displayTotalFaturamento) * 100).toFixed(1)}%` : '0%'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="department-progress">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${key === 'faturamento' ? '100' : 
                                  key === 'rh_passivo_trabalhista' ? '100' : 
                                  percentage}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <button className="scroll-arrow right" onClick={scrollRight}>
            →
          </button>
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className="quick-summary">
        <h2 className="section-title">
          <span className="title-icon">⚡</span>
          Resumo Rápido
        </h2>
        
        <div className="summary-grid">
          <div className="summary-item">
            <h4>Maior Gasto</h4>
            <p>{Object.entries(displayStats)
              .filter(([key]) => key !== 'faturamento' && key !== 'rh_passivo_trabalhista')
              .reduce((max, [key, stat]) => 
                stat.total > max.total ? { name: departmentConfig[key].name, total: stat.total } : max,
                { name: hasData ? '' : 'Carregando...', total: 0 }
              ).name}</p>
            <span>{formatCurrency(Math.max(...Object.entries(displayStats)
              .filter(([key]) => key !== 'faturamento' && key !== 'rh_passivo_trabalhista')
              .map(([, stat]) => stat.total || 0)))}</span>
          </div>
          
          <div className="summary-item">
            <h4>Menor Gasto</h4>
            <p>{Object.entries(displayStats)
              .filter(([key]) => key !== 'faturamento' && key !== 'rh_passivo_trabalhista')
              .reduce((min, [key, stat]) => 
                stat.total < min.total && stat.total > 0 ? { name: departmentConfig[key].name, total: stat.total } : min,
                { name: hasData ? '' : 'Carregando...', total: Infinity }
              ).name}</p>
            <span>{formatCurrency(Math.min(...Object.entries(displayStats)
              .filter(([key]) => key !== 'faturamento' && key !== 'rh_passivo_trabalhista')
              .filter(([, stat]) => (stat.total || 0) > 0)
              .map(([, stat]) => stat.total || 0).concat([0])))}</span>
          </div>
          
          <div className="summary-item">
            <h4>Média por Depto</h4>
            <p>Gastos operacionais</p>
            <span>{formatCurrency((displayTotalGeral || 0) / Math.max(Object.entries(displayStats).filter(([key]) => key !== 'faturamento' && key !== 'rh_passivo_trabalhista').length, 1))}</span>
          </div>
          
          <div className="summary-item">
            <h4>Última Atualização</h4>
            <p>Sistema</p>
            <span>{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 