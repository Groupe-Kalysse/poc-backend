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

router.put("/lockers/:id/:actionToPerform", async (req, res) => {
  const { commBus } = await getServices();
  const lockerToUpdate = Number(req.params.id);
  const availableActions = ["claim", "free", "open", "close"];
  const { actionToPerform } = req.params;
  if (!availableActions.includes(actionToPerform)) return res.status(400);
  if (!lockerToUpdate) return res.status(400);
  const locker = await Locker.findOneBy({ id: lockerToUpdate });
  if (!locker) return res.status(404);
  switch (actionToPerform) {
    case "claim":
      commBus.fireEvent({
        label: "web-asked-claim",
        type: "info",
        message: `✋ Asked to claim locker#${locker.id}`,
        payload: { id: locker.id },
      });
      break;
    case "free":
      commBus.fireEvent({
        label: "web-asked-free",
        type: "info",
        message: `✋ Asked to free locker#${locker.id}`,
        payload: { id: locker.id },
      });
      break;
    case "open":
      commBus.fireEvent({
        label: "web-asked-open",
        type: "info",
        message: `✋ Asked to open locker#${locker.id}`,
        payload: { id: locker.id },
      });
      break;
    case "close":
      commBus.fireEvent({
        label: "web-asked-close",
        type: "info",
        message: `✋ Asked to close locker#${locker.id}`,
        payload: { id: locker.id },
      });
      break;
    default:
      commBus.fireEvent({
        label: "web-asked-gibberish",
        type: "warning",
        message: `✋ Asked to perform "${actionToPerform}" on locker#${locker.id}`,
        payload: { id: locker.id },
      });
      return res.status(400).send();
  }
  // switch (locker.status) {
  //   case "open":
  //     locker.status = "claimed";
  //     commBus.fireEvent({
  //       label: "web-asked-claim",
  //       type: "info",
  //       message: `✋ Asked to claim locker#${locker.id}`,
  //       payload: { id: locker.id },
  //     });
  //     await locker.save();
  //     break;
  //   case "claimed":
  //     locker.status = "open";
  //     commBus.fireEvent({
  //       label: "web-asked-free",
  //       type: "info",
  //       message: `✋ Asked to free locker#${locker.id}`,
  //       payload: { id: locker.id },
  //     });
  //     await locker.save();
  //     break;
  //   case "closed":
  //     console.warn("There is a problem, isn't there ?");
  //     return res.status(400).send();
  // }
  // const lockers = await Locker.find();
  return res.send("Done");
});

export default router;
