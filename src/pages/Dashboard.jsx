import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function Dashboard({ session }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    fetchBusinessData()
    fetchTickets()
  }, [])

  // 1. שליפת פרטי העסק (כדי להציג כותרת יפה)
  async function fetchBusinessData() {
    const { data } = await supabase
      .from('businesses')
      .select('name')
      .eq('owner_id', session.user.id)
      .single()
    
    if (data) setBusinessName(data.name)
  }

  // 2. שליפת הפניות (ה-RLS דואג שתראה רק את שלך!)
  async function fetchTickets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error:', error)
    else setTickets(data)
    setLoading(false)
  }

  // 3. עדכון סטטוס הפנייה
  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('שגיאה בעדכון: ' + error.message)
    } else {
      fetchTickets() // רענון המסך
    }
  }

  // 4. מחיקת פנייה
  async function handleDelete(id) {
    if (!window.confirm('האם למחוק את הפנייה הזו לצמיתות?')) return

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id)

    if (error) {
      alert('שגיאה במחיקה: ' + error.message)
    } else {
      fetchTickets()
    }
  }

  // פונקציית עזר לצבעי סטטוס
  const getStatusColor = (status) => {
    switch(status) {
      case 'חדש': return 'bg-red-100 text-red-800 border-red-200';
      case 'בטיפול': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'טופל': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="container mx-auto p-6 dir-rtl text-right">
      
      {/* כותרת הדשבורד */}
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">
          ניהול פניות - {businessName || 'טוען...'} 💼
        </h2>
        <p className="text-gray-500 mt-1">צפה בפניות הלקוחות ונהל את הטיפול בהן</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400 animate-pulse">טוען פניות...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 text-xl font-bold">אין פניות חדשות כרגע</p>
          <p className="text-sm text-gray-400 mt-2">הפניות שישלחו הלקוחות יופיעו כאן באופן אוטומטי</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden">
              
              {/* כותרת הכרטיס (סטטוס + תאריך) */}
              <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(ticket.created_at).toLocaleDateString('he-IL')} • {new Date(ticket.created_at).toLocaleTimeString('he-IL').slice(0,5)}
                </span>
                <select 
                  value={ticket.status}
                  onChange={(e) => updateStatus(ticket.id, e.target.value)}
                  className={`text-xs font-bold px-2 py-1 rounded-full border cursor-pointer outline-none ${getStatusColor(ticket.status)}`}
                >
                  <option value="חדש">✨ חדש</option>
                  <option value="בטיפול">🛠️ בטיפול</option>
                  <option value="טופל">✅ טופל</option>
                </select>
              </div>

              {/* גוף הכרטיס */}
              <div className="p-5 flex-grow">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{ticket.title}</h3>
                <p className="text-gray-600 text-sm mb-4 whitespace-pre-line bg-gray-50 p-2 rounded border border-gray-100 min-h-[60px]">
                  {ticket.description}
                </p>

                {/* פרטי לקוח */}
                <div className="space-y-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span>👤</span> 
                    <span className="font-bold">{ticket.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📞</span> 
                    <a href={`tel:${ticket.customer_phone}`} className="hover:text-blue-600 hover:underline">{ticket.customer_phone}</a>
                  </div>
                  {ticket.customer_email && (
                    <div className="flex items-center gap-2">
                      <span>📧</span> 
                      <span className="truncate">{ticket.customer_email}</span>
                    </div>
                  )}
                </div>

                {/* תצוגת קובץ מצורף */}
                {ticket.image_url && (
                  <div className="mt-4">
                    <a 
                      href={ticket.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition border border-gray-200"
                    >
                      📎 צפה בקובץ המצורף
                    </a>
                  </div>
                )}
              </div>

              {/* כפתור מחיקה */}
              <div className="p-3 border-t bg-gray-50 text-left">
                 <button 
                  onClick={() => handleDelete(ticket.id)}
                  className="text-gray-400 hover:text-red-500 text-sm transition flex items-center gap-1 mr-auto px-2"
                  title="מחק פנייה"
                >
                  🗑️ מחיקה
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}