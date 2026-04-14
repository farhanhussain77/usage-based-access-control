import express from "express";
import connectToDB from "./db/connection.ts";
import authRoutes from './routes/auth.ts';

const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

connectToDB();