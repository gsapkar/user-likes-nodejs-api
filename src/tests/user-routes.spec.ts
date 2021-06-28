import supertest from 'supertest';
import server from '../server';

import {
  signup,
  login,
  cleanUp,
  like,
  cleanUpTables,
  unlike,
  signupUserAndLogin,
} from './test-utils';

beforeEach(async () => {
  await cleanUpTables();
});

afterAll(async () => {
  // Clean up the database tables
  // Disconnect the database connection
  // Close the app server
  await cleanUp();
});

describe('/user/:id', () => {
  test('return HTTP ERROR 422 if invalid user id (not a number) is sent', async () => {
    const response = await supertest(server)
      .get('/user/not_an_number')
      .set('Accept', 'application-json');

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(422);
  });

  test("return HTTP ERROR 404 if user doesn't exists", async () => {
    const response = await supertest(server)
      .get('/user/123')
      .set('Accept', 'application-json');
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(404);
  });
});

describe('/user/:id/like', () => {
  test('return HTTP ERROR 422 if invalid user id (not a number) is sent', async () => {
    const response = await supertest(server)
      .post('/user/not_an_number/like')
      .set('Accept', 'application-json')
      .set('Authorization', `Bearer token`);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(422);
  });

  test('return HTTP ERROR 403 when user tries to like himself', async () => {
    const userRequest = {
      username: 'testLoggedInUser',
      password: 'Password1',
    };
    // create the user who likes
    const user = await signup(userRequest);
    const { id } = user.body;
    // login the user
    const responseLogin = await login(userRequest);
    // get the auth token
    const authToken = responseLogin.body;

    // the logged in user likes himself
    const response = await like(id, authToken);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(403);
  });

  test('return HTTP CODE 200 when we make valid like', async () => {
    const userRequest = {
      username: 'testLoggedInUser',
      password: 'Password1',
    };
    // create the user who likes
    await signup(userRequest);
    // login the user
    const responseLogin = await login(userRequest);
    // get the auth token
    const authToken = responseLogin.body;

    const userToBeLiked = {
      username: 'testUserToBeLiked',
      password: 'Password1',
    };
    // create the user to be liked
    const likedUser = await signup(userToBeLiked);
    const { id } = likedUser.body;
    // the logged in user likes
    const response = await like(id, authToken);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(200);
  });
});

describe('/user/:id/unlike', () => {
  test('return HTTP ERROR 422 if invalid user id (not a number) is sent', async () => {
    const response = await supertest(server)
      .post('/user/not_an_number/unlike')
      .set('Accept', 'application-json')
      .set('Authorization', `Bearer token`);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(422);
  });

  test('return HTTP CODE 200 when we make valid unlike', async () => {
    const userRequest = {
      username: 'testLoggedInUser',
      password: 'Password1',
    };
    // create the user who likes
    await signup(userRequest);
    // login the user
    const responseLogin = await login(userRequest);
    // get the auth token
    const authToken = responseLogin.body;

    const userToBeLiked = {
      username: 'testUserToBeLiked',
      password: 'Password1',
    };
    // create the user to be liked
    const likedUser = await signup(userToBeLiked);
    const { id } = likedUser.body;
    // the logged in user likes
    await like(id, authToken);

    // the logged in user unlikes
    const response = await unlike(id, authToken);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.statusCode).toEqual(200);
  });
});

describe('/most-liked', () => {
  test('list users in a most liked to least liked', async () => {
    // first we signup and login with user 1
    // we like 2 users
    const userRequest1 = {
      username: 'testLoggedInUser',
      password: 'Password1',
    };
    // create the user who likes
    const authToken1 = await signupUserAndLogin(userRequest1);

    const userToBeLiked1 = {
      username: 'testUserToBeLiked',
      password: 'Password1',
    };
    // create the first user to be liked
    const likedUser1 = await signup(userToBeLiked1);
    const { id1 } = likedUser1.body;
    // the logged in user likes
    await like(id1, authToken1);

    const userToBeLiked2 = {
      username: 'testUserToBeLiked',
      password: 'Password1',
    };
    // create the user to be liked
    const likedUser2 = await signup(userToBeLiked2);
    const { id2 } = likedUser2.body;
    // the logged in user likes
    await like(id1, authToken1);

    // then we signup and login with user 2
    // we like the likedUser1 only
    const userRequest2 = {
      username: 'testLoggedInUser',
      password: 'Password1',
    };
    // create the user who likes
    const authToken2 = await signupUserAndLogin(userRequest2);

    await like(id2, authToken2);

    // calling the most-like endpoint
    const responseMostLiked = await supertest(server)
      .get('/most-liked')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    // expecting to be returned list of two users, with 2 and 1 likes
    expect(responseMostLiked.body).not.toBeNull();
    expect(responseMostLiked.body).toHaveLength(2);
    expect(responseMostLiked.body[0].numberOfLikes).toBeGreaterThanOrEqual(
      responseMostLiked.body[1].numberOfLikes
    );
  });
});
