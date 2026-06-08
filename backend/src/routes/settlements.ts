import { Router } from 'express';
import prisma from '../db';

const router = Router();

// Złożony algorytm rozliczeń
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Pobierz grupę wraz z jej członkami
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Pobierz wszystkie wydatki i ich podziały dla danej grupy
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true }
    });

    // Stwórz słownik użytkowników w grupie
    const userMap: Record<string, { id: string; name: string }> = {};
    group.members.forEach(member => {
      userMap[member.user.id] = {
        id: member.user.id,
        name: member.user.name
      };
    });

    // 1. Oblicz bilans każdego użytkownika
    const balancesRecord: Record<string, number> = {};
    group.members.forEach(member => {
      balancesRecord[member.user.id] = 0;
    });

    expenses.forEach(exp => {
      // Użytkownik, który zapłacił, dostaje plus
      if (balancesRecord[exp.paidById] !== undefined) {
        balancesRecord[exp.paidById] += Number(exp.amount);
      }

      // Każdy uwzględniony w podziale dostaje minus
      exp.splits.forEach(split => {
        if (balancesRecord[split.userId] !== undefined) {
          balancesRecord[split.userId] -= Number(split.amount);
        }
      });
    });

    const balancesResponse = Object.keys(balancesRecord).map(userId => ({
      userId,
      name: userMap[userId]?.name || 'Unknown',
      balance: Number(balancesRecord[userId].toFixed(2))
    }));

    // 2. Podziel na dłużników (debtors) i wierzycieli (creditors)
    const debtors = Object.keys(balancesRecord)
      .map(userId => ({ userId, amount: balancesRecord[userId] }))
      .filter(u => u.amount < -0.01)
      .sort((a, b) => a.amount - b.amount);

    const creditors = Object.keys(balancesRecord)
      .map(userId => ({ userId, amount: balancesRecord[userId] }))
      .filter(u => u.amount > 0.01)
      .sort((a, b) => b.amount - a.amount);

    // 3. Generuj minimalną liczbę transakcji (zachłannie)
    const settlements: Array<{
      from: { id: string; name: string };
      to: { id: string; name: string };
      amount: number;
    }> = [];

    let i = 0; // index dłużnika
    let j = 0; // index wierzyciela
    let safetyCounter = 0;

    while (i < debtors.length && j < creditors.length && safetyCounter < 1000) {
      safetyCounter++;
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amountToSettle = Math.min(Math.abs(debtor.amount), creditor.amount);

      if (amountToSettle < 0.01) {
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
        continue;
      }

      settlements.push({
        from: {
          id: debtor.userId,
          name: userMap[debtor.userId]?.name || 'Unknown'
        },
        to: {
          id: creditor.userId,
          name: userMap[creditor.userId]?.name || 'Unknown'
        },
        amount: Number(amountToSettle.toFixed(2))
      });

      debtor.amount += amountToSettle;
      creditor.amount -= amountToSettle;

      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    res.json({
      groupId,
      groupName: group.name,
      balances: balancesResponse,
      settlements
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate settlements' });
  }
});

export default router;
