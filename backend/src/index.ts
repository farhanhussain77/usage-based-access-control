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
import adminPlansRoutes from "./routes/adminPlans.ts";
import adminUserRoutes from "./routes/adminUsers.ts";
import teamInviteRoutes from "./routes/teamInvites.ts";
import adminStatsRoutes from "./routes/adminStats.ts";

const app = express();
if(!process.env.LOCALHOST_URL){
  throw Error("LOCALHOST_URL Env variable not found!")
}
app.use(cors(({ origin: process.env.LOCALHOST_URL })));

const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  res.send('Hello World!')

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
app.use("/api/users", authenticate, authorizeRoles("superadmin"), adminUserRoutes)
app.use("/api/team/admin", authenticate, adminTeams)
app.use("/api/team/invite", teamInviteRoutes);
app.use("/api/admin/stats", adminStatsRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

connectToDB();