export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans dir-rtl bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800">
      
      {/* Header / Navbar */}
      <header className="w-full p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="text-2xl font-black text-blue-600 tracking-tight">
          AvraSystem
        </div>
        
        {/* כפתור כניסה למנהלים בצד שמאל */}
        <a 
          href="/login" 
          className="bg-white text-blue-600 px-5 py-2 rounded-full font-bold shadow-sm border border-blue-100 hover:shadow-md hover:bg-blue-50 transition-all text-sm"
        >
          כניסת משתמשים 💼
        </a>
      </header>

      {/* Main Content (Hero Section) */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 mt-8 mb-16">
        
        <div className="space-y-6 max-w-3xl animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">
            מערכת לניהול <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">פניות לקוחות</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
            מערכת זו נועדה לנהל בצורה יעילה, חכמה ומהירה את הפניות של הלקוחות שלכם.
            הפכו את השירות לחוויה
          </p>

          <div className="pt-8">
            <a 
              href="/ticket" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold px-10 py-5 rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span>פתיחת פנייה ללקוחות</span>
              <span className="bg-white/20 p-1 rounded-full">➜</span>
            </a>
            <p className="mt-4 text-sm text-gray-400">
              רכשתם מוצר? צריכים שירות? לחצו כאן לפתיחת קריאה מהירה
            </p>
          </div>
        </div>

        {/* Features / Icons (קישוט ויזואלי) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-gray-400 max-w-4xl w-full opacity-80">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">⚡</span>
            <span className="font-medium">טיפול מהיר</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">🔒</span>
            <span className="font-medium">מאובטח ופרטי</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📱</span>
            <span className="font-medium">זמין מכל מקום</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center md:text-right flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>
            © 2025 כל הזכויות שמורות.
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
            <span className="font-bold text-gray-700">מייסד ומפתח: אברהם מועלם</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <a href="tel:0526788859" className="hover:text-blue-600 transition flex items-center gap-1">
              📞 052-6788859
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}