import { Router } from 'express';
import prisma from '../db';

const router = Router();

// Get all expenses for a group
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        paidBy: true,
        splits: {
          include: { user: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add an expense
router.post('/', async (req, res) => {
  try {
    const { groupId, paidById, amount, description, splits } = req.body;

    if (!groupId || !paidById || !description) {
      return res.status(400).json({ error: 'groupId, paidById, and description are required' });
    }
    
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    
    if (!Array.isArray(splits) || splits.length === 0) {
      return res.status(400).json({ error: 'splits array is required and must not be empty' });
    }

    // Prosta walidacja sumy podziałów
    const splitsTotal = splits.reduce((sum: number, s: any) => sum + Number(s.amount), 0);
    if (Math.abs(splitsTotal - parsedAmount) > 0.01) {
      return res.status(400).json({ error: `Splits total (${splitsTotal.toFixed(2)}) must equal amount (${parsedAmount.toFixed(2)})` });
    }

    // Sprawdzenie czy użytkownicy istnieją (Realizm: Franciszek dodaje to po testach)
    const userIds = splits.map((s: any) => s.userId);
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    if (existingUsers.length !== userIds.length) {
      return res.status(400).json({ error: 'One or more users in splits do not exist' });
    }
    
    const expense = await prisma.expense.create({
      data: {
        groupId,
        paidById,
        amount,
        description,
        splits: {
          create: splits.map((s: any) => ({
            userId: s.userId,
            amount: s.amount
          }))
        }
      },
      include: {
        splits: true
      }
    });
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

export default router;
