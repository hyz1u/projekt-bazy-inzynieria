import "dotenv/config";
import express, { type Request, type Response } from "express";

const cors = require("cors");

type StatusKey =
  | "STABLE"
  | "OBSERVATION"
  | "POST_OP"
  | "RECOVERY"
  | "DISCHARGE_SOON";

type MedicalRole = "DOCTOR" | "NURSE";

type StatusOption = {
  key: StatusKey;
  label: string;
  description: string;
  color: string;
};

type StatusEntry = {
  id: string;
  patientId: string;
  statusKey: StatusKey;
  statusLabel: string;
  note: string;
  authorName: string;
  authorRole: MedicalRole;
  createdAt: string;
};

type Patient = {
  id: string;
  pesel: string;
  fullName: string;
  ward: string;
  room: string;
  familyToken: string;
  tokenIssuedAt: string;
};

type FamilySession = {
  id: string;
  patientId: string;
  expiresAt: number;
  lastActivityAt: number;
};

type StaffUser = {
  id: string;
  login: string;
  password: string;
  fullName: string;
  role: MedicalRole;
};

type StaffSession = {
  id: string;
  userId: string;
  expiresAt: number;
  lastActivityAt: number;
};

type SessionBase = {
  id: string;
  expiresAt: number;
  lastActivityAt: number;
};

type LoginPayload = {
  pesel?: string;
  token?: string;
};

type StaffLoginPayload = {
  login?: string;
  password?: string;
};

type CreateStatusPayload = {
  patientPesel?: string;
  statusKey?: StatusKey;
  note?: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    key: "STABLE",
    label: "Stan stabilny",
    description: "Pacjent jest stabilny i pozostaje pod biezaca opieka.",
    color: "emerald",
  },
  {
    key: "OBSERVATION",
    label: "Obserwacja",
    description: "Pacjent wymaga dalszej obserwacji i kontroli parametrow.",
    color: "amber",
  },
  {
    key: "POST_OP",
    label: "Po zabiegu",
    description: "Pacjent wrocil z zabiegu i jest monitorowany pooperacyjnie.",
    color: "sky",
  },
  {
    key: "RECOVERY",
    label: "Poprawa",
    description: "Stan pacjenta poprawia sie zgodnie z planem leczenia.",
    color: "teal",
  },
  {
    key: "DISCHARGE_SOON",
    label: "Przygotowanie do wypisu",
    description: "Pacjent jest przygotowywany do wypisu lub zmiany oddzialu.",
    color: "violet",
  },
];

const statusLabelByKey = new Map(
  STATUS_OPTIONS.map((option) => [option.key, option.label]),
);

const patients: Patient[] = [
  {
    id: "pat-anna-nowak",
    pesel: "92031212345",
    fullName: "Anna Nowak",
    ward: "Kardiologia",
    room: "203A",
    familyToken: "ANNA2026",
    tokenIssuedAt: "2026-04-20T08:00:00.000Z",
  },
  {
    id: "pat-jan-kowalski",
    pesel: "81010454321",
    fullName: "Jan Kowalski",
    ward: "Chirurgia",
    room: "114B",
    familyToken: "JAN114",
    tokenIssuedAt: "2026-04-20T09:15:00.000Z",
  },
  {
    id: "pat-maria-zielinska",
    pesel: "70090598765",
    fullName: "Maria Zielinska",
    ward: "Neurologia",
    room: "310C",
    familyToken: "MARIA310",
    tokenIssuedAt: "2026-04-20T10:20:00.000Z",
  },
];

const staffUsers: StaffUser[] = [
  {
    id: "staff-1",
    login: "lekarz",
    password: "haslo123",
    fullName: "dr Marta Lewandowska",
    role: "DOCTOR",
  },
  {
    id: "staff-2",
    login: "pielegniarka",
    password: "haslo123",
    fullName: "Monika Lis",
    role: "NURSE",
  },
];

const statusEntries: StatusEntry[] = [
  {
    id: "entry-1",
    patientId: "pat-anna-nowak",
    statusKey: "STABLE",
    statusLabel: "Stan stabilny",
    note: "Parametry zyciowe w normie, pacjentka po badaniach kontrolnych.",
    authorName: "dr Tomasz Wojcik",
    authorRole: "DOCTOR",
    createdAt: "2026-04-20T09:40:00.000Z",
  },
  {
    id: "entry-2",
    patientId: "pat-anna-nowak",
    statusKey: "RECOVERY",
    statusLabel: "Poprawa",
    note: "Pacjentka zglasza mniejszy bol, kontynuujemy obserwacje.",
    authorName: "piel. Monika Lis",
    authorRole: "NURSE",
    createdAt: "2026-04-20T13:10:00.000Z",
  },
  {
    id: "entry-3",
    patientId: "pat-jan-kowalski",
    statusKey: "POST_OP",
    statusLabel: "Po zabiegu",
    note: "Pacjent po planowym zabiegu, wybudzony, stan stabilny.",
    authorName: "dr Alicja Mazur",
    authorRole: "DOCTOR",
    createdAt: "2026-04-20T11:00:00.000Z",
  },
  {
    id: "entry-4",
    patientId: "pat-maria-zielinska",
    statusKey: "OBSERVATION",
    statusLabel: "Obserwacja",
    note: "Kontynuujemy monitorowanie neurologiczne co 2 godziny.",
    authorName: "piel. Ewa Kaczmarek",
    authorRole: "NURSE",
    createdAt: "2026-04-20T12:30:00.000Z",
  },
];

