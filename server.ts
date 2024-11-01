import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev });  
const handler = app.getRequestHandler();

type dataSocket = {
  message ?: string;
  magnitude?: number;
  alarmState: boolean;
}

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    
    socket.on("alarm", (data: dataSocket) => {
      io.emit("alarm-recive", data)
    })
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(3000, () => {
      console.log(`> Ready on http://localhost:${3000}`);
    });
});