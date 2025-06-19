import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabaseClient.js'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import './styles/table-view.css'

const monthKeys = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function TableView({ tableName, onBack, onExportFunctionsReady }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [tempValue, setTempValue] = useState('')
  const [editingNote, setEditingNote] = useState(null) // ID da linha sendo editada
  const [tempNote, setTempNote] = useState('') // Valor temporário da anotação
  const [notes, setNotes] = useState({}) // Armazenar anotações por ID
  const tableRef = useRef(null)
  const notesTextareaRef = useRef(null) // Ref para o textarea das anotações

  // Utilitários para números
  const parseNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0
    if (typeof value === 'number') return isNaN(value) ? 0 : value
    if (typeof value === 'string') {
      const cleanedValue = value.replace(/\./g, '').replace(',', '.')
      const parsed = parseFloat(cleanedValue)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const formatNumber = (num) => {
    const validNum = parseNumber(num)
    return validNum.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  const formatForInput = (num) => {
    const validNum = parseNumber(num)
    return validNum === 0 ? '' : validNum.toFixed(2).replace('.', ',')
  }

  // Cálculos
  const calculateTotal = (row) => {
    return monthKeys.reduce((sum, month) => sum + parseNumber(row[month]), 0)
  }

  const calculateAverage = (row) => {
    const filledMonths = monthKeys.filter(month => parseNumber(row[month]) > 0)
    if (filledMonths.length === 0) return 0
    const total = filledMonths.reduce((sum, month) => sum + parseNumber(row[month]), 0)
    return total / filledMonths.length
  }

  // Totais das colunas
  const columnTotals = { Total_Anual: 0, Media_Anual: 0 }
  
  if (data && data.length > 0) {
    monthKeys.forEach(month => {
      columnTotals[month] = data.reduce((sum, row) => sum + parseNumber(row[month]), 0)
    })
    
    columnTotals.Total_Anual = data.reduce((sum, row) => sum + parseNumber(row.Total_Anual || 0), 0)
    
    const validAverages = data.map(row => calculateAverage(row)).filter(avg => avg > 0)
    columnTotals.Media_Anual = validAverages.length > 0 
      ? validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length 
      : 0
  } else {
    // Inicializar totais como zero quando não há dados
    monthKeys.forEach(month => {
      columnTotals[month] = 0
    })
  }

  // Carregar dados
  useEffect(() => {
    loadData()
  }, [tableName])

  // Expor funções de exportação para o Dashboard
  useEffect(() => {
    if (onExportFunctionsReady) {
      onExportFunctionsReady({
        exportToCSV,
        exportToExcel,
        exportToPDF
      })
    }
  }, [data, onExportFunctionsReady, tableName]) // Incluir tableName como dependência

  // Fechar editor de anotações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingNote && !event.target.closest('.notes-editor') && !event.target.closest('.notes-icon')) {
        handleNotesSave(editingNote)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingNote])

  // Focar no textarea quando o editor de anotações for aberto
  useEffect(() => {
    if (editingNote && notesTextareaRef.current) {
      // Usar setTimeout para garantir que o elemento esteja renderizado
      setTimeout(() => {
        const textarea = notesTextareaRef.current
        textarea.focus()
        textarea.select() // Selecionar todo o texto
        
        // Ajustar altura inicial baseada no conteúdo
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 250) + 'px'
      }, 50)
    }
  }, [editingNote])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setEditingCell(null)

    try {
      const { data: tableData, error } = await supabase
        .from(tableName)
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error

      const processedData = tableData.map(item => {
        const row = {
          id: item.id,
          categoria: item.categoria || '',
          ano: parseNumber(item.ano || new Date().getFullYear()),
          anotacoes: item.anotacoes || '' // Carregar anotações (se existir)
        }

        // Processar meses
        monthKeys.forEach(month => {
          row[month] = parseNumber(item[month])
        })

        // Calcular totais
        row.Total_Anual = calculateTotal(row)
        row.Media_Anual = calculateAverage(row)

        return row
      })

      // Carregar anotações no estado local (se existir a coluna)
      const notesData = {}
      processedData.forEach(row => {
        if (row.anotacoes) {
          notesData[row.id] = row.anotacoes
        }
      })
      setNotes(notesData)

      setData(processedData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar os dados da tabela')
    } finally {
      setLoading(false)
    }
  }

  // Edição de células CORRIGIDA
  const handleCellClick = (id, field) => {
    if (field === 'Total_Anual' || field === 'Media_Anual') return
    
    const row = data.find(r => r.id === id)
    if (!row) return
    
    const currentValue = field === 'categoria' ? row[field] : formatForInput(row[field])
    setEditingCell({ id, field })
    setTempValue(currentValue)
  }

  const handleCellSave = async (id, field, value) => {
    if (!value && value !== 0 && value !== '') return
    
    const parsedValue = field === 'categoria' ? value : parseNumber(value)
    
    try {
      // Encontrar linha original
      const originalRow = data.find(r => r.id === id)
      if (!originalRow) return

      // Criar nova linha com valores atualizados
      const updatedRow = { ...originalRow, [field]: parsedValue }
      if (field !== 'categoria') {
        updatedRow.Total_Anual = calculateTotal(updatedRow)
        updatedRow.Media_Anual = calculateAverage(updatedRow)
      }

      // Atualizar no Supabase
      const updateData = { 
        [field]: parsedValue,
        ...(field !== 'categoria' && {
          Total_Anual: updatedRow.Total_Anual,
          Media_Anual: updatedRow.Media_Anual
        })
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      // Atualizar estado local
      setData(prev => prev.map(row => 
        row.id === id ? updatedRow : row
      ))

      setEditingCell(null)
      setTempValue('')
      
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar alteração')
      setEditingCell(null)
      setTempValue('')
    }
  }

  const handleKeyPress = (e, id, field) => {
    if (e.key === 'Enter') {
      handleCellSave(id, field, tempValue)
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setTempValue('')
    }
  }

  const handleInputChange = (e) => {
    setTempValue(e.target.value)
  }

  const handleInputBlur = (id, field) => {
    handleCellSave(id, field, tempValue)
  }

  // Verificar se há dados relevantes (valores diferentes de zero)
  const hasRelevantData = data && data.length > 0 && data.some(row => {
    // Verifica se algum mês tem valor > 0
    return monthKeys.some(month => parseNumber(row[month]) > 0)
  })

  // Função para encontrar o maior valor de cada linha (apenas meses)
  const getMaxValueMonth = (row) => {
    let maxValue = 0
    let maxMonth = null
    
    monthKeys.forEach(month => {
      const value = parseNumber(row[month])
      if (value > maxValue) {
        maxValue = value
        maxMonth = month
      }
    })
    
    return maxValue > 0 ? maxMonth : null
  }

  // Funções para gerenciar anotações
  const handleNotesClick = (id, e) => {
    e.stopPropagation() // Evitar que o clique na categoria seja ativado
    const currentNote = notes[id] || ''
    setEditingNote(id)
    setTempNote(currentNote)
  }

  const handleNotesSave = async (id) => {
    try {
      // Tentar atualizar no Supabase
      const { error } = await supabase
        .from(tableName)
        .update({ anotacoes: tempNote })
        .eq('id', id)

      if (error) {
        // Se der erro de coluna não existe, apenas salvar localmente
        if (error.message.includes('column "anotacoes" of relation') || error.message.includes('anotacoes')) {
          console.warn('Coluna anotacoes não existe no banco. Salvando apenas localmente.')
          // Atualizar apenas estado local
          setNotes(prev => ({
            ...prev,
            [id]: tempNote
          }))
        } else {
          throw error
        }
      } else {
        // Atualizar estado local se salvou no banco
        setNotes(prev => ({
          ...prev,
          [id]: tempNote
        }))
      }

      setEditingNote(null)
      setTempNote('')
      
    } catch (err) {
      console.error('Erro ao salvar anotação:', err)
      alert('Erro ao salvar anotação. A funcionalidade está temporariamente disponível apenas nesta sessão.')
      // Salvar localmente mesmo com erro
      setNotes(prev => ({
        ...prev,
        [id]: tempNote
      }))
      setEditingNote(null)
      setTempNote('')
    }
  }

  const handleNotesKeyPress = (e, id) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNotesSave(id)
    } else if (e.key === 'Escape') {
      setEditingNote(null)
      setTempNote('')
    }
  }

  const handleNotesChange = (e) => {
    setTempNote(e.target.value)
    
    // Auto-expandir altura do textarea conforme o conteúdo
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 250) + 'px'
  }

  const handleNotesBlur = (id) => {
    handleNotesSave(id)
  }

  // FUNÇÕES DE EXPORTAÇÃO
  const exportToCSV = () => {
    // Verificar se há estrutura de dados para exportar
    if (!data || data.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    try {
      // Preparar dados para CSV
      const csvData = []
      
      // Cabeçalho
      const header = ['Categoria', ...monthKeys, 'Total Anual', 'Média Anual']
      csvData.push(header)
      
      // Dados das linhas
      data.forEach(row => {
        const csvRow = [
          row.categoria,
          ...monthKeys.map(month => parseNumber(row[month])),
          parseNumber(row.Total_Anual),
          parseNumber(row.Media_Anual)
        ]
        csvData.push(csvRow)
      })
      
      // Linha de totais
      const totalsRow = [
        'TOTAL GERAL',
        ...monthKeys.map(month => parseNumber(columnTotals[month])),
        parseNumber(columnTotals.Total_Anual),
        parseNumber(columnTotals.Media_Anual)
      ]
      csvData.push(totalsRow)
      
      // Converter para CSV
      const csvContent = csvData.map(row => row.join(';')).join('\n')
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${tableName}_${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      alert('Erro ao exportar para CSV')
    }
  }

  const exportToExcel = () => {
    // Verificar se há estrutura de dados para exportar
    if (!data || data.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    try {
      // Preparar dados para Excel
      const wsData = []
      
      // Cabeçalho
      const header = ['Categoria', ...monthKeys, 'Total Anual', 'Média Anual']
      wsData.push(header)
      
      // Dados das linhas
      data.forEach(row => {
        const excelRow = [
          row.categoria,
          ...monthKeys.map(month => parseNumber(row[month])),
          parseNumber(row.Total_Anual),
          parseNumber(row.Media_Anual)
        ]
        wsData.push(excelRow)
      })
      
      // Linha de totais
      const totalsRow = [
        'TOTAL GERAL',
        ...monthKeys.map(month => parseNumber(columnTotals[month])),
        parseNumber(columnTotals.Total_Anual),
        parseNumber(columnTotals.Media_Anual)
      ]
      wsData.push(totalsRow)
      
      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, tableName)
      
      // Download
      XLSX.writeFile(wb, `${tableName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
      
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      alert('Erro ao exportar para Excel')
    }
  }

  const exportToPDF = () => {
    // Verificar se há estrutura de dados para exportar
    if (!data || data.length === 0) {
      alert('Não há dados para exportar')
      return
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      // Preparar dados para tabela
      const tableData = []
      
      // Dados das linhas
      data.forEach(row => {
        const pdfRow = [
          row.categoria,
          ...monthKeys.map(month => formatNumber(row[month])),
          formatNumber(row.Total_Anual),
          formatNumber(row.Media_Anual)
        ]
        tableData.push(pdfRow)
      })
      
      // Linha de totais
      const totalsRow = [
        'TOTAL GERAL',
        ...monthKeys.map(month => formatNumber(columnTotals[month])),
        formatNumber(columnTotals.Total_Anual),
        formatNumber(columnTotals.Media_Anual)
      ]
      tableData.push(totalsRow)
      
      // Adicionar tabela ocupando toda a página
      autoTable(doc, {
        startY: 10,
        head: [['Categoria', ...monthKeys, 'Total Anual', 'Média Anual']],
        body: tableData,
        styles: { 
          fontSize: 7, 
          cellPadding: 2,
          halign: 'center',
          valign: 'middle',
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [0, 68, 136], 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        bodyStyles: { textColor: [50, 50, 50] },
        columnStyles: {
          0: { halign: 'left', cellWidth: 25 }, // Categoria - à esquerda
          1: { halign: 'center', cellWidth: 16.5 }, // Janeiro - centralizado
          2: { halign: 'center', cellWidth: 16.5 }, // Fevereiro
          3: { halign: 'center', cellWidth: 16.5 }, // Março
          4: { halign: 'center', cellWidth: 16.5 }, // Abril
          5: { halign: 'center', cellWidth: 16.5 }, // Maio
          6: { halign: 'center', cellWidth: 16.5 }, // Junho
          7: { halign: 'center', cellWidth: 16.5 }, // Julho
          8: { halign: 'center', cellWidth: 16.5 }, // Agosto
          9: { halign: 'center', cellWidth: 16.5 }, // Setembro
          10: { halign: 'center', cellWidth: 16.5 }, // Outubro
          11: { halign: 'center', cellWidth: 16.5 }, // Novembro
          12: { halign: 'center', cellWidth: 16.5 }, // Dezembro
          13: { halign: 'center', cellWidth: 20 }, // Total Anual - centralizado
          14: { halign: 'center', cellWidth: 20 }  // Média Anual - centralizado
        },
        margin: { left: 12, right: 12, top: 10, bottom: 15 },
        theme: 'striped',
        tableWidth: 'auto',
        halign: 'center',
        horizontalPageBreak: false,
        pageBreak: 'avoid',
        showHead: 'firstPage',
        showFoot: 'never',
        tableBreak: 'avoid',
        rowPageBreak: 'avoid',
        didParseCell: function (data) {
          // Aplicar estilo do cabeçalho na linha TOTAL GERAL
          if (data.row.index === tableData.length - 1) { // Última linha (TOTAL GERAL)
            data.cell.styles.fillColor = [0, 68, 136] // Mesma cor do cabeçalho
            data.cell.styles.textColor = [255, 255, 255] // Texto branco
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.fontSize = 7
          }
        }
      })
      
      // Data e hora no canto inferior direito
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const now = new Date()
      const dateTimeString = `Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`
      
      doc.setFontSize(7)
      const dateTimeWidth = doc.getTextWidth(dateTimeString)
      doc.text(dateTimeString, pageWidth - dateTimeWidth - 10, pageHeight - 10)
      
      // Download
      doc.save(`${tableName}_${new Date().toISOString().slice(0, 10)}.pdf`)
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      console.error('Detalhes do erro:', error.message)
      alert(`Erro ao exportar para PDF: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="table-loading">
        <div className="table-loading-spinner"></div>
        <p>Carregando dados de {tableName}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="table-error">
        <div className="error-icon">⚠️</div>
        <h3>Erro ao carregar dados</h3>
        <p>{error}</p>
        <button className="usifix-btn-primary" onClick={loadData}>
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="table-view">
      <div className="table-wrapper">
        <div className="table-container">
          <div className="table-scroll-container">
            <table ref={tableRef} className="data-table">
              <thead>
                <tr>
                  <th className="sticky-col">Categoria</th>
                  {monthKeys.map((month) => (
                    <th key={month} className="month-col">
                      {month}
                    </th>
                  ))}
                  <th className="total-col">Total Anual</th>
                  <th className="average-col">Média Anual</th>
                </tr>
              </thead>
              <tbody>
                {/* Só mostrar dados se há dados relevantes */}
                {hasRelevantData && data.map((row) => (
                  <tr key={row.id}>
                    <td className="sticky-col category-cell">
                      {editingCell?.id === row.id && editingCell?.field === 'categoria' ? (
                        <input
                          type="text"
                          value={tempValue}
                          onChange={handleInputChange}
                          onBlur={() => handleInputBlur(row.id, 'categoria')}
                          onKeyDown={(e) => handleKeyPress(e, row.id, 'categoria')}
                          className="cell-input"
                          autoFocus
                        />
                      ) : (
                        <>
                          <div 
                            className="cell-content"
                            onClick={() => handleCellClick(row.id, 'categoria')}
                          >
                            {row.categoria}
                          </div>
                          
                          {/* Ícone de anotações */}
                          <div 
                            className="notes-icon"
                            onClick={(e) => handleNotesClick(row.id, e)}
                            title={notes[row.id] ? 'Ver/editar anotação' : 'Adicionar anotação'}
                          >
                            +
                          </div>
                          
                          {/* Editor de anotações */}
                          {editingNote === row.id && (
                            <div className="notes-editor">
                              <textarea
                                ref={notesTextareaRef}
                                className="notes-textarea"
                                value={tempNote}
                                onChange={handleNotesChange}
                                onBlur={() => handleNotesBlur(row.id)}
                                onKeyDown={(e) => handleNotesKeyPress(e, row.id)}
                                placeholder="Digite sua anotação aqui..."
                                autoFocus
                                disabled={false}
                                readOnly={false}
                                tabIndex={0}
                              />
                              <div className="notes-editor-hint">
                                Pressione Enter para salvar ou Esc para cancelar
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    
                    {monthKeys.map((month) => {
                      const isMaxValue = getMaxValueMonth(row) === month
                      const cellClass = `number-cell month-col ${isMaxValue ? 'max-value-cell' : ''}`
                      
                      return (
                        <td key={month} className={cellClass}>
                          {editingCell?.id === row.id && editingCell?.field === month ? (
                            <input
                              type="text"
                              value={tempValue}
                              onChange={handleInputChange}
                              onBlur={() => handleInputBlur(row.id, month)}
                              onKeyDown={(e) => handleKeyPress(e, row.id, month)}
                              className="cell-input number-input"
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="cell-content"
                              onClick={() => handleCellClick(row.id, month)}
                            >
                              {formatNumber(row[month])}
                            </div>
                          )}
                        </td>
                      )
                    })}
                    
                    <td className="number-cell total-cell">
                      {formatNumber(row.Total_Anual)}
                    </td>
                    
                    <td className="number-cell average-cell">
                      {formatNumber(row.Media_Anual)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td className="sticky-col total-label">TOTAL GERAL</td>
                  {monthKeys.map((month) => (
                    <td key={month} className="number-cell total-value month-col">
                      {formatNumber(columnTotals[month])}
                    </td>
                  ))}
                  <td className="number-cell total-value grand-total">
                    {formatNumber(columnTotals.Total_Anual)}
                  </td>
                  <td className="number-cell total-value average-total">
                    {formatNumber(columnTotals.Media_Anual)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 