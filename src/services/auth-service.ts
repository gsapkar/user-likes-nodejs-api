import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { config } from '../utils/config';
import prisma from '../utils/prisma-client';
import CodedError from '../exceptions/coded-error';
import { UpdatePasswordRequest, UserRequest } from '../interfaces';

class AuthService {
  /**
   * Creates a new user in database
   * @param user user request with username and password
   * @returns user id and username
   */
  signup = async (user: UserRequest) => {
    const { username, password } = user;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const userExists = await prisma.user.findUnique({
      where: { username },
    });
    if (userExists) {
      throw new CodedError(403, 'Username already exists');
    }

    const result = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    return { id: result.id, username: result.username };
  };

  /**
   * User login and token generation
   * @param user user request with username and password
   * @returns the authentication token
   */
  login = async (user: UserRequest) => {
    //Check if username and password are set
    const { username, password } = user;

    //Get user from database
    const dbUser = await prisma.user
      .findUnique({ where: { username } })
      .then((user) => {
        if (user)
          return {
            id: user.id,
            username: user.username,
            password: user.password,
          };
      });

    if (!dbUser) {
      throw new CodedError(404, 'User not found');
    }
    //Check if encrypted password match
    if (!bcrypt.compareSync(password, dbUser.password)) {
      // this message is more general for security reasons
      throw new CodedError(401, 'Wrong username or password');
    }

    //Sing JWT, valid for 1 hour
    const token = jwt.sign(
      { userId: dbUser.id, username: dbUser.username },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    //Send the jwt in the response
    return token;
  };

  /**
   *
   * @param updatePassword request with userId, oldPassword, newPassword
   * @returns void if successfull, throws an error if not sucessfull
   */
  updatePassword = async (updatePassword: UpdatePasswordRequest) => {
    const { userId, oldPassword, newPassword } = updatePassword;
    const id = parseInt(userId);

    //Get user from database
    const dbUser = await prisma.user
      .findUnique({ where: { id } })
      .then((user) => {
        if (user)
          return {
            id: user.id,
            username: user.username,
            password: user.password,
          };
      });

    if (!dbUser) {
      throw new CodedError(404, 'User not found');
    }
    //Check if old password matches
    if (!bcrypt.compareSync(oldPassword, dbUser.password)) {
      // this message is more general for security reasons
      throw new CodedError(401, 'Wrong username or password');
    }
    //Hash the new password and save
    const password = bcrypt.hashSync(newPassword, 8);

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });

    return;
  };
}

export default AuthService;
