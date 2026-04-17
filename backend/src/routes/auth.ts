import express from 'express';
import { createUser, getCurrentUser, login } from '../controllers/auth.ts';
import { authenticate } from '../middlewares/auth.ts';


const router = express.Router();

router.post("/create", createUser);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);

export default router;