import { Router } from "express";
const router = Router();

import { createAdmin, deleteUser, disableUser, getAllUsers, updateUserRole,  } from "../controllers/adminUsers.ts";

import { authorizeRoles } from "../middlewares/authorizeRoles.ts";


router.get("/", getAllUsers);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/disable", disableUser);

router.delete("/:id/delete", deleteUser);

router.post("/create-admin", createAdmin);


export default router;