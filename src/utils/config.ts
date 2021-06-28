import * as dotenv from 'dotenv';

export function loadDotEnv() {
  let path;
  switch (process.env.NODE_ENV) {
    case 'test':
      path = `${__dirname}/../../test.env`;
      break;
    case 'production':
      path = `${__dirname}/../../prod.env`;
      break;
    default:
      path = `${__dirname}/../../dev.env`;
  }

  dotenv.config({ path: path });
}

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET ?? 'mysecret',
};
