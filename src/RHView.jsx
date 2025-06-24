import React, { useState, useEffect } from 'react'
import TableView from './TableView.jsx'
import './styles/table-view.css'
import './styles/rh-view.css'

const RH_TABLES = [
  { id: 'rh_gastos_gerais', name: 'Gastos Gerais', icon: '💰', description: 'Gastos operacionais e administrativos de RH' },
  { id: 'rh_custos_totais', name: 'Custos Totais', icon: '📊', description: 'Resumo consolidado dos custos de RH' },
  { id: 'rh_passivo_trabalhista', name: 'Passivo Trabalhista', icon: '⚖️', description: 'Passivos trabalhistas da contabilidade' }
]

export default function RHView({ onExportFunctionsReady, isFirstLoad = true }) {
  const [activeSubTab, setActiveSubTab] = useState('rh_gastos_gerais')
  const [subTabCache, setSubTabCache] = useState(new Set(['rh_gastos_gerais'])) // Primeira sub-aba já no cache
  const [exportFunctions, setExportFunctions] = useState({
    exportToCSV: () => console.warn('CSV export not ready'),
    exportToExcel: () => console.warn('Excel export not ready'),
    exportToPDF: () => console.warn('PDF export not ready')
  })

  // Propagar as funções de exportação para o Dashboard pai
  useEffect(() => {
    if (onExportFunctionsReady) {
      onExportFunctionsReady(exportFunctions)
    }
  }, [exportFunctions, onExportFunctionsReady])

  // Resetar funções de exportação quando mudar de sub-aba
  useEffect(() => {
    setExportFunctions({
      exportToCSV: () => console.warn('CSV export not ready'),
      exportToExcel: () => console.warn('Excel export not ready'),
      exportToPDF: () => console.warn('PDF export not ready')
    })
  }, [activeSubTab])

  const handleSetExportFunctions = (functions) => {
    setExportFunctions(functions)
  }

  return (
    <div className="rh-view">
      {/* Sub-navegação */}
      <div className="rh-subnav">
        <div className="subnav-tabs">
          {RH_TABLES.map(table => (
            <button
              key={table.id}
              className={`subnav-tab ${activeSubTab === table.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSubTab(table.id)
                setSubTabCache(prev => new Set([...prev, table.id]))
              }}
              title={table.description}
            >
              <span className="subnav-icon">{table.icon}</span>
              <span className="subnav-text">{table.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da sub-aba ativa */}
      <div className="rh-content">
        <TableView 
          tableName={activeSubTab} 
          onExportFunctionsReady={handleSetExportFunctions}
          isFirstLoad={isFirstLoad && !subTabCache.has(activeSubTab)}
        />
      </div>
    </div>
  )
} 