import "reflect-metadata";
import express from "express";
import { createServer } from "http";
import newBadgeCollection from "./infrastructure/BadgeCollection";
import CommBus from "./infrastructure/CommBus";
import newLocker from "./infrastructure/Locker";
import newNfcReader from "./infrastructure/NfcReader";
import newSerialHandler from "./infrastructure/SerialComm";
import SocketServer from "./infrastructure/SocketServer";
import apiRoutes from "./infrastructure/Api/routes";
import { dataSource } from "./infrastructure/Database/dataSource";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use("/api", apiRoutes);

const PORT = 3001;
httpServer.listen(PORT, async () => {
  await dataSource.initialize();
  const commBus = new CommBus();
  newNfcReader(commBus);
  newSerialHandler(commBus);
  newLocker(commBus);
  newBadgeCollection(commBus);
  const socketServer = new SocketServer(httpServer, commBus);

  socketServer.io.emit("init", { msg: "Server initialized" });
  console.info(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
