import { Router } from "express";

import adminUserController from "../controllers/admin-user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", adminUserController.getUsers.bind(adminUserController));
router.get("/:id", adminUserController.getUserById.bind(adminUserController));
router.put("/:id", adminUserController.updateUser.bind(adminUserController));
router.delete("/:id", adminUserController.deleteUser.bind(adminUserController));

export default router;
