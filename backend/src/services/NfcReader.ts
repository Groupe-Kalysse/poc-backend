import HidReader from "./NfcTypes/HidReader";
import PCSCReader from "./NfcTypes/PcscReader";

export default class NfcReader {
  static createReader() {
    const readerType = process.env.RFID_TYPE || "HID";

    if (readerType === "PCSC") {
      console.log("🔵 Utilisation du lecteur PCSC");
      return PCSCReader.getInstance();
    } else {
      console.log("🟢 Utilisation du lecteur HID");
      return HidReader.getInstance();
    }
  }
}
