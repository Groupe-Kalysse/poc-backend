import CommBus, { Command } from "../CommBus";
import { dataSource } from "../Database/dataSource";
import { Locker } from "../Database/entities/Locker";

type Lock = {
  label: string;
  port: number;
  status: "open" | "closed" | "claimed";
  unlockCode: string | null;
  unlockBadge: string | null;
};

export default class MockLocker {
  private commandBus: CommBus;
  private claimedLock: Lock | null;
  private claimFlag: NodeJS.Timeout;
  private claimTime: number;
  private actionOnAllTime: number;
  private locks: Lock[] = [
    {
      label: "A01",
      port: 0,
      status: "closed",
      unlockBadge: null,
      unlockCode: null,
    },
  ];
  private open: boolean;

  constructor(commandBus: CommBus) {
    this.commandBus = commandBus;
    this.claimTime = 1000;
    this.actionOnAllTime = 100;
    this.open = true;
    this.commandBus.listenEvent("serial-status", this.onUpdatedStatus);
    this.commandBus.listenEvent("badge-hit", this.onBadge);
    this.commandBus.listenEvent("web-asked-claim", this.claimLock);

    const newLockers = Locker.create(
      this.locks.map((locker) => ({
        lockerNumber: locker.label,
        status: "open",
      }))
    );
    const repo = dataSource.getRepository(Locker);
    repo.save(newLockers);
  }

  onBadge = (_command: Command) => {
    if (this.open) this.closeLock(0);
    else this.openLock(0);
    this.open = !this.open;
  };

  onUpdatedStatus() {
    // TODO ?
  }

  claimLock = (command: Command) => {
    console.log("BOOYAH?");

    const num = Number(command.payload?.id);
    if (this.claimedLock !== null) {
      this.commandBus.fireEvent({
        label: "locker-claim-miss",
        type: "warning",
        message: `⚠️ Unable to claim locker#${num}`,
      });
      return;
    }
    this.claimedLock =
      this.locks.find((lock) => lock.port === command.payload?.id) || null;
    if (this.claimedLock) {
      this.commandBus.fireEvent({
        label: "locker-claim",
        type: "info",
        message: `✊ Claimed locker#${num}`,
      });

      this.claimFlag = setTimeout(() => {
        this.freeLock(num);
      }, this.claimTime);
    }
  };

  freeLock = (num: number) => {
    if (this.claimedLock?.port === num) {
      this.claimedLock = null;
      if (this.claimFlag) clearTimeout(this.claimFlag);
      this.commandBus.fireEvent({
        label: "locker-free",
        type: "info",
        message: `✋ Freed locker#${num}`,
      });
    }
  };

  openLock = (num: number) => {
    const lock = this.locks.find((lock) => lock.port === num);
    if (!lock) return;

    this.commandBus.fireEvent({
      label: "locker-open",
      type: "info",
      message: `🔓Ask unlocking lock ${lock.label}`,
      payload: {
        port: lock.port,
      },
    });
    this.locks = this.locks.map((candidate) => {
      if (candidate.port !== lock.port) return candidate;
      return { ...candidate, status: "open" };
    });
  };

  closeLock = (num: number) => {
    const lock = this.locks.find((lock) => lock.port === num);
    if (!lock) return;

    this.commandBus.fireEvent({
      label: "locker-close",
      type: "info",
      message: `🔒Ask locking lock ${lock.label}`,
      payload: {
        port: lock.port,
      },
    });
    this.locks = this.locks.map((candidate) => {
      if (candidate.port !== lock.port) return candidate;
      return { ...candidate, status: "closed" };
    });
  };

  openAllLocks = () => {
    for (let i = 0; i < this.locks.length; i++) {
      setTimeout(() => {
        this.openLock(this.locks[i].port);
      }, i * this.actionOnAllTime);
    }
  };

  closeAllLocks = () => {
    for (let i = 0; i < this.locks.length; i++) {
      setTimeout(() => {
        this.closeLock(this.locks[i].port);
      }, i * this.actionOnAllTime);
    }
  };
}
