import App from "./app";

const port = parseInt(process.env.PORT || "5000");
const app = new App(port);

const server = app.listen();

export default server;
