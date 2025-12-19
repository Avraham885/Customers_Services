import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function SearchBusiness() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const searchBusinesses = async () => {
      if (searchTerm.length < 2) {
        setResults([])
        return
      }

      setSearching(true)
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .ilike('name', `%${searchTerm}%`)
        .limit(5)

      if (error) {
        console.error('Error searching:', error)
      } else {
        setResults(data || [])
      }
      setSearching(false)
    }

    const timeoutId = setTimeout(() => {
      searchBusinesses()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleSelectBusiness = (businessId) => {
    window.location.href = `/new-ticket?bid=${businessId}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center p-6 dir-rtl font-sans text-right">
      
      {/* כפתור חזרה לדף הבית */}
      <div className="w-full max-w-3xl flex justify-end mb-8 mt-4">
        <a href="/" className="bg-white/80 backdrop-blur text-gray-500 hover:text-blue-600 px-4 py-2 rounded-full shadow-sm border border-white hover:shadow-md transition-all text-sm font-bold flex items-center gap-2">
          <span>חזרה לדף הבית</span>
          <span>🏠</span>
        </a>
      </div>

      <div className="w-full max-w-2xl space-y-10 mt-8">
        
        {/* כותרות מעוצבות כמו בדף הבית */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
           פתחו פניה<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> בקליק</span>
          </h1>
          <p className="text-xl text-gray-500 font-light">
            הקלידו את שם העסק כדי לפתוח פנייה במהירות
          </p>
        </div>

        {/* תיבת חיפוש צפה ויוקרתית */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white rounded-2xl p-2 shadow-xl ring-1 ring-gray-900/5">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-50">🏪</span>
            <input
              type="text"
              className="w-full p-5 pl-14 text-xl rounded-xl outline-none placeholder-gray-300 font-bold text-gray-700 bg-transparent"
              placeholder="למשל: סטודיו דוד, חשמל כהן..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* אזור תוצאות החיפוש */}
        <div className="space-y-4">
          {searching && (
            <div className="text-center text-blue-500 font-bold animate-pulse">
              מחפש במאגר... 🔄
            </div>
          )}
          
          {!searching && searchTerm.length >= 2 && results.length === 0 && (
            <div className="text-center p-10 bg-white/60 backdrop-blur rounded-2xl border border-white shadow-lg">
              <span className="text-5xl block mb-4">😕</span>
              <h3 className="text-xl font-bold text-gray-800">לא מצאנו עסק כזה</h3>
              <p className="text-gray-500">נסה לחפש שם אחר או בדוק שגיאות כתיב</p>
            </div>
          )}

          {/* כרטיסיות תוצאות */}
          <div className="grid gap-3">
            {results.map((business) => (
              <button
                key={business.id}
                onClick={() => handleSelectBusiness(business.id)}
                className="group relative w-full bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 flex justify-between items-center text-right overflow-hidden"
              >
                {/* אפקט רקע עדין בהובר */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
                    {business.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 text-xl group-hover:text-blue-700 transition-colors">
                      {business.name}
                    </h3>
                    <span className="text-sm text-gray-400 group-hover:text-gray-500">
                      לחץ כאן לפתיחת פנייה לעסק זה
                    </span>
                  </div>
                </div>

                <div className="relative z-10 bg-white rounded-full p-2 shadow-sm text-gray-300 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}