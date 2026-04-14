import express from 'express';
import { createUser } from '../controllers/auth.ts';


const router = express.Router();

router.get("/create", createUser);

export default router;