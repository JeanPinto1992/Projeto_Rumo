// src/components/DashboardTable.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

const monthKeys = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const newRowInitialState = {
  categoria: '',
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
  Dezembro: 0,
  Total_Anual: 0,
  ano: new Date().getFullYear(),
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  '&.MuiTableCell-sticky': {
    position: 'sticky',
    left: 0,
    zIndex: 999,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
    minWidth: '20px',
  },
}));

const StickyHeadRow = styled(TableRow)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 998,
  backgroundColor: theme.palette.primary.main,
}));

const StickyFooterRow = styled(TableRow)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  zIndex: 998,
  backgroundColor: theme.palette.primary.main,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledInvisibleTableCell = styled(TableCell)(({ theme }) => ({
  width: '120px',
  minWidth: '120px',
  padding: 0,
  border: 'none',
  backgroundColor: theme.palette.background.paper,
  visibility: 'hidden',
  overflow: 'hidden',
  pointerEvents: 'none',
  flexShrink: 0,
}));

function DashboardTable({ tableName }) {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState({id: null, field: null});
  const [editingValue, setEditingValue] = useState('');
  const tableContainerRef = useRef(null);
  const theme = useTheme();

  const parseNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (typeof value === 'string') {
      const cleanedValue = value.replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(cleanedValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatNumberForInput = (num) => {
    const validNum = parseNumber(num);
    return validNum === 0 ? '' : validNum.toFixed(2).replace('.', ',');
  };

  const formatNumberForDisplay = (num) => {
    const validNum = parseNumber(num);
    return validNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateTotalAnual = (row) => {
    return monthKeys.reduce((sum, month) => {
        const value = parseNumber(row[month]);
        return sum + value;
    }, 0);
  };

  const calculateMediaAnual = (row) => {
      const filledMonths = monthKeys.filter(month => parseNumber(row[month]) > 0);
      if (filledMonths.length === 0) return 0;

      const totalFilledMonths = filledMonths.reduce((sum, month) => sum + parseNumber(row[month]), 0);
      return totalFilledMonths / filledMonths.length;
  };

  const columnTotals = useMemo(() => {
    const totals = {
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
      Dezembro: 0,
      Total_Anual: 0,
      Media_Anual: 0,
    };

    let totalRowsWithMedia = 0;
    let sumOfMediaAnual = 0;

    dados.forEach(row => {
      monthKeys.forEach(month => {
        totals[month] += parseNumber(row[month]);
      });
      totals.Total_Anual += parseNumber(row.Total_Anual);

      const rowMedia = calculateMediaAnual(row);
      if (rowMedia > 0) {
        sumOfMediaAnual += rowMedia;
        totalRowsWithMedia++;
      }
    });

    totals.Media_Anual = totalRowsWithMedia > 0 ? sumOfMediaAnual / totalRowsWithMedia : 0;

    return totals;
  }, [dados, monthKeys]);

  useEffect(() => {
    const carregarDados = async () => {
      setEditingCell({id: null, field: null});
      setEditingValue('');

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;

        const parsedData = data.map(item => {
           const rowData = {
            id: item.id,
            categoria: item.categoria || '',
            Janeiro: parseNumber(item.Janeiro),
            Fevereiro: parseNumber(item.Fevereiro),
            Marco: parseNumber(item.Marco),
            Abril: parseNumber(item.Abril),
            Maio: parseNumber(item.Maio),
            Junho: parseNumber(item.Junho),
            Julho: parseNumber(item.Julho),
            Agosto: parseNumber(item.Agosto),
            Setembro: parseNumber(item.Setembro),
            Outubro: parseNumber(item.Outubro),
            Novembro: parseNumber(item.Novembro),
            Dezembro: parseNumber(item.Dezembro),
            ano: parseNumber(item.ano || new Date().getFullYear()),
            Total_Anual: 0,
            Media_Anual: 0,
           };
           rowData.Total_Anual = calculateTotalAnual(rowData);
           rowData.Media_Anual = calculateMediaAnual(rowData);
           return rowData;
        });

        setDados(parsedData);
        console.log(`Dados carregados com sucesso para tabela '${tableName}':`, parsedData);
      } catch (error) {
        console.error(`Erro ao carregar dados para tabela '${tableName}' do Supabase:`, error);
        alert(`Erro ao carregar dados para ${tableName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [tableName]);

  const handleNewRowCellChange = (
    value,
    field
  ) => {
      setNewRow(prev => {
        const updatedRow = { ...prev };
        if (field === 'categoria') {
          updatedRow[field] = value;
        } else if (field !== 'Total_Anual' && field !== 'ano') {
          const parsedValue = parseNumber(value);
          updatedRow[field] = parsedValue;
            const rowWithMedia = { ...updatedRow, Media_Anual: 0 };
            rowWithMedia.Total_Anual = calculateTotalAnual(rowWithMedia);
            rowWithMedia.Media_Anual = calculateMediaAnual(rowWithMedia);

            return { ...updatedRow, Total_Anual: rowWithMedia.Total_Anual, Media_Anual: rowWithMedia.Media_Anual };
        }
        return updatedRow;
      });
  };

  const handleSaveCell = async (
    id,
    field,
    value
  ) => {
    const parsedValue = field === 'categoria' ? value : parseNumber(value);

    const originalRow = dados.find(r => r.id === id);
    if (!originalRow) {
        console.error('Linha original não encontrada para ID:', id);
        return;
    }

    const updatedRowData = { ...originalRow };
      if (field === 'categoria') {
        updatedRowData[field] = parsedValue;
    } else if (field !== 'id' && field !== 'Total_Anual' && field !== 'ano') {
        updatedRowData[field] = parsedValue;
    }
    updatedRowData.Total_Anual = calculateTotalAnual(updatedRowData);
    updatedRowData.Media_Anual = calculateMediaAnual(updatedRowData);

    try {
      const updatePayload = { [field]: parsedValue, Total_Anual: updatedRowData.Total_Anual, Media_Anual: updatedRowData.Media_Anual };

      const { error } = await supabase
        .from(tableName)
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      setDados(prev => prev.map(row => row.id === id ? updatedRowData : row));
      setEditingCell({id: null, field: null});
      console.log('Célula atualizada com sucesso!', updatedRowData);
    } catch (error) {
      console.error('Erro ao salvar célula:', error);
      alert(`Erro ao salvar célula: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleCellClick = (id, field, value) => {
    setEditingCell({ id, field });
    setEditingValue(formatNumberForInput(value));
  };

  // Função utilitária para saber se é coluna de total
  const isTotalColumn = (col) => col === 'Total Anual' || col === 'Média Anual';

  if (loading) {
    return <div className="page-loading">Carregando...</div>; // Usando classe
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <TableContainer 
        component={Paper} 
        ref={tableContainerRef} 
        sx={{
          overflowX: 'auto',
          maxHeight: 'calc(100vh - 180px)',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <Table aria-label="customized table" sx={{ minWidth: '2400px' }}>
          <TableHead>
            <StickyHeadRow>
              <StyledTableCell className="MuiTableCell-sticky" sx={{ fontSize: '15px' }}>Categoria</StyledTableCell>
              {monthKeys.map((month) => (
                <StyledTableCell key={month} sx={{ textAlign: 'center', fontSize: '15px', minWidth: '152.5px' }}>{month}</StyledTableCell>
              ))}
              <StyledTableCell sx={{ backgroundColor: '#003865', color: '#fff', textAlign: 'center', fontSize: '15px', minWidth: '152.5px' }}>Total Anual</StyledTableCell>
              <StyledTableCell sx={{ backgroundColor: '#1565a3', color: '#fff', textAlign: 'center', fontSize: '15px', minWidth: '152.5px' }}>Média Anual</StyledTableCell>
              {Array.from({ length: 13 }).map((_, index) => (
                <StyledInvisibleTableCell key={`invisible-head-${index}`}></StyledInvisibleTableCell>
              ))}
            </StickyHeadRow>
          </TableHead>
          <TableBody>
            {dados.map((row, idx) => (
              <StyledTableRow key={row.id}>
                <StyledTableCell className="MuiTableCell-sticky" sx={{ fontWeight: 'bold' }}>{row.categoria}</StyledTableCell>
                {monthKeys.map((month) => (
                  <StyledTableCell key={month} sx={{ textAlign: 'center', minWidth: '152.5px' }}>
                    {editingCell.id === row.id && editingCell.field === month ? (
                      <TextField
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleSaveCell(row.id, month, editingValue)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveCell(row.id, month, editingValue);
                          }
                        }}
                        autoFocus
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <div onClick={() => handleCellClick(row.id, month, row[month])}>
                        {formatNumberForDisplay(row[month])}
                      </div>
                    )}
                  </StyledTableCell>
                ))}
                <StyledTableCell sx={{ backgroundColor: '#003865', color: '#fff', textAlign: 'center', fontWeight: 'bold', minWidth: '152.5px' }}>{formatNumberForDisplay(row.Total_Anual)}</StyledTableCell>
                <StyledTableCell sx={{ textAlign: 'center', fontWeight: 'bold', minWidth: '152.5px', backgroundColor: '#1565a3', color: '#fff' }}>{formatNumberForDisplay(row.Media_Anual)}</StyledTableCell>
                {Array.from({ length: 13 }).map((_, index) => (
                  <StyledInvisibleTableCell key={`invisible-body-${row.id}-${index}`}></StyledInvisibleTableCell>
                ))}
              </StyledTableRow>
            ))}
            <StickyFooterRow>
              <StyledTableCell className="MuiTableCell-sticky" sx={{ backgroundColor: '#003865', color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>Total</StyledTableCell>
              {monthKeys.map((month) => (
                <StyledTableCell key={month} sx={{ backgroundColor: '#003865', color: '#fff', textAlign: 'center', fontSize: '15px', fontWeight: 'bold', minWidth: '152.5px' }}>{formatNumberForDisplay(columnTotals[month])}</StyledTableCell>
              ))}
              <StyledTableCell sx={{ backgroundColor: '#003865', color: '#fff', textAlign: 'center', fontSize: '15px', fontWeight: 'bold', minWidth: '152.5px' }}>{formatNumberForDisplay(columnTotals.Total_Anual)}</StyledTableCell>
              <StyledTableCell sx={{ backgroundColor: '#1565a3', color: '#fff', textAlign: 'center', fontSize: '15px', fontWeight: 'bold', minWidth: '152.5px' }}>{formatNumberForDisplay(columnTotals.Media_Anual)}</StyledTableCell>
              {Array.from({ length: 13 }).map((_, index) => (
                <StyledInvisibleTableCell key={`invisible-total-${index}`}></StyledInvisibleTableCell>
              ))}
            </StickyFooterRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, backgroundColor: '#fff', padding: '16px 0 0 0' }}>
        <IconButton sx={{ color: '#003865' }} onClick={() => {
          if (tableContainerRef.current) {
            const firstCell = tableContainerRef.current.querySelector('th:not(.MuiTableCell-sticky)');
            if (firstCell) {
              const columnWidth = firstCell.offsetWidth;
              tableContainerRef.current.scrollBy({ left: -columnWidth, behavior: 'smooth' });
            }
          }
        }}>
          <ArrowBackIos />
        </IconButton>
        <IconButton sx={{ color: '#003865' }} onClick={() => {
          if (tableContainerRef.current) {
            const firstCell = tableContainerRef.current.querySelector('th:not(.MuiTableCell-sticky)');
            if (firstCell) {
              const columnWidth = firstCell.offsetWidth;
              tableContainerRef.current.scrollBy({ left: columnWidth, behavior: 'smooth' });
            }
          }
        }}>
          <ArrowForwardIos />
        </IconButton>
      </Box>
    </Box>
  );
}

export default DashboardTable;