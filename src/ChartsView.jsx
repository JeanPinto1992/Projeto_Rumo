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
  ArcElement,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
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
  ArcElement,
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

  // Estado inicial - começar sempre com isDataReady = false para animação
  useEffect(() => {
    setIsDataReady(false)
  }, [])

  // Detectar tecla ESC para fechar overlay
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && expandedChart) {
        console.log('🔑 ESC pressionado - fechando overlay com animação')
        
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
    console.log('🔥 CLIQUE DETECTADO:', tableId)
    
    if (!isDataReady) {
      console.log('❌ Dados não prontos ainda')
      return
    }
    
    const clickedElement = event.currentTarget
    
    if (expandedChart === tableId) {
      // 🎬 FECHAR COM ANIMAÇÃO - Voltar para posição original
      console.log('🔄 Fechando overlay com animação para:', tableId)
      
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
      console.log('📈 Abrindo overlay com animação para:', tableId)
      
      // 🎯 Sistema de expansão por posição no grid
      const rect = clickedElement.getBoundingClientRect()
      
      // 🎯 Calcular transform-origin baseado na posição real do gráfico
      let originX, originY
      
      if (tableId === 'administrativo') {
        // Administrativo: puxar do canto inferior direito do gráfico
        const bottomRightX = rect.left + rect.width
        const bottomRightY = rect.top + rect.height
        originX = (bottomRightX / window.innerWidth) * 100
        originY = (bottomRightY / window.innerHeight) * 100
        console.log('🎯 ADMINISTRATIVO: Posição do gráfico:', {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        })
        console.log('🎯 ADMINISTRATIVO: Canto inferior direito:', {
          bottomRightX,
          bottomRightY,
          originX: `${originX}%`,
          originY: `${originY}%`
        })
      } else {
        // Outros gráficos mantêm o sistema anterior
        const expansionDirections = {
          'almoxarifado': { originX: 50, originY: 0 }, // expandir direita + esquerda + baixo
          'faturamento': { originX: 100, originY: 0 }, // expandir esquerda + baixo
          'impostos': { originX: 0, originY: 50 }, // expandir cima + baixo + direita
          'logistica': { originX: 50, originY: 50 }, // expandir todas as direções
          'manutencao': { originX: 100, originY: 50 }, // expandir cima + baixo + esquerda
          'rh_gastos_gerais': { originX: 0, originY: 100 }, // expandir cima + direita
          'rh_custos_totais': { originX: 50, originY: 100 }, // expandir cima + esquerda + direita
          'rh_passivo_trabalhista': { originX: 100, originY: 100 } // expandir cima + esquerda
        }
        
        const direction = expansionDirections[tableId] || { originX: 50, originY: 50 }
        originX = direction.originX
        originY = direction.originY
      }
      
      const origin = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        originX: originX,
        originY: originY,
        tableId: tableId
      }
      
      console.log('📐 Gráfico:', tableId, 'Transform-origin calculado:', { originX, originY })
      console.log('🎯 Transform-origin será:', `${originX}% ${originY}%`)
      setAnimationOrigin(origin)
      
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
        console.log('👻 Escondendo gráfico original')
        clickedElement.style.opacity = '0.1'
      }, 100)
    }
  }

  // 🔧 Renderizar overlay simples
  const renderExpandedChart = () => {
    if (!expandedChart) return null
    
    console.log('🖼️ Renderizando overlay para:', expandedChart)
    const table = TABLES.find(t => t.id === expandedChart)
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
          '--origin-x': animationOrigin ? `${animationOrigin.originX}%` : '50%',
          '--origin-y': animationOrigin ? `${animationOrigin.originY}%` : '50%',
          '--start-left': animationOrigin ? `${animationOrigin.x}px` : '50%',
          '--start-top': animationOrigin ? `${animationOrigin.y}px` : '50%',
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
          {chartType === 'circle' ? (
            <Doughnut 
              data={{
                labels: labelsToShow,
                datasets: [
                  {
                    data: dataToShow,
                    backgroundColor: [
                      table.color,
                      table.color + '80',
                      table.color + '60',
                      table.color + '40',
                      table.color + '20'
                    ].slice(0, dataToShow.length),
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      font: {
                        size: 14
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${formatCurrency(context.parsed)}`
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
                }
              }} 
            />
          ) : chartType === 'line' ? (
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
                    display: true,
                    color: table.color,
                    font: {
                      weight: 'bold',
                      size: 14
                    },
                    formatter: function(value) {
                      return formatCurrency(value)
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: table.color,
                    borderWidth: 1,
                    borderRadius: 4,
                    padding: 6
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
                    display: false
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
                {chartType === 'circle' ? (
                  <Doughnut 
                    data={{
                      labels: labelsToShow,
                      datasets: [
                        {
                          data: dataToShow,
                          backgroundColor: [
                            table.color,
                            table.color + '80',
                            table.color + '60',
                            table.color + '40',
                            table.color + '20'
                          ].slice(0, dataToShow.length),
                          borderWidth: 0,
                        },
                      ],
                    }}
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
                              return `${context.label}: ${formatCurrency(context.parsed)}`
                            }
                          }
                        },
                        datalabels: {
                          display: false
                        }
                      }
                    }} 
                  />
                ) : chartType === 'line' ? (
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