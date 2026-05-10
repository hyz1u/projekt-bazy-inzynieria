import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, APP_TIMEOUTS, VALIDATION } from '../constants.ts';

interface PatientFormData {
  firstName: string;
  lastName: string;
  pesel: string;
}

export default function AddPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PatientFormData>({ firstName: '', lastName: '', pesel: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [patientToken, setPatientToken] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.pesel.length !== VALIDATION.PESEL_LENGTH) {
      setError('Numer PESEL musi mieć dokładnie 11 cyfr.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.PATIENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd rejestracji.');

      const tokenFromServer = data.accessToken || (data.patient && data.patient.accessToken) || 'BŁĄD';

      setPatientToken(tokenFromServer);
      setSuccessMessage(`Zarejestrowano pomyślnie!`);
      
      setTimeout(() => {
        navigate('/lekarz');
      }, APP_TIMEOUTS.REDIRECT_LONG);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Wystąpił nieoczekiwany błąd aplikacji.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (patientToken) {
      navigator.clipboard.writeText(patientToken);
      setCopied(true);
      setTimeout(() => setCopied(false), APP_TIMEOUTS.COPY_SUCCESS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

      {successMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl">
          <div className="bg-white p-10 md:p-14 rounded-[50px] shadow-2xl border-t-8 border-emerald-500 max-w-lg w-full mx-4 text-center transform animate-in fade-in zoom-in duration-300">
            
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✓
            </div>
            
            <h3 className="text-3xl font-black text-slate-800 mb-2">{successMessage}</h3>
            <p className="text-slate-500 font-medium mb-8">Przekaż poniższy kod rodzinie pacjenta:</p>

            <div className="relative group">
              <div className="bg-slate-100 p-6 rounded-3xl mb-4 flex items-center justify-between border-2 border-slate-200 group-hover:border-emerald-400 transition-colors">
                <span className="text-4xl font-mono font-black text-slate-800 tracking-[0.2em]">
                  {patientToken}
                </span>
                <button 
                  onClick={handleCopy}
                  type="button"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl transition-all shadow-md active:scale-90"
                  title="Kopiuj do schowka"
                >
                  <span className="text-xl">📋</span>
                </button>
              </div>

              {copied && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-4 rounded-full font-bold animate-bounce">
                  Skopiowano do schowka!
                </div>
              )}
            </div>

            <div className="mt-12 text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
              Powrót do panelu za chwilę...
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        
        <div className="bg-blue-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold">Przyjęcie Pacjenta</h1>
          <p className="opacity-80 mt-2">Wypełnij dane, aby wygenerować token dostępu</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Imię</label>
              <input
                required
                type="text"
                placeholder="np. Anna"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nazwisko</label>
              <input
                required
                type="text"
                placeholder="np. Kowalska"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Numer PESEL</label>
            <input
              required
              type="text"
              maxLength={11}
              placeholder="Wpisz 11 cyfr"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg tracking-widest"
              onChange={(e) => setFormData({...formData, pesel: e.target.value.replace(/\D/g,'')})}
            />
            <p className="text-xs text-slate-400 mt-2 italic">Numer PESEL jest niezbędny do weryfikacji tożsamości.</p>
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            <button
              disabled={isSubmitting}
              className={`w-full p-5 bg-blue-600 text-white rounded-2xl text-xl font-bold shadow-lg hover:bg-blue-700 transition-all ${isSubmitting ? 'opacity-50' : 'active:scale-95'}`}
            >
              {isSubmitting ? 'Zapisywanie...' : 'Zarejestruj i wygeneruj token'}
            </button>
            <Link to="/" className="text-center text-slate-500 hover:text-slate-800 text-sm font-medium py-2">
              Anuluj i wróć
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
