import { NextFunction, Request, Response } from "express";

import AuthService from "../services/auth-service";
import { BaseController } from "./base-controller";

class AuthController extends BaseController {
  private authService: AuthService;
  constructor() {
    super();
    this.authService = new AuthService();
  }

  signup = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    try {
      const signupResult = await this.authService.signup({
        username,
        password,
      });

      return res.status(200).json(signupResult);
    } catch (error) {
      return next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    //Check if username and password are set
    const { username, password } = req.body;

    try {
      const tokenResult = await this.authService.login({
        username,
        password,
      });

      return res.status(200).json(tokenResult);
    } catch (error) {
      return next(error);
    }
  };

  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    //Get ID from JWTs
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { oldPassword, newPassword } = req.body;

    try {
      await this.authService.updatePassword({
        userId: id,
        oldPassword,
        newPassword,
      });

      return res.status(204).json({});
    } catch (error) {
      return next(error);
    }
  };
}

export default AuthController;
