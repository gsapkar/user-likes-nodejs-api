import { Request, Response } from "express";

export class BaseController {
  currentUser = async (req: Request, res: Response) => {
    //Get id and username from JWT
    const { id, username } = res.locals.jwtPayload;

    return res.status(200).json({ id, username });
  };
}
