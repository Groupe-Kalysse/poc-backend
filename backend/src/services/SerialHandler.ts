import { SerialPort } from "serialport";

class SerialHandler {
  private static instance: SerialHandler;
  private port: SerialPort;
  private isOpen: boolean = false;

  private constructor() {
    this.port = new SerialPort({ path: "/dev/ttyUSB0", baudRate: 9600 });

    this.port.on("open", () => {
      this.isOpen = true;
      console.log("✅ Port série ouvert");
    });

    this.port.on("data", (data: Buffer) => {
      console.log("📡 Données reçues :", data.toString("utf-8").trim());
    });

    this.port.on("error", (err) => {
      console.error("❌ Erreur port série :", err);
    });

    this.port.on("close", () => {
      this.isOpen = false;
      console.log("🔴 Port série fermé");
    });
  }

  public static getInstance(): SerialHandler {
    if (!SerialHandler.instance) {
      SerialHandler.instance = new SerialHandler();
    }
    return SerialHandler.instance;
  }

  public sendCommand(command: string) {
    if (!this.isOpen) {
      console.error("❌ Port série non disponible");
      return;
    }

    this.port.write(command, (err) => {
      if (err) {
        console.error("❌ Erreur d'écriture sur le port série :", err);
      } else {
        console.log("📤 Commande envoyée :", command);
      }
    });
  }

  public close() {
    if (this.isOpen) {
      this.port.close((err) => {
        if (err) {
          console.error("❌ Erreur à la fermeture du port :", err);
        }
      });
    }
  }
}

export default SerialHandler;
