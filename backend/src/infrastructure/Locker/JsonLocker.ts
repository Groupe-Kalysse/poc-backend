import lockers from "../../config/lockers.json";
import CommBus, { Command } from "../CommBus";
import { dataSource } from "../Database/dataSource";
import { Locker } from "../Database/entities/Locker";

// type LockerType = {
//   id: number;
//   lockerNumber: string;
//   status: string;
//   unlockBadge?: string;
//   unlockCode?: string;
// };
export class JsonLocker {
  private commandBus: CommBus;
  // private state: LockerType[];

  constructor(commandBus: CommBus) {
    this.commandBus = commandBus;
    this.initialize();
  }

  async initialize() {
    const repo = dataSource.getRepository(Locker);
    // this.claimedLocker = null;

    const newLockers = Locker.create(
      lockers.map((locker) => ({
        lockerNumber: locker.label,
        status: "open",
        port: locker.port,
      }))
    );
    await repo.save(newLockers);
    // this.state = newLockers;
    this.openAllLocks();
    this.commandBus.listenEvent("serial-status", this.onUpdatedStatus);
    this.commandBus.listenEvent("api-openAll", this.openAllLocks);
    // this.commandBus.listenEvent("web-asked-claim", this.claimLock);
    // this.commandBus.listenEvent("web-asked-free", this.freeLock);
    this.commandBus.listenEvent("web-asked-open", this.openLock);
    this.commandBus.listenEvent("web-asked-close", this.closeLock);

    this.commandBus.listenEvent("socket-ask-close", this.closeLock);
    this.commandBus.listenEvent("socket-ask-open", this.openLock);
  }

  onBadge(): void | Promise<void> {}
  onUpdatedStatus() {}

  // claimLock = (command: Command) => {
  //   const num = Number(command.payload?.id);
  //   if (this.claimedLocker !== null) {
  //     this.commandBus.fireEvent({
  //       label: "locker-claim-miss",
  //       type: "warning",
  //       message: `⚠️ Unable to claim locker#${num}`,
  //       payload: {
  //         locks: this.state,
  //       },
  //     });
  //     return;
  //   }
  //   this.claimedLocker = num;

  //   this.state = this.state.map((candidate) => {
  //     if (candidate.id !== num) return candidate;
  //     return { ...candidate, status: "claimed" };
  //   });
  //   this.commandBus.fireEvent({
  //     label: "locker-claim",
  //     type: "info",
  //     message: `✋ Claimed locker#${num}`,
  //     payload: { locks: this.state },
  //   });
  //   this.claimFlag = setTimeout(() => {
  //     this.freeLock(command);
  //   }, 5000);
  // };
  // freeLock = (command: Command) => {
  //   const num = Number(command.payload?.id);
  //   if (this.claimedLocker === null) {
  //     this.state = this.state.map((candidate) => {
  //       if (candidate.id !== num) return candidate;
  //       return { ...candidate, status: "open" };
  //     });

  //     this.commandBus.fireEvent({
  //       label: "locker-free-miss",
  //       type: "warning",
  //       message: `⚠️ Unable to free locker#${num}`,
  //       payload: {
  //         locks: this.state,
  //       },
  //     });
  //     return;
  //   }
  //   this.claimedLocker = null;
  //   this.commandBus.fireEvent({
  //     label: "locker-free",
  //     type: "info",
  //     message: `✋ Freed locker#${num}`,
  //     payload: { locks: this.state },
  //   });
  //   if (this.claimFlag) clearTimeout(this.claimFlag);
  // };

  closeLock = async (command: Command) => {
    const locker = command.payload?.locker;
    const idType = command.payload?.idType;
    const code = command.payload?.code;

    const lockers = await Locker.find();

    const lock = lockers.find((candidate) => candidate.id === locker); //TODO Fix this, unreadable
    if (!lock) return;

    this.commandBus.fireEvent({
      label: "locker-ask-close", //"locker-close",
      type: "info",
      message: `🔒 Ask locking lock ${lock.lockerNumber}`,
      payload: {
        locker,
        idType,
        code,
        action: "close",
      },
    });

    // this.state = this.state.map((candidate) => {
    //   if (candidate.id !== lock.id) return candidate;
    //   return { ...candidate, status: "closed" };
    // });
  };

  openLock = async (command: Command) => {
    const locker = command.payload?.locker;
    const idType = command.payload?.idType;
    const code = command.payload?.code;

    const lockers = await Locker.find();

    const lock = lockers.find((lock) => lock.id === locker); //TODO Fix this, unreadable
    if (!lock) return;
    if (idType === "badge" && code !== lock.unlockBadge) return;

    console.log("Ready to unlock ", locker);

    this.commandBus.fireEvent({
      label: "locker-open",
      type: "info",
      message: `🔓Ask unlocking lock ${lock.lockerNumber}`,
      payload: {
        // port: lock.id,
        // locks: lockers,
        locker,
        idType,
        code,
        action: "open",
      },
    });
    // this.state = this.state.map((candidate) => {
    //   if (candidate.id !== lock.id) return candidate;
    //   return { ...candidate, status: "open" };
    // });
  };
  openAllLocks = async () => {
    const lockers = await Locker.find();
    for (let i = 1; i <= lockers.length; i++) {
      setTimeout(() => {
        this.openLock({
          label: "irrelevant-internal-event",
          message: "This is a bandaid to spare time, plz fix",
          type: "warning",
          payload: { id: i },
        });
      }, i * 1000);
    }
  };
}
