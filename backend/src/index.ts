import express from "express";
import { createServer } from "http";
import apiRoutes from "./routes/api";
import SocketServer from "./services/SocketServer";
import NfcReader from "./services/NfcReader";
import { dataSource } from "./database/typeorm";

const app = express();
const httpServer = createServer(app);
const socketServer = SocketServer.init(httpServer);
NfcReader.createReader();

app.use(express.json());
app.use("/api", apiRoutes);

const PORT = 3001;
httpServer.listen(PORT, async () => {
  await dataSource.initialize()
  socketServer.io.emit("init", { msg: "Server initialized" });
  console.info(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
