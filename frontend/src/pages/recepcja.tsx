import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { STATUS_MAP, formatDateTime } from '../utils.ts';


// Typ dla pojedynczego wpisu na osi czasu
interface StatusUpdate {
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/patients')
      .then(res => res.json())
      .then((data: Patient[]) => {
        setPatients(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Błąd pobierania danych", err);
        setIsLoading(false);
      });
  }, []);

  const filteredPatients = patients.filter((patient) =>
      patient.pesel.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="flex justify-between items-center bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Panel Recepcji</h1>
          <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md active:scale-95">
            Wróć do menu
          </Link>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-xl font-bold text-slate-800">Baza zarejestrowanych pacjentów</h2>
            
            {/* Pole wyszukiwania po numerze PESEL */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Szukaj po PESEL..."
                maxLength={11}
                className="w-full p-3 pl-4 bg-slate-100 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ''))}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 font-bold"
                >
                  X
                </button>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Pobieranie danych z bazy...</div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div key={patient.id} className="p-5 border-l-8 border-blue-500 bg-slate-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-xl text-slate-800">{patient.lastName} {patient.firstName}</p>
                        <p className="text-sm font-bold text-blue-600 tracking-widest mt-1">PESEL: {patient.pesel}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      {patient.updates && patient.updates.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Ostatnia aktualizacja:</span>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                            {STATUS_MAP[patient.updates[0].status] || patient.updates[0].status}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDateTime(patient.updates[0].createdAt)}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm italic text-slate-400">Brak odnotowanych statusów medycznych.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 text-lg">
                    {searchTerm 
                      ? `Nie znaleziono pacjenta o numerze PESEL: ${searchTerm}` 
                      : "Baza pacjentów jest obecnie pusta."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
