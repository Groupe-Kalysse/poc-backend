import { Router } from "express";

const router = Router();

router.get("/health", (_, res) => {
  res.send("OK!");
});
router.get("/lockers", (_, res) => {
  res.json([
    {
      lockerNumber: "A01",
      id: 0,
      status: "open",
    },
    {
      lockerNumber: "A02",
      id: 1,
      status: "open",
    },
    {
      lockerNumber: "A03",
      id: 2,
      status: "open",
    },
    {
      lockerNumber: "A04",
      id: 3,
      status: "open",
    },
    {
      lockerNumber: "A05",
      id: 4,
      status: "open",
    },
    {
      lockerNumber: "A06",
      id: 5,
      status: "open",
    },
    {
      lockerNumber: "A07",
      id: 6,
      status: "open",
    },
    {
      lockerNumber: "A08",
      id: 7,
      status: "open",
    },
    {
      lockerNumber: "A09",
      id: 8,
      status: "open",
    },
    {
      lockerNumber: "A10",
      id: 9,
      status: "open",
    },
    {
      lockerNumber: "A11",
      id: 10,
      status: "open",
    },
    {
      lockerNumber: "A12",
      id: 11,
      status: "open",
    },
    {
      lockerNumber: "A13",
      id: 12,
      status: "open",
    },
    {
      lockerNumber: "A14",
      id: 13,
      status: "open",
    },
    {
      lockerNumber: "A15",
      id: 14,
      status: "open",
    },
    {
      lockerNumber: "A16",
      id: 15,
      status: "open",
    },
  ]);
});

export default router;
