import { Router } from "express";
import SerialHandler from "../services/SerialHandler";
import SocketServer from "../services/SocketServer";

const router = Router();
router.get("/health", (_req, res) => {
  res.send("OK!");
});
router.get("/socket", (_req, res) => {
  SocketServer.getInstance().io.emit("rfid-event", { uid: "IT WORKS!" });
  res.send("OK!");
});

router.post("/open", (_req, res) => {
  SerialHandler.getInstance().sendCommand("OPEN_LOCKER");
  res.json({ message: "🔓 Casier ouvert !" });
});

export default router;
