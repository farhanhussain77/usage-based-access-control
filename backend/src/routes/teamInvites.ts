import express from "express";

import { createInvite, validateInvite, acceptInvite } from "../controllers/teamInvites.ts";

import { authenticate } from "../middlewares/auth.ts";

const router = express.Router();

router.post( "/create", authenticate, createInvite );

router.get( "/:token", validateInvite );

router.post( "/accept", acceptInvite );

export default router;