import { useState } from 'react';
import { Link } from 'react-router-dom';

// --- DEFINICJE TYPÓW ---
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

export default function Rodzina() {
  const [pesel, setPesel] = useState('');
  const [token, setToken] = useState('');
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAccess = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/family-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesel, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Błąd autoryzacji.');
      }

      setPatient(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Wystąpił nieoczekiwany błąd systemu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      <div className="max-w-2xl mx-auto pt-10">
        
        {/* WIDOK 1: FORMULARZ DOSTĘPU */}
        {!patient ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800">Panel Rodziny</h1>
              <p className="text-slate-500 mt-2">Wprowadź dane, aby sprawdzić stan bliskiej osoby</p>
            </div>

            <form onSubmit={handleAccess} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border-l-4 border-red-500">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">PESEL Pacjenta</label>
                <input
                  required
                  type="text"
                  maxLength={11}
                  placeholder="11 cyfr"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                  value={pesel}
                  onChange={(e) => setPesel(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Token Dostępu</label>
                <input
                  required
                  type="text"
                  placeholder="Otrzymany od personelu"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-lg uppercase"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                />
              </div>

              <button
                disabled={isLoading}
                className="w-full p-5 bg-blue-600 text-white rounded-2xl text-xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Weryfikacja...' : 'Sprawdź aktualny stan'}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm">Wróć do strony głównej</Link>
            </div>
          </div>
        ) : (
          
          /* WIDOK 2: KARTA PACJENTA I OŚ CZASU */
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest">Pacjent</h2>
                  <h1 className="text-3xl font-bold text-slate-900">{patient.firstName} {patient.lastName}</h1>
                </div>
                <button 
                  onClick={() => setPatient(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  Wyloguj
                </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <p className="text-emerald-800 font-medium">
                  Status bieżący: <span className="font-bold">{patient.updates[0]?.status || 'Brak danych'}</span>
                </p>
                <p className="text-emerald-600 text-xs mt-1">
                  Ostatnia aktualizacja: {patient.updates[0] ? new Date(patient.updates[0].createdAt).toLocaleString() : '---'}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Przebieg leczenia</h3>
              
              <div className="space-y-8 relative">
                {/* Linia osi czasu */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>

                {patient.updates.length === 0 ? (
                  <p className="text-slate-400 italic">Brak zarejestrowanych zmian stanu pacjenta.</p>
                ) : (
                  patient.updates.map((update) => (
                    <div key={update.id} className="relative pl-10">
                      <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        {new Date(update.createdAt).toLocaleString()}
                      </p>
                      <p className="text-lg font-bold text-slate-800">{update.status}</p>
                      {update.note && (
                        <p className="text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl text-sm italic">
                          "{update.note}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}