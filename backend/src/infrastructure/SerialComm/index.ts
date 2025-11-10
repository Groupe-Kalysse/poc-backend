import CommBus from "../CommBus";
import { Cu16Serial } from "./Cu16Serial";
import { Cu48Serial } from "./Cu48Serial";
import MockSerial from "./MockSerial";

export default function newSerialHandler(commandBus: CommBus) {
  const { SERIAL_TYPE } = process.env;

  switch (SERIAL_TYPE) {
    case "CU16":
      return new Cu16Serial(commandBus);
    case "CU48":
      return new Cu48Serial(commandBus);
    case "MOCK":
      return new MockSerial(commandBus);
    default:
      commandBus.fireEvent({
        label: "missing-env",
        message: "Missing env variable: SERIAL_TYPE. Fallbacking to MockSerial",
        type: "warning",
      });
      return new MockSerial(commandBus);
  }
}

export interface NfcReader {
  initialize(): void;
}
