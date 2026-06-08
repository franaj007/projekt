import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Rozpoczynam seedowanie bazy danych...');
  
  // Czyszczenie istniejących danych (jeśli konieczne)
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);
  
  // Tworzenie użytkowników
  const user1 = await prisma.user.create({
    data: {
      email: 'antoni@example.com',
      name: 'Antoni',
      passwordHash,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'franciszek@example.com',
      name: 'Franciszek',
      passwordHash,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'jan@example.com',
      name: 'Jan',
      passwordHash,
    },
  });

  // Tworzenie grupy
  const group = await prisma.group.create({
    data: {
      name: 'Wyjazd w góry',
      members: {
        create: [
          { userId: user1.id },
          { userId: user2.id },
          { userId: user3.id },
        ],
      },
    },
  });

  // Tworzenie pierwszego wydatku (Paliwo)
  await prisma.expense.create({
    data: {
      groupId: group.id,
      paidById: user1.id,
      amount: 150.00,
      description: 'Paliwo na dojazd',
      splits: {
        create: [
          { userId: user1.id, amount: 50.00 },
          { userId: user2.id, amount: 50.00 },
          { userId: user3.id, amount: 50.00 },
        ],
      },
    },
  });

  // Tworzenie drugiego wydatku (Noclegi)
  await prisma.expense.create({
    data: {
      groupId: group.id,
      paidById: user2.id,
      amount: 900.00,
      description: 'Wynajem domku w górach',
      splits: {
        create: [
          { userId: user1.id, amount: 300.00 },
          { userId: user2.id, amount: 300.00 },
          { userId: user3.id, amount: 300.00 },
        ],
      },
    },
  });

  // Tworzenie trzeciego wydatku (Jedzenie)
  await prisma.expense.create({
    data: {
      groupId: group.id,
      paidById: user3.id,
      amount: 240.00,
      description: 'Zakupy w Biedronce',
      splits: {
        create: [
          { userId: user1.id, amount: 80.00 },
          { userId: user2.id, amount: 80.00 },
          { userId: user3.id, amount: 80.00 },
        ],
      },
    },
  });

  // Tworzenie czwartego wydatku (Atrakcje)
  await prisma.expense.create({
    data: {
      groupId: group.id,
      paidById: user1.id,
      amount: 120.00,
      description: 'Bilety na kolejkę linową',
      splits: {
        create: [
          { userId: user1.id, amount: 40.00 },
          { userId: user2.id, amount: 40.00 },
          { userId: user3.id, amount: 40.00 },
        ],
      },
    },
  });

  console.log('Baza danych została zasilana przykładowymi danymi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
