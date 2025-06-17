import { useEffect, useState } from 'react'
import TabbedAdminDashboard from './TabbedAdminDashboard.jsx'
import LoginPage from './LoginPage.jsx'
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

  if (!session) {
    return <LoginPage onLogin={() => {}} />
  }

  return <TabbedAdminDashboard />
}

export default App
