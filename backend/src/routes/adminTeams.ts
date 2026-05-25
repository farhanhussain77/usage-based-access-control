import { Router } from "express";
const router = Router();

import { getAdminTeam } from "../controllers/adminTeams.ts";


router.get( "/", getAdminTeam );

export default router;
