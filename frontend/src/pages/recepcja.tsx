import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Typ dla pojedynczego wpisu na osi czasu
interface StatusUpdate {
  id: number;
  status: string;
  createdAt: string; 
}

// Typ dla Pacjenta
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  pesel: string;
  updates: StatusUpdate[];
}

export default function ReceptionPanel() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/patients')
      .then(res => res.json())
      .then((data: Patient[]) => {
        setPatients(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Błąd pobierania danych:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Panel Recepcji</h1>
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            &larr; Powrót do menu
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-700">Zarejestrowani Pacjenci</h2>
          
          {isLoading ? (
            <p className="text-slate-500 animate-pulse">Pobieranie danych z bazy Supabase...</p>
          ) : patients.length === 0 ? (
            <p className="text-amber-600 bg-amber-50 p-4 rounded-lg">
              Baza jest pusta. Dodaj pierwszego pacjenta przez Panel Lekarza!
            </p>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="p-4 border-l-4 border-blue-500 bg-slate-50 rounded-r-lg">
                  <p className="font-bold text-lg">{patient.firstName} {patient.lastName}</p>
                  <p className="text-sm text-slate-500 mb-2">PESEL: {patient.pesel}</p>
                  
                  {patient.updates && patient.updates.length > 0 ? (
                    <p className="text-sm font-medium text-emerald-600">
                      Ostatni status: <span className="font-bold">{patient.updates[0].status}</span>
                      <span className="text-slate-400 font-normal ml-2">
                        ({new Date(patient.updates[0].createdAt).toLocaleTimeString()})
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">Brak statusów leczenia.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
