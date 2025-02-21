import fs from "fs";
import SocketServer from "./SocketServer";
import badges from "../badges.json";

export default class NFCReader {
  private static instance: NFCReader;
  private devicePath = "/dev/hidraw1";
  private accumulatedData: string = "";
  private scanTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.startListening();
  }

  public static getInstance(): NFCReader {
    if (!NFCReader.instance) {
      NFCReader.instance = new NFCReader();
    }
    return NFCReader.instance;
  }

  private startListening() {
    console.log("🟢 Démarrage de la lecture RFID...");

    const stream = fs.createReadStream(this.devicePath);
    stream.on("data", (data: Buffer) => {
      const stringData = this.cleanData(data);
      this.accumulatedData += stringData;

      // Si 0.5s passent sans nouveau caractère, considérer le scan comme terminé
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
      }
      this.scanTimeout = setTimeout(() => {
        this.onScanComplete();
      }, 500);
    });

    stream.on("error", (err) => {
      console.error("❌ Erreur de lecture HID :", err);
    });
  }

  private onScanComplete() {
    const user = badges.find(
      (candidate) => candidate.uid === this.accumulatedData
    );
    console.log("📡 Scan complet détecté, envoi de l'événement :", user?.label);
    SocketServer.getInstance().io.emit("rfid-event", {
      uid: user?.label,
    });
    this.accumulatedData = "";
  }

  private cleanData(rawData: Buffer): string {
    return rawData.toString("utf-8").replace(/[^ -~]/g, "");
  }
}
