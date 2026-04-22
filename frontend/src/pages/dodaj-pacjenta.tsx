import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.pesel.length !== 11) {
      setError('Numer PESEL musi mieć dokładnie 11 cyfr.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Błąd zapisu danych na serwerze.');
      }

      alert(`Pacjent zarejestrowany! Token dla rodziny: ${data.accessToken}`);
      navigate('/recepcja');
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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
