import { Router } from 'express';
import prisma from '../db';

const router = Router();

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        members: {
          include: { user: true }
        }
      }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create a group
router.post('/', async (req, res) => {
  try {
    const { name, userIds } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'At least one userId is required' });
    }
    
    const newGroup = await prisma.group.create({
      data: {
        name,
        members: {
          create: userIds.map((userId: string) => ({ userId }))
        }
      },
      include: {
        members: true
      }
    });
    
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

export default router;
