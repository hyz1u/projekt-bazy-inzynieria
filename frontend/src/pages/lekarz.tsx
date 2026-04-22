import { Link } from 'react-router-dom';

export default function DoctorPanel() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Panel Personelu Medycznego</h1>
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            Powrót do menu głównego
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Akcja: Rejestracja nowego pacjenta */}
          <Link 
            to="/dodaj-pacjenta" 
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-200 transition-colors">
              <span className="text-emerald-600 text-3xl font-bold">+</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Przyjęcie Pacjenta</h2>
            <p className="text-slate-500">
              Zarejestruj nową osobę w systemie i wygeneruj unikalny token dostępu dla rodziny.
            </p>
          </Link>

          {/* Akcja: Aktualizacja statusu (Zarys funkcjonalności) */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 opacity-60 cursor-not-allowed">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-blue-600 text-3xl font-bold">#</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Aktualizacja Stanu</h2>
            <p className="text-slate-500">
              Wybierz pacjenta z listy, aby dodać nowy wpis o przebiegu leczenia na osi czasu.
            </p>
            <p className="text-xs font-bold text-blue-600 mt-4 uppercase tracking-wider">
              Funkcja w przygotowaniu
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}