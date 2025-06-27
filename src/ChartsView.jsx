import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from './lib/supabaseClient.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line } from 'react-chartjs-2'
import './styles/charts-view.css'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ChartDataLabels
)

// Array reorganizado na ordem correta para grid 3x3
const TABLES = [
  // Linha 1
  { id: 'administrativo', name: 'Administrativo', icon: '🏢', color: '#008dd0' },
  { id: 'almoxarifado', name: 'Almoxarifado', icon: '📦', color: '#95c6eb' },
  { id: 'faturamento', name: 'Faturamento', icon: '💰', color: '#4ba3d1' },
  // Linha 2
  { id: 'impostos', name: 'Impostos', icon: '🧾', color: '#006ba3' },
  { id: 'logistica', name: 'Logística', icon: '🚛', color: '#005a8a' },
  { id: 'manutencao', name: 'Manutenção', icon: '🔧', color: '#004e75' },
  // Linha 3
  { id: 'rh_gastos_gerais', name: 'RH - Gastos Gerais', icon: '💸', color: '#8B5CF6' },
  { id: 'rh_custos_totais', name: 'RH - Custos Totais', icon: '📈', color: '#7C3AED' },
  { id: 'rh_passivo_trabalhista', name: 'RH - Passivo Trabalhista', icon: '⚖️', color: '#6D28D9' }
]

// 🎯 Mapeamento explícito de posições no grid 3x3
const CHART_POSITIONS = {
  'administrativo': { row: 1, col: 1, order: 1 },
  'almoxarifado': { row: 1, col: 2, order: 2 },
  'faturamento': { row: 1, col: 3, order: 3 },
  'impostos': { row: 2, col: 1, order: 4 },
  'logistica': { row: 2, col: 2, order: 5 },
  'manutencao': { row: 2, col: 3, order: 6 },
  'rh_gastos_gerais': { row: 3, col: 1, order: 7 },
  'rh_custos_totais': { row: 3, col: 2, order: 8 },
  'rh_passivo_trabalhista': { row: 3, col: 3, order: 9 }
}



const monthNames = {
  1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril', 
  5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
  9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
}

const monthLabels = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

