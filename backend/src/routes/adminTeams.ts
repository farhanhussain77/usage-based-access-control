import { Router } from "express";
const router = Router();

import { getAdminTeam, removeMember } from "../controllers/adminTeams.ts";



router.get( "/", getAdminTeam );
router.delete( "/member/:memberId", removeMember );

export default router;
