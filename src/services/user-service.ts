import prisma from "../utils/prisma-client";
import CodedError from "../exceptions/coded-error";
import { UserIdRequest, UserLikeUnlikeRequest } from "../interfaces";

class UserService {
  /**
   * List username & number of likes of a user
   * @param params userId
   * @returns list of username & number of likes of a user
   */
  getUsernameAndLikes = async (params: UserIdRequest) => {
    //Check if username and password are set
    const userId = params.userId;

    //Get user from database
    const dbUser = await prisma.user
      .findUnique({
        where: { id: userId },
        include: {
          likes: true,
        },
      })
      .then((user) => {
        if (user)
          return {
            id: user.id,
            username: user.username,
            password: user.password,
            numberOfLikes: user.likes.length,
          };
      });

    if (!dbUser) {
      throw new CodedError(404, "User not found");
    }

    return { username: dbUser.username, likes: dbUser.numberOfLikes };
  };

  /**
   * Like a user
   * @param params userId - user to be liked, currentUserId - currentt loggen in user
   * @returns
   */
  like = async (params: UserLikeUnlikeRequest) => {
    const { userId, currentUserId } = params;

    // if the user is selfish and tries to like himself :) 403 Forbidden is returned
    if (userId === currentUserId) {
      throw new CodedError(403, "Self liking is not allowed");
    }

    // Check if user to be liked exists in the database
    const dbUser = await this.getUser(userId);

    if (!dbUser) {
      throw new CodedError(404, "Liked user is not found");
    }

    //Get user like from database
    const dbUserLikes = await prisma.userLikes.findFirst({
      where: { likedByUserId: currentUserId, userId },
    });

    if (dbUserLikes) {
      throw new CodedError(403, "You already liked this user");
    }

    await prisma.userLikes.create({
      data: {
        likedByUserId: currentUserId,
        userId,
      },
    });

    return;
  };

  /**
   * Unlike a user
   * @param params userId - user to be liked, currentUserId - currentt loggen in user
   * @returns
   */
  unlike = async (params: UserLikeUnlikeRequest) => {
    const { userId, currentUserId } = params;

    // Check if user to be liked exists in the database
    const dbUser = await this.getUser(userId);

    if (!dbUser) {
      throw new CodedError(404, "Liked user is not found");
    }

    //Get user from database
    const dbUserLikes = await prisma.userLikes.findFirst({
      where: { likedByUserId: currentUserId, userId },
    });

    if (!dbUserLikes) {
      throw new CodedError(
        401,
        "The like doesnt exists, so youu cannot unlike"
      );
    }

    await prisma.userLikes.delete({
      where: {
        id: dbUserLikes.id,
      },
    });

    return;
  };

  /**
   *
   * @returns List users in a most liked to least liked
   */
  mostLiked = async () => {
    //Get user from database
    const dbUsers = await prisma.user.findMany({
      include: {
        likes: true,
      },
      orderBy: {
        likes: {
          count: "desc",
        },
      },
    });

    const users = dbUsers.map((dbUser) => ({
      username: dbUser.username,
      numberOfLikes: dbUser.likes.length,
    }));

    return users;
  };

  private getUser = async (id: number) => {
    return await prisma.user.findUnique({
      where: { id },
    });
  };
}

export default UserService;
