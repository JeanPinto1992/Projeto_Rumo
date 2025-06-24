import React, { useState, useEffect } from 'react'
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
  { id: 'impostos', name: 'Impostos', icon: '📊', color: '#006ba3' },
  { id: 'logistica', name: 'Logística', icon: '🚛', color: '#005a8a' },
  { id: 'manutencao', name: 'Manutenção', icon: '🔧', color: '#004e75' },
  { id: 'rh_gastos_gerais', name: 'RH - Gastos Gerais', icon: '💰', color: '#8B5CF6' },
  { id: 'rh_custos_totais', name: 'RH - Custos Totais', icon: '📊', color: '#7C3AED' },
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    loadChartsData()
  }, [selectedMonth, selectedYear, viewMode])

  const loadChartsData = async () => {
    // Mostrar loading apenas no carregamento inicial
    if (initialLoad) {
      setLoading(true)
    }
    try {
      const newChartsData = {}

      for (const table of TABLES) {
        try {
          if (viewMode === 'yearly') {
            // Carregar dados de todo o ano
            let { data, error } = await supabase
              .from(table.id)
              .select('Janeiro, Fevereiro, Marco, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro, ano, categoria')
              .eq('ano', selectedYear)

            // Para faturamento, filtrar apenas linhas "FATURAMENTO"
            if (table.id === 'faturamento' && data) {
              const faturamentoData = data.filter(item => 
                item.categoria && item.categoria.toUpperCase() === 'FATURAMENTO'
              )
              data = faturamentoData.length > 0 ? faturamentoData : data
            }

            if (error) {
              console.warn(`Erro ao carregar ${table.id}:`, error)
              newChartsData[table.id] = { monthlyData: new Array(12).fill(0), total: 0 }
            } else {
              const monthlyTotals = new Array(12).fill(0)
              
              data.forEach(item => {
                const months = [
                  item.Janeiro, item.Fevereiro, item.Marco, item.Abril,
                  item.Maio, item.Junho, item.Julho, item.Agosto,
                  item.Setembro, item.Outubro, item.Novembro, item.Dezembro
                ]
                
                months.forEach((value, index) => {
                  monthlyTotals[index] += parseFloat(value) || 0
                })
              })

              const total = monthlyTotals.reduce((sum, value) => sum + value, 0)
              
              newChartsData[table.id] = {
                monthlyData: monthlyTotals,
                total: total,
                name: table.name,
                color: table.color,
                icon: table.icon
              }
            }
          } else {
            // Carregar dados acumulativos até o mês selecionado
            let { data, error } = await supabase
              .from(table.id)
              .select('Janeiro, Fevereiro, Marco, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro, ano, categoria')
              .eq('ano', selectedYear)

            // Para faturamento, filtrar apenas linhas "FATURAMENTO"
            if (table.id === 'faturamento' && data) {
              const faturamentoData = data.filter(item => 
                item.categoria && item.categoria.toUpperCase() === 'FATURAMENTO'
              )
              data = faturamentoData.length > 0 ? faturamentoData : data
            }

            if (error) {
              console.warn(`Erro ao carregar ${table.id}:`, error)
              newChartsData[table.id] = { monthlyData: new Array(12).fill(0), total: 0, cumulativeData: new Array(12).fill(0) }
            } else {
              const monthlyTotals = new Array(12).fill(0)
              
              data.forEach(item => {
                const months = [
                  item.Janeiro, item.Fevereiro, item.Marco, item.Abril,
                  item.Maio, item.Junho, item.Julho, item.Agosto,
                  item.Setembro, item.Outubro, item.Novembro, item.Dezembro
                ]
                
                months.forEach((value, index) => {
                  monthlyTotals[index] += parseFloat(value) || 0
                })
              })

              // Criar dados acumulativos até o mês selecionado
              const cumulativeData = new Array(12).fill(0)
              for (let i = 0; i < selectedMonth; i++) {
                cumulativeData[i] = monthlyTotals[i]
              }
              
              // Total acumulado até o mês selecionado
              const cumulativeTotal = cumulativeData.reduce((sum, value) => sum + value, 0)
              
              newChartsData[table.id] = {
                monthlyData: monthlyTotals,
                cumulativeData: cumulativeData,
                total: cumulativeTotal,
                name: table.name,
                color: table.color,
                icon: table.icon
              }
            }
          }
        } catch (err) {
          console.warn(`Erro ao processar ${table.id}:`, err)
          newChartsData[table.id] = { monthlyData: new Array(12).fill(0), total: 0 }
        }
      }

      setChartsData(newChartsData)
    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error)
      setError('Erro ao carregar dados dos gráficos')
    } finally {
      setLoading(false)
      if (initialLoad) {
        setInitialLoad(false)
      }
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

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



  if (loading) {
    return (
      <div className="charts-loading">
        <div className="charts-loading-spinner"></div>
        <p>Carregando gráficos...</p>
      </div>
    )
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

  return (
    <div className="charts-view">
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
            <div key={table.id} className="chart-card">
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