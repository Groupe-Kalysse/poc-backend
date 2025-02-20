import express from "express";
import { createServer } from "http";
import apiRoutes from "./routes/api";
import NFCReader from "./services/NfcReader";
import SocketServer from "./services/SocketServer";

const app = express();
const httpServer = createServer(app);
const socketServer = SocketServer.init(httpServer);
NFCReader.getInstance();

app.use(express.json());
app.use("/api", apiRoutes);

const PORT = 3001;
httpServer.listen(PORT, () => {
  socketServer.io.emit("init", { msg: "Server initialized" });
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
