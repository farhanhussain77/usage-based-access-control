import express from "express";
import connectToDB from "./db/connection.ts";
import authRoutes from './routes/auth.ts';
import featureRoutes from './routes/features.ts';
import stripeRoutes from './routes/stripe.ts';
import adminTeams from './routes/adminTeams.ts'
import cors from 'cors';
import bodyParser from 'body-parser';
import { authenticate } from "./middlewares/auth.ts";
import { authorizeRoles } from "./middlewares/authorizeRoles.ts";
import { handleWebhook } from "./controllers/stripe.ts";
import Stripe from 'stripe';
import adminPlansRoutes from "./routes/adminPlans.ts";
import adminUserRoutes from "./routes/adminUsers.ts";
import teamInviteRoutes from "./routes/teamInvites.ts";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const app = express();
app.use(cors(({ origin: process.env.LOCALHOST_URL })));

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
app.use("/api/plans", authenticate, adminPlansRoutes);
app.use("/api/users", authenticate, authorizeRoles("admin"), adminUserRoutes)
app.use("/api/team/admin", authenticate, adminTeams)
app.use("/api/team/invite", teamInviteRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

connectToDB();