import { Server } from "socket.io";
import CommBus from "../CommBus";

class SocketServer {
  public io: Server;
  private commandBus: CommBus;

  constructor(httpServer: any, commandBus: CommBus) {
    this.commandBus = commandBus;
    this.initialize(httpServer);
  }
  initialize(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      path: "/socket.io/",
      transports: ["websocket"],
    });
    this.io.on("connection", (socket) => {
      this.commandBus.fireEvent({
        label: "socket-login",
        type: "info",
        message: `🟢 Client connecté :${socket.id}`,
      });

      socket.on("disconnect", () =>
        this.commandBus.fireEvent({
          label: "socket-logoff",
          type: "info",
          message: `🔴 Client déconnecté :${socket.id}`,
        })
      );
    });
  }
}

export default SocketServer;
