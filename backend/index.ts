import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg'; 
import { PrismaPg } from '@prisma/adapter-pg'; 


const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = 3000;

if (!connectionString) {
  console.error("BŁĄD: Brak DATABASE_URL w pliku .env!");
  process.exit(1);
}

app.use(cors()); 
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Systemu InfoPacjent działa poprawnie!');
});


app.get('/api/staff', async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ['DOCTOR', 'NURSE']
        }
      },
      select: {
        id: true,
        fullName: true,
        role: true
      }
    });
    res.json(staff);
  } catch (error: unknown) {
    console.error("Błąd pobierania personelu:", error);
    res.status(500).json({ error: "Nie udało się pobrać listy personelu." });
  }
});

app.post('/api/staff/login', async (req, res) => {
  try {
    const { username, password, expectedRole } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: "Nieprawidłowa nazwa użytkownika." });
    }

    if (user.passwordHash !== password) {
      return res.status(401).json({ error: "Nieprawidłowe hasło." });
    }

    if (user.role !== expectedRole) {
      return res.status(403).json({ error: "Odmowa dostępu. Twoje konto nie ma uprawnień do tego panelu." });
    }

    res.json({
      message: "Zalogowano pomyślnie",
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error: unknown) {
    console.error("Błąd podczas logowania personelu:", error);
    res.status(500).json({ error: "Wystąpił błąd po stronie serwera." });
  }
});

// pobieranie listy wszystkich pacjentów (dla rozwijanej listy)
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(patients);
  } catch (error: unknown) {
    console.error("Błąd podczas pobierania listy pacjentów:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas pobierania pacjentów." });
  }
});

// dodawanie nowego czlonka personelu
app.post('/api/staff/register', async (req, res) => {
  const { username, fullName, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Ta nazwa użytkownika jest już zajęta." });
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        fullName,
        role,
        passwordHash: 'start123', 
      }
    });

    res.json(newUser);
  } catch (error: unknown) {
    console.error("Błąd podczas rejestracji personelu:", error);
    res.status(500).json({ error: "Wystąpił błąd serwera." });
  }
});

// aktualizacja statusu
app.post('/api/status', async (req, res) => {
  const { patientId, authorId, status, note } = req.body;

  try {
    const newStatus = await prisma.statusUpdate.create({
      data: {
        status: status, 
        note: note || null, 
        patientId: Number(patientId),
        authorId: Number(authorId), 
      }
    });
    res.status(201).json(newStatus);
  } catch (error: unknown) {
    console.error("Błąd zapisu statusu w bazie:", error);
    res.status(500).json({ error: "Nie udało się zapisać statusu." });
  }
});

// Rejestracja nowego pacjenta
app.post('/api/patients', async (req, res) => {
  try {
    const { firstName, lastName, pesel } = req.body;

    const existingPatient = await prisma.patient.findUnique({ where: { pesel } });
    if (existingPatient) {
      return res.status(400).json({ error: "Pacjent o tym numerze PESEL już istnieje w bazie." });
    }

    const generatedToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 14);

    const newPatient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        pesel,
        accessToken: generatedToken,
        tokenExpires: expirationDate
      }
    });

    res.json({
      message: "Pacjent pomyślnie zarejestrowany",
      accessToken: generatedToken,
      patient: newPatient
    });

  } catch (error: unknown) {
    console.error("Błąd podczas rejestracji pacjenta:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas rejestracji." });
  }
});


// logowanie rodziny i oś czasu pacjenta
app.post('/api/family/login', async (req, res) => {
  try {
    const { pesel, token } = req.body;

    const patient = await prisma.patient.findFirst({
      where: { 
        pesel: pesel,
        accessToken: token 
      },
      include: {
        updates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(401).json({ error: "Nieprawidłowy numer PESEL lub kod dostępu." });
    }

    if (patient.tokenExpires && new Date() > new Date(patient.tokenExpires)) {
      return res.status(403).json({ error: "Twój kod dostępu wygasł po 14 dniach. Jeśli pacjent nadal przebywa na oddziale, zgłoś się do recepcji po nowy kod." });
    }
    
    res.json(patient);

  } catch (error: unknown) {
    console.error("Błąd podczas autoryzacji rodziny:", error);
    res.status(500).json({ error: "Wystąpił błąd po stronie serwera." });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer backendowy wystartował http://localhost:${PORT}`);
  console.log(`Połączono z bazą danych Supabase`);
});