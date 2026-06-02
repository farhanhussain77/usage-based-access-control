import { getAdminStats } from "../controllers/adminStats.ts";
import { Router } from "express";
const router = Router();


router.get("/",  getAdminStats);


export default router;