const familySessions = new Map<string, FamilySession>();
const staffSessions = new Map<string, StaffSession>();
const SESSION_TIMEOUT_MINUTES = Number.parseInt(
  process.env.SESSION_TIMEOUT_MINUTES ?? "15",
  10,
);
const PORT = Number.parseInt(process.env.PORT ?? "5000", 10);
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizePesel(value: string): string {
  return value.replace(/\D/g, "");
}

function getTimelineForPatient(patientId: string): StatusEntry[] {
  return [...statusEntries]
    .filter((entry) => entry.patientId === patientId)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

function getLatestEntryForPatient(patientId: string): StatusEntry | null {
  return getTimelineForPatient(patientId)[0] ?? null;
}

function touchSession<TSession extends SessionBase>(session: TSession): TSession | null {
  const now = Date.now();
  if (session.expiresAt <= now) {
    familySessions.delete(session.id);
    staffSessions.delete(session.id);
    return null;
  }

  session.lastActivityAt = now;
  session.expiresAt = now + SESSION_TIMEOUT_MINUTES * 60 * 1000;
  return session;
}

function getFamilyView(patient: Patient) {
  return {
    id: patient.id,
    fullName: patient.fullName,
    ward: patient.ward,
    room: patient.room,
    timeline: getTimelineForPatient(patient.id),
  };
}

function getStaffSessionView(session: StaffSession) {
  const user = staffUsers.find((candidate) => candidate.id === session.userId);
  if (!user) {
    return null;
  }

  return {
    sessionId: session.id,
    expiresAt: new Date(session.expiresAt).toISOString(),
    user: {
      id: user.id,
      fullName: user.fullName,
      login: user.login,
      role: user.role,
    },
  };
}

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: false,
    allowedHeaders: ["Content-Type", "x-staff-session-id"],
  }),
);
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    mode: "memory-mvp",
    sessionTimeoutMinutes: SESSION_TIMEOUT_MINUTES,
    patients: patients.length,
  });
});

app.get("/api/status-options", (_req: Request, res: Response) => {
  res.json(STATUS_OPTIONS);
});

app.post(
  "/api/family/login",
  (req: Request<unknown, unknown, LoginPayload>, res: Response) => {
    const body = req.body ?? {};
    const pesel = sanitizePesel(
      typeof body.pesel === "string" ? body.pesel : "",
    );
    const token =
      (typeof body.token === "string" ? body.token : "").trim().toUpperCase();

    if (!pesel || !token) {
      return res.status(400).json({
        message: "Podaj PESEL i token dostepu.",
      });
    }

    const patient = patients.find(
      (candidate) =>
        candidate.pesel === pesel &&
        candidate.familyToken.toUpperCase() === token,
    );

    if (!patient) {
      return res.status(401).json({
        message: "Nie udalo sie zweryfikowac dostepu do pacjenta.",
      });
    }

    const sessionId = makeId("session");
    const now = Date.now();
    familySessions.set(sessionId, {
      id: sessionId,
      patientId: patient.id,
      lastActivityAt: now,
      expiresAt: now + SESSION_TIMEOUT_MINUTES * 60 * 1000,
    });

    return res.json({
      sessionId,
      expiresAt: new Date(
        now + SESSION_TIMEOUT_MINUTES * 60 * 1000,
      ).toISOString(),
      patient: getFamilyView(patient),
    });
  },
);

app.post(
  "/api/staff/login",
  (req: Request<unknown, unknown, StaffLoginPayload>, res: Response) => {
    const body = req.body ?? {};
    const login =
      (typeof body.login === "string" ? body.login : "").trim().toLowerCase();
    const password =
      (typeof body.password === "string" ? body.password : "").trim();

    if (!login || !password) {
      return res.status(400).json({
        message: "Podaj login i haslo personelu.",
      });
    }

    const user = staffUsers.find(
      (candidate) =>
        candidate.login.toLowerCase() === login && candidate.password === password,
    );

    if (!user) {
      return res.status(401).json({
        message: "Nieprawidlowe dane logowania personelu.",
      });
    }

    const sessionId = makeId("staff-session");
    const now = Date.now();
    const session: StaffSession = {
      id: sessionId,
      userId: user.id,
      lastActivityAt: now,
      expiresAt: now + SESSION_TIMEOUT_MINUTES * 60 * 1000,
    };

    staffSessions.set(sessionId, session);

    return res.json(getStaffSessionView(session));
  },
);

