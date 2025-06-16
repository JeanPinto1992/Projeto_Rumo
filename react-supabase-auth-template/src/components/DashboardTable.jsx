// src/components/DashboardTable.jsx
import { useEffect, useState, useMemo } from 'react';
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
  Button,
  IconButton,
  TextField,
  Typography,
  useTheme,
  styled
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';

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
  '&.MuiTableCell-body': {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function DashboardTable({ tableName }) {
  const [dados, setDados] = useState([]);
  const [newRow, setNewRow] = useState(newRowInitialState);
  const [loading, setLoading] = useState(true);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [editingCell, setEditingCell] = useState({id: null, field: null});
  const [editingValue, setEditingValue] = useState('');

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
      setIsAddingRow(false);
      setNewRow(newRowInitialState);
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

            return { ...updatedRow, Total_Anual: rowWithMedia.Total_Anual };
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
    } else if (field !== 'id' && field !== 'Total_Anual' && field !== 'ano' && field !== 'Media_Anual') {
        updatedRowData[field] = parsedValue;
    }
    updatedRowData.Total_Anual = calculateTotalAnual(updatedRowData);
    updatedRowData.Media_Anual = calculateMediaAnual(updatedRowData);

    try {
      const updatePayload = { [field]: parsedValue, Total_Anual: updatedRowData.Total_Anual };

      const { error } = await supabase
        .from(tableName)
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      console.log(`Célula salva com sucesso na tabela '${tableName}'!`)

      setDados(prev =>
        prev.map(row =>
          row.id === id ? updatedRowData : row
        )
      );

    } catch (error) {
      console.error(`Erro ao salvar ${field} na tabela '${tableName}' do Supabase:`, error);
      alert(`Erro ao salvar ${field} em ${tableName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleAddRow = async () => {
    if (!newRow.categoria.trim()) {
      alert('Por favor, insira uma categoria para a nova linha.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([newRow])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const addedRow = { ...data[0] };
        addedRow.Total_Anual = calculateTotalAnual(addedRow);
        addedRow.Media_Anual = calculateMediaAnual(addedRow);

        setDados(prev => [...prev, addedRow]);
        setNewRow(newRowInitialState);
        setIsAddingRow(false);
        console.log(`Nova linha adicionada com sucesso na tabela '${tableName}'!`)
      }
    } catch (error) {
      console.error(`Erro ao adicionar linha na tabela '${tableName}':`, error);
      alert(`Erro ao adicionar linha em ${tableName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setNewRow(newRowInitialState);
      setIsAddingRow(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta linha?')) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (error) throw error;

        console.log(`Linha com ID ${id} excluída com sucesso da tabela '${tableName}'!`)

        setDados(prev => prev.filter(row => row.id !== id));

      } catch (error) {
        console.error(`Erro ao excluir linha com ID ${id} da tabela '${tableName}':`, error);
        alert(`Erro ao excluir linha em ${tableName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="page-loading">Carregando...</div>; // Usando classe
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2">
          {tableName.charAt(0).toUpperCase() + tableName.slice(1)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsAddingRow(true)}
        >
          Adicionar Linha
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Categoria</StyledTableCell>
              {monthKeys.map((month) => (
                <StyledTableCell key={month} align="right">
                  {month}
                </StyledTableCell>
              ))}
              <StyledTableCell align="right">Total Anual</StyledTableCell>
              <StyledTableCell align="right">Média Anual</StyledTableCell>
              <StyledTableCell align="center">Ações</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dados.map((row) => (
              <StyledTableRow key={row.id}>
                <StyledTableCell component="th" scope="row">
                  {editingCell.id === row.id && editingCell.field === 'categoria' ? (
                    <TextField
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => handleSaveCell(row.id, 'categoria', editingValue)}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    <span onClick={() => {
                      setEditingCell({ id: row.id, field: 'categoria' });
                      setEditingValue(row.categoria);
                    }}>
                      {row.categoria}
                    </span>
                  )}
                </StyledTableCell>
                {monthKeys.map((month) => (
                  <StyledTableCell key={month} align="right">
                    {editingCell.id === row.id && editingCell.field === month ? (
                      <TextField
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleSaveCell(row.id, month, editingValue)}
                        size="small"
                        type="number"
                        fullWidth
                      />
                    ) : (
                      <span onClick={() => {
                        setEditingCell({ id: row.id, field: month });
                        setEditingValue(formatNumberForInput(row[month]));
                      }}>
                        {formatNumberForDisplay(row[month])}
                      </span>
                    )}
                  </StyledTableCell>
                ))}
                <StyledTableCell align="right">
                  {formatNumberForDisplay(row.Total_Anual)}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {formatNumberForDisplay(row.Media_Anual)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteRow(row.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
            {isAddingRow && (
              <StyledTableRow>
                <StyledTableCell>
                  <TextField
                    value={newRow.categoria}
                    onChange={(e) => handleNewRowCellChange(e.target.value, 'categoria')}
                    size="small"
                    fullWidth
                  />
                </StyledTableCell>
                {monthKeys.map((month) => (
                  <StyledTableCell key={month} align="right">
                    <TextField
                      value={formatNumberForInput(newRow[month])}
                      onChange={(e) => handleNewRowCellChange(e.target.value, month)}
                      size="small"
                      type="number"
                      fullWidth
                    />
                  </StyledTableCell>
                ))}
                <StyledTableCell align="right">
                  {formatNumberForDisplay(newRow.Total_Anual)}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {formatNumberForDisplay(calculateMediaAnual(newRow))}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={handleAddRow}
                    size="small"
                  >
                    <SaveIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default DashboardTable;