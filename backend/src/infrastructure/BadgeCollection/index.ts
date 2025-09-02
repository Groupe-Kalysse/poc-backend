import CommBus from "../CommBus";
import { JsonBadgeCollection } from "./JsonBadgeCollection";
import { MockBadgeCollection } from "./MockBadgeCollection";

export default function newBadgeCollection(commandBus: CommBus) {
  const { BADGE_TYPE: BADGE_TYPE } = process.env;

  switch (BADGE_TYPE) {
    case "JSON":
      return new JsonBadgeCollection(commandBus);
    case "MOCK":
      return new MockBadgeCollection(commandBus);
    default:
      commandBus.fireEvent({
        label: "missing-env",
        message:
          "Missing env variable: BADGE_TYPE. Fallbacking to MockBadgeCollection",
        type: "warning",
      });
      return new MockBadgeCollection(commandBus);
  }
}
