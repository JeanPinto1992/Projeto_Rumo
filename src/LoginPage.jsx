import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

export default function LoginPage({ onLogin, goToRegister, goToRecover }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        setError(error.message)
      } else {
        // Login bem-sucedido
        onLogin(data.user)
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className={`login-card ${isInitialized ? 'initialized' : ''}`}>
        <div className="logo-container">
          <img 
            src="/USIFIX VETOR MINI.svg" 
            alt="Logo Usifix" 
            className="login-logo"
          />
          <div className="logo-shine"></div>
        </div>
        
        <div className="welcome-section">
          <h1 className="login-title">Bem-vindo de volta!</h1>
          <p className="login-subtitle">Acesse o Relatório Rumo</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-container">
              <input
                className="login-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8L12 13L21 8M3 8V18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V8M3 8C3 7.44772 3.44772 7 4 7H20C20.5523 7 21 7.44772 21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="input-label">Email</span>
            </div>
          </div>

          <div className="input-group">
            <div className="input-container">
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M7 10V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V10M7 10H17M7 10H5C3.89543 10 3 10.8954 3 12V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V12C21 10.8954 20.1046 10 19 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(s => !s)}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                disabled={isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {showPassword ? (
                    <path d="M9.88 9.88C9.33 10.43 9 11.19 9 12S9.33 13.57 9.88 14.12C10.43 14.67 11.19 15 12 15S13.57 14.67 14.12 14.12C14.67 13.57 15 12.81 15 12S14.67 10.43 14.12 9.88M3 3L21 21M12 7C15.87 7 19.1 9.57 20 12C19.63 13.39 18.78 14.56 17.68 15.38M12 17C8.13 17 4.9 14.43 4 12C4.37 10.61 5.22 9.44 6.32 8.62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M12 5C15.87 5 19.1 7.57 20 10C19.1 12.43 15.87 15 12 15S4.9 12.43 4 10C4.9 7.57 8.13 5 12 5ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
              </button>
              <span className="input-label">Senha</span>
            </div>
            <div className="password-strength">
              <span>🔒 Protegido com criptografia avançada</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="login-links">
          <button 
            type="button" 
            className="link-btn"
            onClick={goToRecover}
            disabled={isLoading}
          >
            Esqueceu sua senha?
          </button>
          <button 
            type="button" 
            className="link-btn register-link"
            onClick={goToRegister}
            disabled={isLoading}
          >
            Não possui uma conta? <strong>Cadastre-se</strong>
          </button>
        </div>
      </div>
    </div>
  )
}
