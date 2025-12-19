import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('') // שדה חדש לשם העסק
  
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [msg, setMsg] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      if (isSignUp) {
        // --- תהליך הרשמה (מורכב יותר) ---
        
        // 1. יצירת המשתמש
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (authError) throw authError

        // 2. יצירת העסק בטבלה (רק אם המשתמש נוצר בהצלחה)
        if (authData.user) {
          const { error: bizError } = await supabase
            .from('businesses')
            .insert([
              { 
                name: businessName,
                owner_id: authData.user.id 
              }
            ])
          
          if (bizError) {
            // במקרה נדיר שהמשתמש נוצר אבל העסק לא - כדאי לדעת
            console.error('Business creation failed:', bizError)
            throw new Error('המשתמש נוצר אך הייתה שגיאה ביצירת העסק.')
          }
        }

      } else {
        // --- תהליך התחברות (פשוט) ---
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        })
        if (error) throw error
      }
    } catch (error) {
      setMsg(error.message || 'אירעה שגיאה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans text-right dir-rtl">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignUp ? 'רישום עסק חדש 🚀' : 'כניסה למערכת הניהול'}
          </h2>
          <p className="text-gray-500">
            {isSignUp ? 'הצטרף ונהל את פניות הלקוחות שלך בקלות' : 'ברוך שובך! הזן פרטים להתחברות'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          
          {/* שדה שם העסק - מופיע רק בהרשמה */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">שם העסק</label>
              <input
                type="text"
                required
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-right"
                placeholder="למשל: מוסך המרכז, מספרת דני..."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">כתובת אימייל</label>
            <input
              type="email"
              required
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-right"
              dir="ltr" // טקסט באנגלית מיושר לשמאל בתוך השדה
              style={{ textAlign: 'right' }} // אבל הכתיבה מתחילה מימין
              placeholder="name@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-gray-700">סיסמה</label>
                {!isSignUp && (
                    <button type="button" className="text-xs text-blue-600 hover:underline">
                        שכחת סיסמה?
                    </button>
                )}
            </div>
            <input
              type="password"
              required
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-right"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {msg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              {msg}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {loading ? 'מעבד נתונים...' : (isSignUp ? 'פתח עסק חדש בחינם' : 'התחבר לדשבורד')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
          {isSignUp ? 'כבר רשום למערכת? ' : 'עדיין אין לך חשבון עסקי? '}
          <button
            onClick={() => {
                setIsSignUp(!isSignUp)
                setMsg('')
            }}
            className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition"
          >
            {isSignUp ? 'התחבר כאן' : 'הירשם עכשיו'}
          </button>
        </div>
      </div>
    </div>
  )
}