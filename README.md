# User Likes API in Node.js with Express, TypeScript, PostgreSQL and Docker

This repo is an sample application for showcasing the usage of Node JS with Express, Typescript, PostgreSQL with Docker containers.

## Building tools:

- **[Node.js](https://nodejs.org/en/)** - Backend server with Javascript runtime
- **[Express](https://expressjs.com/)** - Web framework for Node.js.
- **[Typescript](https://www.typescriptlang.org/)** - An open-source language which provides strong types for Javascript
- **[PostgreSQL](https://www.postgresql.org/)** - A powerful, open source object-relational database.
- **[Prisma](https://www.prisma.io/)** - Next-generation Node.js and TypeScript ORM for PostgreSQL
- **[Docker](https://www.docker.com/)** - Docker is the de facto standard to build and share containerized apps
- **[ESLINT](https://eslint.org/)** with **[Prettier](https://prettier.io/)** - ESLINT is pluggable JavaScript linter which support Typescript with integrated Prettier which is opinionated code formatter
- **[Jest](https://jestjs.io/)** - A powerfull JavaScript Testing Framework.
- **[Supertest](https://www.npmjs.com/package/supertest)** - HTTP agent for making assertions in Jest
- **[Joi](https://www.npmjs.com/package/joi)** - Schema description language and data validator for JavaScript.
- **[Dotenv](https://www.npmjs.com/package/dotenv)** - Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
- **[Envalid](https://www.npmjs.com/package/envalid)** - Library for validating and accessing environment variables in Node.js.

## I. Installation

### 1. Clone this repo

```
$ git clone git@github.com:gsapkar/user-likes-nodejs-api.git app-name
$ cd app-name
```

### 2. Install dependencies

Run in terminal:

```
$ npm install
```

## III. Development

### Start development server with docker

Starting the development server builds the application as a Docker image, also spins up a PostgreSQL server Docker image.
The development server uses **[nodemon](https://www.npmjs.com/package/nodemon)** which is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.

```
$ npm run docker:dev:up
```

Running the above commands results in

- 🌏**API Server** running at `http://localhost:5000`
- 🛢️**PostgreSQL Server** running at `postgres://localhost:5434`

**Troubleshoot**: It's possible the **first** time of running the `$ npm run docker:dev:up` command that the Prisma migrations are not executed, and there are errors in the container logs.
So after the containers are started and the database server is ready execute in terminal:

```
$ npm run migrate:dev
```

### Stop the development server

The application and the database images are stopped with the command:

```
$ npm run docker:dev:down
```

### Start the testing server

There is an different environment for testing only, which spins up two different containers, one for running the application, one for the test database.

This command runs the **(integration)** tests for the API:

```
$ npm run docker:test
```

**Troubleshoot**: It's possible the **first** time of running the `$ npm run docker:test` command that the Prisma migrations are not executed, and there are errors in the container logs.
So after the containers are started and the database server is ready execute in terminal:

```
$ npm run migrate:test:init
```

### Stop the test server

The application and the database images are stopped with the command:

```
$ npm run docker:test:down
```

###Environment

There are two environment variables **dev.env** and **test.env**

| Var Name     | Type   | Default                                                             | Description                                          |
| ------------ | ------ | ------------------------------------------------------------------- | ---------------------------------------------------- |
| JWT_SECRET   | string | `development`                                                       | API runtime environment. eg: `test` or `development` |
| PORT         | number | `5000`                                                              | Port to run the API server on                        |
| DATABASE_URL | string | `postgres://postgres:newPassword@localhost:5438/user-likes-test-db` | Connection string for PostgreSQL                     |

## IV API Architecture

The sample application as a Rest API which contains the following endpoints:

- **/signup** - Sign up to the system (username, password)
- **/login** - Logs in an existing user with a password
- **/me** - Get the currently logged in user information. **Authorized**.
- **/me/update-password** - Update the current users password. **Authorized**
- **/user/:id/** - List username & number of likes of a user
- **/user/:id/like** - Like a user. **Authorized**
- **/user/:id/unlike** - Un-Like a user. **Authorized**
- **/most-liked** - List users in a most liked to least liked

### Sequence diagram

This is an example of the use case when the logged in user likes another user

```seq
User->API: signup
User->API: login
API-->User: auth token
Note right of API: the token is sent on each\nauthorized route
User->>API: /user/:id/like
```

### Database

When analyzing the business domain, we can conclude that we need two tables **User** and **UserLikes**.

The User table contains the records for the registered users.

The UserLikes table holds data for the user likes.
The userId and likedByUserId fields reference the id filed in the User table.

Also the combination userId and likedByUserId should be unique (one user can't be liked more than once from a same user) and thats why **unique_likes** index is added.

This means we have relational data model and thats why PostgreSQL is the database of choice.
We can make , the constraints on a database level, not only in the code, which makes our architecture more resilient to errors.

This is the database diagram:
[![Db diagram](https://user-images.githubusercontent.com/5286071/123693517-7402e300-d858-11eb-8669-bfee509b28e8.png 'Db diagram')](https://user-images.githubusercontent.com/5286071/123693517-7402e300-d858-11eb-8669-bfee509b28e8.png 'Db diagram')

The **\_prisma_migrations** table is autogenerated table by Prisma ORM.
It's a new ORM and It's my first time using it, and it looks quite easy to work with.

### Code organization

This is the code organization structure in the project folders:

[![Code organization](https://user-images.githubusercontent.com/5286071/123695384-c5ac6d00-d85a-11eb-8593-33e0c7be9ae5.png 'Code organization')](htthttps://user-images.githubusercontent.com/5286071/123695384-c5ac6d00-d85a-11eb-8593-33e0c7be9ae5.pngp:// 'Code organization')

- **prisma** folder holds the database schema and the migrations folder
- **src** folder contains the node.js api:
  - **app.ts** file has the App clas which initializes the **express** application with the middlewares, the routes, loads and validates the env varibles.
  - **server.ts** is the project entry point. It initalizes the App class to listen on the designated port.
  - **controllers** folder contains thin controllers. Their role is to call the service classes and return json response with status code. They also catch the errors and pass them to the error middleware.
  - **exceptions** contains the CodedError class which is nicer wrapper for throwing the error messages.
  - **interfaces** contains the request parameters for auth and user services.
  - **middlewares** hold the error middleware, params validation with Joi middleware and jwt validation middleware.
  - **routes** contains the **auth** and **user** routes
  - **services** contain the auth and user services which handle the domain logic
  - **tests** contain the integration tests for the auth and user routes.
    The tests are written in **Jest** framework with the **supertest** library for making the api calls and expecting the results.
    Unit tests for the services are TODO.
  - **utils** has different util functions.
  - **validators** hold the Joi schema validation
- in the base project folder are the .env, docker, package.json and other configuration files

## V Docker

For the application code .Dockerfile the **node:12-alpine** is used.

There are two docker-compose files:

- **docker-compose.yml** : contains the application and the postgres containers for development. Uses the dev.env environment variables.
- **docker-compose.test.yml**: contains the application and the postgres containers for running the integration test. Uses the test.env environment variables.

The environment variables PORT and DATABASE_URL for dev and test are different, because the development and test containers can run in paralel, so to avoid colision the variables must be different.

When starting the containers with docker-compose we must be sure that the database container is up and runing before the application container is started.
There is nice utility script to do that, called **[docker-compose-wait](https://github.com/ufoscout/docker-compose-wait)**

## VI TODO

There is a lot of space for improving this project.

- **[Swagger](https://www.npmjs.com/package/swagger-ui-express)** can be added for documenting and testing the API endpoints.
- **[Morgan](https://www.npmjs.com/package/morgan)** a request logger middleware
- Impovements with Docker: Dev environment without nodemon watcher, with only Postgres container started
- Dependency injection library
- Unit tests for the services
