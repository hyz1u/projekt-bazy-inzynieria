import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { STATUS_MAP } from '../utils.ts';

interface PatientInfo {
  id: number;
  firstName: string;
  lastName: string;
  pesel: string;
}

interface StaffInfo {
  id: number;
  fullName: string;
  role: string;
}

interface StatusOption {
  id: string;
  color: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { id: 'STABLE', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'IMPROVING', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'POST_OP', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'AWAITING_TESTS', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'CRITICAL', color: 'bg-red-100 text-red-800 border-red-300' },
];

export default function UpdateStatus() {
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [note, setNote] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/api/patients').then(res => res.json()),
      fetch('http://localhost:3000/api/staff').then(res => res.json())
    ])
    .then(([patientsData, staffData]) => {
      setPatients(patientsData);
      setStaffList(staffData);
      setIsLoading(false);
    })
    .catch(() => {
      setError("Nie udało się załadować danych z serwera.");
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAuthorId || !selectedPatientId || !selectedStatus) {
      setError('Wypełnij wszystkie wymagane pola.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          status: selectedStatus,
          note: note,
          authorId: Number(selectedAuthorId) 
        }),
      });

      if (!res.ok) throw new Error('Błąd komunikacji z serwerem.');

      setSuccessMessage('Zapisano nowy status pacjenta.');
      setTimeout(() => {
        navigate('/lekarz'); // Zmieniłem '/' na '/lekarz', żeby wracało do panelu lekarza
      }, 2500);

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

          {/* NOWY KROK 1: Wybór pracownika */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">1. Kto wprowadza wpis?</label>
            {isLoading ? (
              <div className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-500 text-lg">Ładowanie...</div>
            ) : (
              <select
                required
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none text-lg font-medium"
                value={selectedAuthorId}
                onChange={(e) => setSelectedAuthorId(e.target.value)}
              >
                <option value="" disabled>-- Wybierz swoje nazwisko --</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.role === 'DOCTOR' ? 'Lek.' : 'Piel.'} {staff.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* KROK 2: Wybór pacjenta */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">2. Kogo dotyczy wpis?</label>
            {isLoading ? (
              <div className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-500 text-lg">Ładowanie...</div>
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

          {/* KROK 3: Wybór statusu */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">3. Aktualny stan</label>
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

          {/* KROK 4: Notatka */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">4. Dodatkowe uwagi (opcjonalne)</label>
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
            disabled={isSubmitting || !selectedAuthorId || !selectedPatientId || !selectedStatus}
            className={`w-full p-5 rounded-2xl text-xl font-bold text-white shadow-lg transition-all
              ${(!selectedAuthorId || !selectedPatientId || !selectedStatus) ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz i opublikuj'}
          </button>
        </form>
      </div>
    </div>
  );
}