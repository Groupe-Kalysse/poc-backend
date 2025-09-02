import CommBus from "../CommBus";

export default class MockReader {
  private commandBus: CommBus;
  private emitInterval = 5_000;
  private success = true;

  constructor(commandBus: CommBus) {
    this.commandBus = commandBus;
    this.initialize();
  }

  initialize() {
    setInterval(() => {
      if (this.success) this.onCompleteMessage("This_Is_Fine");
      else
        this.commandBus.fireEvent({
          label: "nfc-error",
          type: "error",
          message: "❌ Erreur (factice) de lecture Mock",
          payload: {
            error: new Error("❌ Erreur (factice) de lecture Mock"),
          },
        });
    }, this.emitInterval);
  }

  onCompleteMessage(data: string) {
    this.commandBus.fireEvent({
      label: "nfc-hit",
      type: "info",
      message: `📡 Hit HID: ${data}`,
      payload: {
        trace: data,
      },
    });
  }
}
