import { Router } from "express";
import Locker from "../services/Locker";

const router = Router();

router.get("/health", (_req, res) => {
  res.send("OK!");
});

router.post("/open", (_req, res) => {
  const lockerType = process.env.LOCKER_TYPE;
  if (!lockerType) {
    res.status(500);
    return;
  }
  const locker = new Locker(lockerType);
  locker.unlock(1);
  res.json({ message: "🔓 Casier ouvert !" });
});

export default router;
