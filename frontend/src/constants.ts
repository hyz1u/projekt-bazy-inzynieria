export const API_BASE_URL = 'http://localhost:3000/api';


export const API_ENDPOINTS = {
  PATIENTS: `${API_BASE_URL}/patients`,               // pobieranie i dodawanie pacjentów
  STAFF: `${API_BASE_URL}/staff`,                     // pobieranie listy personelu
  STAFF_REGISTER: `${API_BASE_URL}/staff/register`,   // rejestracja nowego pracownika
  STAFF_LOGIN: `${API_BASE_URL}/staff/login`,         // logowanie personelu
  FAMILY_LOGIN: `${API_BASE_URL}/family/login`,       // logowanie rodziny pacjenta
  STATUS: `${API_BASE_URL}/status`,                   // dodawanie nowego wpisu medycznego
};


export const ROLES = {
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
};


export const APP_TIMEOUTS = {
  FAMILY_AUTO_LOGOUT: 30000,  // czas bezczynności przed automatycznym wylogowaniem rodziny (30 sek)
  TOAST_MESSAGE: 5000,        // czas wyświetlania powiadomienia np. o wylogowaniu (5 sek)
  COPY_SUCCESS: 4000,         // czas wyświetlania dymku "Skopiowano do schowka" (4 sek)
  REDIRECT_SHORT: 2500,       // szybkie przekierowanie po zapisaniu statusu lub pracownika (2.5 sek)
  REDIRECT_LONG: 8000,        // wydłużone przekierowanie, by lekarz miał czas skopiować token (8 sek)
};

interface StatusOption {
  id: string;
  color: string;
}
// lista możliwych statusów pacjenta do wyboru w formularzu
export const STATUS_OPTIONS: StatusOption[] = [
  { id: 'STABLE', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'IMPROVING', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'POST_OP', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'AWAITING_TESTS', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'CRITICAL', color: 'bg-red-100 text-red-800 border-red-300' },
];

// ograniczenia i walidacja danych wejściowych
export const VALIDATION = {
  PESEL_LENGTH: 11,
};