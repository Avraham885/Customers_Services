export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 dir-rtl font-sans">
      <div className="bg-white/95 backdrop-blur rounded-2xl p-8 shadow-2xl max-w-md w-full text-center space-y-8 border border-white/20">
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">ברוכים הבאים 👋</h1>
          <p className="text-gray-500 text-lg">מערכת ניהול שירות לקוחות</p>
        </div>

        <div className="grid gap-4">
          <a href="/ticket" className="group relative w-full flex items-center justify-between p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-600 p-3 rounded-lg text-2xl group-hover:scale-110 transition">🎫</span>
              <div className="text-right">
                <div className="font-bold text-gray-800">אני לקוח</div>
                <div className="text-xs text-gray-500">רוצה לפתוח פנייה חדשה</div>
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-blue-500 transition">➜</span>
          </a>

          <a href="/login" className="group relative w-full flex items-center justify-between p-4 bg-white border-2 border-purple-100 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <span className="bg-purple-100 text-purple-600 p-3 rounded-lg text-2xl group-hover:scale-110 transition">💼</span>
              <div className="text-right">
                <div className="font-bold text-gray-800">אני מנהל עסק</div>
                <div className="text-xs text-gray-500">כניסה למערכת הניהול</div>
              </div>
            </div>
            <span className="text-gray-300 group-hover:text-purple-500 transition">➜</span>
          </a>
        </div>

        <div className="text-xs text-gray-400 pt-4 border-t">
          נבנה באמצעות הטכנולוגיה המתקדמת ביותר 🚀
        </div>
      </div>
    </div>
  )
}