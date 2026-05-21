import { Router } from "express";
const router = Router();

import { createPlan, deletePlan, updatePlan, getPlans } from "../controllers/adminPlans.ts";

import { authorizeRoles } from "../middlewares/authorizeRoles.ts";


router.get( "/", getPlans );

router.post( "/create", createPlan );

router.put("/update/:planId", authorizeRoles("admin"), updatePlan);
router.delete("/delete/:planId", authorizeRoles("admin"), deletePlan);


export default router;
