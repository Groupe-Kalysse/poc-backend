import { Router } from "express";
import Locker from "../services/Locker";
import { Reservation } from "../database/Reservation";

const router = Router();

const lockerType = process.env.LOCKER_TYPE;
if (!lockerType) throw new Error("Missing env: LOCKER_TYPE");

const locker = Locker.getInstance(lockerType);

router.get("/health", (_req, res) => {
  res.send("OK!");
});

router.get("/system", (_req, res) => {
  res.json({
    Locker: locker.getData(),
    Database:Reservation.find() 
  });
  return;
});

router.post("/open/:id", (req, res) => {
  const lockerId = Number(req.params.id);
  locker.unlockByNumber(lockerId);
  res.json({ message: "🔓 Casier ouvert !" });
});

router.post("/openAll", (_req, res) => {
  locker.unlockAll();
  res.json({ message: "🔓🔓🔓 Casiers ouverts !" });
});

router.post("/status", (_req, res) => {
  const lockerType = process.env.LOCKER_TYPE;
  if (!lockerType) {
    res.status(500);
    return;
  }
  locker.getStatus();
  res.status(200).send();
});

export default router;
