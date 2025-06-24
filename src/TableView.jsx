import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient.js'
import './styles/table-view.css'
// As bibliotecas PDF e Excel são carregadas via CDN no index.html

const monthKeys = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const monthLabels = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
]

// Estilos inline para garantir layout - TODAS AS COLUNAS VISÍVEIS  
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: 'calc(100% - 40px)', // 40px reservados para as setas
  padding: '0',
  boxSizing: 'border-box',
  margin: '0',
  minHeight: '200px', // Altura mínima
  maxHeight: 'calc(100vh - 60px)', // Altura máxima
  position: 'relative',
  overflow: 'visible' // Permite que as setas sejam visíveis
}

// Estilos para os botões de filtro por ano
const yearFilterStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  gap: '0.8rem',
  marginBottom: '0.5rem',
  padding: '0.5rem 1rem',
  background: 'transparent'
}

const yearButtonStyle = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '2px solid #002b55',
  color: '#002b55',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  fontWeight: '700',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0, 43, 85, 0.1)'
}

const yearButtonActiveStyle = {
  ...yearButtonStyle,
  background: 'linear-gradient(135deg, #002b55 0%, #004080 100%)',
  color: '#ffffff',
  transform: 'translateY(-2px)',
  boxShadow: '0 6px 20px rgba(0, 43, 85, 0.3)'
}

const wrapperStyle = {
  background: 'transparent', // Fundo transparente
  margin: '0 1rem 0.5rem 1rem',
  width: 'calc(100% - 2rem)', // Usa toda largura do container
  minHeight: 'auto', // Altura mínima automática
  maxHeight: 'calc(100vh - 120px)', // Altura máxima limitada
  overflow: 'hidden', // Remove scrollbar
  display: 'flex',
  flexDirection: 'column',
  position: 'relative'
}

const tableStyle = {
  width: '100%',
  fontSize: '0.85rem',
  background: 'transparent', // Fundo transparente
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  tableLayout: 'fixed',
  height: 'auto', // Altura automática baseada no conteúdo
  display: 'table'
}

const theadStyle = {
  background: 'linear-gradient(135deg, #002b55 0%, #004080 50%, #0056b3 100%)',
  color: '#ffffff',
  position: 'sticky',
  top: 0,
  zIndex: 15
}

const thStyle = {
  padding: '1.4rem 0.5rem', // Aumentado o padding do header
  fontWeight: '700',
  textAlign: 'center',
  border: 'none',
  whiteSpace: 'nowrap',
  fontSize: '12px',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  width: '7%', // Aumentado para não cortar valores
  color: 'white',
  background: '#002b55'
}

const thFirstStyle = {
  ...thStyle,
  textAlign: 'left',
  width: '8%', // Reduzido para dar mais espaço aos meses
  background: '#002b55',
  border: 'none',
  fontSize: '12px',
  color: 'white'
}

const thTotalStyle = {
  ...thStyle,
  width: '8%',
  background: '#374151', // Cinza escuro
  fontSize: '12px',
  border: 'none',
  color: 'white'
}

const thMediaStyle = {
  ...thStyle,
  width: '8%',
  background: '#9ca3af', // Cinza claro
  fontSize: '12px',
  border: 'none',
  color: 'white'
}

const tdStyle = {
  padding: '1.2rem 0.4rem', // Aumentado o padding para harmonizar com a categoria
  verticalAlign: 'middle',
  textAlign: 'center',
  fontSize: '0.8rem',
  border: 'none',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}

const categoriaStyle = {
  ...tdStyle,
  textAlign: 'left',
  fontWeight: '700',
  color: '#002b55',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  border: 'none',
  fontSize: '0.85rem',
  padding: '1.2rem 0.8rem', // Aumentado o padding horizontal e vertical
  position: 'relative'
}

// Estilos para o ícone de anotações (canto superior direito)
const noteIconStyle = {
  position: 'absolute',
  top: '2px',
  right: '2px',
  width: '12px',
  height: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#002b55',
  fontSize: '10px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  opacity: 0.6
}

const noteIconHoverStyle = {
  ...noteIconStyle,
  opacity: 1,
  transform: 'scale(1.2)'
}

const noteIconActiveStyle = {
  ...noteIconStyle,
  opacity: 1,
  color: '#0056b3'
}

// Estilos para o modal de anotações
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
}

const modalContentStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '2rem',
  width: '500px',
  maxWidth: '90vw',
  maxHeight: '80vh',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  border: '2px solid #002b55'
}

const modalHeaderStyle = {
  fontSize: '1.2rem',
  fontWeight: '700',
  color: '#002b55',
  marginBottom: '1rem',
  textAlign: 'center'
}

const textareaStyle = {
  width: '100%',
  height: '200px',
  padding: '1rem',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  resize: 'vertical',
  outline: 'none',
  transition: 'border-color 0.3s ease',
  boxSizing: 'border-box'
}

const buttonContainerStyle = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'flex-end',
  marginTop: '1rem'
}

const saveButtonStyle = {
  background: 'linear-gradient(135deg, #002b55 0%, #004080 100%)',
  color: '#ffffff',
  border: 'none',
  padding: '0.8rem 1.5rem',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
}

const cancelButtonStyle = {
  background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
  color: '#ffffff',
  border: 'none',
  padding: '0.8rem 1.5rem',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
}

// Estilos para o ícone de comparativo (seta para baixo)
const comparativeIconStyle = {
  position: 'absolute',
  top: '2px',
  right: '4px',
  width: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  opacity: 0.8
}

const comparativeIconHoverStyle = {
  ...comparativeIconStyle,
  opacity: 1,
  transform: 'scale(1.2)'
}

const comparativeIconActiveStyle = {
  ...comparativeIconStyle,
  opacity: 1,
  color: '#ffffff'
}

// Estilos para valores comparativos
const comparativeValueIncreaseStyle = {
  color: '#16a34a', // Verde
  fontWeight: 'bold'
}

const comparativeValueDecreaseStyle = {
  color: '#dc2626', // Vermelho
  fontWeight: 'bold'
}

