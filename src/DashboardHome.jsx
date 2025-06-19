import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient.js'
import './styles/dashboard-home.css'

export default function DashboardHome() {
  const [stats, setStats] = useState({
    administrativo: { total: 0, count: 0 },
    almoxarifado: { total: 0, count: 0 },
    comercial: { total: 0, count: 0 },
    impostos: { total: 0, count: 0 },
    logistica: { total: 0, count: 0 },
    manutencao: { total: 0, count: 0 },
    rh: { total: 0, count: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const tables = ['administrativo', 'almoxarifado', 'comercial', 'impostos', 'logistica', 'manutencao', 'rh']
      const newStats = {}

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('Total_Anual')
            .not('Total_Anual', 'is', null)

          if (error) {
            console.warn(`Erro ao carregar ${table}:`, error)
            newStats[table] = { total: 0, count: 0 }
          } else {
            const total = data.reduce((sum, item) => sum + (parseFloat(item.Total_Anual) || 0), 0)
            newStats[table] = {
              total,
              count: data.length
            }
          }
        } catch (err) {
          console.warn(`Erro ao processar ${table}:`, err)
          newStats[table] = { total: 0, count: 0 }
        }
      }

      setStats(newStats)
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const departmentConfig = {
    administrativo: { name: 'Administrativo', icon: '📊', color: '#008dd0' },
    almoxarifado: { name: 'Almoxarifado', icon: '📦', color: '#95c6eb' },
    comercial: { name: 'Comercial', icon: '💼', color: '#4ba3d1' },
    impostos: { name: 'Impostos', icon: '📋', color: '#006ba3' },
    logistica: { name: 'Logística', icon: '🚛', color: '#005a8a' },
    manutencao: { name: 'Manutenção', icon: '🔧', color: '#004e75' },
    rh: { name: 'Recursos Humanos', icon: '👥', color: '#003d5c' }
  }

  const totalGeral = Object.values(stats).reduce((sum, stat) => sum + stat.total, 0)
  const totalRegistros = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0)

  if (loading) {
    return (
      <div className="dashboard-home-loading">
        <div className="loading-spinner-home"></div>
        <p>Carregando estatísticas...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-home">
      {/* Cards de Resumo */}
      <div className="summary-cards">
        <div className="summary-card total-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Geral</h3>
            <p className="card-value">{formatCurrency(totalGeral)}</p>
            <span className="card-subtitle">{totalRegistros} registros</span>
          </div>
        </div>

        <div className="summary-card avg-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Média Mensal</h3>
            <p className="card-value">{formatCurrency(totalGeral / 12)}</p>
            <span className="card-subtitle">Projeção anual</span>
          </div>
        </div>

        <div className="summary-card departments-card">
          <div className="card-icon">🏢</div>
          <div className="card-content">
            <h3>Departamentos</h3>
            <p className="card-value">{Object.keys(stats).length}</p>
            <span className="card-subtitle">Áreas ativas</span>
          </div>
        </div>
      </div>

      {/* Grid de Departamentos */}
      <div className="departments-grid">
        <h2 className="section-title">
          <span className="title-icon">📊</span>
          Visão por Departamentos
        </h2>
        
        <div className="departments-cards">
          {Object.entries(stats).map(([key, stat]) => {
            const config = departmentConfig[key]
            const percentage = totalGeral > 0 ? (stat.total / totalGeral) * 100 : 0
            
            return (
              <div key={key} className="department-card" style={{ '--department-color': config.color }}>
                <div className="department-header">
                  <span className="department-icon">{config.icon}</span>
                  <h4 className="department-name">{config.name}</h4>
                </div>
                
                <div className="department-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Anual</span>
                    <span className="stat-value">{formatCurrency(stat.total)}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Registros</span>
                    <span className="stat-value">{stat.count}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">% do Total</span>
                    <span className="stat-value">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="department-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
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
            <p>{Object.entries(stats).reduce((max, [key, stat]) => 
              stat.total > max.total ? { name: departmentConfig[key].name, total: stat.total } : max,
              { name: '', total: 0 }
            ).name}</p>
            <span>{formatCurrency(Math.max(...Object.values(stats).map(s => s.total)))}</span>
          </div>
          
          <div className="summary-item">
            <h4>Menor Gasto</h4>
            <p>{Object.entries(stats).reduce((min, [key, stat]) => 
              stat.total < min.total && stat.total > 0 ? { name: departmentConfig[key].name, total: stat.total } : min,
              { name: departmentConfig[Object.keys(stats)[0]], total: Infinity }
            ).name}</p>
            <span>{formatCurrency(Math.min(...Object.values(stats).filter(s => s.total > 0).map(s => s.total)))}</span>
          </div>
          
          <div className="summary-item">
            <h4>Média por Depto</h4>
            <p>Todas as áreas</p>
            <span>{formatCurrency(totalGeral / Object.keys(stats).length)}</span>
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