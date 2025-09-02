import newBadgeCollection from "./infrastructure/BadgeCollection";
import CommBus from "./infrastructure/CommBus";
import newLocker from "./infrastructure/Locker";
import newNfcReader from "./infrastructure/NfcReader";
import newSerialHandler from "./infrastructure/SerialComm";

const commBus = new CommBus();
newNfcReader(commBus);
newSerialHandler(commBus);
newLocker(commBus);
newBadgeCollection(commBus);