const numberStyle = {
  ...tdStyle,
  fontFamily: 'Courier New, Monaco, Menlo, monospace',
  fontWeight: '600',
  background: 'rgba(248, 250, 252, 0.5)',
  fontSize: '0.75rem',
  color: '#374151',
  border: 'none',
  whiteSpace: 'nowrap', // Evita quebra de linha
  overflow: 'visible' // Permite que valores sejam visíveis
}

const totalStyle = {
  ...tdStyle,
  fontWeight: '800',
  color: '#ffffff',
  background: '#374151', // Cinza escuro para toda a coluna TOTAL
  fontSize: '0.8rem',
  border: 'none'
}

const mediaStyle = {
  ...tdStyle,
  fontWeight: '800',
  color: '#ffffff',
  background: '#9ca3af', // Cinza claro para toda a coluna MÉDIA
  fontSize: '0.8rem',
  border: 'none'
}

// Estilos para a linha de TOTAL GERAL
const totalGeralRowStyle = {
  background: '#002b55',
  borderTop: '4px solid #000000'
}

const totalGeralCategoriaStyle = {
  ...categoriaStyle,
  background: '#002b55',
  color: '#ffffff',
  fontWeight: '900',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  border: 'none',
  padding: '1.2rem 0.8rem', // Aumentado o padding para manter consistência
  position: 'relative'
}

const totalGeralNumberStyle = {
  ...numberStyle,
  background: '#002b55',
  color: '#ffffff',
  fontWeight: '800',
  fontSize: '12px',
  border: 'none',
  padding: '1.2rem 0.4rem', // Padding consistente
  lineHeight: '1.2'
}

const totalGeralTotalStyle = {
  ...totalStyle,
  background: '#374151', // Cinza escuro conforme solicitado
  color: '#ffffff',
  fontWeight: '900',
  fontSize: '12px',
  border: 'none'
}

const totalGeralMediaStyle = {
  ...mediaStyle,
  background: '#9ca3af', // Cinza claro conforme solicitado
  color: '#ffffff',
  fontWeight: '900',
  fontSize: '12px',
  border: 'none'
}

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  textAlign: 'center',
  gap: '1rem',
  padding: '2rem',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
  borderRadius: '16px',
  border: '2px solid #e5e7eb',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  color: '#002b55'
}

const spinnerStyle = {
  width: '50px',
  height: '50px',
  border: '4px solid rgba(0, 43, 85, 0.2)',
  borderTopColor: '#002b55',
  borderRadius: '50%',
  animation: 'spin 1.2s linear infinite'
}

// Estilos para os botões de navegação (centralizados nos 40px disponíveis)
const navigationUpStyle = {
  position: 'fixed',
  right: '5px', // Bem próximo da borda direita nos 40px disponíveis
  top: '100px', // Subido mais para cima
  zIndex: 1000
}

const navigationDownStyle = {
  position: 'fixed',
  right: '5px', // Bem próximo da borda direita nos 40px disponíveis
  bottom: '20px', // Descido mais para baixo
  zIndex: 1000
}

const arrowButtonStyle = {
  width: '50px', // Tamanho menor para não ocupar muito espaço
  height: '50px',
  borderRadius: '50%',
  border: '3px solid #002b55',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  color: '#002b55',
  fontSize: '1.6rem', // Tamanho da seta
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0, 43, 85, 0.3)' // Sombra mais forte para destaque
}

const arrowButtonFlashStyle = {
  ...arrowButtonStyle,
  background: 'linear-gradient(135deg, #002b55 0%, #004080 100%)',
  color: '#ffffff',
  transform: 'scale(1.2)',
  boxShadow: '0 8px 24px rgba(0, 43, 85, 0.8)',
  border: '3px solid #ffffff'
}

const arrowButtonHoverStyle = {
  ...arrowButtonStyle,
  background: 'linear-gradient(135deg, #002b55 0%, #004080 100%)',
  color: '#ffffff',
  scale: '1.1',
  boxShadow: '0 6px 20px rgba(0, 43, 85, 0.5)' // Sombra ainda mais forte no hover
}

