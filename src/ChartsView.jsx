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

const TABLES = [
  { id: 'administrativo', name: 'Administrativo', icon: '🏢', color: '#008dd0' },
  { id: 'almoxarifado', name: 'Almoxarifado', icon: '📦', color: '#95c6eb' },
  { id: 'faturamento', name: 'Faturamento', icon: '💰', color: '#4ba3d1' },
  { id: 'impostos', name: 'Impostos', icon: '🧾', color: '#006ba3' },
  { id: 'logistica', name: 'Logística', icon: '🚛', color: '#005a8a' },
  { id: 'manutencao', name: 'Manutenção', icon: '🔧', color: '#004e75' },
  { id: 'rh_gastos_gerais', name: 'RH - Gastos Gerais', icon: '💸', color: '#8B5CF6' },
  { id: 'rh_custos_totais', name: 'RH - Custos Totais', icon: '📈', color: '#7C3AED' },
  { id: 'rh_passivo_trabalhista', name: 'RH - Passivo Trabalhista', icon: '⚖️', color: '#6D28D9' }
]

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
  // 🚀 OTIMIZAÇÃO 6: Cache básico para evitar recarregamentos desnecessários
  const [dataCache, setDataCache] = useState({})
  const [lastCacheKey, setLastCacheKey] = useState('')
  
  // ✨ Estados para efeito de zoom no lugar
  const [isZooming, setIsZooming] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [zoomDirection, setZoomDirection] = useState('in')
  const [clickedCardRef, setClickedCardRef] = useState(null)

  useEffect(() => {
    loadChartsData()
  }, [selectedMonth, selectedYear, viewMode])

  // Estado inicial - começar sempre com isDataReady = false para animação
  useEffect(() => {
    setIsDataReady(false)
  }, [])

  // Detectar tecla ESC para sair do modo expandido com zoom
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && expandedChart) {
        // ✨ Fechar com efeito de zoom out
        setZoomDirection('out')
        setIsZooming(true)
        
        setTimeout(() => {
          setExpandedChart(null)
          setIsZooming(false)
        }, 600)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [expandedChart])

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

  // Função para expandir/contrair gráfico inflando no lugar
  const handleChartClick = (tableId, event) => {
    if (expandedChart === tableId) {
      // ✨ Minimizar - "desinflar" de volta para posição original
      setZoomDirection('out')
      setIsZooming(true)
      
      // Aguardar animação de deflação completa
      setTimeout(() => {
        setExpandedChart(null)
        setIsZooming(false)
        setClickedCardRef(null)
      }, 600)
    } else {
      // ✨ Expandir - "inflar" da posição original
      const clickedElement = event.currentTarget
      const rect = clickedElement.getBoundingClientRect()
      
      // Capturar posição exata do gráfico clicado
      setZoomOrigin({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      })
      
      setClickedCardRef(clickedElement)
      setZoomDirection('in')
      setIsZooming(true)
      setExpandedChart(tableId)
      
      setTimeout(() => {
        setIsZooming(false)
      }, 600)
    }
  }

  // ✨ Renderizar componente expandido como overlay (sem esconder os outros gráficos)
  const renderExpandedChart = () => {
    if (!expandedChart) return null
    
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
        className={`chart-overlay ${isZooming ? `zoom-${zoomDirection}` : 'zoom-ready'}`}
        style={{ 
          '--origin-x': `${zoomOrigin.x}px`,
          '--origin-y': `${zoomOrigin.y}px`,
          '--origin-width': `${zoomOrigin.width}px`,
          '--origin-height': `${zoomOrigin.height}px`,
          borderColor: table.color
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
    <div className={`charts-view ${isZooming ? 'zooming' : ''}`}>
      {/* ✨ Renderizar overlay expandido quando necessário */}
      {renderExpandedChart()}
      
      <div className="charts-grid">
        
        {/* Gráfico individual para cada tabela */}
        {TABLES.map(table => {
          const tableData = chartsData[table.id] || {}
          
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
              className="chart-card"
              onClick={(e) => handleChartClick(table.id, e)}
              style={{ borderColor: table.color }}
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