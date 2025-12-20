import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function NewTicket() {
  // קריאת מזהה העסק מהכתובת
  const params = new URLSearchParams(window.location.search)
  const businessId = params.get('bid')

  const [businessName, setBusinessName] = useState('')
  const [categories, setCategories] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: '', // נושא הפנייה
    description: '',
    image: null
  })

  // טעינת פרטי העסק והקטגוריות בעת טעינת הדף
  useEffect(() => {
    async function loadBusinessDetails() {
      if (!businessId) {
        alert("שגיאה: לא נבחר עסק")
        window.location.href = '/ticket' // חזרה לחיפוש
        return
      }

      try {
        // 1. שליפת שם העסק
        const { data: business, error: busError } = await supabase
          .from('businesses')
          .select('name')
          .eq('id', businessId)
          .single()

        if (busError) throw busError
        setBusinessName(business.name)

        // 2. שליפת קטגוריות הפנייה של העסק
        const { data: cats, error: catError } = await supabase
          .from('ticket_categories')
          .select('name')
          .eq('business_id', businessId)
          .eq('is_active', true)

        if (catError) console.error("Error fetching categories", catError)
        setCategories(cats || [])

      } catch (error) {
        console.error("Error:", error)
        alert("לא הצלחנו לטעון את פרטי העסק")
      } finally {
        setLoading(false)
      }
    }

    loadBusinessDetails()
  }, [businessId])

  // פונקציה להסרת התמונה שנבחרה
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = null

      // העלאת תמונה אם יש
      // העלאת תמונה אם יש
      if (formData.image) {
        // תיקון: יצירת שם קובץ "בטוח" באנגלית בלבד (למשל: 1766255_img.jpg)
        const fileExt = formData.image.name.split('.').pop()
        const fileName = `${Date.now()}_img.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('ticket-images')
          .upload(fileName, formData.image)

        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('ticket-images')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      }

      // שמירת הפנייה בדאטה בייס
      const { error: insertError } = await supabase
        .from('tickets')
        .insert([{
          business_id: businessId,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          category: formData.category || 'כללי', // אם לא נבחר, נגדיר כ'כללי'
          description: formData.description,
          image_url: imageUrl,
          status: 'חדש'
        }])

      if (insertError) throw insertError

      setSubmitted(true) // מעבר למסך תודה

    } catch (error) {
      console.error('Error submitting ticket:', error)
      alert('אירעה שגיאה בשליחת הפנייה. נסה שנית')
    } finally {
      setUploading(false)
    }
  }

  // --- מסך תודה לאחר שליחה ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 dir-rtl font-sans">
        <div className="bg-white rounded-2xl p-10 shadow-xl text-center max-w-md w-full animate-fade-in-up border border-white/50">
          <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ✅
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">הפנייה נשלחה!</h2>
          <p className="text-gray-500 mb-8">
            קיבלנו את הפנייה שלך עבור <span className="font-bold text-gray-700">{businessName}</span>.
            נטפל בה בהקדם האפשרי.
          </p>
          <a href="/" className="block w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
            חזרה לדף הבית
          </a>
        </div>
      </div>
    )
  }

  // --- מסך טעינה ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 font-bold">טוען נתונים...</p>
        </div>
      </div>
    )
  }

  // --- הטופס עצמו ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-4 dir-rtl font-sans text-right">
      
      {/* כפתור חזרה */}
      <div className="max-w-2xl mx-auto mb-6">
        <a href="/ticket" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition text-sm">
          <span>חזרה לחיפוש עסק</span>
          <span>➜</span>
        </a>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-white/50">
        
        {/* כותרת הטופס */}
        <div className="bg-gray-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">פתיחת פנייה חדשה 📝</h1>
            <p className="opacity-80 text-lg">שליחת הודעה ל: <span className="font-bold text-yellow-300 underline decoration-wavy">{businessName}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">שם מלא <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition invalid:border-red-500 focus:invalid:border-red-500"
                placeholder="שמך המלא"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">טלפון <span className="text-red-500">*</span></label>
              <input
                required
                type="tel"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition invalid:border-red-500 focus:invalid:border-red-500"
                placeholder="טלפון להתקשרות"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">אימייל <span className="text-gray-400 font-normal text-xs"></span></label>
            <input
              type="email"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="your@email.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* בחירת נושא - דינאמי! */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">נושא הפנייה <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none text-gray-600 invalid:border-red-500"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="" disabled>בחר נושא מהרשימה</option>
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))
                ) : (
                  <option value="כללי">פנייה כללית</option>
                )}
              </select>
              {/* אייקון חץ קטן שיהיה בצד שמאל */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">תיאור הפניה <span className="text-red-500">*</span></label>
            <textarea
              required
              rows="4"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none invalid:border-red-500 focus:invalid:border-red-500"
              placeholder="פרט כאן את מהות הפנייה..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">צרף חשבונית/הזמנה אם קיימת</label>
            
            {!formData.image ? (
              // מצב שבו אין תמונה - מציגים את תיבת ההעלאה
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer group hover:border-blue-400">
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={e => setFormData({...formData, image: e.target.files[0]})}
                />
                <div className="space-y-1">
                  <div className="text-3xl group-hover:scale-110 transition">📸</div>
                  <div className="text-sm text-gray-500 group-hover:text-blue-600">
                    לחץ כאן להעלאת תמונה
                  </div>
                </div>
              </div>
            ) : (
              // מצב שבו יש תמונה - מציגים אותה עם אפשרות מחיקה
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm animate-fade-in-up">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-2xl">🖼️</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700 truncate max-w-[200px]">
                      {formData.image.name}
                    </span>
                    <span className="text-xs text-gray-400">התמונה מוכנה לשליחה</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-white text-red-500 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 hover:border-red-200 text-sm font-bold transition flex items-center gap-1"
                >
                  <span>🗑️</span>
                  <span>הסר</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-4 rounded-xl font-black text-white text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
              uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}
          >
            {uploading ? 'שולח...' : 'שלח פנייה בקליק'}
          </button>

        </form>
      </div>
    </div>
  )
}