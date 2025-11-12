import lockers from "../../config/lockers.json";
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

export class JsonLocker {
  private commandBus: CommBus;
  private claimedLocker: number | null;
  private claimFlag: NodeJS.Timeout;
  private state: Lock[];

  constructor(commandBus: CommBus) {
    this.commandBus = commandBus;
    this.claimedLocker = null;
    this.state = lockers.map((baseLocker) => ({
      ...baseLocker,
      status: "closed",
      unlockBadge: null,
      unlockCode: null,
    }));
    this.openAllLocks();
    this.commandBus.listenEvent("serial-status", this.onUpdatedStatus);
    this.commandBus.listenEvent("api-openAll", this.openAllLocks);
    this.commandBus.listenEvent("web-asked-claim", this.claimLock);

    const newLockers = Locker.create(
      this.state.map((locker) => ({
        lockerNumber: locker.label,
        status: "open",
      }))
    );
    const repo = dataSource.getRepository(Locker);
    repo.save(newLockers);
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
        payload: {},
      });
      return;
    }
    this.claimedLocker = num;
    this.commandBus.fireEvent({
      label: "locker-claim",
      type: "info",
      message: `✋ Claimed locker#${num}`,
      payload: {},
    });
    this.claimFlag = setTimeout(() => {
      this.freeLock(num);
    }, 5000);
  };
  freeLock(num: number): void | Promise<void> {
    if (this.claimedLocker === num) {
      this.claimedLocker = null;
      //TODO Unclaim
      if (this.claimFlag) clearTimeout(this.claimFlag);
    }
  }

  closeLock(num: number): void | Promise<void> {
    const lock = this.state.find((lock) => lock.port === num);
    if (!lock) return;

    this.commandBus.fireEvent({
      label: "locker-close",
      type: "info",
      message: `🔒Ask locking lock ${lock.label}`,
      payload: {
        port: lock.port,
      },
    });
    this.state = this.state.map((candidate) => {
      if (candidate.port !== lock.port) return candidate;
      return { ...candidate, status: "closed" };
    });
  }
  closeAllLocks(): void | Promise<void> {
    for (let i = 0; i <= this.state.length; i++) {
      setTimeout(() => {
        this.closeLock(this.state[i].port);
      }, i * 100);
    }
  }

  openLock(num: number): void | Promise<void> {
    const lock = this.state.find((lock) => lock.port === num);
    if (!lock) return;

    this.commandBus.fireEvent({
      label: "locker-open",
      type: "info",
      message: `🔓Ask unlocking lock ${lock.label}`,
      payload: {
        port: lock.port,
      },
    });
    this.state = this.state.map((candidate) => {
      if (candidate.port !== lock.port) return candidate;
      return { ...candidate, status: "open" };
    });
  }
  openAllLocks(): void | Promise<void> {
    for (let i = 0; i < this.state.length; i++) {
      setTimeout(() => {
        this.openLock(this.state[i].port);
      }, i * 100);
    }
  }
}
