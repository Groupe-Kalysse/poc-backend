import CommBus from "../CommBus";
import HidReader from "./HidReader";
import MockReader from "./MockReader";
import PcscReader from "./PcscReader";

export default function newNfcReader(commandBus: CommBus) {
  const { NFC_TYPE } = process.env;

  switch (NFC_TYPE) {
    case "PCSC":
      return new PcscReader(commandBus);
    case "HID":
      return new HidReader(commandBus);
    case "MOCK":
      return new MockReader(commandBus);
    default:
      commandBus.fireEvent({
        label: "missing-env",
        message: "Missing env variable: NFC_TYPE. Fallbacking to MockReader",
        type: "warning",
      });
      return new MockReader(commandBus);
  }
}
