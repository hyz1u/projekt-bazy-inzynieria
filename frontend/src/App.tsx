import { useEffect, useState } from "react";
import backgroundImage from "./assets/tlo-med.jpg";

type View = "home" | "family" | "staff" | "reception";
type MedicalRole = "DOCTOR" | "NURSE";
type StatusKey =
  | "STABLE"
  | "OBSERVATION"
  | "POST_OP"
  | "RECOVERY"
  | "DISCHARGE_SOON";

type StatusOption = {
  key: StatusKey;
  label: string;
  description: string;
  color: string;
};

type TimelineEntry = {
  id: string;
  patientId: string;
  statusKey: StatusKey;
  statusLabel: string;
  note: string;
  authorName: string;
  authorRole: MedicalRole;
  createdAt: string;
};

type FamilyPatient = {
  id: string;
  fullName: string;
  ward: string;
  room: string;
  timeline: TimelineEntry[];
};

type FamilySessionResponse = {
  sessionId: string;
  expiresAt: string;
  patient: FamilyPatient;
};

type StaffSessionResponse = {
  sessionId: string;
  expiresAt: string;
  user: {
    id: string;
    fullName: string;
    login: string;
    role: MedicalRole;
  };
};

type ReceptionPatient = {
  id: string;
  pesel: string;
  fullName: string;
  ward: string;
  room: string;
  familyToken: string;
  latestEntry: TimelineEntry | null;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    const mergedHeaders = {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    };

    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: mergedHeaders,
    });
  } catch {
    throw new Error("Nie udalo sie polaczyc z backendem.");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(payload?.message ?? "Nie udalo sie wykonac zadania.");
  }

  return (await response.json()) as T;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function App() {
  const [activeView, setActiveView] = useState<View>("home");
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [healthMessage, setHealthMessage] = useState("Laczenie z API...");
  const [globalError, setGlobalError] = useState("");

  const [familyPesel, setFamilyPesel] = useState("");
  const [familyToken, setFamilyToken] = useState("");
  const [familySession, setFamilySession] = useState<FamilySessionResponse | null>(
    null,
  );
  const [familyLoading, setFamilyLoading] = useState(false);

  const [staffPesel, setStaffPesel] = useState("92031212345");
  const [staffStatus, setStaffStatus] = useState<StatusKey>("RECOVERY");
  const [staffNote, setStaffNote] = useState(
    "Pacjentka spokojna, leczenie przebiega zgodnie z planem.",
  );
  const [staffLogin, setStaffLogin] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffSession, setStaffSession] = useState<StaffSessionResponse | null>(null);
  const [staffLoginLoading, setStaffLoginLoading] = useState(false);
  const [staffMessage, setStaffMessage] = useState("");
  const [staffSaving, setStaffSaving] = useState(false);

  const [searchPesel, setSearchPesel] = useState("");
  const [receptionPatients, setReceptionPatients] = useState<ReceptionPatient[]>([]);
  const [receptionLoading, setReceptionLoading] = useState(false);

  useEffect(() => {
    const loadBootstrap = async () => {
      try {
        const [health, options] = await Promise.all([
          apiFetch<{ ok: boolean; patients: number; mode: string }>("/health"),
          apiFetch<StatusOption[]>("/api/status-options"),
        ]);
        setHealthMessage(
          `System gotowy do pracy, dostepnych pacjentow: ${health.patients}.`,
        );
        setStatusOptions(options);
      } catch (error) {
        setGlobalError(
          error instanceof Error ? error.message : "Nie udalo sie polaczyc z API.",
        );
        setHealthMessage("Backend nie odpowiada. Uruchom serwer Express.");
      }
    };

    void loadBootstrap();
  }, []);

  useEffect(() => {
    const loadPatients = async () => {
      setReceptionLoading(true);
      try {
        const query = searchPesel ? `?search=${encodeURIComponent(searchPesel)}` : "";
        const patients = await apiFetch<ReceptionPatient[]>(
          `/api/reception/patients${query}`,
        );
        setReceptionPatients(patients);
      } catch (error) {
        setGlobalError(
          error instanceof Error ? error.message : "Nie udalo sie pobrac pacjentow.",
        );
      } finally {
        setReceptionLoading(false);
      }
    };

    void loadPatients();
  }, [searchPesel]);

  useEffect(() => {
    if (!staffSession?.sessionId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void apiFetch<StaffSessionResponse>(
        `/api/staff/session/${staffSession.sessionId}`,
      )
        .then((payload) => {
          setStaffSession(payload);
        })
        .catch(() => {
          setStaffSession(null);
          setGlobalError("Sesja personelu wygasla. Zaloguj sie ponownie.");
        });
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [staffSession?.sessionId]);

  useEffect(() => {
    if (!familySession?.sessionId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void apiFetch<FamilySessionResponse>(
        `/api/family/session/${familySession.sessionId}`,
      )
        .then((payload) => {
          setFamilySession(payload);
        })
        .catch(() => {
          setFamilySession(null);
          setGlobalError("Sesja rodziny wygasla. Zaloguj sie ponownie.");
        });
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [familySession?.sessionId]);

  async function handleFamilyLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFamilyLoading(true);
    setGlobalError("");

    try {
      const payload = await apiFetch<FamilySessionResponse>("/api/family/login", {
        method: "POST",
        body: JSON.stringify({
          pesel: familyPesel,
          token: familyToken,
        }),
      });
      setFamilySession(payload);
    } catch (error) {
      setFamilySession(null);
      setGlobalError(
        error instanceof Error ? error.message : "Nie udalo sie zalogowac rodziny.",
      );
    } finally {
      setFamilyLoading(false);
    }
  }

  async function handleStaffSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!staffSession?.sessionId) {
      setGlobalError("Zaloguj personel medyczny przed dodaniem statusu.");
      return;
    }

    setStaffSaving(true);
    setStaffMessage("");
    setGlobalError("");

    try {
      await apiFetch<{ message: string }>("/api/staff/status", {
        method: "POST",
        headers: {
          "x-staff-session-id": staffSession?.sessionId ?? "",
        },
        body: JSON.stringify({
          patientPesel: staffPesel,
          statusKey: staffStatus,
          note: staffNote,
        }),
      });
      setStaffMessage("Status zapisany poprawnie.");
      const query = searchPesel ? `?search=${encodeURIComponent(searchPesel)}` : "";
      const patients = await apiFetch<ReceptionPatient[]>(
        `/api/reception/patients${query}`,
      );
      setReceptionPatients(patients);
      if (familySession?.sessionId) {
        const refreshed = await apiFetch<FamilySessionResponse>(
          `/api/family/session/${familySession.sessionId}`,
        );
        setFamilySession(refreshed);
      }
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error.message : "Nie udalo sie zapisac statusu.",
      );
    } finally {
      setStaffSaving(false);
    }
  }

  async function handleStaffLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStaffLoginLoading(true);
    setGlobalError("");
    setStaffMessage("");

    try {
      const payload = await apiFetch<StaffSessionResponse>("/api/staff/login", {
        method: "POST",
        body: JSON.stringify({
          login: staffLogin,
          password: staffPassword,
        }),
      });
      setStaffSession(payload);
    } catch (error) {
      setStaffSession(null);
      setGlobalError(
        error instanceof Error ? error.message : "Nie udalo sie zalogowac personelu.",
      );
    } finally {
      setStaffLoginLoading(false);
    }
  }

  const selectedStatusDescription =
    statusOptions.find((option) => option.key === staffStatus)?.description ??
    "Opis wybranego statusu pojawi sie tutaj.";

  function goToHome(): void {
    setActiveView("home");
    setFamilySession(null);
    setFamilyPesel("");
    setFamilyToken("");
    setStaffSession(null);
    setStaffLogin("");
    setStaffPassword("");
    setGlobalError("");
  }

  const roleCards: Array<{
    key: Exclude<View, "home">;
    title: string;
    subtitle: string;
    description: string;
    style: string;
    arrow: string;
  }> = [
    {
      key: "family",
      title: "Rodzina Pacjenta",
      subtitle: "Zaloguj sie za pomoca tokenu",
      description: "Dostep do osi czasu i ostatnich informacji o stanie pacjenta.",
      style:
        "border-blue-100 bg-blue-50 hover:border-blue-300 hover:bg-blue-100 text-blue-950",
      arrow: "text-blue-500",
    },
    {
      key: "staff",
      title: "Personel Medyczny",
      subtitle: "Dodaj nowy status leczenia",
      description: "Szybki wpis statusu z lista gotowych opcji i notatka.",
      style:
        "border-emerald-100 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100 text-emerald-950",
      arrow: "text-emerald-500",
    },
    {
      key: "reception",
      title: "Rejestracja / Recepcja",
      subtitle: "Podglad statusow wszystkich pacjentow",
      description: "Wyszukiwanie po PESEL-u i podglad ostatniego statusu.",
      style:
        "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 text-slate-900",
      arrow: "text-slate-500",
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-6 text-slate-900 sm:px-6"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="mx-auto max-w-6xl">
        {activeView === "home" ? (
          <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/80">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-blue-600">
                  InfoPacjent
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  System informacji o stanie pacjenta
                </p>
                <p className="mt-4 text-xs text-slate-400">{healthMessage}</p>
              </div>

              <div className="mt-8 space-y-4">
                {roleCards.map((card) => (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => setActiveView(card.key)}
                    className={`group w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 ${card.style}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold">{card.title}</h2>
                        <p className="mt-1 text-sm">{card.subtitle}</p>
                        <p className="mt-3 text-xs opacity-75">{card.description}</p>
                      </div>
                      <span
                        className={`text-2xl transition-transform group-hover:translate-x-1 ${card.arrow}`}
                      >
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeView !== "home" ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/70 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">InfoPacjent</h1>
                <p className="mt-2 text-sm text-slate-500">{healthMessage}</p>
              </div>
              <button
                type="button"
                onClick={goToHome}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Wroc do strony glownej
              </button>
            </div>

            {globalError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {globalError}
              </div>
            ) : null}

            {activeView === "family" ? (
              <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/70">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-blue-700">
                    Zaloguj sie, aby sprawdzic status pacjenta
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Wpisz PESEL pacjenta i token dostepu, aby zobaczyc aktualny status oraz
                    historie wpisow.
                  </p>
                </div>

                <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleFamilyLogin}>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    PESEL pacjenta
                    <input
                      value={familyPesel}
                      onChange={(event) => setFamilyPesel(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Token dostepu
                    <input
                      value={familyToken}
                      onChange={(event) => setFamilyToken(event.target.value.toUpperCase())}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 uppercase outline-none transition focus:border-blue-400 focus:bg-white"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={familyLoading}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {familyLoading ? "Logowanie..." : "Pokaz status pacjenta"}
                  </button>
                </form>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-900">
                  Przykladowe dane do sprawdzenia:
                  <div className="mt-2 font-medium">PESEL: 92031212345</div>
                  <div className="font-medium">Token: ANNA2026</div>
                </div>

                {familySession ? (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-3xl bg-blue-50 p-5">
                      <h3 className="text-2xl font-bold text-blue-950">
                        {familySession.patient.fullName}
                      </h3>
                      <p className="mt-2 text-sm text-blue-800">
                        Oddzial {familySession.patient.ward}, sala {familySession.patient.room}
                      </p>
                      <p className="mt-2 text-xs text-blue-700">
                        Sesja aktywna do {formatDate(familySession.expiresAt)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {familySession.patient.timeline.map((entry) => (
                        <article
                          key={entry.id}
                          className="rounded-3xl border border-slate-200 bg-white p-5"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">
                                {entry.statusLabel}
                              </h4>
                              <p className="mt-2 text-sm text-slate-600">{entry.note}</p>
                            </div>
                            <p className="text-sm text-slate-400">
                              {formatDate(entry.createdAt)}
                            </p>
                          </div>
                          <p className="mt-4 text-xs uppercase tracking-wide text-slate-400">
                            {entry.authorRole === "DOCTOR" ? "Lekarz" : "Pielegniarka"}:
                            {" "}
                            {entry.authorName}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                    Po poprawnym zalogowaniu tutaj pojawi sie historia statusow pacjenta.
                  </div>
                )}
              </section>
            ) : null}

            {activeView === "staff" ? (
              <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/70">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-emerald-700">
                    Logowanie personelu medycznego
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Zaloguj sie jako lekarz lub pielegniarka, aby dodawac nowe statusy
                    pacjentow.
                  </p>
                </div>

                {!staffSession ? (
                  <>
                    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleStaffLogin}>
                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Login
                        <input
                          value={staffLogin}
                          onChange={(event) => setStaffLogin(event.target.value)}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Haslo
                        <input
                          type="password"
                          value={staffPassword}
                          onChange={(event) => setStaffPassword(event.target.value)}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={staffLoginLoading}
                        className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                      >
                        {staffLoginLoading ? "Logowanie..." : "Zaloguj personel"}
                      </button>
                    </form>

                    <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                      Przykladowe dane logowania lekarza:
                      <div className="mt-2 font-medium">Login: lekarz</div>
                      <div className="font-medium">Haslo: haslo123</div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Po poprawnym zalogowaniu pojawi sie formularz dodawania statusu pacjenta.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                      Zalogowano jako {staffSession.user.fullName}
                      {" "}
                      ({staffSession.user.role === "DOCTOR" ? "Lekarz" : "Pielegniarka"}).
                    </div>

                    <form className="grid gap-4" onSubmit={handleStaffSubmit}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          PESEL pacjenta
                          <input
                            value={staffPesel}
                            onChange={(event) => setStaffPesel(event.target.value)}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                          Status
                          <select
                            value={staffStatus}
                            onChange={(event) => setStaffStatus(event.target.value as StatusKey)}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
                          >
                            {statusOptions.map((option) => (
                              <option key={option.key} value={option.key}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="grid gap-2 text-sm font-medium text-slate-700">
                        Notatka
                        <textarea
                          value={staffNote}
                          onChange={(event) => setStaffNote(event.target.value)}
                          rows={5}
                          className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
                        />
                      </label>

                      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        {selectedStatusDescription}
                      </div>

                      <button
                        type="submit"
                        disabled={staffSaving}
                        className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                      >
                        {staffSaving ? "Zapisywanie..." : "Dodaj nowy status"}
                      </button>
                    </form>

                    {staffMessage ? (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {staffMessage}
                      </div>
                    ) : null}
                  </>
                )}
              </section>
            ) : null}

            {activeView === "reception" ? (
              <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/70">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Panel rejestracji i recepcji
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Znajdz pacjenta po numerze PESEL i sprawdz jego ostatni status.
                  </p>
                </div>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Wyszukaj po PESEL-u
                  <input
                    value={searchPesel}
                    onChange={(event) => setSearchPesel(event.target.value)}
                    placeholder="np. 92031212345"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </label>

                <div className="mt-6 grid gap-4">
                  {receptionLoading ? (
                    <div className="rounded-2xl bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Ladowanie pacjentow...
                    </div>
                  ) : receptionPatients.length > 0 ? (
                    receptionPatients.map((patient) => (
                      <article
                        key={patient.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {patient.fullName}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600">
                              PESEL {patient.pesel}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Oddzial {patient.ward}, sala {patient.room}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Token dla rodziny: {patient.familyToken}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4 lg:max-w-md">
                            {patient.latestEntry ? (
                              <>
                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                  Ostatni status
                                </p>
                                <p className="mt-2 font-semibold text-slate-900">
                                  {patient.latestEntry.statusLabel}
                                </p>
                                <p className="mt-2 text-sm text-slate-600">
                                  {patient.latestEntry.note}
                                </p>
                                <p className="mt-3 text-xs text-slate-400">
                                  {formatDate(patient.latestEntry.createdAt)}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-slate-500">
                                Brak wpisow dla tego pacjenta.
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                      Brak pacjentow spelniajacych kryteria wyszukiwania.
                    </div>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
