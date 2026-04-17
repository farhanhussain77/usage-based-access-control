import express from 'express';
import {featureAccess} from '../controllers/features.ts';

const router = express.Router();

router.post("/", featureAccess);

export default router;