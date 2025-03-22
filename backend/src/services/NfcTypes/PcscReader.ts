import pcsclite from "pcsclite";
import SocketServer from "../SocketServer";
import badges from "../../config/badges.json";

export default class PCSCReader {
  private static instance: PCSCReader;
  private pcsc = pcsclite();

  private constructor() {
    this.startListening();
  }

  public static getInstance(): PCSCReader {
    if (!PCSCReader.instance) {
      PCSCReader.instance = new PCSCReader();
    }
    return PCSCReader.instance;
  }

  private startListening() {
    console.log("🟢 Démarrage de la lecture RFID via PCSC...");

    this.pcsc.on("reader", (reader) => {
      console.log(`🔗 Lecteur détecté : ${reader.name}`);

      reader.on("status", (status) => {
        if (!(status.state & reader.SCARD_STATE_PRESENT)) return;

        reader.connect(
          { share_mode: reader.SCARD_SHARE_SHARED },
          (err, protocol) => {
            if (err) {
              console.error("❌ Erreur de connexion au lecteur :", err);
              return;
            }

            const sendCommand = Buffer.from([0xff, 0xca, 0x00, 0x00, 0x00]);
            reader.transmit(sendCommand, 40, protocol, (err, response) => {
              if (err) {
                console.error("❌ Erreur de transmission :", err);
                return;
              }

              const uid = response.toString("hex").toUpperCase();
              console.log("📡 UID reçu :", uid);

              const user = badges.find((candidate) => candidate.uid === uid);
              SocketServer.getInstance().io.emit("rfid-event", {
                uid: user?.label ?? "Inconnu",
              });

              reader.disconnect(reader.SCARD_LEAVE_CARD, (err) => {
                if (err) console.error("❌ Erreur de déconnexion :", err);
              });
            });
          }
        );
      });
    });
  }
}
