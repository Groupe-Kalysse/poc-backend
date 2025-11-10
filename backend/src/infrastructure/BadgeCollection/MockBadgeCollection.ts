import CommBus, { Command } from "../CommBus";

export class MockBadgeCollection {
  private commandBus: CommBus;
  private success = true;
  private badges = [
    {
      id: "42",
      name: "Kalysse",
      role: "staff",
    },
  ];

  constructor(commandBus: CommBus) {
    this.commandBus = commandBus;
    this.commandBus.listenEvent("nfc-hit", this.findBadgeFromNfc);
  }
  findBadgeFromNfc = (_command: Command) => {
    if (this.success)
      this.commandBus.fireEvent({
        label: "badge-hit",
        type: "info",
        message: `🪪 Badge reconnu: Kalysse`,
        payload: {
          data: this.badges[0],
        },
      });
    else
      this.commandBus.fireEvent({
        label: "badge-miss",
        type: "warning",
        message: "⚠️ Badge non reconnu: WrongBadge",
        payload: {
          data: "WrongBadge",
        },
      });
  };
  getList() {
    return this.badges;
  }
}
