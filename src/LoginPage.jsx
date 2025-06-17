import { useState } from 'react'
import { supabase } from './lib/supabaseClient.js'
import {
  Button,
  Card,
  Input,
  Title,
  Form,
  FormGroup,
} from './styles'

function LoginPage({ onLogin, goToRegister, goToRecover }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      onLogin()
    }
  }

  return (
    <Card>
      <Title>Login</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="password">Senha</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        {error && <p className="error">{error}</p>}
        <Button type="submit">Entrar</Button>
        <Button type="button" onClick={goToRegister}>Registrar</Button>
        <Button type="button" onClick={goToRecover}>
          Esqueceu a senha?
        </Button>
      </Form>
    </Card>
  )
}

export default LoginPage
