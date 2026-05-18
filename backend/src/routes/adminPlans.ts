import { Router } from "express";
const router = Router();

import { createPlan, getPlans } from "../controllers/adminPlans.ts";
import { authenticate } from "../middlewares/auth.ts";
import { authorizeRoles } from "../middlewares/authorizeRoles.ts";


router.get( "/", getPlans );

router.post( "/create", createPlan );


export default router;
