import lockers from "../../config/lockers.json";
import CommBus, { Command } from "../CommBus";
import { dataSource } from "../Database/dataSource";
import { Locker } from "../Database/entities/Locker";

type LockerType = {
  id: number;
  lockerNumber: string;
  status: string;
  //   unlockBadge: null,
  //   unlockCode: null,
};
export class JsonLocker {
  private commandBus: CommBus;
  private claimedLocker: number | null;
  private claimFlag: NodeJS.Timeout;
  private state: LockerType[];

  constructor(commandBus: CommBus) {
    const repo = dataSource.getRepository(Locker);
    this.commandBus = commandBus;
    this.claimedLocker = null;

    const newLockers = Locker.create(
      lockers.map((locker) => ({
        lockerNumber: locker.lockerNumber,
        status: "open",
      }))
    );
    repo.save(newLockers);
    this.state = newLockers;
    this.openAllLocks();
    this.commandBus.listenEvent("serial-status", this.onUpdatedStatus);
    this.commandBus.listenEvent("api-openAll", this.openAllLocks);
    this.commandBus.listenEvent("web-asked-claim", this.claimLock);
    this.commandBus.listenEvent("web-asked-free", this.freeLock);
    this.commandBus.listenEvent("web-asked-open", this.openLock);
    this.commandBus.listenEvent("web-asked-close", this.closeLock);
  }

  onBadge(): void | Promise<void> {}
  onUpdatedStatus() {}

  claimLock = (command: Command) => {
    const num = Number(command.payload?.id);
    if (this.claimedLocker !== null) {
      this.commandBus.fireEvent({
        label: "locker-claim-miss",
        type: "warning",
        message: `⚠️ Unable to claim locker#${num}`,
        payload: {
          locks: this.state,
        },
      });
      return;
    }
    this.claimedLocker = num;

    this.state = this.state.map((candidate) => {
      if (candidate.id !== num) return candidate;
      return { ...candidate, status: "claimed" };
    });
    this.commandBus.fireEvent({
      label: "locker-claim",
      type: "info",
      message: `✋ Claimed locker#${num}`,
      payload: { locks: this.state },
    });
    this.claimFlag = setTimeout(() => {
      this.freeLock(command);
    }, 5000);
  };
  freeLock = (command: Command) => {
    const num = Number(command.payload?.id);
    if (this.claimedLocker === null) {
      this.state = this.state.map((candidate) => {
        if (candidate.id !== num) return candidate;
        return { ...candidate, status: "open" };
      });

      this.commandBus.fireEvent({
        label: "locker-free-miss",
        type: "warning",
        message: `⚠️ Unable to free locker#${num}`,
        payload: {
          locks: this.state,
        },
      });
      return;
    }
    this.claimedLocker = null;
    this.commandBus.fireEvent({
      label: "locker-free",
      type: "info",
      message: `✋ Freed locker#${num}`,
      payload: { locks: this.state },
    });
    if (this.claimFlag) clearTimeout(this.claimFlag);
  };

  closeLock = (command: Command) => {
    const lock = this.state.find((lock) => lock.id === command.payload?.id);
    if (!lock) return;

    this.commandBus.fireEvent({
      label: "locker-close",
      type: "info",
      message: `🔒Ask locking lock ${lock.lockerNumber}`,
      payload: {
        port: lock.id,
        locks: this.state,
      },
    });
    this.state = this.state.map((candidate) => {
      if (candidate.id !== lock.id) return candidate;
      return { ...candidate, status: "closed" };
    });
  };
  closeAllLocks(): void | Promise<void> {
    for (let i = 0; i <= this.state.length; i++) {
      setTimeout(() => {
        // this.closeLock(this.state[i].id);
        this.closeLock({
          label: "irrelevant-internal-event",
          message: "This is a bandaid to spare time, plz fix",
          type: "warning",
          payload: { id: i },
        });
      }, i * 100);
    }
  }

  openLock = (command: Command) => {
    const lock = this.state.find((lock) => lock.id === command.payload?.id);
    if (!lock) return;

    this.commandBus.fireEvent({
      label: "locker-open",
      type: "info",
      message: `🔓Ask unlocking lock ${lock.lockerNumber}`,
      payload: {
        port: lock.id,
        locks: this.state,
      },
    });
    this.state = this.state.map((candidate) => {
      if (candidate.id !== lock.id) return candidate;
      return { ...candidate, status: "open" };
    });
  };
  openAllLocks = () => {
    console.log(this.state);

    for (let i = 1; i <= this.state.length; i++) {
      setTimeout(() => {
        this.openLock({
          label: "irrelevant-internal-event",
          message: "This is a bandaid to spare time, plz fix",
          type: "warning",
          payload: { id: i },
        });
      }, i * 100);
    }
  };
}
