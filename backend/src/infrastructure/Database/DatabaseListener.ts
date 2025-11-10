import CommBus from "../CommBus";

export default class DatabaseListener {
  private commandBus: CommBus;

  constructor(commandBus: CommBus) {
    this.commandBus = commandBus;
    this.commandBus.listenEvent("serial-open", this.onError);
  }

  onError() {
    // TODO Log error to DB
  }

  onClose() {
    // TODO Log closing to DB
  }
}
