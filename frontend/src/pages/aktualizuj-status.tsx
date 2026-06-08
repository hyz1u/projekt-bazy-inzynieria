import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { STATUS_MAP } from '../utils.ts';
import { API_ENDPOINTS, APP_TIMEOUTS, ROLES, STATUS_OPTIONS } from '../constants.ts';

interface PatientInfo {
  id: number;
  firstName: string;
  lastName: string;
  pesel: string;
}

export default function UpdateStatus() {
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [note, setNote] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    fetch(API_ENDPOINTS.PATIENTS)
      .then(res => res.json())
      .then((patientsData) => {
        setPatients(patientsData);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Nie udało się załadować danych z serwera.");
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const storedUser = localStorage.getItem('currentUser');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (!currentUser || !currentUser.id) {
      setError('Błąd autoryzacji: Zaloguj się ponownie, aby dodać wpis.');
      return;
    }

    if (!selectedPatientId || !selectedStatus) {
      setError('Wypełnij wszystkie wymagane pola.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.STATUS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          status: selectedStatus,
          note: note,
          authorId: currentUser.id
        }),
      });

      if (!res.ok) throw new Error('Błąd komunikacji z serwerem.');

      setSuccessMessage('Zapisano nowy status pacjenta.');
      
      setTimeout(() => {
        if (currentUser?.role === ROLES.NURSE) {
          navigate('/personel'); 
        } else {
          navigate('/lekarz');   
        }
      }, APP_TIMEOUTS.REDIRECT_SHORT);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nieoczekiwany błąd.');
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl md:text-3xl font-bold">Aktualizacja Stanu</h1>
            <Link to="/personel" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-all text-lg shadow-md">
              Anuluj
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold">{error}</div>}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">1. Kogo dotyczy wpis?</label>
            {isLoading ? (
              <div className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-500 text-lg">Ładowanie bazy pacjentów...</div>
            ) : (
              <select
                required
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none text-lg font-medium"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="" disabled>-- Wybierz z listy --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.lastName} {p.firstName} (PESEL: {p.pesel})</option>
                ))}
              </select>
            )}
          </div>

          {/* Wybór statusu */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">2. Aktualny stan</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = selectedStatus === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedStatus(option.id)}
                    className={`p-4 rounded-xl border-2 font-bold text-center transition-all ${
                      isSelected 
                        ? `${option.color} ring-4 ring-slate-200 scale-105 shadow-md` 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {STATUS_MAP[option.id]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notatka */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">3. Dodatkowe uwagi (opcjonalne)</label>
            <textarea
              rows={3}
              placeholder="Zalecenia, uwagi dla rodziny..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedPatientId || !selectedStatus}
            className={`w-full p-5 rounded-2xl text-xl font-bold text-white shadow-lg transition-all
              ${(!selectedPatientId || !selectedStatus) ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz i opublikuj'}
          </button>
        </form>
      </div>
    </div>
  );
}