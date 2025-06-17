import { useState } from 'react'
import { supabase } from './lib/supabaseClient.js'
import {
  Button,
  Card,
  Input,
  Title,
  Form,
  FormGroup
} from './styles'

function RegisterPage({ onRegister, goToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const { isOpen, open, close } = useTabbedOverlay(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      open()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    if (error) {
      setError(error.message)
    } else {
      onRegister()
    }
  }

  return (
    <Card>
      <Title>Registrar</Title>
      <Form onSubmit={handleSignup}>
        <FormGroup>
          <label htmlFor="reg-email">Email</label>
          <Input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="reg-password">Senha</label>
          <Input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        {error && <p className="error">{error}</p>}
        <Button type="submit">Cadastrar</Button>
        <Button type="button" onClick={goToLogin}>
          Voltar ao Login
        </Button>
      </Form>
      <TabbedOverlay isOpen={isOpen} title="Código de Verificação">
        <Form onSubmit={handleVerify}>
          <FormGroup>
            <label htmlFor="code">Código</label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </FormGroup>
          {error && <p className="error">{error}</p>}
          <Button type="submit">Verificar</Button>
          <Button type="button" onClick={close}>
            Cancelar
          </Button>
        </Form>
      </TabbedOverlay>
    </Card>
  )
}

export default RegisterPage
