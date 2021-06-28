import supertest from 'supertest';
import prisma from '../utils/prisma-client';

import server from '../server';

interface UserRequest {
  username: string;
  password: string;
}

export const signup = async (user: UserRequest) =>
  await supertest(server)
    .post('/signup')
    .send(user)
    .set('Accept', 'application/json');

export const login = async (user: UserRequest) =>
  await supertest(server)
    .post('/login')
    .send(user)
    .set('Accept', 'application/json');

export const like = async (id: string, token: string) =>
  await supertest(server)
    .post(`/user/${id}/like`)
    .send()
    .set('Accept', 'application/json')
    .set('Authorization', `bearer ${token}`);

export const unlike = async (id: string, token: string) =>
  await supertest(server)
    .post(`/user/${id}/unlike`)
    .send()
    .set('Accept', 'application/json')
    .set('Authorization', `bearer ${token}`);

export const signupUserAndLogin = async (user: UserRequest) => {
  // create the user who likes
  await signup(user);
  // login the user
  const responseLogin = await login(user);
  // get the auth token
  const authToken = responseLogin.body;
  return authToken;
};

export const cleanUpTables = async () => {
  // Clean up the database tables
  await prisma.userLikes.deleteMany({});
  await prisma.user.deleteMany({});
};

export const cleanUp = async () => {
  // Clean up the database tables
  await cleanUpTables();

  // disconnecting the databases
  await prisma.$disconnect();
  // closing server to avoid jest open handlers error
  server.close();
};
