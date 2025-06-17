import { useEffect, useState } from 'react';
import './App.css';
import Login, { supabase } from './Login';
import TabbedAdminDashboard from './TabbedAdminDashboard';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Login onLogin={() => {}} />;
  }

  return <TabbedAdminDashboard />;
}
