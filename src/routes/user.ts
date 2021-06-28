import { Router } from "express";
import UserController from "../controllers/user-contoller";
import { schemas } from "../validators/schemas";
import { validateParams, validateJwt } from "../middlewares";

const router = Router();

const userController = new UserController();
// List username & number of likes of a user
router.get(
  "/user/:id",
  validateParams(schemas.id, "params"),
  userController.getUsernameAndLikes
);

// Like a user
router.post(
  "/user/:id/like",
  validateParams(schemas.id, "params"),
  validateJwt,
  userController.like
);

// Un-Like a user
router.post(
  "/user/:id/unlike",
  validateParams(schemas.id, "params"),
  validateJwt,
  userController.unlike
);

// List users in a most liked to least liked
router.get("/most-liked", userController.mostLiked);

export default router;
