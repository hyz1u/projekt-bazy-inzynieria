import { Link } from 'react-router-dom';

export default function MainMenu() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 tracking-tight">InfoPacjent</h1>
          <p className="text-slate-500 mt-2 font-medium">System informacji o stanie pacjenta</p>
        </div>

        <div className="space-y-4 mt-8">
          
          {/* Przycisk 1: Prowadzi do /rodzina */}
          <Link to="/rodzina" className="w-full group flex items-center justify-between p-5 border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 rounded-xl transition-all duration-200">
            <div className="text-left">
              <h2 className="text-lg font-bold text-blue-900">Rodzina Pacjenta</h2>
              <p className="text-sm text-blue-700 mt-1">Zaloguj się za pomocą tokenu</p>
            </div>
            <span className="text-blue-500 text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {/* Przycisk 2: Prowadzi do /lekarz */}
          <Link to="/lekarz" className="w-full group flex items-center justify-between p-5 border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 rounded-xl transition-all duration-200">
            <div className="text-left">
              <h2 className="text-lg font-bold text-emerald-900">Personel Medyczny</h2>
              <p className="text-sm text-emerald-700 mt-1">Dodaj nowy status leczenia</p>
            </div>
            <span className="text-emerald-500 text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {/* Przycisk 3: Prowadzi do /recepcja (Tu już mamy podpiętą bazę!) */}
          <Link to="/recepcja" className="w-full group flex items-center justify-between p-5 border-2 border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-all duration-200">
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-800">Rejestracja / Recepcja</h2>
              <p className="text-sm text-slate-600 mt-1">Podgląd statusów wszystkich pacjentów</p>
            </div>
            <span className="text-slate-500 text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>

        </div>

        <div className="text-center mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">© 2026 Szpital Wojewódzki. Wersja MVP 1.0</p>
        </div>

      </div>
    </div>
  );
}