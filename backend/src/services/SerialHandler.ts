import { SerialPort } from "serialport";

class SerialHandler {
  private static instance: SerialHandler;
  private port: SerialPort;

  private constructor() {
    this.port = new SerialPort({ path: "/dev/ttyUSB0", baudRate: 9600 });
    this.port.on("open", () => console.log("✅ Port série ouvert"));
    this.port.on("error", (err) =>
      console.error("❌ Erreur port série :", err)
    );
  }

  public static getInstance(): SerialHandler {
    if (!SerialHandler.instance) {
      SerialHandler.instance = new SerialHandler();
    }
    return SerialHandler.instance;
  }

  public sendCommand(command: string) {
    this.port.write(command, (err) => {
      if (err) {
        console.error("❌ Erreur d'écriture sur le port série :", err);
      } else {
        console.log("📤 Commande envoyée :", command);
      }
    });
  }
}

export default SerialHandler;
