import { Router } from "express";
import Locker from "../services/Locker";

const router = Router();

const lockerType = process.env.LOCKER_TYPE;
if (!lockerType) throw new Error("Missing env: LOCKER_TYPE");

const locker = Locker.getInstance(lockerType);

router.get("/health", (_req, res) => {
  res.send("OK!");
});

router.post("/open/:id", (req, res) => {
  if (!lockerType) {
    res.status(500);
    return;
  }
  const lockerId = Number(req.params.id);
  // TODO Implement correct behaviour
  locker.unlock(lockerId);
  res.json({ message: "🔓 Casier ouvert !" });
});

router.post("/status", (_req, res) => {
  const lockerType = process.env.LOCKER_TYPE;
  if (!lockerType) {
    res.status(500);
    return;
  }
  // TODO Implement correct behaviour  
  locker.getStatus();
  res.status(200).send();
});

export default router;
