import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewTicket from './pages/NewTicket'
import Home from './pages/Home' // <--- הוספנו את זה

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [session, setSession] = useState(null)
  
  // בדיקת הנתיב הנוכחי
  const path = window.location.pathname

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
    window.location.href = '/' // חזרה לדף הבית אחרי יציאה
  }

  // --- ניתובים ---
  
  // 1. דף כרטיס ללקוח
  if (path === '/ticket') {
    return <NewTicket />
  }

  // 2. דף התחברות למנהלים
  if (path === '/login') {
    if (session) return <Dashboard session={session} /> // אם כבר מחובר, לך לדשבורד
    return <Login />
  }

  // 3. דשבורד (רק אם מחובר ונמצא בדף הראשי או אחרי לוגין)
  if (session && path === '/') {
      // כאן נחליט: אם מחובר בדף הבית -> נראה דשבורד. אם לא -> נראה לובי.
      // בוא נעשה את זה פשוט: מחוברים רואים דשבורד.
      return (
        <div className="min-h-screen bg-gray-100 dir-rtl font-sans">
          <nav className="bg-white shadow-sm p-4 mb-6">
            <div className="container mx-auto flex justify-between items-center">
              <div className="font-bold text-xl text-blue-600">מערכת הניהול 💼</div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden md:inline">
                  {session.user.email}
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

  // 4. ברירת מחדל: דף הבית (הלובי)
  return <Home />
}