import express from "express";
import { createServer } from "http";
import newBadgeCollection from "./infrastructure/BadgeCollection";
import CommBus from "./infrastructure/CommBus";
import newLocker from "./infrastructure/Locker";
import newNfcReader from "./infrastructure/NfcReader";
import newSerialHandler from "./infrastructure/SerialComm";
import SocketServer from "./infrastructure/SocketServer";
import apiRoutes from "./infrastructure/Api/routes";

const commBus = new CommBus();
newNfcReader(commBus);
newSerialHandler(commBus);
newLocker(commBus);
newBadgeCollection(commBus);

const app = express();
const httpServer = createServer(app);
const socketServer = new SocketServer(httpServer, commBus);

app.use(express.json());
app.use("/api", apiRoutes);

const PORT = 3001;
httpServer.listen(PORT, async () => {
  socketServer.io.emit("init", { msg: "Server initialized" });
  console.info(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
