import { Link } from 'react-router-dom';

export default function DoctorPanel() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full py-10">
        
        <div className="bg-slate-800 p-8 rounded-[32px] shadow-2xl mb-12 text-center">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Panel Lekarza
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* REJESTRACJA PACJENTA */}
          <Link 
            to="/dodaj-pacjenta" 
            className="bg-white h-48 rounded-[40px] shadow-xl hover:shadow-2xl transition-all border-l-8 border-blue-500 flex flex-col items-center justify-center text-center group active:scale-95 px-6"
          >
            <h2 className="text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
              Rejestracja Pacjenta
            </h2>
            <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">Wprowadź do systemu</p>
          </Link>

          {/* AKTUALIZACJA STANU */}
          <Link 
            to="/aktualizuj-status" 
            className="bg-white h-48 rounded-[40px] shadow-xl hover:shadow-2xl transition-all border-l-8 border-emerald-500 flex flex-col items-center justify-center text-center group active:scale-95 px-6"
          >
            <h2 className="text-3xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
              Aktualizacja Stanu
            </h2>
            <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">Dodaj wpis na osi czasu</p>
          </Link>

          {/* PANEL RECEPCJI */}
          <Link 
            to="/recepcja" 
            className="bg-white h-48 rounded-[40px] shadow-xl hover:shadow-2xl transition-all border-l-8 border-amber-500 flex flex-col items-center justify-center text-center group active:scale-95 px-6"
          >
            <h2 className="text-3xl font-black text-slate-800 group-hover:text-amber-600 transition-colors">
              Panel Recepcji
            </h2>
            <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">Wyszukiwarka i przegląd</p>
          </Link>

          {/* DODAJ PERSONEL */}
          <Link 
            to="/dodaj-personel" 
            className="bg-slate-800 h-48 rounded-[40px] shadow-xl hover:shadow-2xl transition-all border-l-8 border-purple-500 flex flex-col items-center justify-center text-center group active:scale-95 px-6"
          >
            <h2 className="text-3xl font-black text-white group-hover:text-purple-400 transition-colors">
              Dodaj Personel
            </h2>
            <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">Zarządzanie kontami</p>
          </Link>

        </div>

        {/* PRZYCISK POWROTU */}
        <div className="mt-16">
          <Link 
            to="/personel" 
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 px-4 rounded-2xl transition-all shadow-xl active:scale-95 text-center text-xl uppercase tracking-widest"
          >
            Wyloguj i wróć
          </Link>
        </div>

      </div>
    </div>
  );
}