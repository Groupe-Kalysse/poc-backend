import { NFC } from "nfc-pcsc";
import SocketServer from "./SocketServer";

class NfcReader {
  private static instance: NfcReader;
  private nfc: NFC;

  private constructor() {
    this.nfc = new NFC();
    this.nfc.on("reader", (reader) => {
      console.log("✅ Lecteur RFID connecté :", reader.name);

      reader.on("card", (card) => {
        console.log("📟 Carte détectée :", card.uid);
        SocketServer.getInstance().io.emit("rfid-event", { uid: card.uid });
      });

      reader.on("error", (err) => console.error("❌ Erreur NFC :", err));

      reader.on("end", () => {
        console.log(`Reader disconnected: ${reader.name}`);
      });
    });

    this.nfc.on("error", (err) =>
      console.error("❌ Erreur NFC principale :", err)
    );
  }

  public static getInstance(): NfcReader {
    if (!NfcReader.instance) {
      NfcReader.instance = new NfcReader();
    }
    return NfcReader.instance;
  }
}

export default NfcReader;
