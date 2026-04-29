import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { STATUS_MAP, formatDateTime } from '../utils.ts';

interface StatusUpdate {
  id: number;
  status: string;
  note: string | null;
  createdAt: string;
}

interface PatientData {
  firstName: string;
  lastName: string;
  updates: StatusUpdate[];
}

export default function FamilyPanel() {
  const [pesel, setPesel] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [logoutMessage, setLogoutMessage] = useState<string>('');

  useEffect(() => {
    // Uruchamiamy timer tylko, gdy rodzina jest zalogowana
    if (!patientData) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 30 sekund
      timeoutId = setTimeout(() => {
        setPatientData(null);
        setPesel('');
        setToken('');
        setLogoutMessage('Ze względów bezpieczeństwa zostałeś automatycznie wylogowany po 30 sekundach braku aktywności.');
      }, 30000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    // Startujemy timer od razu po zalogowaniu
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [patientData]);

  useEffect(() => {
    if (logoutMessage) {
      const timer = setTimeout(() => {
        setLogoutMessage('');
      }, 5000);

      // reset timera, jeśli użytkownik np. zaloguje się ponownie przed upływem 5s
      return () => clearTimeout(timer);
    }
  }, [logoutMessage]);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLogoutMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/family/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesel, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Błąd autoryzacji.');
      }

      setPatientData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Wystąpił nieoczekiwany błąd.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setPatientData(null);
    setPesel('');
    setToken('');
    setLogoutMessage("Wylogowano pomyślnie.");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">

      {logoutMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-amber-100 border-l-8 border-amber-500 text-amber-800 px-8 py-4 rounded-2xl shadow-2xl font-bold text-center w-11/12 md:w-auto animate-in fade-in slide-in-from-top-4 duration-500">
          {logoutMessage}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        
        {/* Nawigacja górna */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Strefa Rodziny</h1>
          {patientData ? (
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md active:scale-95">
              Wyloguj się
            </button>
          ) : (
            <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md active:scale-95">
              Powrót do menu
            </Link>
          )}
        </div>

        {/* Formularz logowania */}
        {!patientData && (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Sprawdź stan bliskiej osoby</h2>
            <p className="text-slate-500 mb-8">Wprowadź numer PESEL pacjenta oraz unikalny token otrzymany w recepcji.</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Numer PESEL</label>
                <input
                  required
                  type="text"
                  maxLength={11}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium tracking-widest text-lg"
                  value={pesel}
                  onChange={(e) => setPesel(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Token dostępu</label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-lg uppercase tracking-widest"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !pesel || !token}
                className={`w-full p-5 rounded-2xl text-xl font-bold text-white transition-all shadow-lg mt-4 
                  ${(isLoading || !pesel || !token) ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
              >
                {isLoading ? 'Weryfikacja danych...' : 'Wyświetl historię leczenia'}
              </button>
            </form>
          </div>
        )}

        {/* Oś czasu pacjenta */}
        {patientData && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-blue-600 p-8 text-white">
              <h2 className="text-2xl font-bold">Historia leczenia</h2>
              <p className="text-blue-100 mt-1 text-lg">Pacjent: {patientData.firstName} {patientData.lastName}</p>
            </div>

            <div className="p-8">
              {patientData.updates.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                  <p className="text-lg">Brak wpisów w historii medycznej pacjenta.</p>
                </div>
              ) : (
                <div className="relative border-l-4 border-slate-200 ml-4 space-y-10 py-4">
                  {patientData.updates.map((update, index) => (
                    <div key={update.id} className="relative pl-8 md:pl-10">
                      
                      {/* Kropka na osi czasu */}
                      <div className={`absolute -left-[14px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm
                        ${index === 0 ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-slate-300'}`} 
                      ></div>
                      
                      {/* Zawartość wpisu */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-wide
                            ${index === 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                            {STATUS_MAP[update.status] || update.status}
                          </span>
                          <span className="text-sm font-bold text-slate-400">
                            {formatDateTime(update.createdAt)}
                          </span>
                        </div>
                        
                        {update.note && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-slate-600 leading-relaxed">
                              <span className="font-bold text-slate-400 text-sm uppercase block mb-1">Notatka personelu:</span>
                              {update.note}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}