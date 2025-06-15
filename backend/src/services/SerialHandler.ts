import { cu16, cu48 } from "../config/lockerTypes";
import { SerialPort } from "serialport";
import Locker from "./Locker";

class SerialHandler {
  private static instance: SerialHandler;
  private lastMsgFromCU: Uint8Array;
  private msgTimeout: NodeJS.Timeout;
  private address: number;
  private port: SerialPort;
  private isOpen: boolean = false;
  private retryInterval: NodeJS.Timeout | null = null;
  private baudRate: number;
  private commandPrefix: number;
  private commandSuffix: number;
  private commands: {
    open: number;
    status: number;
  };
  private locker: Locker;

  private constructor() {
    if (!process.env.LOCKER_TYPE) throw new Error("Missing env: LOCKER_TYPE");
    if (!process.env.SERIAL_PATH) throw new Error("Missing env: SERIAL_PATH");

    const lockerType = process.env.LOCKER_TYPE;
    let settings;
    switch (lockerType) {
      case "CU48":
        settings = cu48;
        break;
      case "CU16":
        settings = cu16;
        break;
      default:
        throw new Error("Wrong type of Locker type: " + lockerType);
    }

    this.locker = Locker.getInstance(lockerType);
    this.lastMsgFromCU = new Uint8Array();
    this.baudRate = settings.baudRate;
    this.address = settings.address;
    this.commandSuffix = settings.codeEnd;
    this.commandPrefix = settings.codeStart;
    this.commands = {
      status: settings.codeGetStatus,
      open: settings.codeOpening,
    };

    this.port = new SerialPort({
      path: process.env.SERIAL_PATH,
      baudRate: this.baudRate,
    });

    this.port.on("open", () => {
      this.isOpen = true;
      console.info("✅ Port série ouvert");
      if (this.retryInterval) {
        clearInterval(this.retryInterval);
      }
    });

    this.port.on("data", (data: Buffer) => {
      if (!this.lastMsgFromCU) this.lastMsgFromCU = data;
      else {
        let tmp = new Uint8Array(
          this.lastMsgFromCU.byteLength + data.byteLength
        );
        tmp.set(new Uint8Array(this.lastMsgFromCU), 0);
        tmp.set(new Uint8Array(data), this.lastMsgFromCU.byteLength);
        this.lastMsgFromCU = tmp;
      }

      // Si 0.5s passent sans nouveau paquet, considérer le message comme complet
      if (this.msgTimeout) {
        clearTimeout(this.msgTimeout);
      }
      this.msgTimeout = setTimeout(() => {
        this.receiveMessage();
      }, 300);
    });

    this.port.on("error", (err) => {
      console.error("❌ Erreur port série :", err);
    });

    this.port.on("close", () => {
      this.isOpen = false;
      console.info("🔴 Port série fermé");
      this.retryConnection();
    });
  }

  private checksum(...values: number[]): number {
    return values.reduce((acc, val) => acc + val, 0);
  }

  public static getInstance(): SerialHandler {
    if (!SerialHandler.instance) {
      SerialHandler.instance = new SerialHandler();
    }
    return SerialHandler.instance;
  }

  public async sendCommand(command: "open" | "getStatus", slot = 0) {
    const lockerType = process.env.LOCKER_TYPE;
    let commandCode;
    switch (command) {
      case "open":
        commandCode = this.commands.open;
        break;
      case "getStatus":
        commandCode = this.commands.status;
        break;
    }

    const message = [
      this.commandPrefix, // CU-dependant
      slot, // 0x30 for broadcast,
      commandCode, // CU-dependant
      this.commandSuffix, // CU-dependant
    ];

    // CU16 and CU48 have slightly different protocols
    if (lockerType === "CU48") message.splice(1, 0, this.address);

    // In any case, checksum must be added at the end
    message.push(this.checksum(...message));

    // console.debug("Serial Order to send", message.map(byte=>byte.toString(16)));

    if (!this.isOpen) {
      console.error("❌ Port série non disponible");
      return;
    }

    await this.port.write(message, (err) => {
      if (err) {
        console.error("❌ Erreur d'écriture sur le port série :", err);
      } else {
        // console.debug(`📤 Commande envoyée: ${command} ${slot}`);
      }
    });
  }

  private receiveMessage() {
    // console.debug("📡 Données reçues :", this.lastMsgFromCU);

    // Remove affixes and unused data
    let values: Number[] = [];
    for (let i = 3; i < this.lastMsgFromCU.length - 4; i++)
      values.push(this.lastMsgFromCU[i]);

    const lockersStatusBits = values
      .map((byte) => byte.toString(2).padStart(8, "0"))
      //.reverse()
      .join("")
      .split("");
    const closedLockers = lockersStatusBits.reduce((acc, bit, index) => {
      if (bit === "0") return acc;
      return [...acc, index + 1];
    }, new Array());
    this.locker.handleStatusUpdate(closedLockers);

    this.lastMsgFromCU = new Uint8Array();
  }

  private retryConnection(): void {
    if (this.isOpen) {
      console.error("Port déjà ouvert, reconnexion annulée");
      return;
    }
    if (!this.retryInterval) {
      this.retryInterval = setInterval(() => {
        console.info("🔄 Tentative de reconnexion au port série...");
        this.port.open((err) => {
          if (!err) {
            // console.debug("✅ Reconnexion réussie au port série");
            this.isOpen = true;
            clearInterval(this.retryInterval!);
          }
        });
      }, 5000);
    }
  }

  public setPortConfiguration(baudRate: number): void {
    if (this.isOpen) {
      console.error(
        "❌ Impossible de configurer le port série, il est déjà ouvert."
      );
      return;
    }
    try {
      this.port.update({ baudRate: baudRate });
      console.info("🛠️ Configuration du port série mise à jour");
    } catch (err) {
      console.error("❌ Impossible de configurer le port série:", err);
    }
  }

  public close(): void {
    if (this.isOpen) {
      this.port.close((err) => {
        if (err) {
          console.error("❌ Erreur à la fermeture du port :", err);
        } else {
          console.info("🔴 Port série fermé");
        }
      });
    }
  }
}

export default SerialHandler;
