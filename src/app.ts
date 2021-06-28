import cors from 'cors';
import express from 'express';
import { json, urlencoded } from 'body-parser';
import { loadDotEnv } from './utils/config';
import { auth, user } from './routes';
import validateEnv from './utils/validate-env';
import { codedErrorMiddleware } from './middlewares';

class App {
  public app: express.Application;
  public port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    // load the env variables
    loadDotEnv();
    // validates the env variables
    validateEnv();

    this.initializeMiddlewares();
    this.routes();
    this.initializeErrorMiddleware();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(json());
  }

  private initializeErrorMiddleware() {
    // register error middleware
    this.app.use(codedErrorMiddleware);
  }

  private routes() {
    //Set the auth and user routes
    this.app.use('/', auth);
    this.app.use('/', user);
  }

  public listen() {
    return this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }
}
// exporting singleton App
export default App;
