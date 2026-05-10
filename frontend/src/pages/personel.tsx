import { Link } from 'react-router-dom';
import { ROLES } from '../constants.ts';

export default function StaffSelection() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full py-10">
        
        <div className="bg-slate-800 p-8 shadow-2xl mb-12 text-center">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Panel Personelu
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-bold">Wybierz swoją rolę</p>
        </div>

        {/* KONTENER PRZYCISKÓW */}
        <div className="flex flex-col">
          
          {/* LEKARZ */}
          <Link 
            to="/logowanie" 
            state={{ role: ROLES.DOCTOR, title: 'Lekarza', path: '/lekarz' }} 
            className="bg-white h-64 w-full mb-10 rounded-[48px] shadow-xl hover:shadow-2xl transition-all border-b-8 border-blue-500 flex flex-col items-center justify-center text-center group active:scale-95"
          >
            <h2 className="text-4xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
              LEKARZ
            </h2>
            <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">
              Pełny dostęp medyczny
            </p>
          </Link>

          {/* PIELĘGNIARKA */}
          <Link 
            to="/logowanie" 
            state={{ role: ROLES.NURSE, title: 'Pielęgniarki', path: '/aktualizuj-status' }}
            className="bg-white h-64 w-full mb-10 rounded-[48px] shadow-xl hover:shadow-2xl transition-all border-b-8 border-emerald-500 flex flex-col items-center justify-center text-center group active:scale-95"
          >
            <h2 className="text-4xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
              PIELĘGNIARKA
            </h2>
            <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">
              Tylko aktualizacja stanu
            </p>
          </Link>

          {/* RECEPCJA */}
          <Link 
            to="/logowanie" 
            state={{ role: ROLES.RECEPTIONIST, title: 'Recepcji', path: '/recepcja' }}
            className="bg-white h-64 w-full mb-10 rounded-[48px] shadow-xl hover:shadow-2xl transition-all border-b-8 border-amber-500 flex flex-col items-center justify-center text-center group active:scale-95"
          >
            <h2 className="text-4xl font-black text-slate-800 group-hover:text-amber-600 transition-colors">
              RECEPCJA
            </h2>
            <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">
              Rejestracja i wypisy
            </p>
          </Link>

        </div>

        {/* PRZYCISK POWROTU */}
        <div className="mt-24">
          <Link 
            to="/" 
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 px-4 rounded-2xl transition-all shadow-xl active:scale-95 text-center text-xl uppercase tracking-widest"
          >
            Wróć do strony głównej
          </Link>
        </div>

      </div>
    </div>
  );
}