import supertest from 'supertest';
import server from '../server';
import prisma from '../utils/prisma-client';

import { signup, login, cleanUp } from './test-utils';

afterAll(async () => {
  // Clean up the database tables
  // Disconnect the database connection
  // Close the app server
  await cleanUp();
});

describe('/signup', () => {
  test('return HTTP ERROR 422 if invalid username (not string) is sent', async () => {
    const userRequest = { username: '1', password: 'testpw1234' };
    const response = await signup(userRequest);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(422);
  });

  test('return HTTP ERROR 422 if invalid password format (more than 5 chars, at least one number and at least one uppercase char) is sent', async () => {
    const userRequest = { username: 'testuser', password: 'test' };
    const response = await signup(userRequest);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(422);
  });

  test('return HTTP ERROR 403 if registered user with same username already exists', async () => {
    // create testuser
    await prisma.user.create({
      data: {
        username: 'testuser',
        password: 'Password5',
      },
    });
    // create again testuser
    const userRequest = { username: 'testuser', password: 'Password1' };
    const response = await signup(userRequest);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(403);
  });

  test('return HTTP CODE 200 for successful user registration', async () => {
    const userRequest = { username: 'testuser1', password: 'Password1' };

    const response = await signup(userRequest);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toBe(200);
  });
});

describe('/login', () => {
  test('return HTTP ERROR 422 if invalid password format (more than 5 chars and at least one number) is sent', async () => {
    const userRequest = { username: 'testuser', password: 'test' };
    const response = await login(userRequest);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toBe(422);
  });

  test('return HTTP ERROR 401 if user tries to login with wrong password', async () => {
    const userRequest = { username: 'testuserLogin', password: 'Password1' };
    // signup the user
    await signup(userRequest);
    // login the user with wrong password
    const response = await login({
      username: userRequest.username,
      password: 'Password123',
    });

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toBe(401);
  });

  test('return HTTP CODE 200 and the JWT token on succesfull login', async () => {
    const userRequest = {
      username: 'testuserLoginSuccess',
      password: 'Password1',
    };

    await signup(userRequest);

    const response = await login(userRequest);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toBeNull();
  });
});

describe('/me', () => {
  test('returns the current logged in user', async () => {
    const userRequest = {
      username: 'testuserMe',
      password: 'Password1',
    };
    // signup the user
    await signup(userRequest);
    // login the user
    const responseLogin = await login(userRequest);
    // get the auth token
    const authToken = responseLogin.body;

    const responseMe = await supertest(server)
      .get('/me')
      .set('Accept', 'application/json')
      .set('Authorization', `bearer ${authToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(responseMe.body).not.toBeNull();
    expect(responseMe.body.username).toBe(userRequest.username);
  });
});

describe('/me/update-password', () => {
  test('returns HTTP ERROR 401 if user tries to change the password with invalid token', async () => {
    const changePasswordRequest = {
      oldPassword: 'Password1',
      newPassword: 'Password2',
    };

    await supertest(server)
      .post('/me/update-password')
      .set('Accept', 'application/json')
      .set('Authorization', `bearer INVALID_TOKEN`)
      .send(changePasswordRequest)
      .expect(401);
  });

  test('returns HTTP ERROR 401 if old password is wrong', async () => {
    const userRequest = {
      username: 'testuserUpdateWrongPassword',
      password: 'Password1',
    };
    // signup the user
    await signup(userRequest);
    // login the user
    const responseLogin = await login(userRequest);
    // get the auth token
    const authToken = responseLogin.body;

    // set wrong old password
    const changePasswordRequest = {
      oldPassword: 'WrongPassword1',
      newPassword: 'Password2',
    };

    await supertest(server)
      .post('/me/update-password')
      .send(changePasswordRequest)
      .set('Accept', 'application/json')
      .set('Authorization', `bearer ${authToken}`)
      .expect('Content-Type', /json/)
      .expect(401);
  });

  test('returns HTTP CODE 204 update password is successfull', async () => {
    const userRequest = {
      username: 'testuserUpdatePassword',
      password: 'Password1',
    };
    // signup the user
    await signup(userRequest);
    // login the user
    const responseLogin = await login(userRequest);
    // get the auth token
    const authToken = responseLogin.body;
    // change the old password with new
    const changePasswordRequest = {
      oldPassword: userRequest.password,
      newPassword: 'Password2',
    };

    await supertest(server)
      .post('/me/update-password')
      .send(changePasswordRequest)
      .set('Accept', 'application/json')
      .set('Authorization', `bearer ${authToken}`)
      .expect(204);
  });
});
