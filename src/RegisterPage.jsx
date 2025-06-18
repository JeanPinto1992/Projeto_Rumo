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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const { isOpen, open, close } = useTabbedOverlay(false)

  // Função para validar critérios da senha
  const passwordCriteria = {
    minLength: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (!isPasswordStrong) {
      setError('A senha não atende todos os requisitos.')
      return
    }
    // Aqui você pode incluir o nome no cadastro, se o backend permitir
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
          <label htmlFor="reg-name">Nome completo</label>
          <Input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormGroup>
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
          <div className="password-strength">
            <div className="password-bar" style={{
              height: '4px',
              background: isPasswordStrong ? '#43a047' : '#ccc',
              width: isPasswordStrong ? '100%' : `${Object.values(passwordCriteria).filter(Boolean).length * 20}%`,
              marginBottom: 8,
              borderRadius: 2
            }} />
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              Força da senha: <span style={{ fontWeight: 'bold', color: isPasswordStrong ? '#43a047' : '#e65100' }}>{isPasswordStrong ? 'forte' : 'fraca'}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <li style={{ color: passwordCriteria.minLength ? '#388e3c' : '#b71c1c' }}>{passwordCriteria.minLength ? '✓' : '✗'} Mín. 8 caracteres</li>
              <li style={{ color: passwordCriteria.upper ? '#388e3c' : '#b71c1c' }}>{passwordCriteria.upper ? '✓' : '✗'} Letra maiúscula</li>
              <li style={{ color: passwordCriteria.lower ? '#388e3c' : '#b71c1c' }}>{passwordCriteria.lower ? '✓' : '✗'} Letra minúscula</li>
              <li style={{ color: passwordCriteria.number ? '#388e3c' : '#b71c1c' }}>{passwordCriteria.number ? '✓' : '✗'} Número</li>
              <li style={{ color: passwordCriteria.special ? '#388e3c' : '#b71c1c' }}>{passwordCriteria.special ? '✓' : '✗'} Caractere especial</li>
            </ul>
          </div>
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
