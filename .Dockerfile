FROM node:12-alpine

RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY package.json tsconfig.json ./
COPY src ./src
COPY prisma ./prisma/

RUN npm install 

## Downloading Wait script so Postgres can start
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.2/wait /wait
RUN chmod +x /wait

RUN npx prisma generate

EXPOSE 5000 9229
## Run the Waith script and start the application
CMD /wait && npm run dev