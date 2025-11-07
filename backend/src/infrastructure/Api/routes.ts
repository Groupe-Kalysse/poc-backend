import { Router } from "express";
import { Locker } from "../Database/entities/Locker";

const router = Router();

router.get("/health", (_, res) => {
  res.send("OK!");
});
router.get("/lockers", (_, res) => {
  // TODO: plug to a database

  return res.json(Locker.find());
});

export default router;
