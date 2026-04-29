import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AddStaff() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('NURSE');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd rejestracji.');

      // 2. ZAMIAST ALERTU USTAW ZMIENNĄ I OPÓŹNIJ NAWIGACJĘ
      setSuccessMessage(`Konto utworzone pomyślnie! Login: ${username}`);
      setTimeout(() => {
        navigate('/lekarz');
      }, 2500); // Przeniesie po 2.5 sekundy

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nieoczekiwany błąd.');
      setIsSubmitting(false); // Zdejmujemy ładowanie tylko, gdy jest błąd. Jeśli jest sukces, zostawiamy wciśnięty przycisk, by uniknąć podwójnych kliknięć.
    } 
  };

  // automatyczne generowanie loginu na podstawie imienia i nazwiska (np. Jan Kowalski -> j.kowalski)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFullName(name);
    
    const parts = name.trim().toLowerCase().split(' ');
    if (parts.length >= 2) {
      const firstLetter = parts[0].charAt(0);
      const lastName = parts[parts.length - 1];
      const cleanLastName = lastName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l");
      setUsername(`${firstLetter}.${cleanLastName}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">

      {successMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md">
          <div className="bg-emerald-500 text-white p-10 md:p-14 rounded-[40px] shadow-2xl border-4 border-emerald-400 max-w-md w-full mx-4 text-center transform scale-100 animate-[pulse_2s_ease-in-out_infinite]">
            <div className="text-7xl mb-6">✓</div>
            <h3 className="text-2xl md:text-3xl font-black mb-6 leading-tight">{successMessage}</h3>
            <p className="text-emerald-100 font-bold tracking-widest uppercase text-sm">Przekierowywanie...</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="bg-slate-800 p-6 md:p-8 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold">Nowy Pracownik</h1>
            <Link to="/lekarz" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-all text-lg shadow-md">
              Anuluj
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold">{error}</div>}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">1. Imię i nazwisko</label>
            <input
              required
              type="text"
              placeholder="np. Jan Kowalski"
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none text-lg font-medium focus:border-blue-500"
              value={fullName}
              onChange={handleNameChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">2. Rola w systemie</label>
            <select
              required
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none text-lg font-medium"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="NURSE">Pielęgniarka / Pielęgniarz</option>
              <option value="RECEPTIONIST">Pracownik Recepcji</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">3. Nazwa użytkownika (Login)</label>
            <input
              required
              type="text"
              className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-xl outline-none text-lg font-medium text-slate-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase">Login generuje się automatycznie, ale możesz go zmienić.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !fullName || !username}
            className={`w-full p-5 rounded-2xl text-xl font-bold text-white shadow-lg transition-all
              ${(isSubmitting || !fullName || !username) ? 'bg-slate-300' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'}`}
          >
            {isSubmitting ? 'Tworzenie konta...' : 'Utwórz konto pracownika'}
          </button>
        </form>
      </div>
    </div>
  );
}