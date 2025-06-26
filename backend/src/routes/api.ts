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

router.get("/system", async (_req, res) => {
  const nbReservs = await Reservation.find();
  res.json({
    Locker: locker.getData(),
    Database: nbReservs.length,
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

router.get("/lockers", async (_req, res) => {
  //fake
  const lockers = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16".split(" ");
  const reservations = await Reservation.find();
  const result = lockers.map((id) => {
    let status = "free";
    const isReserved = reservations.some(
      (reserv) => reserv.lockerNumber === Number(id)
    );
    if (isReserved) status = "claimed";
    if (locker.tmpClosedLocker === Number(id)) status = "claimed";

    return {
      id: Number(id),
      lockerNumber: id,
      status,
    };
  });
  res.send(result);
});

export default router;