export default function ChartsView({ selectedMonth, selectedYear, viewMode, chartType = 'bar' }) {
  // Garantir compatibilidade removendo gráfico circular
  const safeChartType = chartType === 'circle' ? 'bar' : chartType
  
  // 🛠️ Função utilitária para verificar se dados são válidos
  const hasValidChartData = (data) => {
    return data && Array.isArray(data) && data.some(value => 
      value !== null && value !== undefined && !isNaN(value) && value > 0
    )
  }
  
  const [chartsData, setChartsData] = useState({})
  const [error, setError] = useState(null)
  const [expandedChart, setExpandedChart] = useState(null)
  const [isDataReady, setIsDataReady] = useState(false)
  // Cache para otimização
  const [dataCache, setDataCache] = useState({})
  const [lastCacheKey, setLastCacheKey] = useState('')
  
  // Estados para overlay com animação
  const [isZooming, setIsZooming] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [clickedCardRef, setClickedCardRef] = useState(null)



  useEffect(() => {
    loadChartsData()
  }, [selectedMonth, selectedYear, viewMode])

  // 🔄 Forçar atualização quando dados mudarem e houver gráfico expandido
  useEffect(() => {
    if (expandedChart && isDataReady) {
      // Forçar re-render do gráfico expandido quando dados mudarem
      const tableData = chartsData[expandedChart] || {}
      const dataToCheck = viewMode === 'yearly' ? tableData.monthlyData : tableData.cumulativeData
      const hasData = hasValidChartData(dataToCheck)
      
      if (!hasData) {
        // Fechar automaticamente se não há mais dados válidos
        setExpandedChart(null)
        setAnimationOrigin(null)
        if (clickedCardRef) {
          clickedCardRef.style.opacity = '1'
          clickedCardRef.classList.remove('clicked')
          setClickedCardRef(null)
        }
      }
    }
  }, [chartsData, expandedChart, isDataReady, viewMode, selectedMonth, selectedYear])

  // Estado inicial - começar sempre com isDataReady = false para animação
  useEffect(() => {
    setIsDataReady(false)
  }, [])

  // Detectar tecla ESC para fechar overlay
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && expandedChart) {

        
        // 🎬 FECHAR COM ANIMAÇÃO (mesmo que clique)
        const overlay = document.querySelector('.chart-overlay-simple')
        if (overlay && animationOrigin) {
          overlay.classList.add('closing')
          
          setTimeout(() => {
            setExpandedChart(null)
            setAnimationOrigin(null)
            if (clickedCardRef) {
              clickedCardRef.style.opacity = '1'
              clickedCardRef.classList.remove('clicked')
              setClickedCardRef(null)
            }
          }, 400) // Duração da animação de fechamento
        } else {
          // Fallback
          setExpandedChart(null)
          setAnimationOrigin(null)
          if (clickedCardRef) {
            clickedCardRef.style.opacity = '1'
            clickedCardRef.classList.remove('clicked')
            setClickedCardRef(null)
          }
        }
        
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [expandedChart, clickedCardRef])

  const loadChartsData = async () => {
    // ✨ CORREÇÃO: Cache inteligente - atualização instantânea para mês/modo, só loading para ano novo
    const cacheKey = `${selectedYear}`
    if (dataCache[cacheKey]) {
      // Usar dados do cache e recalcular instantaneamente para o modo/mês atual
      const cachedData = dataCache[cacheKey]
      const newChartsData = {}
      
      Object.keys(cachedData).forEach(tableId => {
        const tableData = cachedData[tableId]
        const yearlyTotal = tableData.monthlyData.reduce((sum, value) => sum + value, 0)
        // ✨ CORREÇÃO: Usar monthlyData para dados cumulativos
        const cumulativeData = tableData.monthlyData.slice(0, selectedMonth)
        const cumulativeTotal = cumulativeData.reduce((sum, value) => sum + value, 0)
        
        newChartsData[tableId] = {
          ...tableData,
          cumulativeData: cumulativeData,
          total: viewMode === 'yearly' ? yearlyTotal : cumulativeTotal
        }
      })
      
      setChartsData(newChartsData)
      setIsDataReady(true)
      setLastCacheKey(cacheKey)
      return
    }
    
    // ✨ Apenas mostrar loading se for carregar dados novos do servidor (ano diferente)
    setIsDataReady(false)

    try {
      // 🚀 OTIMIZAÇÃO 1: Carregamento paralelo de todas as tabelas simultaneamente
      const queries = TABLES.map(table => {
        // Construir query otimizada com filtro do Supabase em vez de filtro no cliente
        let query = supabase
          .from(table.id)
          .select('Janeiro, Fevereiro, Marco, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro, ano, categoria')
          .eq('ano', selectedYear)

        // 🚀 OTIMIZAÇÃO 2: Filtro de faturamento direto na query
        if (table.id === 'faturamento') {
          query = query.ilike('categoria', 'FATURAMENTO')
        }

        return query.then(({ data, error }) => ({ table, data, error }))
      })

      // 🚀 OTIMIZAÇÃO 3: Executar todas as queries simultaneamente
      const results = await Promise.all(queries)
      
      const newChartsData = {}
      const cacheData = {}

      // 🚀 OTIMIZAÇÃO 4: Processamento único e otimizado
      results.forEach(({ table, data, error }) => {
        if (error) {
          console.warn(`Erro ao carregar ${table.id}:`, error)
          const emptyData = { 
            monthlyData: new Array(12).fill(0), 
            cumulativeData: new Array(12).fill(0),
            total: 0,
            name: table.name,
            color: table.color,
            icon: table.icon
          }
          newChartsData[table.id] = emptyData
          cacheData[table.id] = emptyData
          return
        }

        // 🚀 OTIMIZAÇÃO 7: Cálculo vetorizado mais eficiente
        const monthlyTotals = new Array(12).fill(0)
        
        if (data?.length) {
          // Processamento otimizado sem loops aninhados desnecessários
          const monthKeys = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
          
          data.forEach(item => {
            monthKeys.forEach((key, index) => {
              monthlyTotals[index] += parseFloat(item[key]) || 0
            })
          })
        }

        // Calcular dados uma única vez
        const cumulativeData = monthlyTotals.slice(0, selectedMonth)
        const yearlyTotal = monthlyTotals.reduce((sum, value) => sum + value, 0)
        const cumulativeTotal = cumulativeData.reduce((sum, value) => sum + value, 0)
        
        const processedData = {
          monthlyData: monthlyTotals,
          cumulativeData: cumulativeData,
          total: viewMode === 'yearly' ? yearlyTotal : cumulativeTotal,
          name: table.name,
          color: table.color,
          icon: table.icon
        }
        
        newChartsData[table.id] = processedData
        // Salvar no cache apenas os dados essenciais
        cacheData[table.id] = {
          monthlyData: monthlyTotals,
          name: table.name,
          color: table.color,
          icon: table.icon
        }
      })

      // 🚀 OTIMIZAÇÃO 8: Salvar no cache para próximas consultas
      setDataCache(prev => ({ ...prev, [cacheKey]: cacheData }))
      setLastCacheKey(cacheKey)
      
      setChartsData(newChartsData)
      // 🚀 OTIMIZAÇÃO 5: Remover delay desnecessário - renderização instantânea
      setIsDataReady(true)
    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error)
      setError('Erro ao carregar dados dos gráficos')
      setIsDataReady(true)
    }
  }

  // 🚀 OTIMIZAÇÃO 9: Memoizar formatter para evitar criações desnecessárias
  const formatCurrency = useMemo(() => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return (value) => formatter.format(value)
  }, [])

  // Configurações dos gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.parsed.y)
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value)
          }
        }
      }
    }
  }

  if (error) {
    return (
      <div className="charts-error">
        <div className="error-icon">⚠️</div>
        <h3>Erro ao carregar gráficos</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => setError(null)}>
          Tentar novamente
        </button>
      </div>
    )
  }

  // 🎬 Sistema de animação REALISTA - Do tamanho original
  const [animationOrigin, setAnimationOrigin] = useState(null)
  
  const handleChartClick = (tableId, event) => {
    if (!isDataReady) {
      return
    }
    
    // 🚫 Verificar se há dados válidos antes de expandir
    const tableData = chartsData[tableId] || {}
    let dataToCheck
    
    if (viewMode === 'yearly') {
      dataToCheck = tableData.monthlyData || []
    } else {
      dataToCheck = tableData.cumulativeData || []
    }
    
    const hasValidData = hasValidChartData(dataToCheck)
    
    if (!hasValidData) {
      return // Não permitir clique em gráficos sem dados
    }
    
    const clickedElement = event.currentTarget
    
    if (expandedChart === tableId) {
      // 🎬 FECHAR COM ANIMAÇÃO - Voltar para posição original
      
      const overlay = document.querySelector('.chart-overlay-simple')
      if (overlay && animationOrigin) {
        overlay.classList.add('closing')
        
        setTimeout(() => {
          setExpandedChart(null)
          setAnimationOrigin(null)
          if (clickedCardRef) {
            clickedCardRef.style.opacity = '1'
            clickedCardRef.classList.remove('clicked')
            setClickedCardRef(null)
          }
        }, 400) // Duração da animação de fechamento
      } else {
        // Fallback
        setExpandedChart(null)
        setAnimationOrigin(null)
        if (clickedCardRef) {
          clickedCardRef.style.opacity = '1'
          clickedCardRef.classList.remove('clicked')
          setClickedCardRef(null)
        }
      }
    } else {
      // 🎬 ABRIR COM ANIMAÇÃO - Começar da posição original
      
      // 🎯 Sistema de expansão por posição no grid
      const rect = clickedElement.getBoundingClientRect()
      
      // 🎯 POSIÇÕES REAIS DOS GRÁFICOS - Capturadas e configuradas
      const MANUAL_POSITIONS = {
        'administrativo': { left: 1, top: 1, width: 570, height: 310 },
        'almoxarifado': { left: 572, top: 1, width: 570, height: 310 },
        'faturamento': { left: 1143,top: 1, width: 570, height: 310 },
        'impostos': { left: 1,top: 320, width: 570, height: 310 },
        'logistica': { left: 572, top: 320, width: 570, height: 310 },
        'manutencao': { left: 1143,top: 320, width: 570, height: 310 },
        'rh_gastos_gerais': { left: 1, top: 635, width: 570, height: 310 },
        'rh_custos_totais': { left: 572, top: 635,width: 570, height: 310 },
        'rh_passivo_trabalhista': { left: 1143, top: 635, width: 570, height: 310 }
      }
      
      // Usar posição manual se definida, caso contrário usar a posição real
      const manualPos = MANUAL_POSITIONS[tableId]
      const useManual = manualPos ? true : false
      
      const origin = useManual ? manualPos : {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      }
      

      
      setAnimationOrigin({...origin, tableId: tableId})
      
      // Adicionar animação de pulso no cartão
      clickedElement.classList.add('clicked')
      
      // Limpar cartão anterior se existir
      if (clickedCardRef) {
        clickedCardRef.style.opacity = '1'
        clickedCardRef.classList.remove('clicked')
      }
      
      setClickedCardRef(clickedElement)
      setExpandedChart(tableId)
      
      // Esconder gráfico original após pequeno delay
      setTimeout(() => {
        clickedElement.style.opacity = '0.1'
      }, 100)
      
      // ✅ A animação CSS já mantém o estado final com animation-fill-mode: forwards
    }
  }

      // 🔧 Renderizar overlay simples
  const renderExpandedChart = () => {
    if (!expandedChart) return null
    
    const table = TABLES.find(t => t.id === expandedChart)
    if (!table) return null
    
    const tableData = chartsData[expandedChart] || {}
    
    let dataToShow, labelsToShow, totalValue
    
    if (viewMode === 'yearly') {
      dataToShow = tableData.monthlyData || new Array(12).fill(0)
      labelsToShow = monthLabels
      totalValue = tableData.total || 0
    } else {
      dataToShow = tableData.cumulativeData || new Array(selectedMonth).fill(0)
      labelsToShow = monthLabels.slice(0, selectedMonth)
      totalValue = tableData.total || 0
    }

    // 🚫 Não renderizar se não houver dados válidos
    const hasValidData = hasValidChartData(dataToShow)
    
    if (!hasValidData) {
      return (
        <div 
          className="chart-overlay-simple"
          style={{ 
            '--chart-color': table.color,
            '--start-left': animationOrigin ? `${animationOrigin.left}px` : '50vw',
            '--start-top': animationOrigin ? `${animationOrigin.top}px` : '50vh',
            '--start-width': animationOrigin ? `${animationOrigin.width}px` : '300px',
            '--start-height': animationOrigin ? `${animationOrigin.height}px` : '200px'
          }}
        >
          <div className="expanded-chart-header">
            <h2>
              <span style={{ marginRight: '0.5rem' }}>{table.icon}</span>
              {table.name}
            </h2>
            <button 
              className="close-expanded-btn"
              onClick={(e) => handleChartClick(table.id, e)}
              title="Pressione ESC para fechar"
            >
              ✕
            </button>
          </div>
          <div className="expanded-chart-total">
            <span className="total-label">Nenhum dado disponível para {selectedYear}</span>
          </div>
        </div>
      )
    }

    // 📊 Calcular variações percentuais entre meses
    const calculatePercentageChange = (current, previous) => {
      // Verificar se os valores são válidos
      if (current === undefined || previous === undefined || 
          current === null || previous === null ||
          isNaN(current) || isNaN(previous)) {
        return NaN
      }
      
      // Converter para números se necessário
      const curr = Number(current)
      const prev = Number(previous)
      
      if (prev === 0) {
        return curr > 0 ? 100 : (curr < 0 ? -100 : 0)
      }
      
      const result = ((curr - prev) / prev) * 100
      return isFinite(result) ? result : NaN
    }

    // 📊 Plugin customizado para variações percentuais coloridas - RECRIAR SEMPRE
    const createPercentageVariationPlugin = (currentData) => ({
      id: 'percentageVariation',
      afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx
        
        // Usar os dados atuais passados como parâmetro
        if (!chart.data.datasets[0] || !chart.data.datasets[0].data || !Array.isArray(currentData)) {
          return
        }
        
        chart.data.datasets[0].data.forEach((value, index) => {
          if (index === 0) return // Primeiro mês não tem comparação
          
          // Verificar se os índices são válidos
          if (index >= currentData.length || index - 1 < 0) {
            return
          }
          
          const currentValue = currentData[index]
          const previousValue = currentData[index - 1]
          
          // Verificar se os valores são válidos
          if (currentValue === undefined || previousValue === undefined || 
              currentValue === null || previousValue === null ||
              isNaN(currentValue) || isNaN(previousValue)) {
            return
          }
          
          const percentChange = calculatePercentageChange(currentValue, previousValue)
          
          // Verificar se o percentChange é válido
          if (isNaN(percentChange) || !isFinite(percentChange) || Math.abs(percentChange) < 0.1) return
          
          const meta = chart.getDatasetMeta(0)
          const element = meta.data[index]
          
          if (!element || !element.x || !element.y) return
          
          const sign = percentChange > 0 ? '+' : ''
          const percentText = `${sign}${percentChange.toFixed(1)}%`
          const color = percentChange > 0 ? '#16a34a' : '#dc2626'
          
          ctx.save()
          ctx.font = 'bold 14px Arial'
          ctx.fillStyle = color
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          
          // Posicionar acima da barra/ponto
          const yPosition = element.y - (safeChartType === 'bar' ? 35 : 45)
          
          // Adicionar fundo branco para melhor legibilidade
          const textWidth = ctx.measureText(percentText).width
          const textHeight = 14
          
          // Garantir que o texto não saia dos limites do canvas
          const canvasWidth = chart.width
          const canvasHeight = chart.height
          
          let textX = element.x
          let backgroundX = element.x - textWidth/2 - 3
          
          // Ajustar posição se estiver muito próximo das bordas
          if (backgroundX < 10) {
            backgroundX = 10
            textX = backgroundX + textWidth/2 + 3
          } else if (backgroundX + textWidth + 6 > canvasWidth - 10) {
            backgroundX = canvasWidth - textWidth - 16
            textX = backgroundX + textWidth/2 + 3
          }
          
          // Verificar se está dentro dos limites verticais
          if (yPosition - textHeight/2 > 20 && yPosition < canvasHeight - 20) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
            ctx.fillRect(backgroundX, yPosition - 12, textWidth + 6, textHeight)
            
            // Desenhar o texto
            ctx.fillStyle = color
            ctx.fillText(percentText, textX, yPosition)
          }
          
          ctx.restore()
        })
      }
    })

    // Criar plugin com dados atuais
    const percentageVariationPlugin = createPercentageVariationPlugin(dataToShow)
    
    // ✅ Chave única para forçar re-render quando dados mudarem
    const chartKey = `${expandedChart}-${selectedYear}-${selectedMonth}-${viewMode}-${dataToShow?.join(',')}`

    const individualChartData = {
      labels: labelsToShow,
      datasets: [
        {
          label: table.name,
          data: dataToShow,
          backgroundColor: table.color,
          borderColor: table.color,
          borderWidth: 1,
        },
      ],
    }

    return (
      <div 
        className="chart-overlay-simple"
        style={{ 
          '--chart-color': table.color,
          '--start-left': animationOrigin ? `${animationOrigin.left}px` : '50vw',
          '--start-top': animationOrigin ? `${animationOrigin.top}px` : '50vh',
          '--start-width': animationOrigin ? `${animationOrigin.width}px` : '300px',
          '--start-height': animationOrigin ? `${animationOrigin.height}px` : '200px'
        }}
      >
        <div className="expanded-chart-header">
          <h2>
            <span style={{ marginRight: '0.5rem' }}>{table.icon}</span>
            {table.name}
          </h2>
          <button 
            className="close-expanded-btn"
            onClick={(e) => handleChartClick(table.id, e)}
            title="Pressione ESC para fechar"
          >
            ✕
          </button>
        </div>
        <div className="expanded-chart-total">
          <span className="total-label">Total Acumulado:</span>
          <span className="total-value" style={{ color: table.color }}>
            {formatCurrency(totalValue)}
          </span>
        </div>
        <div className="expanded-chart">
          {safeChartType === 'line' ? (
            <Line 
              key={chartKey}
              data={individualChartData}
              plugins={[percentageVariationPlugin]}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                  padding: {
                    top: 50, // Espaço extra para variações percentuais
                    bottom: 25,
                    left: 80, // Mais espaço à esquerda
                    right: 80 // Mais espaço à direita
                  }
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return formatCurrency(context.parsed.y)
                      }
                    }
                  },
                  datalabels: {
                    display: true,
                    color: table.color,
                    font: {
                      weight: 'bold',
                      size: 14
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: table.color,
                    borderWidth: 2,
                    borderRadius: 6,
                    padding: 8,
                    formatter: function(value) {
                      return formatCurrency(value)
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 12,
                        weight: 'bold'
                      }
                    }
                  },
                  y: {
                    display: false,
                    beginAtZero: true,
                    suggestedMax: function(context) {
                      // Adicionar espaço extra no topo para as variações percentuais
                      try {
                        const data = context.chart.data.datasets[0].data
                        const validValues = data.filter(v => v !== null && v !== undefined && !isNaN(v) && isFinite(v) && v > 0)
                        if (validValues.length === 0) return 100 // Valor padrão se não houver dados válidos
                        const maxValue = Math.max(...validValues)
                        return isFinite(maxValue) ? maxValue * 1.4 : 100 // Verificar se maxValue é finito
                      } catch (error) {
                        console.warn('Erro ao calcular suggestedMax:', error)
                        return 100 // Valor padrão em caso de erro
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <Bar 
              key={chartKey}
              data={individualChartData}
              plugins={[percentageVariationPlugin]}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return formatCurrency(context.parsed.y)
                      }
                    }
                  },
                  datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                      weight: 'bold',
                      size: 14
                    },
                    formatter: function(value) {
                      return formatCurrency(value)
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 12,
                        weight: 'bold'
                      }
                    }
                  },
                  y: {
                    display: false,
                    max: function(context) {
                      // Adicionar espaço extra no topo para as variações percentuais
                      try {
                        const data = context.chart.data.datasets[0].data
                        const validValues = data.filter(v => v !== null && v !== undefined && !isNaN(v) && isFinite(v) && v > 0)
                        if (validValues.length === 0) return 100 // Valor padrão se não houver dados válidos
                        const maxValue = Math.max(...validValues)
                        return isFinite(maxValue) ? maxValue * 1.15 : 100 // Verificar se maxValue é finito
                      } catch (error) {
                        console.warn('Erro ao calcular max para barras:', error)
                        return 100 // Valor padrão em caso de erro
                      }
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    )
  }



  return (
    <div className="charts-view">
      {/* Renderizar overlay quando expandido */}
      {renderExpandedChart()}
      
      <div className="charts-grid">
        
        {/* 🎯 Gráficos renderizados na ordem correta com posicionamento explícito */}
        {TABLES.map((table) => {
          const tableData = chartsData[table.id] || {}
          const position = CHART_POSITIONS[table.id]
          
          // Determinar quais dados mostrar baseado no modo
          let dataToShow, labelsToShow, totalValue
          
          if (viewMode === 'yearly') {
            dataToShow = tableData.monthlyData || new Array(12).fill(0)
            labelsToShow = monthLabels
            totalValue = tableData.total || 0
          } else {
            dataToShow = tableData.cumulativeData || new Array(selectedMonth).fill(0)
            labelsToShow = monthLabels.slice(0, selectedMonth)
            totalValue = tableData.total || 0
          }

          // 🚫 Verificar se há dados válidos para mostrar o gráfico
          const hasValidData = hasValidChartData(dataToShow)
          
          // Se não há dados válidos, não renderizar o cartão do gráfico
          if (!hasValidData) {
            return null
          }

          // Dados específicos para esta tabela
          const individualChartData = {
            labels: labelsToShow,
            datasets: [
              {
                label: table.name,
                data: dataToShow,
                backgroundColor: table.color,
                borderColor: table.color,
                borderWidth: 1,
              },
            ],
          }

          return (
            <div 
              key={table.id} 
              className={`chart-card`}
              data-chart-id={table.id}
              onClick={(e) => handleChartClick(table.id, e)}
              style={{ 
                borderColor: table.color,
                // 🎯 Posicionamento explícito no grid
                gridColumn: position.col,
                gridRow: position.row,
                order: position.order
              }}

            >
              <div className="chart-header">
                <h3>
                  <span style={{ marginRight: '0.3rem' }}>{table.icon}</span>
                  {table.name}
                </h3>
                <div className="chart-total">
                  <span className="total-label">Total Acumulado:</span>
                  <span className="total-value" style={{ color: table.color }}>
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>
              <div className="chart-container">
                {safeChartType === 'line' ? (
                  <Line 
                    data={individualChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return formatCurrency(context.parsed.y)
                            }
                          }
                        },
                        datalabels: {
                          display: false
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            font: {
                              size: 9,
                              weight: 'bold'
                            }
                          }
                        },
                        y: {
                          display: false
                        }
                      }
                    }}
                  />
                ) : (
                  <Bar 
                    data={individualChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return formatCurrency(context.parsed.y)
                            }
                          }
                        },
                        datalabels: {
                          display: false
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            font: {
                              size: 9,
                              weight: 'bold'
                            }
                          }
                        },
                        y: {
                          display: false
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
} 