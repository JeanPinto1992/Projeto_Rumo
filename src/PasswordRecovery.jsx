import { useState } from 'react'
import { supabase } from './lib/supabaseClient.js'
import { Button, Card, Input, Title, Form, FormGroup } from './styles'

function PasswordRecovery({ goToLogin }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRecover = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      setError(error.message)
    } else {
      setMessage('Verifique seu email para redefinir a senha.')
    }
  }

  return (
    <Card>
      <Title>Recuperar Senha</Title>
      <Form onSubmit={handleRecover}>
        <FormGroup>
          <label htmlFor="rec-email">Email</label>
          <Input
            id="rec-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormGroup>
        {error && <p className="error">{error}</p>}
        {message && <p>{message}</p>}
        <Button type="submit">Enviar</Button>
        <Button type="button" onClick={goToLogin}>
          Voltar ao Login
        </Button>
      </Form>
    </Card>
  )
}

export default PasswordRecovery
