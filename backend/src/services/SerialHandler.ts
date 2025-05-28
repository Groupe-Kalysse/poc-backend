import { cu16, cu48 } from "../config/lockerTypes";
import { SerialPort } from "serialport";

class SerialHandler {
  private static instance: SerialHandler;
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
  private responses: {
    status: number;
    // allStatus: string | null;
  };

  private constructor() {
    if(!process.env.LOCKER_TYPE) throw new Error("Missing env: LOCKER_TYPE")
    if(!process.env.SERIAL_PATH) throw new Error("Missing env: SERIAL_PATH")

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
    this.baudRate = settings.baudRate;
    this.address = settings.address;
    this.commandSuffix = settings.codeEnd;
    this.commandPrefix = settings.codeStart;
    this.commands = {
      status: settings.codeGetStatus,
      open: settings.codeOpening,
    };
    this.responses = {
      status: settings.codeResponseStatus,
      // allStatus = settings.codeResponseAllStatus;
    };

    this.port = new SerialPort({
      path: process.env.SERIAL_PATH,
      baudRate: this.baudRate,
    });

    this.port.on("open", () => {
      this.isOpen = true;
      console.log("✅ Port série ouvert");
      if (this.retryInterval) {
        clearInterval(this.retryInterval);
      }
    });

    this.port.on("data", (data: Buffer) => {
      console.log("📡 Données reçues :", data);
      console.log("Should compare to code " + this.responses.status);
    });

    this.port.on("error", (err) => {
      console.error("❌ Erreur port série :", err);
    });

    this.port.on("close", () => {
      this.isOpen = false;
      console.log("🔴 Port série fermé");
      this.retryConnection();
    });
  }

  private checksum(...values: number[]): number {
    return values
      .reduce((acc, val) => acc+val, 0)
  }

  public static getInstance(): SerialHandler {
    if (!SerialHandler.instance) {
      SerialHandler.instance = new SerialHandler();
    }
    return SerialHandler.instance;
  }

  public sendCommand(command: "open" | "getStatus", slot: number): void {
    let commandCode;
    switch (command) {
      case "open":
        commandCode = this.commands.open;
        break;
      case "getStatus":
        commandCode = this.commands.status;
        break;
    }

    const message =[
      this.commandPrefix, // CU-dependant
      slot, // 0x30 for broadcast,
      commandCode, // CU-dependant
      this.commandSuffix // CU-dependant
    ];

    // CU16 and CU48 have slightly different protocols
    const lockerType = process.env.LOCKER_TYPE
    if(lockerType==="CU48")
      message.splice(1,0,this.address)

    // In any case, checksum must be added at the end
    message.push(this.checksum(...message))

    if (!this.isOpen) {
      console.error("❌ Port série non disponible");
      return;
    }

    this.port.write(message, (err) => {
      if (err) {
        console.error("❌ Erreur d'écriture sur le port série :", err);
      } else {
        console.log("📤 Commande envoyée :", command);
      }
    });
  }

  private retryConnection(): void {
    if (this.isOpen) {
      console.error("Port déjà ouvert, reconnexion annulée");
      return;
    }
    if (!this.retryInterval) {
      this.retryInterval = setInterval(() => {
        console.log("🔄 Tentative de reconnexion au port série...");
        this.port.open((err) => {
          if (!err) {
            console.log("✅ Reconnexion réussie au port série");
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
      console.log("🛠️ Configuration du port série mise à jour");
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
          console.log("🔴 Port série fermé");
        }
      });
    }
  }
}

export default SerialHandler;