export default function TableView({ tableName, onExportFunctionsReady }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedYear, setSelectedYear] = useState(2025)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [hoverUp, setHoverUp] = useState(false)
  const [hoverDown, setHoverDown] = useState(false)
  const [flashUp, setFlashUp] = useState(false)
  const [flashDown, setFlashDown] = useState(false)
  
  // Estados para o sistema de anotações
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [currentNoteItem, setCurrentNoteItem] = useState(null)
  const [noteContent, setNoteContent] = useState('')
  const [hoveredNoteIcon, setHoveredNoteIcon] = useState(null)
  
  // Estados para o sistema de comparativo
  const [showComparative, setShowComparative] = useState(false)
  const [hoveredComparativeIcon, setHoveredComparativeIcon] = useState(false)

  useEffect(() => {
    loadData()
  }, [tableName])

  // Fechar modal com tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showNotesModal) {
        closeNotesModal()
      }
    }
    
    if (showNotesModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showNotesModal])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: tableData, error } = await supabase
        .from(tableName)
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      setData(tableData || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError(`Erro ao carregar dados da tabela "${tableName}": ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar dados por ano selecionado
  const filteredData = data.filter(row => {
    const rowYear = row.ano || new Date().getFullYear()
    return parseInt(rowYear) === selectedYear
  })

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0,00'
    const num = parseFloat(value)
    if (isNaN(num)) return '0,00'
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handleYearChange = (year) => {
    setSelectedYear(year)
  }

  // Funções para o sistema de anotações
  const openNotesModal = (item) => {
    setCurrentNoteItem(item)
    const noteKey = `note_${tableName}_${item.id}_${selectedYear}`
    const savedNote = localStorage.getItem(noteKey) || ''
    setNoteContent(savedNote)
    setShowNotesModal(true)
  }

  const closeNotesModal = () => {
    setShowNotesModal(false)
    setCurrentNoteItem(null)
    setNoteContent('')
  }

  const saveNote = () => {
    if (currentNoteItem) {
      const noteKey = `note_${tableName}_${currentNoteItem.id}_${selectedYear}`
      localStorage.setItem(noteKey, noteContent)
      closeNotesModal()
    }
  }

  const hasNote = (item) => {
    const noteKey = `note_${tableName}_${item.id}_${selectedYear}`
    const savedNote = localStorage.getItem(noteKey)
    return savedNote && savedNote.trim().length > 0
  }

  // Funções para o sistema de comparativo
  const toggleComparative = () => {
    setShowComparative(!showComparative)
  }

  const calculateComparative = (currentValue, previousValue) => {
    if (previousValue === 0) return { percent: 0, isIncrease: false }
    
    const percent = ((currentValue - previousValue) / previousValue) * 100
    return {
      percent: Math.abs(percent),
      isIncrease: currentValue > previousValue
    }
  }

  const getComparativeData = (totalsData) => {
    if (!showComparative) return null

    const comparativeData = {}
    
    monthKeys.forEach((month, index) => {
      if (index === 0) {
        // Janeiro não tem mês anterior, mostrar 0
        comparativeData[month] = { percent: 0, isIncrease: false }
      } else {
        const currentMonth = monthKeys[index]
        const previousMonth = monthKeys[index - 1]
        
        const currentValue = totalsData[currentMonth] || 0
        const previousValue = totalsData[previousMonth] || 0
        
        comparativeData[month] = calculateComparative(currentValue, previousValue)
      }
    })
    
    return comparativeData
  }

  // Função para calcular o total de uma linha
  const calculateRowTotal = (item) => {
    const monthlyValues = [
      item.Janeiro || 0,
      item.Fevereiro || 0,
      item.Marco || 0,
      item.Abril || 0,
      item.Maio || 0,
      item.Junho || 0,
      item.Julho || 0,
      item.Agosto || 0,
      item.Setembro || 0,
      item.Outubro || 0,
      item.Novembro || 0,
      item.Dezembro || 0
    ]
    
    return monthlyValues.reduce((acc, val) => acc + val, 0)
  }

  // Função para calcular a média de uma linha
  const calculateRowAverage = (item) => {
    const total = calculateRowTotal(item)
    return total / 12
  }

  // Função para calcular totais
  const calculateTotals = () => {
    const totals = {
      categoria: 'TOTAL GERAL',
      Janeiro: 0,
      Fevereiro: 0,
      Marco: 0,
      Abril: 0,
      Maio: 0,
      Junho: 0,
      Julho: 0,
      Agosto: 0,
      Setembro: 0,
      Outubro: 0,
      Novembro: 0,
      Dezembro: 0
    }

    filteredData.forEach(item => {
      totals.Janeiro += item.Janeiro || 0
      totals.Fevereiro += item.Fevereiro || 0
      totals.Marco += item.Marco || 0
      totals.Abril += item.Abril || 0
      totals.Maio += item.Maio || 0
      totals.Junho += item.Junho || 0
      totals.Julho += item.Julho || 0
      totals.Agosto += item.Agosto || 0
      totals.Setembro += item.Setembro || 0
      totals.Outubro += item.Outubro || 0
      totals.Novembro += item.Novembro || 0
      totals.Dezembro += item.Dezembro || 0
    })

    return totals
  }

  // Função para encontrar o maior valor de uma linha (excluindo categoria, total e média)
  const findMaxValueInRow = (row) => {
    const monthValues = monthKeys.map(month => parseFloat(row[month]) || 0)
    return Math.max(...monthValues)
  }

  // Função para encontrar o menor valor de uma linha (excluindo categoria, total e média)
  const findMinValueInRow = (row) => {
    const monthValues = monthKeys.map(month => parseFloat(row[month]) || 0)
    return Math.min(...monthValues)
  }

  // Função para verificar se um valor é o maior da linha FATURAMENTO E é a primeira ocorrência
  const isMaxValueFaturamento = (row, month) => {
    if (row.categoria !== 'FATURAMENTO') return false
    
    const currentValue = parseFloat(row[month]) || 0
    const maxValue = findMaxValueInRow(row)
    
    if (currentValue !== maxValue || maxValue <= 0) {
      return false
    }
    
    // Verificar se é a primeira ocorrência do valor máximo
    const monthIndex = monthKeys.indexOf(month)
    if (monthIndex === -1) return false // Mês não encontrado
    
    for (let i = 0; i < monthIndex; i++) {
      const previousValue = parseFloat(row[monthKeys[i]]) || 0
      if (previousValue === maxValue) {
        return false // Não é a primeira ocorrência
      }
    }
    
    return true // É a primeira ocorrência do valor máximo
  }

  // Função para verificar se um valor é o menor da linha FATURAMENTO E é a primeira ocorrência
  const isMinValueFaturamento = (row, month) => {
    if (row.categoria !== 'FATURAMENTO') return false
    
    const currentValue = parseFloat(row[month]) || 0
    const minValue = findMinValueInRow(row)
    
    if (currentValue !== minValue) {
      return false
    }
    
    // Verificar se é a primeira ocorrência do valor mínimo
    const monthIndex = monthKeys.indexOf(month)
    if (monthIndex === -1) return false // Mês não encontrado
    
    for (let i = 0; i < monthIndex; i++) {
      const previousValue = parseFloat(row[monthKeys[i]]) || 0
      if (previousValue === minValue) {
        return false // Não é a primeira ocorrência
      }
    }
    
    return true // É a primeira ocorrência do valor mínimo
  }

  // Função para verificar se um valor é o maior da linha E é a primeira ocorrência (desabilitada para META e FATURAMENTO)
  const isMaxValue = (row, month) => {
    // Não destacar valores nas linhas META e FATURAMENTO
    if (row.categoria === 'META' || row.categoria === 'FATURAMENTO') {
      return false
    }
    
    const currentValue = parseFloat(row[month]) || 0
    const maxValue = findMaxValueInRow(row)
    
    if (currentValue !== maxValue || maxValue <= 0) {
      return false
    }
    
    // Verificar se é a primeira ocorrência do valor máximo
    const monthIndex = monthKeys.indexOf(month)
    if (monthIndex === -1) return false // Mês não encontrado
    
    for (let i = 0; i < monthIndex; i++) {
      const previousValue = parseFloat(row[monthKeys[i]]) || 0
      if (previousValue === maxValue) {
        return false // Não é a primeira ocorrência
      }
    }
    
    return true // É a primeira ocorrência do valor máximo
  }

  // Estilo para o maior valor (apenas números vermelhos, fundo branco)
  const maxValueStyle = {
    ...numberStyle,
    color: '#dc2626', // Vermelho
    fontWeight: '900', // Extra negrito
    background: '#ffffff', // Fundo branco
    fontSize: '0.8rem' // Aumentado para destacar
  }

  // Estilo para o maior valor da linha FATURAMENTO (verde)
  const maxValueFaturamentoStyle = {
    ...numberStyle,
    color: '#16a34a', // Verde
    fontWeight: '900', // Extra negrito
    background: '#ffffff', // Fundo branco
    fontSize: '0.8rem' // Aumentado para destacar
  }

  // Estilo para o menor valor da linha FATURAMENTO (vermelho)
  const minValueFaturamentoStyle = {
    ...numberStyle,
    color: '#dc2626', // Vermelho
    fontWeight: '900', // Extra negrito
    background: '#ffffff', // Fundo branco
    fontSize: '0.8rem' // Aumentado para destacar
  }

  // Função para navegar linha por linha (sem scrollbar)
  const scrollToRow = (direction) => {
    // Efeito de piscar
    if (direction === 'up') {
      setFlashUp(true)
      setTimeout(() => setFlashUp(false), 200)
    } else if (direction === 'down') {
      setFlashDown(true)
      setTimeout(() => setFlashDown(false), 200)
    }
    
    const table = document.querySelector('.simple-table tbody')
    const allRows = table?.querySelectorAll('tr') // Todas as linhas incluindo TOTAL GERAL
    const dataRows = table?.querySelectorAll('tr:not(.total-geral-row)') // Apenas linhas de dados
    
    if (!allRows || allRows.length === 0 || !dataRows || dataRows.length === 0) return
    
    const rowHeight = dataRows[0].offsetHeight
    
    if (direction === 'up') {
      const newPosition = Math.max(0, scrollPosition - 1)
      setScrollPosition(newPosition)
      
      // Move as linhas para cima
      table.style.transform = `translateY(-${newPosition * rowHeight}px)`
    } else if (direction === 'down') {
      // Permitir scroll até que todas as linhas de dados passem para trás do header
      // Deixando apenas a linha TOTAL GERAL visível junto com o header
      const maxPosition = dataRows.length // Permite scroll completo
      const newPosition = Math.min(maxPosition, scrollPosition + 1)
      setScrollPosition(newPosition)
      
      // Move as linhas para baixo
      table.style.transform = `translateY(-${newPosition * rowHeight}px)`
    }
  }

  const totals = calculateTotals()
  const totalSum = Object.keys(totals)
    .filter(key => key !== 'categoria')
    .reduce((sum, key) => sum + totals[key], 0)
  const totalAverage = totalSum / 12

  // Verificar se é tabela de faturamento
  const isFaturamento = tableName === 'faturamento'
  
  // Função para calcular META ATINGIDA (percentual)
  const calculateMetaAtingida = () => {
    if (!isFaturamento || !filteredData || filteredData.length === 0) return totals

    const faturamentoRow = filteredData.find(row => row.categoria === 'FATURAMENTO')
    const metaRow = filteredData.find(row => row.categoria === 'META')
    
    // Se não encontrar as linhas necessárias, retorna totals padrão
    if (!faturamentoRow || !metaRow) return totals

    const metaAtingida = { categoria: 'META ATINGIDA' }
    
    monthKeys.forEach(month => {
      const faturamento = parseFloat(faturamentoRow[month]) || 0
      const meta = parseFloat(metaRow[month]) || 0
      
      if (meta > 0) {
        metaAtingida[month] = (faturamento / meta) * 100
        } else {
        metaAtingida[month] = 0
      }
    })
    
    return metaAtingida
  }

  // Função para calcular FATURAMENTO X META
  const calculateFaturamentoXMeta = () => {
    if (!isFaturamento || !filteredData || filteredData.length === 0) return null

    const faturamentoRow = filteredData.find(row => row.categoria === 'FATURAMENTO')
    const metaRow = filteredData.find(row => row.categoria === 'META')
    
    // Se não encontrar as linhas necessárias, retorna null
    if (!faturamentoRow || !metaRow) return null

    const faturamentoXMeta = { categoria: 'FAT X META' }
    
        monthKeys.forEach(month => {
      const faturamento = parseFloat(faturamentoRow[month]) || 0
      const meta = parseFloat(metaRow[month]) || 0
      faturamentoXMeta[month] = faturamento - meta
    })
    
    return faturamentoXMeta
  }

  const metaAtingida = isFaturamento ? calculateMetaAtingida() : totals
  const faturamentoXMeta = calculateFaturamentoXMeta()

  // Funções de exportação
  const exportToCSV = () => {
    console.log('🟢 Função exportToCSV chamada!', { tableName, selectedYear, dados: filteredData.length })
    
    try {
      if (!filteredData || filteredData.length === 0) {
        alert('❌ Nenhum dado disponível para exportar')
        return
      }

      const headers = ['CATEGORIA', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ', 'TOTAL', 'MÉDIA']
      
      const csvRows = [headers.join(',')]
      
      filteredData.forEach(row => {
        const total = calculateRowTotal(row)
        const average = calculateRowAverage(row)
        
        const rowData = [
          `"${row.categoria}"`,
          row.Janeiro || 0,
          row.Fevereiro || 0,
          row.Marco || 0,
          row.Abril || 0,
          row.Maio || 0,
          row.Junho || 0,
          row.Julho || 0,
          row.Agosto || 0,
          row.Setembro || 0,
          row.Outubro || 0,
          row.Novembro || 0,
          row.Dezembro || 0,
          total.toFixed(2),
          average.toFixed(2)
        ]
        csvRows.push(rowData.join(','))
      })

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${tableName}_${selectedYear}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert('✅ CSV exportado com sucesso!')
    } catch (error) {
      console.error('❌ Erro CSV:', error)
      alert('❌ Erro ao exportar CSV: ' + error.message)
    }
  }

  const exportToExcel = () => {
    console.log('🟢 Função exportToExcel chamada!', { tableName, selectedYear, dados: filteredData.length })
    
    try {
      if (!filteredData || filteredData.length === 0) {
        alert('❌ Nenhum dado disponível para exportar')
        return
      }

      // Verificar se a biblioteca está disponível
      if (typeof window.XLSX === 'undefined') {
        alert('❌ Biblioteca XLSX não carregada. Recarregue a página.')
        return
      }
      
      const XLSX = window.XLSX

      const worksheetData = [
        ['CATEGORIA', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ', 'TOTAL', 'MÉDIA']
      ]
      
      filteredData.forEach(row => {
        const total = calculateRowTotal(row)
        const average = calculateRowAverage(row)
        
        worksheetData.push([
          row.categoria,
          parseFloat(row.Janeiro) || 0,
          parseFloat(row.Fevereiro) || 0,
          parseFloat(row.Marco) || 0,
          parseFloat(row.Abril) || 0,
          parseFloat(row.Maio) || 0,
          parseFloat(row.Junho) || 0,
          parseFloat(row.Julho) || 0,
          parseFloat(row.Agosto) || 0,
          parseFloat(row.Setembro) || 0,
          parseFloat(row.Outubro) || 0,
          parseFloat(row.Novembro) || 0,
          parseFloat(row.Dezembro) || 0,
          total,
          average
        ])
      })

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados')
      XLSX.writeFile(workbook, `${tableName}_${selectedYear}.xlsx`)

      alert('✅ Excel exportado com sucesso!')
    } catch (error) {
      console.error('❌ Erro Excel:', error)
      alert('❌ Erro ao exportar Excel: ' + error.message)
    }
  }

  const exportToPDF = () => {
    console.log('🟢 Função exportToPDF chamada!', { tableName, selectedYear, dados: filteredData.length })
    
    try {
      if (!filteredData || filteredData.length === 0) {
        alert('❌ Nenhum dado disponível para exportar')
        return
      }

      // Verificar se as bibliotecas estão disponíveis globalmente
      if (typeof window.jspdf === 'undefined') {
        alert('❌ Biblioteca jsPDF não carregada. Recarregue a página e tente novamente.')
        return
      }

      const { jsPDF } = window.jspdf
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      // Título compacto
      pdf.setFontSize(16)
      pdf.setFont(undefined, 'bold')
      pdf.text(`Relatório ${tableName} - ${selectedYear}`, 10, 20)
      
      // Linha horizontal abaixo do título
      pdf.setLineWidth(0.3)
      pdf.line(10, 25, 287, 25)
      
      // Preparar dados da tabela com formatação similar à visualizada
      const tableData = filteredData.map(row => {
        const values = [
          parseFloat(row.Janeiro) || 0,
          parseFloat(row.Fevereiro) || 0,
          parseFloat(row.Marco) || 0,
          parseFloat(row.Abril) || 0,
          parseFloat(row.Maio) || 0,
          parseFloat(row.Junho) || 0,
          parseFloat(row.Julho) || 0,
          parseFloat(row.Agosto) || 0,
          parseFloat(row.Setembro) || 0,
          parseFloat(row.Outubro) || 0,
          parseFloat(row.Novembro) || 0,
          parseFloat(row.Dezembro) || 0
        ]
        
        const total = calculateRowTotal(row)
        const average = calculateRowAverage(row)
        
        return [
          row.categoria,
          ...values.map(v => v.toFixed(2)),
          total.toFixed(2),
          average.toFixed(2)
        ]
      })

      // Calcular e adicionar linha TOTAL GERAL
      const totals = calculateTotals()
      console.log('Totais calculados para PDF:', totals)
      
      if (totals && filteredData.length > 0) {
        // Extrair valores mensais do objeto totals
        const monthValues = monthKeys.map(month => parseFloat(totals[month]) || 0)
        
        const totalGeral = calculateRowTotal(totals)
        const mediaGeral = calculateRowAverage(totals)
        
        const totalRowData = [
          'TOTAL GERAL',
          ...monthValues.map(value => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
          totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          mediaGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ]
        
        console.log('Linha TOTAL GERAL para PDF:', totalRowData)
        tableData.push(totalRowData)
      }

      if (pdf.autoTable) {
        pdf.autoTable({
          head: [['CATEGORIA', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ', 'TOTAL', 'MÉDIA']],
          body: tableData,
          startY: 35,
          theme: 'grid',
          styles: { 
            fontSize: 7, // Fonte menor
            cellPadding: 2, // Padding menor
            overflow: 'linebreak',
            halign: 'center',
            valign: 'middle'
          },
          headStyles: {
            fillColor: [0, 43, 85], // Azul Usifix
            textColor: [255, 255, 255],
            fontSize: 8, // Fonte menor no cabeçalho
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 7 // Fonte menor no corpo
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252] // Linhas alternadas
          },
          columnStyles: {
            0: { halign: 'left', cellWidth: 32, fontStyle: 'bold' }, // CATEGORIA
            1: { halign: 'right', cellWidth: 17 }, // JAN
            2: { halign: 'right', cellWidth: 17 }, // FEV
            3: { halign: 'right', cellWidth: 17 }, // MAR
            4: { halign: 'right', cellWidth: 17 }, // ABR
            5: { halign: 'right', cellWidth: 17 }, // MAI
            6: { halign: 'right', cellWidth: 17 }, // JUN
            7: { halign: 'right', cellWidth: 17 }, // JUL
            8: { halign: 'right', cellWidth: 17 }, // AGO
            9: { halign: 'right', cellWidth: 17 }, // SET
            10: { halign: 'right', cellWidth: 17 }, // OUT
            11: { halign: 'right', cellWidth: 17 }, // NOV
            12: { halign: 'right', cellWidth: 17 }, // DEZ
            13: { halign: 'right', cellWidth: 22, fontStyle: 'bold', fillColor: [55, 65, 81], textColor: [255, 255, 255] }, // TOTAL
            14: { halign: 'right', cellWidth: 22, fontStyle: 'bold', fillColor: [156, 163, 175], textColor: [255, 255, 255] } // MÉDIA
          },
          // Estilo especial para a linha TOTAL GERAL (última linha)
          didParseCell: function (data) {
            const lastRowIndex = tableData.length - 1
            if (data.row.index === lastRowIndex && tableData[lastRowIndex][0] === 'TOTAL GERAL') {
              data.cell.styles.fillColor = [0, 43, 85] // Azul Usifix
              data.cell.styles.textColor = [255, 255, 255]
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.fontSize = 7
            }
          },
          margin: { left: 5, right: 5 } // Margens mínimas para garantir que tudo caiba
        })
      } else {
        // Fallback se autoTable não estiver disponível
        let y = 50
        pdf.setFontSize(8)
        
        // Cabeçalho da tabela
        const headers = ['CATEGORIA', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ', 'TOTAL', 'MÉDIA']
        pdf.setFont(undefined, 'bold')
        pdf.text(headers.join(' | '), 20, y)
        y += 8
        
        // Dados da tabela
        pdf.setFont(undefined, 'normal')
        tableData.forEach(row => {
          pdf.text(row.join(' | '), 20, y)
          y += 6
        })
      }
      
      pdf.save(`${tableName}_${selectedYear}.pdf`)
      alert('✅ PDF exportado com sucesso!')
    } catch (error) {
      console.error('❌ Erro PDF:', error)
      alert('❌ Erro ao exportar PDF: ' + error.message)
    }
  }



  // Configurar funções de exportação para o Dashboard pai
  useEffect(() => {
    if (onExportFunctionsReady) {
      console.log('🔧 Configurando funções de exportação na TableView:', {
        tableName,
        selectedYear,
        hasData: filteredData.length > 0,
        exportFunctions: typeof exportToCSV
      })
      onExportFunctionsReady({
        exportToCSV,
        exportToExcel,
        exportToPDF
      })
    }
  }, [filteredData, selectedYear, tableName, onExportFunctionsReady])

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle}></div>
        <p style={{ fontWeight: '600', margin: 0, fontSize: '1.1rem' }}>Carregando dados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        ...loadingStyle,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 242, 242, 0.95) 100%)',
        border: '3px solid #ef4444'
      }}>
        <h3 style={{ color: '#dc2626', margin: 0, fontSize: '1.5rem' }}>Erro ao carregar dados</h3>
        <p style={{ color: '#7f1d1d', margin: 0, fontSize: '1.1rem' }}>{error}</p>
        <button 
          onClick={loadData}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (filteredData.length === 0) {
  return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        border: '3px solid #3b82f6',
        borderRadius: '20px',
        margin: '2rem',
        padding: '3rem',
        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          color: '#3b82f6'
        }}>
          📅
        </div>
        <h3 style={{ 
          color: '#1e40af', 
          margin: '0 0 1rem 0', 
          fontSize: '1.5rem',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          Nenhum dado encontrado para {selectedYear}
        </h3>
        <p style={{ 
          color: '#64748b', 
          margin: '0', 
          fontSize: '1.1rem',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          A tabela <strong>{tableName}</strong> não possui dados cadastrados para o ano {selectedYear}.<br/>
          Tente selecionar outro ano ou verifique se os dados foram inseridos corretamente.
        </p>
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '1rem'
        }}>
            <button 
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onClick={() => handleYearChange(2025)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)'
              e.target.style.boxShadow = 'none'
            }}
          >
            Ver 2025
            </button>
          <button
            style={{
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onClick={loadData}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)'
              e.target.style.boxShadow = 'none'
            }}
          >
            Recarregar dados
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .simple-table tbody tr:nth-child(even):not(.total-geral-row) {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
          }
          
          .simple-table tbody tr:nth-child(odd):not(.total-geral-row) {
            background: #ffffff !important;
          }
          
          .simple-table tbody tr:hover:not(.total-geral-row) {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 43, 85, 0.15) !important;
          }
          
          .simple-table-container {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 200px !important;
            max-height: calc(100vh - 60px) !important;
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
            overflow: visible !important;
            width: calc(100% - 40px) !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          .table-wrapper {
            width: calc(100% - 2rem) !important;
            height: auto !important;
            min-height: auto !important;
            overflow: hidden !important;
            margin: 0 1rem 0.5rem 1rem !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          .table-wrapper::before,
          .table-wrapper::after {
            content: none !important;
          }
          
          .simple-table * {
            box-sizing: border-box !important;
          }
          
          .simple-table td,
          .simple-table th {
            outline: none !important;
            border: none !important;
          }
          
          .simple-table tr {
            border: none !important;
            outline: none !important;
          }
          
          .simple-table {
            height: auto !important;
            position: relative !important;
            display: table !important;
            width: 100% !important;
            background: transparent !important;
            border: none !important;
            border-collapse: separate !important;
            border-spacing: 0 !important;
            box-shadow: none !important;
          }
          
          .simple-table thead {
            position: sticky !important;
            top: 0 !important;
            z-index: 10 !important;
            background: #002b55 !important;
            border: 3px solid #002b55 !important;
            border-radius: 16px 16px 0 0 !important;
            box-shadow: 0 10px 30px rgba(0, 43, 85, 0.25) !important;
          }
          
          .simple-table thead th:first-child {
            border-radius: 13px 0 0 0 !important;
          }
          
          .simple-table thead th:last-child {
            border-radius: 0 13px 0 0 !important;
          }
          
          .simple-table tbody {
            transition: transform 0.3s ease !important;
            position: relative !important;
            z-index: 5 !important;
            display: table-row-group !important;
          }
          
          .simple-table tbody tr:not(.total-geral-row) {
            border: none !important;
          }
          
          .simple-table tbody tr:not(.total-geral-row) td {
            border: none !important;
          }
          
          .total-geral-row {
            background: #002b55 !important;
            border: 3px solid #002b55 !important;
            border-top: 4px solid #000000 !important;
            border-radius: 0 0 16px 16px !important;
            box-shadow: 0 10px 30px rgba(0, 43, 85, 0.25) !important;
          }
          
          .total-geral-row td:first-child {
            border-radius: 0 0 0 13px !important;
          }
          
          .total-geral-row td:last-child {
            border-radius: 0 0 13px 0 !important;
          }
        `}
      </style>
      
      {/* Botão de navegação para cima - alinhado com cabeçalhos */}
      <button 
        style={{
          ...arrowButtonStyle, 
          ...navigationUpStyle, 
          ...(flashUp ? arrowButtonFlashStyle : hoverUp ? arrowButtonHoverStyle : {})
        }}
        onClick={() => scrollToRow('up')}
        onMouseEnter={() => setHoverUp(true)}
        onMouseLeave={() => setHoverUp(false)}
        title="Subir uma linha"
      >
        ↑
      </button>
      
      {/* Botão de navegação para baixo - bem embaixo */}
      <button 
        style={{
          ...arrowButtonStyle, 
          ...navigationDownStyle, 
          ...(flashDown ? arrowButtonFlashStyle : hoverDown ? arrowButtonHoverStyle : {})
        }}
        onClick={() => scrollToRow('down')}
        onMouseEnter={() => setHoverDown(true)}
        onMouseLeave={() => setHoverDown(false)}
        title="Descer uma linha"
      >
        ↓
      </button>

      <div className="simple-table-container" style={containerStyle}>
        {/* Botões de filtro por ano */}
        <div style={yearFilterStyle}>
          <button
            style={selectedYear === 2025 ? yearButtonActiveStyle : yearButtonStyle}
            onClick={() => handleYearChange(2025)}
            onMouseEnter={(e) => {
              if (selectedYear !== 2025) {
                e.target.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 16px rgba(0, 43, 85, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedYear !== 2025) {
                e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                e.target.style.transform = 'translateY(0px)'
                e.target.style.boxShadow = '0 2px 8px rgba(0, 43, 85, 0.1)'
              }
            }}
          >
            2025
          </button>
          <button
            style={selectedYear === 2024 ? yearButtonActiveStyle : yearButtonStyle}
            onClick={() => handleYearChange(2024)}
            onMouseEnter={(e) => {
              if (selectedYear !== 2024) {
                e.target.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 16px rgba(0, 43, 85, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (selectedYear !== 2024) {
                e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                e.target.style.transform = 'translateY(0px)'
                e.target.style.boxShadow = '0 2px 8px rgba(0, 43, 85, 0.1)'
              }
            }}
          >
            2024
          </button>
        </div>

        <div className="table-wrapper" style={wrapperStyle}>
          <table className="simple-table" style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thFirstStyle}>CATEGORIA</th>
                {monthKeys.map((month, index) => (
                  <th key={month} style={thStyle}>{monthLabels[index]}</th>
                ))}
                <th style={thTotalStyle}>TOTAL</th>
                <th style={thMediaStyle}>MÉDIA</th>
                    </tr>
                  </thead>
                  <tbody>
              {filteredData.map((row, index) => (
                <tr key={row.id} style={{
                  background: index % 2 === 0 ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' : '#ffffff',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <td style={categoriaStyle} title={row.categoria}>
                              {row.categoria}
                    <span
                      style={
                        hoveredNoteIcon === row.id 
                          ? noteIconHoverStyle 
                          : hasNote(row) 
                            ? noteIconActiveStyle 
                            : noteIconStyle
                      }
                      onClick={() => openNotesModal(row)}
                      onMouseEnter={() => setHoveredNoteIcon(row.id)}
                      onMouseLeave={() => setHoveredNoteIcon(null)}
                      title={hasNote(row) ? 'Ver anotação' : 'Adicionar anotação'}
                    >
                      +
                    </span>
                        </td>
                  {monthKeys.map(month => {
                    let cellStyle = numberStyle
                    
                    // Verificar se é valor máximo ou mínimo na linha FATURAMENTO
                    if (isMaxValueFaturamento(row, month)) {
                      cellStyle = maxValueFaturamentoStyle
                    } else if (isMinValueFaturamento(row, month)) {
                      cellStyle = minValueFaturamentoStyle
                    } else if (isMaxValue(row, month)) {
                      cellStyle = maxValueStyle
                    }
                    
                    return (
                      <td 
                        key={month} 
                        style={cellStyle} 
                        title={formatNumber(row[month])}
                      >
                                {formatNumber(row[month])}
                          </td>
                    )
                  })}
                  <td style={totalStyle} title={formatNumber(calculateRowTotal(row))}>
                    {formatNumber(calculateRowTotal(row))}
                  </td>
                  <td style={mediaStyle} title={formatNumber(calculateRowAverage(row))}>
                    {formatNumber(calculateRowAverage(row))}
                  </td>
                </tr>
              ))}

              {/* Linha FATURAMENTO X META (apenas para faturamento) */}
              {isFaturamento && faturamentoXMeta && filteredData.length > 0 && (
                <tr style={{
                  background: filteredData.length % 2 === 0 ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' : '#ffffff',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <td style={categoriaStyle}>
                    FAT X META
                        </td>
                  {monthKeys.map(month => {
                    const value = faturamentoXMeta[month] || 0
                    const isPositive = value >= 0
                    
                    return (
                      <td key={month} style={{
                        ...numberStyle,
                        color: isPositive ? '#16a34a' : '#dc2626',
                        fontWeight: 'bold'
                      }}>
                        {isPositive ? '+' : ''}{formatNumber(value)}
                          </td>
                    )
                  })}
                  <td style={totalStyle}>
                    {formatNumber(
                      monthKeys.reduce((sum, month) => sum + (parseFloat(faturamentoXMeta[month]) || 0), 0)
                    )}
                  </td>
                  <td style={mediaStyle}>
                    {formatNumber(
                      monthKeys.reduce((sum, month) => sum + (parseFloat(faturamentoXMeta[month]) || 0), 0) / 12
                    )}
                  </td>
                      </tr>
              )}
              
              {/* Linha de TOTAL GERAL / META ATINGIDA */}
              <tr className="total-geral-row" style={totalGeralRowStyle}>
                <td style={totalGeralCategoriaStyle}>
                  <span style={{
                    color: '#ffffff',
                    fontWeight: '900',
                    fontSize: '12px',
                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>
                    {isFaturamento ? 'META ATINGIDA' : (showComparative ? 'COMPARATIVO' : 'TOTAL GERAL')}
                  </span>
                  {/* Seta apenas para tabelas que não são faturamento */}
                  {!isFaturamento && (
                            <span 
                      style={
                        hoveredComparativeIcon 
                          ? comparativeIconHoverStyle 
                          : showComparative 
                            ? comparativeIconActiveStyle 
                            : comparativeIconStyle
                      }
                      onClick={toggleComparative}
                      onMouseEnter={() => setHoveredComparativeIcon(true)}
                      onMouseLeave={() => setHoveredComparativeIcon(false)}
                      title={showComparative ? 'Voltar para Total Geral' : 'Ver Comparativo'}
                    >
                      ↓
                            </span>
                  )}
                        </td>
                {monthKeys.map(month => {
                  const comparativeData = getComparativeData(totals)
                  const comparative = comparativeData ? comparativeData[month] : null
                  const dataToShow = isFaturamento ? metaAtingida : totals
                  
                  return (
                    <td key={month} style={totalGeralNumberStyle}>
                      {isFaturamento ? (
                        // Modo Faturamento: mostra percentual da meta atingida
                        <span style={{
                          color: (dataToShow[month] && dataToShow[month] < 100) ? '#fbbf24' : '#ffffff',
                          fontWeight: '800',
                          fontSize: '12px',
                          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                        }}>
                          {dataToShow[month] ? `${dataToShow[month].toFixed(1)}%` : '0,0%'}
                        </span>
                      ) : showComparative ? (
                        // Modo Comparativo: só mostra percentuais
                        comparative ? (
                          <span style={{
                            color: comparative.isIncrease ? '#16a34a' : '#dc2626',
                            fontWeight: '800',
                            fontSize: '12px',
                            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                          }}>
                            {comparative.isIncrease ? '+' : '-'}{comparative.percent.toFixed(1)}%
                          </span>
                        ) : (
                          <span style={{ 
                            color: '#ffffff', 
                            opacity: 0.5,
                            fontSize: '12px',
                            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                          }}>-</span>
                        )
                      ) : (
                        // Modo Total Geral: mostra valores totais
                        <span style={{
                          color: '#ffffff',
                          fontWeight: '800',
                          fontSize: '12px',
                          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                        }}>
                          {formatNumber(totals[month])}
                        </span>
                      )}
                          </td>
                  )
                })}
                <td style={totalGeralTotalStyle} title={isFaturamento ? 'Percentual total de meta atingida' : formatNumber(totalSum)}>
                  <span style={{
                    color: isFaturamento ? (() => {
                      const avgPercentage = Object.keys(metaAtingida)
                        .filter(key => key !== 'categoria')
                        .reduce((sum, key) => sum + (metaAtingida[key] || 0), 0) / 12
                      return avgPercentage < 100 ? '#fbbf24' : '#ffffff'
                    })() : '#ffffff',
                    fontWeight: '900',
                    fontSize: '12px',
                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    {isFaturamento ? (
                      // Total da meta atingida (soma de todos os percentuais dividido por 12)
                      (() => {
                        const avgPercentage = Object.keys(metaAtingida)
                          .filter(key => key !== 'categoria')
                          .reduce((sum, key) => sum + (metaAtingida[key] || 0), 0) / 12
                        return `${avgPercentage.toFixed(1)}%`
                      })()
                    ) : (
                      formatNumber(totalSum)
                    )}
                  </span>
                        </td>
                <td style={totalGeralMediaStyle} title={isFaturamento ? 'Percentual médio de meta atingida' : formatNumber(totalAverage)}>
                  <span style={{
                    color: isFaturamento ? (() => {
                      const avgPercentage = Object.keys(metaAtingida)
                        .filter(key => key !== 'categoria')
                        .reduce((sum, key) => sum + (metaAtingida[key] || 0), 0) / 12
                      return avgPercentage < 100 ? '#fbbf24' : '#ffffff'
                    })() : '#ffffff',
                    fontWeight: '900',
                    fontSize: '12px',
                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    {isFaturamento ? (
                      // Média da meta atingida (mesmo valor que o total)
                      `${(Object.keys(metaAtingida)
                        .filter(key => key !== 'categoria')
                        .reduce((sum, key) => sum + (metaAtingida[key] || 0), 0) / 12
                      ).toFixed(1)}%`
                    ) : (
                      formatNumber(totalAverage)
                    )}
                  </span>
                </td>
                      </tr>
            </tbody>
                </table>
                </div>
            </div>

      {/* Modal de Anotações */}
      {showNotesModal && (
        <div style={modalOverlayStyle} onClick={closeNotesModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              Anotações - {currentNoteItem?.categoria}
          </div>
            <textarea
              style={textareaStyle}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Digite suas anotações aqui..."
              autoFocus
              onFocus={(e) => e.target.style.borderColor = '#002b55'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <div style={buttonContainerStyle}>
              <button
                style={cancelButtonStyle}
                onClick={closeNotesModal}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
              >
                Cancelar
              </button>
              <button
                style={saveButtonStyle}
                onClick={saveNote}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
              >
                Salvar
              </button>
        </div>
      </div>
        </div>
      )}
    </>
  )
}
