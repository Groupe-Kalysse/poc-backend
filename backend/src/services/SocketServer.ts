import { Server } from "socket.io";

class SocketServer {
  private static instance: SocketServer;
  public io: Server;

  private constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      path: "/socket.io/",
      transports: ["websocket"],
    });
    this.io.on("connection", (socket) => {
      console.log("🟢 Client connecté :", socket.id);

      socket.on("disconnect", () =>
        console.log("🔴 Client déconnecté :", socket.id)
      );
    });
  }

  public static init(httpServer: any): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer(httpServer);
    }
    return SocketServer.instance;
  }

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      throw new Error(
        "SocketServer non initialisé. Appelle d'abord init(httpServer)."
      );
    }
    return SocketServer.instance;
  }
}

export default SocketServer;