app.get(
  "/api/staff/session/:sessionId",
  (req: Request<{ sessionId: string }>, res: Response) => {
    const session = staffSessions.get(req.params.sessionId);

    if (!session) {
      return res.status(401).json({
        message: "Sesja personelu wygasla lub jest nieprawidlowa.",
      });
    }

    const refreshed = touchSession(session);
    if (!refreshed) {
      return res.status(401).json({
        message: "Sesja personelu wygasla. Zaloguj sie ponownie.",
      });
    }

    const payload = getStaffSessionView(refreshed);
    if (!payload) {
      staffSessions.delete(refreshed.id);
      return res.status(404).json({
        message: "Nie znaleziono konta personelu dla tej sesji.",
      });
    }

    return res.json(payload);
  },
);

app.get(
  "/api/family/session/:sessionId",
  (req: Request<{ sessionId: string }>, res: Response) => {
    const session = familySessions.get(req.params.sessionId);

    if (!session) {
      return res.status(401).json({
        message: "Sesja wygasla lub jest nieprawidlowa.",
      });
    }

    const refreshed = touchSession(session);
    if (!refreshed) {
      return res.status(401).json({
        message: "Sesja wygasla. Zaloguj sie ponownie.",
      });
    }

    const patient = patients.find(
      (candidate) => candidate.id === refreshed.patientId,
    );
    if (!patient) {
      familySessions.delete(refreshed.id);
      return res.status(404).json({
        message: "Nie znaleziono pacjenta dla tej sesji.",
      });
    }

    return res.json({
      sessionId: refreshed.id,
      expiresAt: new Date(refreshed.expiresAt).toISOString(),
      patient: getFamilyView(patient),
    });
  },
);

app.post(
  "/api/staff/status",
  (req: Request<unknown, unknown, CreateStatusPayload>, res: Response) => {
    const body = req.body ?? {};
    const sessionId = String(req.headers["x-staff-session-id"] ?? "").trim();
    const pesel = sanitizePesel(
      typeof body.patientPesel === "string" ? body.patientPesel : "",
    );
    const statusKey =
      typeof body.statusKey === "string"
        ? (body.statusKey as StatusKey)
        : undefined;
    const note = typeof body.note === "string" ? body.note.trim() : "";

    const session = staffSessions.get(sessionId);
    if (!session) {
      return res.status(401).json({
        message: "Zaloguj personel medyczny przed dodaniem statusu.",
      });
    }

    const refreshed = touchSession(session);
    if (!refreshed) {
      return res.status(401).json({
        message: "Sesja personelu wygasla. Zaloguj sie ponownie.",
      });
    }

    const user = staffUsers.find((candidate) => candidate.id === refreshed.userId);
    if (!user) {
      staffSessions.delete(refreshed.id);
      return res.status(404).json({
        message: "Nie znaleziono konta personelu.",
      });
    }

    if (!pesel || !statusKey) {
      return res.status(400).json({
        message: "Wymagane sa: PESEL pacjenta i status.",
      });
    }

    const patient = patients.find((candidate) => candidate.pesel === pesel);
    if (!patient) {
      return res.status(404).json({
        message: "Nie znaleziono pacjenta o podanym PESEL-u.",
      });
    }

    const statusLabel = statusLabelByKey.get(statusKey);
    if (!statusLabel) {
      return res.status(400).json({
        message: "Wybrany status nie istnieje w slowniku systemu.",
      });
    }

    const entry: StatusEntry = {
      id: makeId("entry"),
      patientId: patient.id,
      statusKey,
      statusLabel,
      note,
      authorName: user.fullName,
      authorRole: user.role,
      createdAt: new Date().toISOString(),
    };

    statusEntries.push(entry);

    return res.status(201).json({
      message: "Status pacjenta zostal zapisany.",
      entry,
      patient: getFamilyView(patient),
    });
  },
);

app.get("/api/reception/patients", (req: Request, res: Response) => {
  const search = sanitizePesel(String(req.query.search ?? ""));

  const filteredPatients = patients.filter((patient) =>
    search ? patient.pesel.includes(search) : true,
  );

  const payload = filteredPatients.map((patient) => ({
    id: patient.id,
    pesel: patient.pesel,
    fullName: patient.fullName,
    ward: patient.ward,
    room: patient.room,
    familyToken: patient.familyToken,
    latestEntry: getLatestEntryForPatient(patient.id),
  }));

  return res.json(payload);
});

app.get(
  "/api/reception/patients/:patientId",
  (req: Request<{ patientId: string }>, res: Response) => {
    const patient = patients.find(
      (candidate) => candidate.id === req.params.patientId,
    );

    if (!patient) {
      return res.status(404).json({
        message: "Nie znaleziono pacjenta.",
      });
    }

    return res.json({
      ...patient,
      timeline: getTimelineForPatient(patient.id),
    });
  },
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Nie znaleziono zadanego zasobu.",
  });
});

app.use((error: Error, _req: Request, res: Response, _next: unknown) => {
  console.error("Nieobsluzony blad API:", error);
  res.status(500).json({
    message: "Wystapil blad serwera podczas przetwarzania zadania.",
  });
});

app.listen(PORT, () => {
  console.log(`InfoPacjent API dziala na porcie ${PORT}`);
});
