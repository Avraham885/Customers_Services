import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewTicket from './pages/NewTicket' // <--- הוספנו את זה

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [session, setSession] = useState(null)
  
  // בדיקה פשוטה: האם אנחנו בדף של הלקוחות?
  const isPublicPage = window.location.pathname === '/ticket'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // --- מצב 1: דף פתיחת קריאה ללקוחות ---
  if (isPublicPage) {
    return <NewTicket />
  }

  // --- מצב 2: מערכת ניהול (מצריך התחברות) ---
  if (!session) {
    return (
        // הוספתי כפתור קטן למטה בדף הלוגין שמעביר לדף הלקוחות לבדיקה
        <div className="relative">
            <Login />
            <div className="fixed bottom-4 left-4">
                <a href="/ticket" className="bg-white px-4 py-2 rounded shadow text-sm font-bold text-gray-600 border hover:bg-gray-50">
                    מעבר לדף לקוחות (לבדיקה) ➜
                </a>
            </div>
        </div>
    )
  }

  // --- מצב 3: דשבורד מנהלים ---
  return (
    <div className="min-h-screen bg-gray-100 dir-rtl font-sans">
      <nav className="bg-white shadow-sm p-4 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-xl text-blue-600">מערכת הניהול 💼</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:inline">
              מחובר: {session.user.email}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-3 py-1 rounded border border-red-200 hover:bg-red-100 text-sm transition"
            >
              יציאה
            </button>
          </div>
        </div>
      </nav>

      <Dashboard session={session} />
    </div>
  )
}