import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient.js'
import TableView from './TableView.jsx'
import RHView from './RHView.jsx'
import DashboardHome from './DashboardHome.jsx'
import './styles/dashboard.css'

const TABLES = [
  { id: 'administrativo', name: 'Administrativo', icon: '🏢' },
  { id: 'almoxarifado', name: 'Almoxarifado', icon: '📦' },
  { id: 'faturamento', name: 'Faturamento', icon: '💰' },
  { id: 'impostos', name: 'Impostos', icon: '📊' },
  { id: 'logistica', name: 'Logística', icon: '🚛' },
  { id: 'manutencao', name: 'Manutenção', icon: '🔧' },
  { id: 'rh', name: 'Recursos Humanos', icon: '👥' }
]

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [exportFunctions, setExportFunctions] = useState({
    exportToCSV: () => console.warn('CSV export not ready'),
    exportToExcel: () => console.warn('Excel export not ready'),
    exportToPDF: () => console.warn('PDF export not ready')
  })

  // Resetar funções de exportação quando mudar de aba
  useEffect(() => {
    setExportFunctions({
      exportToCSV: () => console.warn('CSV export not ready'),
      exportToExcel: () => console.warn('Excel export not ready'),
      exportToPDF: () => console.warn('PDF export not ready')
    })
  }, [activeTab])

  // Funções para lidar com exportações
  const handleExport = (type) => {
    if (activeTab === 'dashboard') {
      alert('Selecione uma tabela para exportar dados')
      return
    }

    switch (type) {
      case 'csv':
        if (exportFunctions.exportToCSV && typeof exportFunctions.exportToCSV === 'function') {
          exportFunctions.exportToCSV()
        } else {
          console.warn('exportToCSV function not available')
          alert('Função de exportação CSV não está disponível. Aguarde o carregamento completo da tabela.')
        }
        break
      case 'excel':
        if (exportFunctions.exportToExcel && typeof exportFunctions.exportToExcel === 'function') {
          exportFunctions.exportToExcel()
        } else {
          console.warn('exportToExcel function not available')
          alert('Função de exportação Excel não está disponível. Aguarde o carregamento completo da tabela.')
        }
        break
      case 'pdf':
        if (exportFunctions.exportToPDF && typeof exportFunctions.exportToPDF === 'function') {
          exportFunctions.exportToPDF()
        } else {
          console.warn('exportToPDF function not available')
          alert('Função de exportação PDF não está disponível. Aguarde o carregamento completo da tabela.')
        }
        break
    }
    setShowExportDropdown(false)
  }

  const handleSetExportFunctions = (functions) => {
    setExportFunctions(functions)
  }

  // Função para entrar/sair do modo fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.warn('Erro ao entrar em tela cheia:', err)
        setIsFullscreen(true)
      })
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false)
        }).catch(err => {
          console.warn('Erro ao sair da tela cheia:', err)
          setIsFullscreen(false)
        })
      } else {
        setIsFullscreen(false)
      }
    }
  }

  // Event listeners para fullscreen e ESC
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          setIsFullscreen(false)
        }
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [isFullscreen])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown-container')) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportDropdown])

  // Função para renderizar conteúdo baseado na aba ativa
  const renderContent = () => {
    if (loading) {
      return (
        <div className="content-loading">
          <div className="content-loading-spinner"></div>
          <p>Carregando dados...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => setError(null)}>
            Tentar novamente
          </button>
        </div>
      )
    }

    if (activeTab === 'dashboard') {
      return <DashboardHome />
    }

    // Renderizar RHView para a aba de Recursos Humanos
    if (activeTab === 'rh') {
      return <RHView onExportFunctionsReady={handleSetExportFunctions} />
    }

    // Renderizar TableView para outras abas
    const currentTable = TABLES.find(table => table.id === activeTab)
    if (currentTable) {
      return <TableView tableName={activeTab} onExportFunctionsReady={handleSetExportFunctions} />
    }

    return null
  }

  return (
    <div className={`dashboard ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Container Principal com Sidebar e Conteúdo */}
      <div className={`dashboard-body ${isFullscreen ? 'fullscreen-mode' : ''}`}>
        {/* Sidebar com Logo, Navegação e Controles */}
        <aside className="dashboard-sidebar">
          {/* Logo SynNova no cantinho da sidebar */}
          <div className="sidebar-logo">
            <img 
              src="/synnova-logo.svg" 
              alt="Logo SynNova" 
              className="sidebar-logo-img"
              onError={(e) => {
                e.target.src = "/Logo-SynNova.svg";
              }}
            />
          </div>
          
          {/* Header da Sidebar com Logo e Título */}
          <div className="sidebar-header">
            <div className="logo">
              <img 
                src="/USIFIX VETOR MINI.svg" 
                alt="Logo USIFIX" 
                onError={(e) => {
                  e.target.src = "/logo-usifix.jpg";
                }}
              />
            </div>
            <h1 className="sidebar-title">Relatório Rumo</h1>
          </div>

          {/* Navegação */}
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </button>
            
            {TABLES.map(table => (
              <button
                key={table.id}
                className={`nav-item ${activeTab === table.id ? 'active' : ''}`}
                onClick={() => setActiveTab(table.id)}
              >
                <span className="nav-icon">{table.icon}</span>
                <span className="nav-text">{table.name}</span>
              </button>
            ))}
          </nav>
          
          {/* Controles da Sidebar */}
          <div className="sidebar-controls">
            {/* Container dos 3 ícones em linha horizontal */}
            <div className="control-buttons-row">
              {/* Botão Fullscreen - Circular */}
              <button 
                className="control-btn-circle fullscreen-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Sair da tela cheia (ESC)" : "Entrar em tela cheia"}
              >
                {isFullscreen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                )}
              </button>

              {/* Botão de Exportar - Circular */}
              <div className="export-dropdown-container">
                <button 
                  className="control-btn-circle export-btn"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  title="Exportar relatório"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 6,2 18,2 18,9"></polyline>
                    <path d="M6,9 L18,9 L18,16 L6,16 Z"></path>
                    <rect x="6" y="11" width="12" height="3"></rect>
                    <polyline points="6,14 6,18 18,18 18,14"></polyline>
                    <circle cx="17" cy="11.5" r="0.5" fill="currentColor"></circle>
                  </svg>
                </button>
                
                {showExportDropdown && (
                  <div className="export-dropdown">
                    <button 
                      className="export-option csv-option"
                      onClick={() => handleExport('csv')}
                      disabled={activeTab === 'dashboard'}
                    >
                      <span className="export-icon">📊</span>
                      <span>CSV</span>
                    </button>
                    <button 
                      className="export-option excel-option"
                      onClick={() => handleExport('excel')}
                      disabled={activeTab === 'dashboard'}
                    >
                      <span className="export-icon">📋</span>
                      <span>Excel</span>
                    </button>
                    <button 
                      className="export-option pdf-option"
                      onClick={() => handleExport('pdf')}
                      disabled={activeTab === 'dashboard'}
                    >
                      <span className="export-icon">📄</span>
                      <span>PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Botão de Sair - Circular */}
              <button 
                className="control-btn-circle logout-btn" 
                onClick={onLogout} 
                title="Sair"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="content-body">
            {renderContent()}
          </div>
        </main>

        {/* Botão flutuante para sair do fullscreen */}
        {isFullscreen && (
          <button 
            className="fullscreen-exit-btn"
            onClick={toggleFullscreen}
            title="Sair da tela cheia (ESC)"
          >
            ⤓
          </button>
        )}
      </div>
    </div>
  )
} 