import { useEffect, useState } from 'react'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx'
import PasswordRecovery from './PasswordRecovery.jsx'
import { supabase } from './lib/supabaseClient.js'
import DashboardTable from './DashboardTable.jsx'

function App() {
  const [session, setSession] = useState(null)
  const [page, setPage] = useState('login')

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }
    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

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
        onLogin={() => setSession(true)}
        goToRegister={() => setPage('register')}
        goToRecover={() => setPage('recover')}
      />
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #4f8cff 0%, #2ecba6 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h2 style={{ color: '#222' }}>Todos os dados do Supabase</h2>
      <DashboardTable />
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          setSession(null);
          setPage('login');
        }}
        style={{
          marginTop: 20,
          padding: '10px 24px',
          borderRadius: 8,
          border: 'none',
          background: '#4f8cff',
          color: '#fff',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer'
        }}
      >
        Sair
      </button>
    </div>
  )
}

export default App
