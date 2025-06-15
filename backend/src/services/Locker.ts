import { Reservation } from "../database/Reservation";
import { cu16, cu48 } from "../config/lockerTypes";
import SerialHandler from "./SerialHandler";
import SocketServer from "./SocketServer";

export default class Locker {
  private static instance: Locker;
  private totalSlots: number;
  private claimedLockers: number[] = [];
  private tmpClosedLocker: number | undefined;
  private badgeTimeout: number | undefined;

  private constructor(lockerType: string) {
    if (!process.env.TIMEOUT_STATUS)
      throw new Error("Missing env: TIMEOUT_STATUS");
    if (!process.env.TIMEOUT_RESERVATION)
      throw new Error("Missing env: TIMEOUT_RESERVATION");

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

    setInterval(this.getStatus, Number(process.env.TIMEOUT_STATUS));
  }
  public static getInstance(lockerType: string): Locker {
    if (!Locker.instance) {
      Locker.instance = new Locker(lockerType);
    }
    return Locker.instance;
  }

  public getData() {
    return {
      totalSlots: this.totalSlots,
      claimedLockers: this.claimedLockers,
      tmpClosedLocker: this.tmpClosedLocker,
    };
  }

  public canLock() {
    return this.tmpClosedLocker !== undefined;
  }

  async unlockByNumber(lockerNumber: number) {
    if (lockerNumber < 1 || lockerNumber > this.totalSlots) {
      return console.error(`Invalid slot number: ${lockerNumber}`);
    }
    await Reservation.delete({ lockerNumber });
    await SerialHandler.getInstance().sendCommand("open", lockerNumber - 1);
    this.claimedLockers = this.claimedLockers.filter(
      (lockerId) => lockerId !== lockerNumber
    );
  }

  async unlockByBadge(badgeTrace: string) {
    const reservation = await Reservation.findOneBy({ badgeTrace });
    // console.log("Trying to unlock locker ",reservation?.lockerNumber);
    if (reservation) {
      SerialHandler.getInstance().sendCommand("open", reservation.lockerNumber);
      this.claimedLockers = this.claimedLockers.filter(
        (lockerId) => lockerId !== reservation.lockerNumber
      );
      SocketServer.getInstance().io.emit("door-event", {
        locker: reservation?.lockerNumber,
      });
    } else console.error(`No reservation under badge #${badgeTrace}`);
  }

  unlockAll() {
    //TODO Should be doable with ONE order
    for (let i = 1; i <= this.totalSlots; i++) {
      setTimeout(() => {
        this.unlockByNumber(i);
      }, i * 100);
    }
    this.tmpClosedLocker = undefined;
  }

  async lockByBadge(badgeTrace: string) {
    if (!badgeTrace) {
      console.debug("Can't lock without a proper badge signature");
      return;
    }

    if (!this.tmpClosedLocker) {
      console.debug("Can't lock an undefined locker");
      return;
    }

    console.debug(
      `Closing lock #${this.tmpClosedLocker} until badge or 12h have passed`
    );
    await Reservation.save({
      lockerNumber: this.tmpClosedLocker,
      badgeTrace,
    });

    this.claimedLockers.push(this.tmpClosedLocker);
    this.tmpClosedLocker = undefined;
    clearTimeout(this.badgeTimeout);
  }

  getStatus() {
    SerialHandler.getInstance().sendCommand("getStatus");
  }

  async handleStatusUpdate(newData: number[]) {
    const newlyClosed = newData.filter(
      (lockerId) => !this.claimedLockers.includes(lockerId)
    );

    // If we're already waiting for a badge, open everything & leave
    if (this.tmpClosedLocker) {
      newlyClosed.forEach((locker) => {
        if (locker === this.tmpClosedLocker) return;

        this.unlockByNumber(locker);
      });
      return;
    }

    // If nothing has changed, leave
    if (!newlyClosed.length) return;

    this.tmpClosedLocker = newlyClosed.shift();

    // Shouldn't happen
    if (!this.tmpClosedLocker) return;

    // Reopen other locks
    newlyClosed.forEach((locker) => {
      this.unlockByNumber(locker);
    });

    const tmpClosedLocker = this.tmpClosedLocker;
    console.log(`Waiting for a badge before closing #${this.tmpClosedLocker}`);
    setTimeout(() => {
      console.log(
        `Locker #${tmpClosedLocker} reopened after ${process.env.TIMEOUT_RESERVATION}ms without a badge scan`
      );
      this.unlockByNumber(tmpClosedLocker);
      this.tmpClosedLocker = undefined;
    }, Number(process.env.TIMEOUT_RESERVATION));
  }
}
