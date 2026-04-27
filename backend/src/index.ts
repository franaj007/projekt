import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRouter from './routes/users';
import groupsRouter from './routes/groups';
import expensesRouter from './routes/expenses';
import { requireAuth } from './middleware/auth';


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/groups', requireAuth, groupsRouter);
app.use('/api/expenses', requireAuth, expensesRouter);


app.get('/', (req, res) => {
  res.send('SplitPay API is running');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
