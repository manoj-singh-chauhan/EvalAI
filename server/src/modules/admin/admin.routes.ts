import { Router } from "express";
import { requireAdmin } from "../../middleware/admin.middleware";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
  "/users",
  requireAdmin,
  AdminController.getAllUsers
);

router.get(
  "/users/search",
  requireAdmin,
  AdminController.searchUsers
);

router.get(
  "/users/:userId/activity",
  requireAdmin,
  AdminController.getUserActivity
);

export default router;