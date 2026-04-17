import express from "express";
import connectToDB from "./db/connection.ts";
import authRoutes from './routes/auth.ts';
import featureRoutes from './routes/features.ts';
import stripeRoutes from './routes/stripe.ts';
import cors from 'cors';
import bodyParser from 'body-parser';
import { authenticate } from "./middlewares/auth.ts";
import { handleWebhook } from "./controllers/stripe.ts";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  res.send('Hello World!')

  // const subscription = await stripe.subscriptions.retrieve('sub_1TMmICJzTfFzl3r4yu3wTA5D');
  // console.log("subscription", subscription);
});

app.post(
  '/api/stripe/webhook',
  bodyParser.raw({ type: 'application/json' }),
  handleWebhook
);

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/feature', authenticate, featureRoutes);
app.use('/api/stripe', stripeRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

connectToDB();