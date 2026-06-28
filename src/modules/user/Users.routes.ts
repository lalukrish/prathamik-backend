import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { usersController } from "./Users.controller";

const router = Router();

// All routes require auth (admin only — add role guard middleware if you have one)
router.use(authMiddleware);

// GET  /users                    — list all users with stats + pagination
// GET  /users?search=arjun       — search by name or email
// GET  /users?status=BLOCKED     — filter by status
// GET  /users?role=ADMIN         — filter by role
// GET  /users?page=2&limit=10    — pagination
router.get("/", usersController.getAllUsers);

// GET  /users/:userId            — full user detail with all sessions
router.get("/:userId", usersController.getUserById);

// PATCH /users/:userId/status    — block or activate a user
// Body: { "status": "BLOCKED" } or { "status": "ACTIVE" }
router.patch("/:userId/status", usersController.updateStatus);

// PATCH /users/:userId/role      — change user role
// Body: { "role": "ADMIN" } or { "role": "USER" }
router.patch("/:userId/role", usersController.updateRole);

export default router;
