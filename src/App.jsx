import { useEffect, useState } from 'react'
import HomePage from './HomePage.jsx'
import RegisterPage from './RegisterPage.jsx'
import PasswordRecovery from './PasswordRecovery.jsx'
import DataTable from './DataTable.jsx'
import { supabase } from './lib/supabaseClient.js'

function App() {
  const [session, setSession] = useState(null)

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

  const [page, setPage] = useState('login')

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
      <HomePage
        onLogin={() => setSession(true)}
        goToRegister={() => setPage('register')}
        goToRecover={() => setPage('recover')}
      />
    )
  }

  return <DataTable />
}

export default App
