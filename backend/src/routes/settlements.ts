import { Router } from 'express';
import prisma from '../db';

const router = Router();

// Złożony algorytm rozliczeń
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Pobierz wszystkie wydatki i ich podziały dla danej grupy
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true }
    });

    // 1. Oblicz bilans każdego użytkownika
    // balance[userId] = ile użytkownik "ma na plusie" (zapłacił więcej niż zużył)
    const balances: Record<string, number> = {};

    expenses.forEach(exp => {
      // Użytkownik, który zapłacił, dostaje plus
      if (!balances[exp.paidById]) balances[exp.paidById] = 0;
      balances[exp.paidById] += Number(exp.amount);

      // Każdy uwzględniony w podziale dostaje minus
      exp.splits.forEach(split => {
        if (!balances[split.userId]) balances[split.userId] = 0;
        balances[split.userId] -= Number(split.amount);
      });
    });

    // 2. Podziel na dłużników (debtors) i wierzycieli (creditors)
    const debtors = Object.keys(balances)
      .map(userId => ({ userId, amount: balances[userId] }))
      .filter(u => u.amount < -0.01) // Ujemny bilans = musi oddać
      .sort((a, b) => a.amount - b.amount); // Sortuj rosnąco (od najbardziej zadłużonych)

    const creditors = Object.keys(balances)
      .map(userId => ({ userId, amount: balances[userId] }))
      .filter(u => u.amount > 0.01) // Dodatni bilans = musi dostać
      .sort((a, b) => b.amount - a.amount); // Sortuj malejąco (od mających dostać najwięcej)

    // 3. Generuj minimalną liczbę transakcji (zachłannie)
    const settlements: Array<{ from: string; to: string; amount: number }> = [];

    let i = 0; // index dłużnika
    let j = 0; // index wierzyciela

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // Kwota do wyrównania to minimum z (tego co dłużnik jest winien, tego co wierzyciel ma dostać)
      const amountToSettle = Math.min(Math.abs(debtor.amount), creditor.amount);

      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Number(amountToSettle.toFixed(2))
      });

      // Zaktualizuj bilanse po tej transakcji
      debtor.amount += amountToSettle;
      creditor.amount -= amountToSettle;

      // Przejdź do następnej osoby, jeśli obecna jest rozliczona (z uwzględnieniem precyzji zmiennoprzecinkowej)
      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    res.json({ settlements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate settlements' });
  }
});

export default router;
