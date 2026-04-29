import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-6xl w-full">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-4 tracking-tight">
            Info<span className="text-blue-600">Pacjent</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium">System informacyjny Szpitala Wojewódzkiego</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* KARTA: RODZINA */}
          <Link 
            to="/rodzina" 
            className="group bg-white p-12 rounded-[40px] shadow-2xl border-2 border-transparent hover:border-blue-500 transition-all transform hover:-translate-y-2 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-200 transition-colors">
              <span className="text-5xl">🏠</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Strefa Rodziny</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Sprawdź aktualny stan zdrowia bliskiej osoby.
            </p>
          </Link>

          {/* KARTA: PERSONEL */}
          <Link 
            to="/personel" 
            className="group bg-slate-800 p-12 rounded-[40px] shadow-2xl border-2 border-transparent hover:border-slate-600 transition-all transform hover:-translate-y-2 flex flex-col items-center text-center text-white"
          >
            <div className="w-24 h-24 bg-slate-700 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-slate-600 transition-colors">
              <span className="text-5xl">🩺</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Strefa Personelu</h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Panel dla lekarzy, pielęgniarek i recepcji.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}