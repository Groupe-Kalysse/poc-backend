import { Router } from "express";
import { Locker } from "../Database/entities/Locker";

const router = Router();

router.get("/health", (_, res) => {
  res.send("OK!");
});
router.get("/lockers", async (_, res) => {
  const lockers = await Locker.find();
  return res.json(lockers);
});

export default router;
