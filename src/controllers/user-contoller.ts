import { NextFunction, Request, Response } from "express";

import UserService from "../services/user-service";
import { BaseController } from "./base-controller";

class UserController extends BaseController {
  private userService: UserService;
  constructor() {
    super();
    this.userService = new UserService();
  }

  getUsernameAndLikes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // read the id from the query params
      const userId = parseInt(req.params.id);

      const result = await this.userService.getUsernameAndLikes({ userId });

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  like = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // read the id from the query params
      const userId = parseInt(req.params.id);

      //Get ID from JWTs
      const currentUserId = res.locals.jwtPayload.userId;

      await this.userService.like({ userId, currentUserId });

      return res.status(200).json();
    } catch (error) {
      next(error);
    }
  };

  unlike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // read the id from the query params
      const userId = parseInt(req.params.id);

      //Get ID from JWTs
      const currentUserId = res.locals.jwtPayload.userId;

      await this.userService.unlike({ userId, currentUserId });

      return res.status(200).json();
    } catch (error) {
      next(error);
    }
  };

  mostLiked = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.mostLiked();

      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
