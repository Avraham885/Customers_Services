import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false) // בורר בין התחברות להרשמה
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    phone: ''
  })
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (isSignUp) {
        // --- תהליך הרשמה ---
        
        // 1. יצירת משתמש ב-Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('שגיאה ביצירת משתמש')

        // 2. יצירת העסק בטבלה
        const { error: bizError } = await supabase
          .from('businesses')
          .insert([{
            owner_id: authData.user.id,
            name: formData.businessName,
            phone: formData.phone || '',
            email: formData.email
          }])

        if (bizError) throw bizError

        // רענון כדי להיכנס לדשבורד
        window.location.reload()

      } else {
        // --- תהליך התחברות ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
        
        // המעבר לדשבורד יקרה אוטומטית ב-App.jsx ברגע שיש סשן
        window.location.reload()
      }

    } catch (error) {
      console.error('Auth error:', error)
      setErrorMsg(error.message === 'Invalid login credentials' 
        ? 'אימייל או סיסמה שגויים' 
        : 'אירעה שגיאה. נסה שנית או בדוק את הפרטים.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dir-rtl font-sans p-4">
      
      {/* כפתור חזרה לדף הבית */}
      <a href="/" className="absolute top-6 left-6 text-gray-400 hover:text-blue-600 font-bold transition flex items-center gap-2">
        <span>חזרה לדף הבית</span>
        <span>🏠</span>
      </a>

      <div className="bg-white rounded-3xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gray-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Rubik, sans-serif' }}>
              {isSignUp ? 'הקמת עסק חדש' : 'כניסה למערכת 🔐'}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'הצטרף ונהל את הפניות שלך בקלות' : 'שמחים לראות אותך שוב'}
            </p>
          </div>
        </div>

        <div className="p-8">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* שדות שמופיעים רק בהרשמה */}
            {isSignUp && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">שם בית העסק</label>
                  <input
                    required
                    type="text"
                    placeholder="למשל: AvraSystem"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={formData.businessName}
                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">טלפון העסק</label>
                  <input
                    type="tel"
                    placeholder="05...."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* שדות קבועים (אימייל וסיסמה) */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">אימייל</label>
              <input
                required
                type="email"
                placeholder="your@email.com"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">סיסמה</label>
              <input
                required
                type="password"
                placeholder="********"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg text-center border border-red-100">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              {loading ? 'טוען...' : (isSignUp ? 'צור חשבון בקליק ובחינם' : 'התחבר למערכת ➜')}
            </button>

          </form>

          {/* מעבר בין מצבים */}
          <div className="mt-6 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-2">
              {isSignUp ? 'כבר יש לך חשבון?' : 'עדיין אין לך חשבון?'}
            </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 font-black hover:underline"
            >
              {isSignUp ? 'התחבר כאן' : 'צור חשבון חדש בקליק ובחינם'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}