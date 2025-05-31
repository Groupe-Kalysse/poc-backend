import { cu16, cu48 } from "../config/lockerTypes";
import SerialHandler from "./SerialHandler";

export default class Locker {
  private static instance: Locker;
  private totalSlots: number;
  private openLockers:number[] = []

  private constructor(lockerType: string) {
    if(!process.env.TIMEOUT_STATUS) throw new Error("Missing env: TIMEOUT_STATUS")
    

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

    setInterval(this.getStatus,Number(process.env.TIMEOUT_STATUS))
  }
  public static getInstance(lockerType: string): Locker {
    if (!Locker.instance) {
      Locker.instance = new Locker(lockerType);
    }
    return Locker.instance;
  }


  unlock(slot: number): void {
    if (slot < 0 || slot > this.totalSlots-1) {
      throw new Error(`Invalid slot number: ${slot}`);
    }
    SerialHandler.getInstance().sendCommand("open", slot);
  }

  lock(slot: number): void {
    console.debug(`Opening locker ${slot} to lock`);
    //TODO Implement the call to Serial
  }

  getStatus() {
    SerialHandler.getInstance().sendCommand("getStatus")
  }

  handleStatusUpdate(newData: number[]) {
    // console.debug(`
    //   `);
    // console.debug("Old status: ",this.openLockers);
    // console.debug("new status: ",newData);
    this.openLockers=newData
    this.openLockers
  }
}
