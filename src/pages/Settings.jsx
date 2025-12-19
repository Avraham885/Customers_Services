import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function Settings({ session }) {
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState(null)
  const [businessName, setBusinessName] = useState('')
  
  // קטגוריות
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [addingCat, setAddingCat] = useState(false)

  // סטטוסים
  const [statuses, setStatuses] = useState([])
  const [newStatusName, setNewStatusName] = useState('')
  const [newStatusDesc, setNewStatusDesc] = useState('')
  const [newStatusColor, setNewStatusColor] = useState('blue') // ברירת מחדל
  const [addingStatus, setAddingStatus] = useState(false)

  // צבעים לבחירה לסטטוסים
  const colorOptions = [
    { name: 'gray', label: 'אפור', class: 'bg-gray-100 text-gray-600 border-gray-200' },
    { name: 'red', label: 'אדום', class: 'bg-red-100 text-red-600 border-red-200' },
    { name: 'yellow', label: 'צהוב', class: 'bg-yellow-100 text-yellow-600 border-yellow-200' },
    { name: 'green', label: 'ירוק', class: 'bg-green-100 text-green-600 border-green-200' },
    { name: 'blue', label: 'כחול', class: 'bg-blue-100 text-blue-600 border-blue-200' },
    { name: 'purple', label: 'סגול', class: 'bg-purple-100 text-purple-600 border-purple-200' },
    { name: 'pink', label: 'ורוד', class: 'bg-pink-100 text-pink-600 border-pink-200' },
  ]

  useEffect(() => {
    fetchSettings()
  }, [session])

  async function fetchSettings() {
    try {
      const user = session.user
      
      const { data: business, error: busError } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user.id)
        .single()

      if (busError) throw busError
      setBusinessId(business.id)
      setBusinessName(business.name)

      // שליפת קטגוריות
      const { data: cats } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      setCategories(cats || [])

      // שליפת סטטוסים אישיים
      const { data: stats } = await supabase
        .from('ticket_statuses')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      setStatuses(stats || [])

    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- לוגיקת קטגוריות ---
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    setAddingCat(true)
    try {
      const { data, error } = await supabase
        .from('ticket_categories')
        .insert([{ business_id: businessId, name: newCategory.trim() }])
        .select()
      if (error) throw error
      setCategories([...categories, data[0]])
      setNewCategory('')
    } catch (error) { alert('שגיאה בהוספה') } 
    finally { setAddingCat(false) }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('למחוק נושא זה?')) return
    await supabase.from('ticket_categories').delete().eq('id', id)
    setCategories(categories.filter(c => c.id !== id))
  }

  // --- לוגיקת סטטוסים ---
  const handleAddStatus = async (e) => {
    e.preventDefault()
    if (!newStatusName.trim()) return
    setAddingStatus(true)

    // מציאת מחרוזת ה-CSS המלאה לפי הצבע שנבחר
    const selectedColorClass = colorOptions.find(c => c.name === newStatusColor)?.class || colorOptions[0].class

    try {
      const { data, error } = await supabase
        .from('ticket_statuses')
        .insert([{ 
          business_id: businessId, 
          name: newStatusName.trim(),
          description: newStatusDesc.trim() || 'סטטוס מותאם אישית',
          color: selectedColorClass 
        }])
        .select()
      if (error) throw error
      setStatuses([...statuses, data[0]])
      setNewStatusName('')
      setNewStatusDesc('')
    } catch (error) { alert('שגיאה בהוספה') } 
    finally { setAddingStatus(false) }
  }

  const handleDeleteStatus = async (id) => {
    if (!window.confirm('למחוק סטטוס זה?')) return
    await supabase.from('ticket_statuses').delete().eq('id', id)
    setStatuses(statuses.filter(s => s.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 text-xl animate-pulse">טוען הגדרות...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans dir-rtl text-right pb-20">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur border-b border-white/20 px-6 py-4 mb-8 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-blue-100 p-2 rounded-xl">⚙️</span>
            <div>
              <h1 className="text-2xl font-black text-gray-800" style={{ fontFamily: 'Rubik, sans-serif' }}>
                הגדרות עסק
              </h1>
              <span className="text-sm text-gray-500 font-medium">{businessName}</span>
            </div>
          </div>
          <a href="/" className="bg-white text-gray-600 hover:text-blue-600 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm flex items-center gap-2 border border-gray-100">
            <span>חזרה לדשבורד</span>
            <span>➜</span>
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 grid gap-8">
        
        {/* כרטיס 1: ניהול נושאי פנייה */}
        <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fade-in-up">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
            <h2 className="text-2xl font-black text-gray-800 mb-2" style={{ fontFamily: 'Heebo, sans-serif' }}>
              🏷️ נושאי פנייה
            </h2>
            <p className="text-gray-500 max-w-xl">
              הגדר את הנושאים שיופיעו ללקוח בטופס הפנייה. זה יעזור לך לסנן ולהבין על מה הלקוחות מתלוננים
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4 items-end mb-8">
              <div className="flex-grow w-full space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">נושא חדש</label>
                <input
                  type="text"
                  placeholder="למשל: משלוחים, החזר כספי..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-medium"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={addingCat || !newCategory.trim()}
                className="w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingCat ? '...' : 'הוסף +'}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:bg-white hover:shadow-md transition-all duration-300">
                  <span className="font-bold text-gray-700">{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-300 hover:text-red-500 p-2 transition">🗑️</button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-gray-400 col-span-3 text-center py-4">אין נושאים מוגדרים.</p>}
            </div>
          </div>
        </div>

        {/* כרטיס 2: ניהול סטטוסים (החדש!) */}
        <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-transparent">
            <h2 className="text-2xl font-black text-gray-800 mb-2" style={{ fontFamily: 'Heebo, sans-serif' }}>
               סטטוסים מותאמים אישית
            </h2>
            <p className="text-gray-500 max-w-xl">
              הוסף מצבי טיפול מיוחדים (למשל: "דחוף", "ממתין לחלקים"). הם יופיעו בדשבורד עם הצבע שתבחר.
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleAddStatus} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              
              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">שם הסטטוס</label>
                <input
                  type="text"
                  placeholder="למשל: דחוף מאוד"
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                />
              </div>

              <div className="md:col-span-5 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">תיאור (לבועה)</label>
                <input
                  type="text"
                  placeholder="הסבר קצר שיופיע על הסטטוס"
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none"
                  value={newStatusDesc}
                  onChange={(e) => setNewStatusDesc(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">צבע</label>
                <div className="flex gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setNewStatusColor(color.name)}
                      className={`w-6 h-6 rounded-full border transition-transform ${color.class.split(' ')[0]} ${newStatusColor === color.name ? 'scale-125 ring-2 ring-offset-1 ring-gray-400 border-gray-400' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={addingStatus || !newStatusName.trim()}
                  className="w-full py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  הוסף
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {statuses.map((status) => (
                <div key={status.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition group">
                  <div className="flex items-center gap-4">
                    {/* תצוגה מקדימה של הסטטוס */}
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${status.color}`}>
                      {status.name}
                    </span>
                    <span className="text-sm text-gray-400 hidden md:inline border-r pr-4 mr-4">
                      {status.description}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteStatus(status.id)} className="text-gray-300 hover:text-red-500 p-2 transition">🗑️</button>
                </div>
              ))}
              {statuses.length === 0 && <p className="text-gray-400 text-center py-2 text-sm">במידה ואין סטטוסים מותאמים אישית, המערכת תשתמש בברירת המחדל</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}