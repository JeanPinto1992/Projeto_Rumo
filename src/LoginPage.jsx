import { useState } from 'react'

export default function LoginPage({ onLogin, goToRegister, goToRecover }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    // Se quiser usar Supabase, descomente as linhas abaixo:
    // const { error } = await supabase.auth.signInWithPassword({ email, password })
    // if (error) {
    //   setError(error.message)
    // } else {
    //   onLogin()
    // }
    onLogin() // Remova esta linha se usar Supabase acima
  }

  return (
    <div style={styles.bg}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <img src="/logo-usifix.jpg" alt="Logo Usifix" style={styles.logo} />
        <h2 style={styles.title}>Bem-vindo ao Projeto Rumo</h2>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <span
            style={styles.eye}
            onClick={() => setShowPassword(s => !s)}
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >👁️</span>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>Entrar</button>
        <div style={styles.links}>
          <a href="#" onClick={e => { e.preventDefault(); goToRecover(); }}>Esqueceu sua senha?</a>
          <br />
          <a href="#" onClick={e => { e.preventDefault(); goToRegister(); }}>Não possui uma conta? Cadastre-se</a>
        </div>
      </form>
    </div>
  )
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(120deg, #4f8cff 0%, #2ecba6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
    padding: 40,
    width: 350,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    marginBottom: 16,
  },
  title: {
    marginBottom: 24,
    fontWeight: 700,
    color: '#222',
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '12px 40px 12px 12px',
    borderRadius: 8,
    border: '1px solid #d0d0d0',
    fontSize: 16,
    outline: 'none',
  },
  eye: {
    position: 'absolute',
    right: 12,
    top: 12,
    cursor: 'pointer',
    fontSize: 18,
    color: '#888',
  },
  button: {
    width: '100%',
    padding: '12px 0',
    borderRadius: 8,
    border: 'none',
    background: '#4f8cff',
    color: '#fff',
    fontWeight: 600,
    fontSize: 16,
    marginBottom: 12,
    cursor: 'pointer',
  },
  links: {
    textAlign: 'center',
    fontSize: 14,
    color: '#4f8cff',
    marginTop: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  }
}
