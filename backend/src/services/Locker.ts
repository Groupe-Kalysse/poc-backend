import { cu16, cu48 } from "../config/lockerTypes";
import SerialHandler from "./SerialHandler";

export default class Locker {
  private totalSlots: number;

  constructor(lockerType: string) {
    switch (lockerType) {
      case "CU48":
        this.totalSlots = cu48.totalSlots;
        break;
      case "CU16":
        this.totalSlots = cu16.totalSlots;
        break;
      default:
        throw new Error("Wrong type of Locker type: " + lockerType);
    }
  }

  unlock(slot: number): void {
    if (slot < 1 || slot > this.totalSlots) {
      throw new Error("Invalid slot number");
    }
    console.log(`Opening locker ${slot} to unlock`);
    SerialHandler.getInstance().sendCommand("open", slot);
  }

  lock(slot: number): void {
    if (slot < 1 || slot > this.totalSlots) {
      throw new Error("Invalid slot number");
    }
    console.log(`Opening locker ${slot} to lock`);
    //TODO Implement the call to Serial
  }

  getStatus(slot: number): void {
    if (slot < 1 || slot > this.totalSlots) {
      throw new Error("Invalid slot number");
    }
    console.log(`Getting locker ${slot}'s status`);
    //TODO Implement the call to Serial
  }
}
