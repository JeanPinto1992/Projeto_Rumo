import { useState, useEffect, useRef, useMemo } from 'react'
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
  const [showTotalDropdown, setShowTotalDropdown] = useState(false)
  const [totalDisplayMode, setTotalDisplayMode] = useState('total') // 'total', 'media', 'comparativo'
  const [previousMonthData, setPreviousMonthData] = useState({})
  const [currentRowIndex, setCurrentRowIndex] = useState(0) // Índice da primeira linha visível
  const [selectedYear, setSelectedYear] = useState(2025) // Ano selecionado
  const tableRef = useRef(null)
  const notesTextareaRef = useRef(null) // Ref para o textarea das anotações
  const dropdownRef = useRef(null)

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

  // Dados para exibição (filtrado por ano)
  const filteredData = data.filter(row => parseNumber(row.ano) === selectedYear)

  // Totais das colunas baseado nos dados filtrados por ano (exceto para tabela impostos - não mostrar TOTAL GERAL)
  const columnTotals = useMemo(() => {
    const totals = { Total_Anual: 0, Media_Anual: 0 }
    
    // Inicializar todos os meses com zero
    monthKeys.forEach(month => {
      totals[month] = 0
    })
    
    // Só calcular totais se não for tabela impostos e houver dados filtrados
    if (filteredData && filteredData.length > 0 && tableName !== 'impostos') {
      // Somar valores de cada mês dos dados filtrados por ano
      monthKeys.forEach(month => {
        totals[month] = filteredData.reduce((sum, row) => sum + parseNumber(row[month]), 0)
      })
      
      // Somar total anual dos dados filtrados por ano
      totals.Total_Anual = filteredData.reduce((sum, row) => sum + parseNumber(row.Total_Anual || 0), 0)
      
      // Calcular média das médias anuais dos dados filtrados por ano
      const validAverages = filteredData.map(row => calculateAverage(row)).filter(avg => avg > 0)
      totals.Media_Anual = validAverages.length > 0 
        ? validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length 
        : 0
    }
    
    return totals
  }, [filteredData, tableName, selectedYear]) // Recalcular quando filteredData, tableName ou selectedYear mudarem

  // Carregar dados
  useEffect(() => {
    loadData()
  }, [tableName])

  // Recarregar dados quando o ano mudar
  useEffect(() => {
    if (data.length > 0) {
      // Se já temos dados carregados, não precisamos recarregar tudo
      // apenas filtrar por ano
    }
  }, [selectedYear])

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

      // Tratamentos especiais para diferentes tabelas
      let finalData = processedData
      
      // Tratamento especial para tabela faturamento - criar linha "Faturamento X Meta"
      if (tableName === 'faturamento') {
        const faturamentoRow = processedData.find(row => row.categoria.toLowerCase().trim() === 'faturamento')
        const metaRow = processedData.find(row => row.categoria.toLowerCase().trim() === 'meta')
        
        if (faturamentoRow && metaRow) {

          
          // Verificar se já existe linha "Faturamento X Meta"
          const existingRow = processedData.find(row => row.categoria.toLowerCase().includes('faturamento x meta'))
          
          if (!existingRow) {
            // Criar linha "Faturamento X Meta" automaticamente
            const faturamentoMetaRow = {
              id: Date.now(), // ID temporário único
              categoria: 'Faturamento X Meta',
              ano: new Date().getFullYear(),
              anotacoes: ''
            }
            
            // Calcular diferença para cada mês (Meta - Faturamento para inverter a lógica)
            monthKeys.forEach(month => {
              const faturamento = parseNumber(faturamentoRow[month])
              const meta = parseNumber(metaRow[month])
              faturamentoMetaRow[month] = meta - faturamento
            })
            
            // Calcular totais da diferença
            faturamentoMetaRow.Total_Anual = calculateTotal(faturamentoMetaRow)
            faturamentoMetaRow.Media_Anual = calculateAverage(faturamentoMetaRow)
            
            // Adicionar linha após a linha Meta
            const metaIndex = finalData.findIndex(row => row.categoria.toLowerCase() === 'meta')
            if (metaIndex !== -1) {
              finalData.splice(metaIndex + 1, 0, faturamentoMetaRow)
            } else {
              finalData.push(faturamentoMetaRow)
            }
          }
        }

        // Tratamento especial para tabela impostos - criar linha "Impostos" baseada no faturamento
        if (tableName === 'impostos') {
          try {
            // Buscar dados de faturamento da tabela faturamento
            const { data: faturamentoData, error: faturamentoError } = await supabase
              .from('faturamento')
              .select('*')
              .order('id', { ascending: true })

            if (!faturamentoError && faturamentoData && faturamentoData.length > 0) {
              // Encontrar linha de faturamento (não "Meta" ou "Faturamento X Meta")
              const faturamentoRow = faturamentoData.find(row => 
                row.categoria && 
                row.categoria.toLowerCase().trim() === 'faturamento'
              )

              if (faturamentoRow) {
                // Verificar se já existe linha "Impostos"
                const existingImpostosRow = finalData.find(row => 
                  row.categoria && row.categoria.toLowerCase().trim() === 'impostos'
                )

                if (!existingImpostosRow) {
                  // Criar linha "Impostos" automaticamente (16,33% do faturamento)
                  const impostosRow = {
                    id: Date.now(), // ID temporário único
                    categoria: 'Impostos',
                    ano: new Date().getFullYear()
                  }

                  // Calcular 16,33% do faturamento para cada mês
                  const percentualImpostos = 0.1633 // 16,33%
                  monthKeys.forEach(month => {
                    const faturamentoMes = parseNumber(faturamentoRow[month])
                    impostosRow[month] = faturamentoMes * percentualImpostos
                  })

                  // Calcular para Total Anual
                  const faturamentoTotal = parseNumber(faturamentoRow.Total_Anual)
                  impostosRow.Total_Anual = faturamentoTotal * percentualImpostos

                  // Adicionar linha no início da tabela
                  finalData.unshift(impostosRow)
                }
              }
            }
          } catch (faturamentoFetchError) {
            console.warn('Erro ao buscar dados de faturamento para cálculo de impostos:', faturamentoFetchError)
          }
        }
      }

      setData(finalData)
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
    
    // Impedir edição de linhas calculadas automaticamente
    if (tableName === 'impostos' && row.categoria && row.categoria.toLowerCase().trim() === 'impostos') {
      return // Linha "Impostos" não pode ser editada
    }
    if (tableName === 'faturamento' && row.categoria && row.categoria.toLowerCase().includes('faturamento x meta')) {
      return // Linha "Faturamento X Meta" não pode ser editada
    }
    
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

  // Verificar se há dados relevantes (valores diferentes de zero) nos dados filtrados
  const hasRelevantData = filteredData && filteredData.length > 0 && filteredData.some(row => {
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

  // FUNCIONALIDADES DO DROPDOWN DE TOTAL GERAL
  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTotalDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Função para alternar o dropdown
  const toggleTotalDropdown = () => {
    setShowTotalDropdown(!showTotalDropdown)
  }

  // Função para selecionar o modo de exibição
  const handleTotalModeSelect = (mode) => {
    setTotalDisplayMode(mode)
    setShowTotalDropdown(false)
  }

  // Função para calcular médias das colunas
  const calculateColumnAverages = () => {
    const averages = {}
    if (data && data.length > 0) {
      monthKeys.forEach(month => {
        const validValues = data.filter(row => parseNumber(row[month]) > 0)
        if (validValues.length > 0) {
          const sum = validValues.reduce((acc, row) => acc + parseNumber(row[month]), 0)
          averages[month] = sum / validValues.length
        } else {
          averages[month] = 0
        }
      })
      
      // Calcular média do total anual
      const validTotals = data.filter(row => parseNumber(row.Total_Anual) > 0)
      if (validTotals.length > 0) {
        const totalSum = validTotals.reduce((acc, row) => acc + parseNumber(row.Total_Anual), 0)
        averages.Total_Anual = totalSum / validTotals.length
      } else {
        averages.Total_Anual = 0
      }
      
      // Calcular média das médias anuais
      const validAverages = data.filter(row => parseNumber(row.Media_Anual) > 0)
      if (validAverages.length > 0) {
        const avgSum = validAverages.reduce((acc, row) => acc + parseNumber(row.Media_Anual), 0)
        averages.Media_Anual = avgSum / validAverages.length
      } else {
        averages.Media_Anual = 0
      }
    }
    return averages
  }

  // Função para calcular comparativo (tabela faturamento: diferença com meta, outras: mês anterior)
  const getPreviousMonthComparison = useMemo(() => {
    const comparisons = {}
    if (data && data.length > 0) {
      if (tableName === 'faturamento') {
        // Para tabela faturamento: mostrar diferença com a meta (excluindo "Faturamento X Meta")
        const faturamentoRow = data.find(row => row.categoria.toLowerCase().trim() === 'faturamento')
        const metaRow = data.find(row => row.categoria.toLowerCase().trim() === 'meta')
        
        if (faturamentoRow && metaRow) {
          monthKeys.forEach(month => {
            const faturamento = parseNumber(faturamentoRow[month])
            const meta = parseNumber(metaRow[month])
            
            if (meta > 0) {
              const diferenca = meta - faturamento // Meta - Faturamento (invertido para consistência)
              comparisons[month] = diferenca
            } else {
              comparisons[month] = null
            }
          })
          
          // Para total anual
          const faturamentoTotal = parseNumber(faturamentoRow.Total_Anual)
          const metaTotal = parseNumber(metaRow.Total_Anual)
          if (metaTotal > 0) {
            comparisons.Total_Anual = metaTotal - faturamentoTotal
          } else {
            comparisons.Total_Anual = null
          }
        }
      } else {
        // Para outras tabelas: lógica original de comparativo mês anterior
        monthKeys.forEach((month, index) => {
          if (index === 0) {
            // Janeiro não tem mês anterior para comparar
            comparisons[month] = null
          } else {
            // Comparar com o mês anterior
            const currentValue = parseNumber(columnTotals[month])
            const previousMonth = monthKeys[index - 1]
            const previousValue = parseNumber(columnTotals[previousMonth])
            
            if (currentValue > 0 && previousValue > 0) {
              const variation = ((currentValue - previousValue) / previousValue) * 100
              comparisons[month] = variation
            } else if (currentValue > 0 && previousValue === 0) {
              // Se mês anterior era 0 e atual tem valor, é crescimento infinito
              comparisons[month] = null // Não mostrar valor
            } else if (currentValue === 0 && previousValue > 0) {
              // Se atual é 0 e anterior tinha valor, é queda de 100%
              comparisons[month] = -100
            } else {
              // Ambos são 0
              comparisons[month] = null
            }
          }
        })
        
        // Total Anual e Média Anual não devem ter comparativo
        comparisons.Total_Anual = null
        comparisons.Media_Anual = null
      }
    }
    return comparisons
  }, [data, columnTotals, tableName]) // Dependências controladas para evitar re-cálculo infinito

  // Função para formatar variação percentual
  const formatVariation = (variation) => {
    if (variation === null || variation === undefined) return '--'
    if (variation === 0) return '0%'
    
    // Para valores muito grandes, limitar a 999.9%
    const limitedVariation = Math.max(-999.9, Math.min(999.9, variation))
    const sign = limitedVariation > 0 ? '+' : ''
    return `${sign}${limitedVariation.toFixed(1)}%`
  }

  // Função para obter a cor da variação
  const getVariationColor = (variation) => {
    if (variation === null || variation === undefined) return '#6b7280' // Cinza para N/A
    if (variation > 0) return '#22c55e' // Verde
    if (variation < 0) return '#ef4444' // Vermelho
    return '#6b7280' // Cinza para zero
  }

  // Função para renderizar o valor baseado no modo selecionado
  const renderTotalValue = (field) => {
    switch (totalDisplayMode) {
      case 'media':
        const averages = calculateColumnAverages()
        return formatNumber(averages[field] || 0)
      
      case 'comparativo':
        const variation = getPreviousMonthComparison[field]
        if (variation === null || variation === undefined) {
          return (
            <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
              --
            </span>
          )
        }
        
        // Para tabela faturamento, mostrar valor absoluto da diferença com a meta
        if (tableName === 'faturamento') {
          return formatFaturamentoMetaValue(variation)
        } else {
          // Para outras tabelas, mostrar percentual
          return (
            <span style={{ color: getVariationColor(variation) }}>
              {formatVariation(variation)}
            </span>
          )
        }
      
      default: // 'total'
        // Tratamento especial para tabela faturamento - mostrar % de atingimento da meta
        if (tableName === 'faturamento') {
          const achievement = calculateGoalAchievement()
          const percentage = achievement[field] || 0
          return formatAchievement(percentage)
        } else {
          // Para outras tabelas, mostrar soma normal
          return formatNumber(columnTotals[field])
        }
    }
  }

  // Função para calcular percentual de atingimento da meta (específico para tabela faturamento)
  const calculateGoalAchievement = () => {
    const achievement = {}
    if (tableName === 'faturamento' && data && data.length > 0) {
      // Encontrar as linhas de Faturamento e Meta (excluindo "Faturamento X Meta")
      const faturamentoRow = data.find(row => row.categoria.toLowerCase().trim() === 'faturamento')
      const metaRow = data.find(row => row.categoria.toLowerCase().trim() === 'meta')
      
      if (faturamentoRow && metaRow) {
        monthKeys.forEach(month => {
          const faturamento = parseNumber(faturamentoRow[month])
          const meta = parseNumber(metaRow[month])
          
          if (meta > 0) {
            achievement[month] = (faturamento / meta) * 100
          } else {
            achievement[month] = 0
          }
        })
        
        // Calcular para total anual
        const faturamentoTotal = parseNumber(faturamentoRow.Total_Anual)
        const metaTotal = parseNumber(metaRow.Total_Anual)
        if (metaTotal > 0) {
          achievement.Total_Anual = (faturamentoTotal / metaTotal) * 100
        } else {
          achievement.Total_Anual = 0
        }
        
        // Calcular para média anual  
        const faturamentoMedia = parseNumber(faturamentoRow.Media_Anual)
        const metaMedia = parseNumber(metaRow.Media_Anual)
        if (metaMedia > 0) {
          achievement.Media_Anual = (faturamentoMedia / metaMedia) * 100
        } else {
          achievement.Media_Anual = 0
        }
      }
    }
    return achievement
  }

  // Função para formatar percentual de atingimento
  const formatAchievement = (percentage) => {
    if (percentage === 0 || percentage === null || percentage === undefined) return '0%'
    
    const color = percentage >= 100 ? '#22c55e' : percentage >= 80 ? '#f59e0b' : '#ef4444'
    return (
      <span style={{ color, fontWeight: 'bold' }}>
        {percentage.toFixed(1)}%
      </span>
    )
  }

  // Função para formatar valores da linha "Faturamento X Meta"
  const formatFaturamentoMetaValue = (value) => {
    const numValue = parseNumber(value)
    if (numValue === 0) return formatNumber(0)
    
    // Inverter valor e sinal para lógica intuitiva: + = ultrapassou (verde), - = não atingiu (vermelho)
    const invertedValue = -numValue
    const color = invertedValue > 0 ? '#22c55e' : '#ef4444'
    
    return (
      <span style={{ color, fontWeight: 'bold' }}>
        {invertedValue > 0 ? '+' : ''}{formatNumber(invertedValue)}
      </span>
    )
  }

  // Função para obter o texto do label baseado no modo selecionado
  const getTotalLabel = () => {
    if (tableName === 'faturamento') {
      switch (totalDisplayMode) {
        case 'media':
          return 'MÉDIA GERAL'
        case 'comparativo':
          return 'COMPARATIVO'
        default:
          return 'ATINGIMENTO META'
      }
    } else {
      switch (totalDisplayMode) {
        case 'media':
          return 'MÉDIA GERAL'
        case 'comparativo':
          return 'COMPARATIVO'
        default:
          return 'TOTAL GERAL'
      }
    }
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
      
      // Cabeçalho (sem Média Anual para tabela faturamento)
      const header = tableName === 'faturamento' 
        ? ['Categoria', ...monthKeys, 'Total Anual']
        : ['Categoria', ...monthKeys, 'Total Anual', 'Média Anual']
      csvData.push(header)
      
      // Dados das linhas (sem Média Anual para tabela faturamento)
      data.forEach(row => {
        const csvRow = tableName === 'faturamento'
          ? [
              row.categoria,
              ...monthKeys.map(month => parseNumber(row[month])),
              parseNumber(row.Total_Anual)
            ]
          : [
              row.categoria,
              ...monthKeys.map(month => parseNumber(row[month])),
              parseNumber(row.Total_Anual),
              parseNumber(row.Media_Anual)
            ]
        csvData.push(csvRow)
      })
      
              // Linha de totais (tratamento especial para faturamento, excluir para impostos)
      if (tableName !== 'impostos') {
        let totalsRow
        if (tableName === 'faturamento') {
          const achievement = calculateGoalAchievement()
          totalsRow = [
            'ATINGIMENTO META',
            ...monthKeys.map(month => `${(achievement[month] || 0).toFixed(1)}%`),
            `${(achievement.Total_Anual || 0).toFixed(1)}%`
          ]
        } else {
          totalsRow = [
            'TOTAL GERAL',
            ...monthKeys.map(month => parseNumber(columnTotals[month])),
            parseNumber(columnTotals.Total_Anual),
            parseNumber(columnTotals.Media_Anual)
          ]
        }
        csvData.push(totalsRow)
      }
      
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
      
      // Cabeçalho (sem Média Anual para tabela faturamento)
      const header = tableName === 'faturamento' 
        ? ['Categoria', ...monthKeys, 'Total Anual']
        : ['Categoria', ...monthKeys, 'Total Anual', 'Média Anual']
      wsData.push(header)
      
      // Dados das linhas (sem Média Anual para tabela faturamento)
      data.forEach(row => {
        const excelRow = tableName === 'faturamento'
          ? [
              row.categoria,
              ...monthKeys.map(month => parseNumber(row[month])),
              parseNumber(row.Total_Anual)
            ]
          : [
              row.categoria,
              ...monthKeys.map(month => parseNumber(row[month])),
              parseNumber(row.Total_Anual),
              parseNumber(row.Media_Anual)
            ]
        wsData.push(excelRow)
      })
      
      // Linha de totais (tratamento especial para faturamento, excluir para impostos)
      if (tableName !== 'impostos') {
        let totalsRow
        if (tableName === 'faturamento') {
          const achievement = calculateGoalAchievement()
          totalsRow = [
            'ATINGIMENTO META',
            ...monthKeys.map(month => `${(achievement[month] || 0).toFixed(1)}%`),
            `${(achievement.Total_Anual || 0).toFixed(1)}%`
          ]
        } else {
          totalsRow = [
            'TOTAL GERAL',
            ...monthKeys.map(month => parseNumber(columnTotals[month])),
            parseNumber(columnTotals.Total_Anual),
            parseNumber(columnTotals.Media_Anual)
          ]
        }
        wsData.push(totalsRow)
      }
      
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
      
      // Dados das linhas (sem Média Anual para tabela faturamento)
      data.forEach(row => {
        const pdfRow = tableName === 'faturamento'
          ? [
              row.categoria,
              ...monthKeys.map(month => formatNumber(row[month])),
              formatNumber(row.Total_Anual)
            ]
          : [
              row.categoria,
              ...monthKeys.map(month => formatNumber(row[month])),
              formatNumber(row.Total_Anual),
              formatNumber(row.Media_Anual)
            ]
        tableData.push(pdfRow)
      })
      
      // Linha de totais (tratamento especial para faturamento, excluir para impostos)
      if (tableName !== 'impostos') {
        let totalsRow
        if (tableName === 'faturamento') {
          const achievement = calculateGoalAchievement()
          totalsRow = [
            'ATINGIMENTO META',
            ...monthKeys.map(month => `${(achievement[month] || 0).toFixed(1)}%`),
            `${(achievement.Total_Anual || 0).toFixed(1)}%`
          ]
        } else {
          totalsRow = [
            'TOTAL GERAL',
            ...monthKeys.map(month => formatNumber(columnTotals[month])),
            formatNumber(columnTotals.Total_Anual),
            formatNumber(columnTotals.Media_Anual)
          ]
        }
        tableData.push(totalsRow)
      }
      
      // Adicionar tabela ocupando toda a página
      const tableHeader = tableName === 'faturamento' 
        ? [['Categoria', ...monthKeys, 'Total Anual']]
        : [['Categoria', ...monthKeys, 'Total Anual', 'Média Anual']]
      
      autoTable(doc, {
        startY: 10,
        head: tableHeader,
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
        columnStyles: tableName === 'faturamento' 
          ? {
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
            }
          : {
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
          // Aplicar estilo do cabeçalho na linha TOTAL GERAL (exceto para impostos)
          if (tableName !== 'impostos' && data.row.index === tableData.length - 1) { // Última linha (TOTAL GERAL)
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

  // Funções para navegação linha por linha
  const scrollUp = () => {
    if (currentRowIndex > 0) {
      setCurrentRowIndex(currentRowIndex - 1)
    }
  }

  const scrollDown = () => {
    if (currentRowIndex < filteredData.length) {
      setCurrentRowIndex(currentRowIndex + 1)
    }
  }

  // Calcular linhas visíveis baseado no índice atual e filtro de categorias
  const getVisibleRows = () => {
    if (!filteredData || filteredData.length === 0) return []
    
    // Se currentRowIndex = 0, mostra todas as linhas filtradas
    // Se currentRowIndex > 0, esconde as primeiras currentRowIndex linhas filtradas
    if (currentRowIndex === 0) {
      return filteredData
    }
    
    return filteredData.slice(currentRowIndex)
  }

  // Resetar índice quando mudar de tabela
  useEffect(() => {
    setCurrentRowIndex(0)
  }, [tableName])

  if (loading) {
    return (
      <div className="table-loading">
        <div className="table-loading-spinner"></div>
        
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

  const visibleRows = getVisibleRows()
  const canScrollUp = currentRowIndex > 0
  const canScrollDown = currentRowIndex < filteredData.length

  // Função para alternar entre anos
  const handleYearChange = (year) => {
    setSelectedYear(year)
    setCurrentRowIndex(0) // Resetar índice ao mudar de ano
  }

  return (
    <>
      {/* Seletor de anos - FORA da estrutura da tabela, posicionado de forma fixa */}
      <div className="year-selector-compact">
        <div className="year-buttons-right">
          <button 
            className={`year-btn-compact ${selectedYear === 2024 ? 'active' : ''}`}
            onClick={() => handleYearChange(2024)}
          >
            2024
          </button>
          <button 
            className={`year-btn-compact ${selectedYear === 2025 ? 'active' : ''}`}
            onClick={() => handleYearChange(2025)}
          >
            2025
          </button>
        </div>
      </div>
    
      {/* Setas posicionadas FORA da estrutura da tabela */}
      <div className="scroll-controls-fixed">
        <button 
          className="scroll-arrow scroll-up"
          onClick={scrollUp}
          disabled={!canScrollUp}
          title="Subir uma linha"
        >
          ▲
        </button>
        <button 
          className="scroll-arrow scroll-down"
          onClick={scrollDown}
          disabled={!canScrollDown}
          title="Descer uma linha"
        >
          ▼
        </button>
      </div>

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
                    {/* Ocultar coluna Média Anual apenas na tabela faturamento */}
                    {tableName !== 'faturamento' && (
                      <th className="average-col">Média Anual</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* Mostrar apenas as linhas visíveis */}
                  {hasRelevantData && visibleRows.map((row) => {
                    // Verificar se é uma linha calculada automaticamente
                    const isAutoCalculated = (
                      (tableName === 'impostos' && row.categoria && row.categoria.toLowerCase().trim() === 'impostos') ||
                      (tableName === 'faturamento' && row.categoria && row.categoria.toLowerCase().includes('faturamento x meta'))
                    )
                    
                    return (
                    <tr key={row.id} className={isAutoCalculated ? 'auto-calculated-row' : ''}>
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
                              title={isAutoCalculated ? 'Linha calculada automaticamente - não editável' : undefined}
                            >
                              {row.categoria}
                              {/* Indicador para linhas calculadas automaticamente (exceto impostos) */}
                              {isAutoCalculated && tableName !== 'impostos' && (
                                <span style={{ 
                                  marginLeft: '0.5rem', 
                                  fontSize: '0.6rem', 
                                  opacity: 0.7,
                                  color: '#22c55e'
                                }}>
                                  📊
                                </span>
                              )}
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
                        // Não destacar maiores valores na tabela faturamento
                        const isMaxValue = tableName !== 'faturamento' && getMaxValueMonth(row) === month
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
                                {/* Formatação especial para linha Faturamento X Meta na tabela faturamento */}
                                {tableName === 'faturamento' && row.categoria.toLowerCase().includes('faturamento x meta') 
                                  ? formatFaturamentoMetaValue(row[month])
                                  : formatNumber(row[month])
                                }
                              </div>
                            )}
                          </td>
                        )
                      })}
                      
                      <td className="number-cell total-cell">
                        {/* Formatação especial para linha Faturamento X Meta na tabela faturamento */}
                        {tableName === 'faturamento' && row.categoria.toLowerCase().includes('faturamento x meta') 
                          ? formatFaturamentoMetaValue(row.Total_Anual)
                          : formatNumber(row.Total_Anual)
                        }
                      </td>
                      
                      {/* Ocultar coluna Média Anual apenas na tabela faturamento */}
                      {tableName !== 'faturamento' && (
                        <td className="number-cell average-cell">
                          {formatNumber(row.Media_Anual)}
                        </td>
                      )}
                    </tr>
                    )
                  })}
                </tbody>
                {/* Ocultar rodapé TOTAL GERAL na tabela impostos */}
                {tableName !== 'impostos' && (
                <tfoot>
                  <tr className="totals-row">
                    <td className="sticky-col total-label">
                      <div className="total-label-container" ref={dropdownRef}>
                        {/* Só não mostrar seta para ATINGIMENTO META na tabela faturamento */}
                        <span 
                          className="total-arrow"
                          onClick={!(tableName === 'faturamento' && totalDisplayMode === 'total') ? toggleTotalDropdown : undefined}
                          style={!(tableName === 'faturamento' && totalDisplayMode === 'total') ? { cursor: 'pointer' } : { cursor: 'default', opacity: 0.3 }}
                        >
                          {showTotalDropdown ? '▼' : '▶'}
                        </span>
                        <span 
                          className="total-text"
                          onClick={!(tableName === 'faturamento' && totalDisplayMode === 'total') ? toggleTotalDropdown : undefined}
                          style={!(tableName === 'faturamento' && totalDisplayMode === 'total') ? { cursor: 'pointer' } : { cursor: 'default' }}
                        >
                          {getTotalLabel()}
                        </span>
                        
                        {showTotalDropdown && !(tableName === 'faturamento' && totalDisplayMode === 'total') && (
                          <div className="total-dropdown">
                            <div 
                              className={`dropdown-option ${totalDisplayMode === 'total' ? 'active' : ''}`}
                              onClick={() => handleTotalModeSelect('total')}
                            >
                              TOTAL
                            </div>
                            <div 
                              className={`dropdown-option ${totalDisplayMode === 'media' ? 'active' : ''}`}
                              onClick={() => handleTotalModeSelect('media')}
                            >
                              MÉDIA
                            </div>
                            <div 
                              className={`dropdown-option ${totalDisplayMode === 'comparativo' ? 'active' : ''}`}
                              onClick={() => handleTotalModeSelect('comparativo')}
                            >
                              COMPARATIVO
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    {monthKeys.map((month) => (
                      <td key={month} className="number-cell total-value month-col">
                        {renderTotalValue(month)}
                      </td>
                    ))}
                    <td className="number-cell total-value grand-total">
                      {renderTotalValue('Total_Anual')}
                    </td>
                    {/* Ocultar coluna Média Anual apenas na tabela faturamento */}
                    {tableName !== 'faturamento' && (
                      <td className="number-cell total-value average-total">
                        {renderTotalValue('Media_Anual')}
                      </td>
                    )}
                  </tr>
                </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
