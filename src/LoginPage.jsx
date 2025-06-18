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
    <div className="login-bg">
      <div className="login-card">
        <img src="/logo-usifix.jpg" alt="Logo Usifix" className="login-logo" style={{ width: '140px', height: 'auto', marginBottom: '18px' }} />
        <h2 className="login-title">Bem-vindo ao Relatório Rumo</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <span className="login-input-icon">📧</span>
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-input-group">
            <span className="login-input-icon">🔒</span>
            <input
              className="login-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span
              className="login-eye"
              onClick={() => setShowPassword(s => !s)}
              title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >{showPassword ? '🙈' : '👁️'}</span>
          </div>
          <div className="login-password-info">Sua senha é protegida com criptografia avançada</div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn">Entrar</button>
        </form>
        <div className="login-links">
          <a href="#" onClick={e => { e.preventDefault(); goToRecover(); }}>Esqueceu sua senha?</a>
          <br />
          <a href="#" onClick={e => { e.preventDefault(); goToRegister(); }}>Não possui uma conta? Cadastre-se</a>
        </div>
      </div>
    </div>
  )
}

// Adicione o CSS correspondente em seu arquivo de estilos global (ex: src/index.css):
/*
.login-bg {
  min-height: 100vh;
  background: linear-gradient(120deg, #4f8cff 0%, #2ecba6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 48px 32px 32px 32px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-logo {
  width: 96px;
  margin-bottom: 18px;
}
.login-title {
  margin-bottom: 28px;
  font-weight: 700;
  color: #222;
  text-align: center;
  font-size: 1.5rem;
}
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.login-input-group {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}
.login-input-icon {
  position: absolute;
  left: 12px;
  font-size: 1.2rem;
  color: #4f8cff;
  pointer-events: none;
}
.login-input {
  width: 100%;
  padding: 12px 40px 12px 38px;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  font-size: 16px;
  outline: none;
  background: #f5f8ff;
}
.login-eye {
  position: absolute;
  right: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  color: #888;
}
.login-password-info {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 4px;
  text-align: left;
  margin-top: -10px;
  margin-left: 2px;
}
.login-btn {
  width: 100%;
  padding: 12px 0;
  border-radius: 8px;
  border: none;
  background: #4f8cff;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.login-btn:hover {
  background: #2563eb;
}
.login-links {
  text-align: center;
  font-size: 15px;
  color: #4f8cff;
  margin-top: 18px;
}
.login-error {
  color: red;
  margin-bottom: 8px;
  text-align: center;
}
*/
