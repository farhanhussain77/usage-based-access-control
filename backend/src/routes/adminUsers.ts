import { Router } from "express";
const router = Router();

import { getAllUsers, updateUserRole } from "../controllers/adminUsers.ts";

import { authorizeRoles } from "../middlewares/authorizeRoles.ts";


router.get("/", authorizeRoles("admin"), getAllUsers);
router.patch("/:id/role",authorizeRoles("admin"), updateUserRole);


export default router;