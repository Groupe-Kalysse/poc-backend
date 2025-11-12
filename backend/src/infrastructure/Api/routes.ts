import { Router } from "express";
import { Locker } from "../Database/entities/Locker";
import getServices from "../../services";

const router = Router();
router.get("/health", (_, res) => {
  res.send("OK!");
});
router.get("/lockers", async (_, res) => {
  const lockers = await Locker.find();
  return res.json(lockers);
});

router.put("/lockers/:id", async (req, res) => {
  const { commBus } = await getServices();
  const lockerToUpdate = Number(req.params.id);
  if (!lockerToUpdate) return res.status(400);
  const locker = await Locker.findOneBy({ id: lockerToUpdate });
  if (!locker) return res.status(404);
  if (locker.status === "open") locker.status = "claimed";
  else locker.status = "open";
  await locker.save();
  commBus.fireEvent({
    label: "web-asked-claim",
    type: "info",
    message: `✋ Asked to claim locker#${locker.id}`,
    payload: { id: locker.id },
  });

  return res.json(locker);
});

export default router;
