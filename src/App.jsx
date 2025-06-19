import { useEffect, useState } from 'react'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'
import PasswordRecovery from './PasswordRecovery.jsx'
import Dashboard from './Dashboard.jsx'
import { supabase } from './lib/supabaseClient.js'
import './styles/usifix-theme.css'

function App() {
  const [session, setSession] = useState(null)
  const [page, setPage] = useState('login')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }
    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner-app"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!session) {
    if (page === 'register') {
      return (
        <RegisterPage
          onRegister={() => setPage('login')}
          goToLogin={() => setPage('login')}
        />
      )
    }
    if (page === 'recover') {
      return <PasswordRecovery goToLogin={() => setPage('login')} />
    }
    return (
      <LoginPage
        onLogin={(user) => setSession({ user })}
        goToRegister={() => setPage('register')}
        goToRecover={() => setPage('recover')}
      />
    )
  }

  return (
    <Dashboard 
      user={session.user}
      onLogout={async () => {
        await supabase.auth.signOut()
        setSession(null)
        setPage('login')
      }}
    />
  )
}

export default App
