import { Router } from "express";
import AuthController from "../controllers/auth-controller";
import { schemas } from "../validators/schemas";
import { validateParams, validateJwt } from "../middlewares";

const router = Router();

const authController = new AuthController();
// Sign up to the system (username, password)
router.post(
  "/signup",
  validateParams(schemas.signup, "body"),
  authController.signup
);

// Logs in an existing user with a password
router.post(
  "/login",
  validateParams(schemas.login, "body"),
  authController.login
);

// Update the current users password
router.post(
  "/me/update-password",
  validateJwt,
  validateParams(schemas.updatePassword, "body"),
  authController.updatePassword
);

// Get the currently logged in user information
router.get("/me", validateJwt, authController.currentUser);

export default router;
