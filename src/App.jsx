import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewTicket from './pages/NewTicket'
import SearchBusiness from './pages/SearchBusiness'
import Home from './pages/Home'
import Settings from './pages/Settings'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const path = window.location.pathname

  useEffect(() => {
    // בדיקת סשן ראשונית
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // האזנה לשינויים בחיבור
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // מסך טעינה - מונע את הבהוב הדף הלבן והבעיות במעבר לדף הגדרות
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-blue-600 font-bold text-xl animate-pulse">טוען מערכת... 🚀</div>
      </div>
    )
  }

  // --- ניתובים (Routing) ---

  // 1. שלב החיפוש
  if (path === '/ticket') {
    return <SearchBusiness />
  }

  // 2. שלב הטופס
  if (path === '/new-ticket') {
    return <NewTicket />
  }

  // 3. דף הגדרות - מוגן
  if (path === '/settings') {
    if (!session) {
      window.location.href = '/login'
      return null
    }
    return <Settings session={session} />
  }

  // 4. דף התחברות
  if (path === '/login') {
    if (session) return <Dashboard session={session} />
    return <Login />
  }

  // 5. דשבורד מנהלים
  if (session && path === '/') {
      return <Dashboard session={session} />
  }

  // 6. ברירת מחדל: דף הבית
  return <Home />
}