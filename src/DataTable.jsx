import { useEffect, useState } from 'react'
import { Card, Title } from './styles'
import { supabase } from './lib/supabaseClient.js'

function DataTable() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) {
        setError(error.message)
      } else {
        setRows(data)
      }
    }
    fetchData()
  }, [])

  return (
    <Card>
      <Title>Dados do Supabase</Title>
      {error && <p className="error">{error}</p>}
      <table className="table">
        <thead>
          <tr>
            {rows[0] &&
              Object.keys(rows[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {Object.keys(row).map((key) => (
                <td key={key}>{String(row[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default DataTable
