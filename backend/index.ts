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


app.get('/api/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { 
        updates: {
          orderBy: { createdAt: 'desc' }
        } 
      }
    });
    res.json(patients);
  } catch (error) {
    console.error("Błąd pobierania pacjentów:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas łączenia z bazą danych." });
  }
});

app.post('/api/status', async (req, res) => {
  const { patientId, authorId, status, note } = req.body;

  try {
    const newStatus = await prisma.statusUpdate.create({
      data: {
        status: status,
        note: note,
        patientId: patientId,
        authorId: authorId,
      }
    });
    res.status(201).json(newStatus);
  } catch (error) {
    console.error("Błąd dodawania statusu:", error);
    res.status(500).json({ error: "Nie udało się zapisać statusu." });
  }
});

// Rejestracja nowego pacjenta
app.post('/api/patients', async (req, res) => {
  const { firstName, lastName, pesel } = req.body;

  try {
    const generatedToken = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newPatient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        pesel,
        accessToken: generatedToken,
      },
    });

    res.status(201).json(newPatient);
  } catch (error: unknown) {
    console.error("Błąd dodawania pacjenta:", error);
    
    const isPrismaError = typeof error === 'object' && error !== null && 'code' in error;
    
    if (isPrismaError && (error as Record<string, unknown>).code === 'P2002') {
      return res.status(400).json({ error: "Pacjent o tym numerze PESEL już istnieje w systemie." });
    }
    
    res.status(500).json({ error: "Nie udało się zarejestrować pacjenta." });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer backendowy wystartował http://localhost:${PORT}`);
  console.log(`Połączono z bazą danych Supabase`);
});