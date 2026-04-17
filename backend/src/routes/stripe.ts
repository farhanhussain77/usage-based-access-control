import { authenticate } from '../middlewares/auth.ts';
import { createCheckoutSession, handleWebhook } from '../controllers/stripe.ts';
import express from 'express';

const router = express.Router();

router.post("/create-checkout", authenticate, createCheckoutSession);

export default router;