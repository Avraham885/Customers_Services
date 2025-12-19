import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function Dashboard({ session }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState('')
  const [businessId, setBusinessId] = useState(null)
  const [activeFilter, setActiveFilter] = useState('הכל')
  const [dateFilter, setDateFilter] = useState('')

  // סטטוסים ברירת מחדל
  const defaultStatuses = [
    { name: 'חדש', description: 'פנייה חדשה שהתקבלה מלקוח', colorClass: 'bg-red-100 text-red-600 border-red-200', label: 'חדש' },
    { name: 'בטיפול', description: 'פניה שנמצאת כרגע בטיפול', colorClass: 'bg-orange-100 text-orange-600 border-orange-200', label: 'בטיפול' },
    { name: 'סגור', description: 'טופל בקליק', colorClass: 'bg-green-100 text-green-600 border-green-200', label: '✅ סגור' }
  ]

  const [statusConfig, setStatusConfig] = useState(defaultStatuses)

  useEffect(() => {
    fetchBusinessAndData()
  }, [session])

  async function fetchBusinessAndData() {
    try {
      setLoading(true)
      const user = session.user

      // 1. שליפת פרטי העסק
      const { data: business, error: busError } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user.id)
        .single()

      if (busError) throw busError
      setBusinessId(business.id)
      setBusinessName(business.name)

      // 2. שליפת סטטוסים מותאמים אישית
      const { data: customStatuses } = await supabase
        .from('ticket_statuses')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
      
      // מיזוג: ברירת מחדל + מותאמים אישית
      if (customStatuses && customStatuses.length > 0) {
        const formattedCustom = customStatuses.map(s => ({
          name: s.name,
          description: s.description,
          colorClass: s.color, // זה ה-string של הקלאסים ששמרנו
          label: s.name
        }))
        setStatusConfig([...defaultStatuses, ...formattedCustom])
      }

      // 3. שליפת פניות
      await fetchTickets(business.id)

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTickets(bid) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('business_id', bid)
      .order('created_at', { ascending: false })

    if (!error) {
      setTickets(data)
    }
  }

  // מכאן והלאה - הלוגיקה זהה, רק משתמשת ב-statusConfig הדינמי
  const statusStats = useMemo(() => {
    const initialCounts = statusConfig.reduce((acc, curr) => {
      acc[curr.name] = 0;
      return acc;
    }, {});

    const stats = tickets.reduce((acc, ticket) => {
      const status = ticket.status || 'חדש';
      // אם יש סטטוס ישן שלא קיים כבר בקונפיג, נוסיף אותו לספירה שלא יעלם
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, initialCounts);
    return stats;
  }, [tickets, statusConfig]);

  const availableFilters = ['הכל', ...Object.keys(statusStats).filter(key => statusStats[key] > 0 || defaultStatuses.some(d => d.name === key))];

  const getConfig = (statusName) => {
    return statusConfig.find(s => s.name === statusName) || {
      name: statusName,
      description: 'סטטוס מותאם אישית',
      colorClass: 'bg-gray-100 text-gray-600 border-gray-200',
      label: statusName
    };
  }

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter !== 'הכל' && ticket.status !== activeFilter) return false
    if (dateFilter) {
      const ticketDate = new Date(ticket.created_at).toISOString().split('T')[0]
      if (ticketDate !== dateFilter) return false
    }
    return true
  });

  const handleStatusChange = async (ticketId, newStatus) => {
    const updatedTickets = tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
    setTickets(updatedTickets)
    await supabase.from('tickets').update({ status: newStatus }).eq('id', ticketId)
  }

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('למחוק את הפנייה?')) return
    await supabase.from('tickets').delete().eq('id', ticketId)
    setTickets(tickets.filter(t => t.id !== ticketId))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 text-xl animate-pulse">טוען דשבורד... 🚀</div>

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans dir-rtl text-right">
      
      <nav className="bg-white border-b border-gray-200 px-6 py-4 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💼</span>
            <div className="leading-tight">
              <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Rubik, sans-serif' }}>{businessName}</h1>
              <span className="text-xs text-gray-400">ממשק ניהול</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/settings" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all text-sm font-bold border border-transparent hover:border-blue-100">
              <span>⚙️</span><span className="hidden md:inline">הגדרות</span>
            </a>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-all text-sm font-bold">
              <span>יציאה</span><span>➜</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-8 animate-fade-in-up">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Heebo, sans-serif' }}>דשבורד ניהול</h2>
            <p className="text-gray-500 mt-1">צפה בפניות הלקוחות ונהל את הטיפול בהן</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center min-w-[100px]">
              <span className="text-3xl font-black text-gray-800" style={{ fontFamily: 'Heebo, sans-serif' }}>{tickets.length}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">סה"כ</span>
            </div>
            {Object.entries(statusStats).map(([status, count]) => {
              // נציג רק סטטוסים שיש בהם תוכן או שהם ברירת מחדל
              if (count === 0 && !defaultStatuses.some(d => d.name === status)) return null;
              
              const config = getConfig(status);
              const colorClass = config.colorClass;
              const textColor = colorClass.split(' ').find(c => c.startsWith('text-')) || 'text-gray-800';
              const borderColor = colorClass.split(' ').find(c => c.startsWith('border-')) || 'border-gray-200';
              const bgClass = colorClass.split(' ').find(c => c.startsWith('bg-')) || 'bg-gray-50';

              return (
                <div key={status} className={`px-6 py-3 rounded-2xl border flex flex-col items-center min-w-[100px] shadow-sm bg-white ${borderColor} ${bgClass} bg-opacity-10`}>
                  <span className={`text-3xl font-black ${textColor}`} style={{ fontFamily: 'Heebo, sans-serif' }}>{count}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-1">
            {availableFilters.map(status => (
              <button key={status} onClick={() => setActiveFilter(status)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeFilter === status ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                {status}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-400 font-bold px-2">📅 תאריך:</span>
            <input type="date" className="bg-white border border-gray-200 text-gray-700 text-sm rounded-md p-1.5 outline-none focus:ring-2 focus:ring-blue-500" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            {dateFilter && <button onClick={() => setDateFilter('')} className="text-gray-400 hover:text-red-500 px-2">✕</button>}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="rounded-2xl overflow-visible">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right w-40">סטטוס</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right w-32">תאריך</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">לקוח</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right w-32">נושא</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right w-1/3">תיאור</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center w-20">תמונה</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center w-20">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTickets.length === 0 ? (
                  <tr><td colSpan="7" className="p-12 text-center text-gray-400"><div className="text-4xl mb-2">📅</div>לא נמצאו פניות</td></tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const config = getConfig(ticket.status);
                    return (
                      <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors group/row relative hover:z-50">
                        <td className="px-6 py-4 align-top overflow-visible relative">
                          <div className="relative group/tooltip inline-block w-full">
                            <select value={ticket.status} onChange={(e) => handleStatusChange(ticket.id, e.target.value)} className={`w-full text-xs font-bold py-2 px-3 rounded-xl border cursor-pointer outline-none transition-all shadow-sm appearance-none text-center ${config.colorClass}`} style={{ fontFamily: 'Rubik, sans-serif' }}>
                              {statusConfig.map(status => <option key={status.name} value={status.name}>{status.label}</option>)}
                            </select>
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                              <div className="bg-white text-gray-700 p-4 rounded-xl shadow-2xl border border-gray-100 relative">
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white drop-shadow-sm"></div>
                                <div className="font-black text-gray-900 mb-1 text-sm">{config.name}</div>
                                <div className="leading-relaxed text-gray-500 text-xs">{config.description}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="text-sm font-medium text-gray-900">{new Date(ticket.created_at).toLocaleDateString('he-IL')}</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(ticket.created_at).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-gray-900">{ticket.customer_name}</div>
                          <a href={`tel:${ticket.customer_phone}`} className="text-sm text-gray-500 hover:text-blue-600 block mt-1 dir-ltr text-right">{ticket.customer_phone}</a>
                        </td>
                        <td className="px-6 py-4 align-top"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">{ticket.category || 'כללי'}</span></td>
                        <td className="px-6 py-4 align-top"><p className="text-sm text-gray-600 leading-relaxed break-words whitespace-pre-wrap">{ticket.description}</p></td>
                        <td className="px-6 py-4 align-top text-center">
                          {ticket.image_url ? <a href={ticket.image_url} target="_blank" rel="noreferrer" className="block w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:scale-150 transition-transform shadow-sm mx-auto bg-white"><img src={ticket.image_url} alt="ticket" className="w-full h-full object-cover" /></a> : <span className="text-gray-300 text-xl">-</span>}
                        </td>
                        <td className="px-6 py-4 align-top text-center">
                          <button onClick={() => handleDeleteTicket(ticket.id)} className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition" title="מחק פנייה">🗑️</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}