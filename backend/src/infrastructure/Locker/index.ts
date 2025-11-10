import CommBus from "../CommBus";
import { JsonLocker } from "./JsonLocker";
import MockLocker from "./MockLocker";

export default function newLocker(commandBus: CommBus) {
  const { LOCKER_TYPE } = process.env;

  switch (LOCKER_TYPE) {
    case "JSON":
      return new JsonLocker(commandBus);
    case "MOCK":
      return new MockLocker(commandBus);
    default:
      commandBus.fireEvent({
        label: "missing-env",
        message: "Missing env variable: LOCKER_TYPE. Fallbacking to MockLocker",
        type: "warning",
      });
      return new MockLocker(commandBus);
  }
}
