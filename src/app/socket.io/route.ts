import type { Server as HttpServer } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as ServerIO } from "socket.io";
import { Server as ServerIo } from "socket.io";

interface SocketServer extends HttpServer {
  io?: ServerIO | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export const GET = (_: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res && res.socket && res.socket.server && res.socket.server.io) {
    console.log("socket.io already running");
    res.end();
    return;
  } else {
    console.log("socket.io is initializing");
    console.log({ socket: res.socket })
    const io = new ServerIo(res?.socket?.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        // origin: [
        //   "http://localhost:3000/",
        //   "https://nextjs-socket-io-demo.vercel.app/",
        //   "https://socketionextjs.netlify.app",
        // ],
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log(`Socket ${socket.id} connected`);

      socket.on(
        "alarm",
        (alarmState: boolean) => {
          socket.emit("alarm-recive", Boolean(alarmState));
        }
      );
    });
  }

  res.end();
};