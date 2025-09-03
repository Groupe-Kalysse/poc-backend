import pcsclite from "pcsclite";
import CommBus from "../CommBus";

export default class PcscReader {
  private commandBus: CommBus;
  private pcsc: ReturnType<typeof pcsclite>;

  constructor(commandBus: CommBus) {
    this.initialize();
    this.commandBus = commandBus;
  }

  initialize() {
    // Initialize PCSC library, scan for readers
    this.pcsc = pcsclite();

    // For each recognized card reader
    this.pcsc.on("reader", (reader) => {
      // Handle protocol errors
      reader.on("error", (err) => {
        this.commandBus.fireEvent({
          label: "nfc-error",
          type: "error",
          message: "❌ Erreur de lecture PCSC",
          payload: {
            error: err,
          },
        });
      });

      // Handle new data
      reader.on("status", (status) => {
        if (!(status.state & reader.SCARD_STATE_PRESENT)) return;
        // Connect to the lib, to transmit data
        reader.connect(
          { share_mode: reader.SCARD_SHARE_SHARED },
          (err, protocol) => {
            if (err) {
              this.commandBus.fireEvent({
                label: "nfc-error",
                type: "error",
                message: "❌ Erreur de lecture PCSC",
                payload: {
                  error: err,
                },
              });
              return;
            }
            // TODO Rework/explicit this mess
            const sendCommand = Buffer.from([0xff, 0xca, 0x00, 0x00, 0x00]);
            reader.transmit(sendCommand, 40, protocol, (err, response) => {
              if (err) {
                this.commandBus.fireEvent({
                  label: "nfc-error",
                  type: "error",
                  message: "❌ Erreur de transmission PCSC",
                  payload: {
                    error: err,
                  },
                });
                return;
              }
              const uid = response.toString("hex").toUpperCase();
              this.onCompleteMessage(uid);
              // Once the message transmitted, disconnect from the lib
              reader.disconnect(reader.SCARD_LEAVE_CARD, (err) => {
                if (err) {
                  this.commandBus.fireEvent({
                    label: "nfc-error",
                    type: "error",
                    message: "❌ Erreur de déconnexion PCSC",
                    payload: {
                      error: err,
                    },
                  });
                  return;
                }
              });
            });
          }
        );
      });
    });
  }
  onCompleteMessage(data: string) {
    this.commandBus.fireEvent({
      label: "nfc-hit",
      type: "info",
      message: `📡 Hit PCSC: ${data}`,
      payload: {
        trace: data,
      },
    });
  }
}
