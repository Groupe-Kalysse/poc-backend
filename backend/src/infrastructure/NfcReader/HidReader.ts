import fs from "fs";
import CommBus from "../CommBus";

export default class HidReader {
  private devicePath = "/dev/hidraw1";
  private timeoutDuration = 500;
  private accumulatedData: string;
  private scanTimeout: NodeJS.Timeout | null;
  private commandBus: CommBus;

  constructor(commandBus: CommBus) {
    this.initialize();
    this.commandBus = commandBus;
  }

  initialize() {
    this.accumulatedData = "";
    this.scanTimeout = null;
    const stream = fs.createReadStream(this.devicePath);
    stream.on("data", (data: string | Buffer) => {
      this.onIncomingData(data);
    });
    stream.on("error", (err) => {
      this.commandBus.fireEvent({
        label: "nfc-error",
        type: "error",
        message: "❌ Erreur de lecture HID",
        payload: {
          error: err,
        },
      });
    });
  }
  onIncomingData(data: string | Buffer) {
    const stringData = this.cleanData(data);
    this.accumulatedData += stringData;

    // Si 0.5s passent sans nouveau caractère, considérer le scan comme terminé
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }
    this.scanTimeout = setTimeout(() => {
      this.onCompleteMessage(this.accumulatedData);
    }, this.timeoutDuration);
  }
  onCompleteMessage(data: string) {
    this.accumulatedData = "";
    this.commandBus.fireEvent({
      label: "nfc-hit",
      type: "info",
      message: `📡 Hit HID: ${data}`,
      payload: {
        trace: data,
      },
    });
  }

  private cleanData(rawData: string | Buffer): string {
    return rawData.toString("utf-8").replace(/[^ -~]/g, "");
  }
}
