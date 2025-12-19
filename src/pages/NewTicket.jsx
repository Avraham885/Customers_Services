import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function NewTicket() {
  const [step, setStep] = useState(1) // 1=בחירת עסק, 2=טופס, 3=סיום
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  
  // נתוני הטופס
  const [selectedBiz, setSelectedBiz] = useState(null)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    title: '',
    description: '',
    priority: 'רגיל'
  })
  const [file, setFile] = useState(null)

  // שליפת רשימת העסקים בטעינה ראשונית
  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
      
      if (!error) setBusinesses(data)
    }
    loadBusinesses()
  }, [])

  const handleSubmit = async (e) => {
    console.log("Sending ticket to business ID:", selectedBiz); // בדיקה
    e.preventDefault()
    setLoading(true)

    try {
      let fileUrl = null

      // 1. העלאת קובץ (אם נבחר)
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${selectedBiz}/${fileName}` // שומרים בתיקייה לפי ID של העסק

        const { error: uploadError } = await supabase.storage
          .from('ticket-files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // קבלת הלינק הציבורי לקובץ
        const { data: { publicUrl } } = supabase.storage
          .from('ticket-files')
          .getPublicUrl(filePath)
        
        fileUrl = publicUrl
      }

      // 2. שמירת הפנייה בדאטה-בייס
      const { error: dbError } = await supabase
        .from('tickets')
        .insert([
          {
            business_id: selectedBiz,
            ...formData,
            image_url: fileUrl,
            status: 'חדש' // סטטוס התחלתי
          }
        ])

      if (dbError) throw dbError

      // מעבר למסך תודה
      setStep(3)

    } catch (error) {
      alert('שגיאה בשליחת הטופס: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // --- תצוגת מסך 1: בחירת עסק ---
  if (step === 1) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dir-rtl text-right font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">פתיחת פנייה חדשה 🎫</h1>
        <p className="text-gray-500 mb-8">בחר את בית העסק אליו תרצה לפנות</p>
        
        <div className="space-y-3">
          {businesses.length === 0 && <p>טוען עסקים...</p>}
          {businesses.map((biz) => (
            <button
              key={biz.id}
              onClick={() => {
                setSelectedBiz(biz.id)
                setStep(2)
              }}
              className="w-full p-4 text-right border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between items-center group"
            >
              <span className="font-bold text-gray-700 group-hover:text-blue-700">{biz.name}</span>
              <span className="text-gray-400">➜</span>
            </button>
          ))}
        </div>
        
        <div className="mt-8 pt-4 border-t">
          <a href="/" className="text-sm text-gray-400 hover:text-gray-600">אני בעל עסק (כניסה למנהלים)</a>
        </div>
      </div>
    </div>
  )

  // --- תצוגת מסך 3: תודה ---
  if (step === 3) return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 dir-rtl text-center font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border-t-8 border-green-500">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">הפנייה נשלחה!</h2>
        <p className="text-gray-600 mb-8">
          פרטי הפנייה הועברו בהצלחה לבית העסק.<br/>
          תודה שפנית אלינו.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-900 transition"
        >
          פתיחת פנייה נוספת
        </button>
      </div>
    </div>
  )

  // --- תצוגת מסך 2: הטופס (העיקר) ---
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 dir-rtl text-right font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
        <button 
          onClick={() => setStep(1)}
          className="text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-2 text-sm"
        >
          ➜ חזרה לבחירת עסק
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">פרטי הפנייה</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">שמך המלא *</label>
              <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.customer_name}
                onChange={e => setFormData({...formData, customer_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">טלפון לחזרה *</label>
              <input required type="tel" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.customer_phone}
                onChange={e => setFormData({...formData, customer_phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">אימייל (לא חובה)</label>
            <input type="email" className="w-full p-3 border rounded-lg outline-none"
              dir="ltr" style={{textAlign: 'right'}}
              value={formData.customer_email}
              onChange={e => setFormData({...formData, customer_email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">נושא הפנייה *</label>
            <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="למשל: המזגן מרעיש"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">פירוט הבעיה *</label>
            <textarea required rows="4" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="אנא תאר את המקרה..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">צרף קובץ / תמונה (אופציונלי)</label>
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            <p className="text-xs text-gray-400 mt-1">מקסימום 2MB (תמונות או PDF)</p>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg flex justify-center items-center gap-2"
          >
            {loading ? 'שולח...' : 'שלח פנייה לעסק ✅'}
          </button>
        </form>
      </div>
    </div>
  )
}