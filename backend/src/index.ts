import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRouter from './routes/users';


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);


app.get('/', (req, res) => {
  res.send('SplitPay API is running');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
