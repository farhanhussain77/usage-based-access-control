import { Router } from "express";
const router = Router();

import { createPlan, deletePlan, updatePlan, getPlans } from "../controllers/adminPlans.ts";
import { authenticate } from "../middlewares/auth.ts";
import { authorizeRoles } from "../middlewares/authorizeRoles.ts";


router.get( "/", authenticate, getPlans );

router.post( "/create", authenticate, createPlan );

router.put("/update/:planId", authenticate, updatePlan);
router.delete("/delete/:planId", authenticate, deletePlan);


export default router;
