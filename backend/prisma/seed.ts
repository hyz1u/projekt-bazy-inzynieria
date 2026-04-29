import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const doctors = [
    { username: 'a.nowak', fullName: 'Anna Nowak', role: 'DOCTOR' },
    { username: 'p.wisniewski', fullName: 'Piotr Wiśniewski', role: 'DOCTOR' },
    { username: 'm.kowalska', fullName: 'Maria Kowalska', role: 'DOCTOR' }
  ];

  console.log("Rozpoczynam dodawanie lekarzy...");

  for (const doc of doctors) {
    await prisma.user.upsert({
      where: { username: doc.username },
      update: {},
      create: {
        username: doc.username,
        passwordHash: 'haslo123',
        fullName: doc.fullName,
        role: doc.role as any, 
      },
    });
    console.log(`Dodano: ${doc.fullName} (${doc.username})`);
  }

  console.log("Baza danych została zasilona!");
}

main()
  .catch((e: unknown) => {
    console.error("Błąd podczas seedowania:", e);
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect();
  });