import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function StaffLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Odczytujemy intencję użytkownika (z jakiego przycisku tu trafił). 
  // Zabezpieczenie: domyślnie przyjmujemy Lekarza, jeśli ktoś wejdzie z palca pod /logowanie
  const { role, title, path } = location.state || { role: 'DOCTOR', title: 'Lekarza', path: '/lekarz' };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, expectedRole: role }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Błąd autoryzacji.');
      }

      // Możemy zapisać dane użytkownika w pamięci przeglądarki na później
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      // Kierujemy do docelowego panelu!
      navigate(path);
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        
        {/* NAGŁÓWEK */}
        <div className="bg-slate-800 p-8 rounded-t-[32px] shadow-2xl text-center">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Logowanie
          </h1>
          <p className="text-blue-300 text-sm mt-1 font-bold">Dostęp do panelu: {title}</p>
        </div>

        {/* FORMULARZ */}
        <div className="bg-white p-8 md:p-10 rounded-b-[32px] shadow-2xl border-x-2 border-b-2 border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Nazwa użytkownika
              </label>
              <input 
                required 
                type="text" 
                placeholder="np. a.nowak"
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-lg" 
                value={username} 
                onChange={(e) => setUsername(e.target.value.toLowerCase())} 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Hasło
              </label>
              <input 
                required 
                type="password" 
                placeholder="••••••••"
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-lg" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !username || !password} 
              className={`w-full p-5 rounded-2xl text-xl font-bold text-white transition-all shadow-lg mt-4 ${(isLoading || !username || !password) ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
            >
              {isLoading ? 'Sprawdzanie...' : 'Zaloguj się'}
            </button>
          </form>
        </div>

        {/* PRZYCISK POWROTU */}
        <div className="mt-12">
          <Link 
            to="/personel" 
            className="block w-full bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold py-4 px-6 rounded-2xl transition-all shadow-sm active:scale-95 text-center text-lg"
          >
            Anuluj i wróć
          </Link>
        </div>

      </div>
    </div>
  );
}