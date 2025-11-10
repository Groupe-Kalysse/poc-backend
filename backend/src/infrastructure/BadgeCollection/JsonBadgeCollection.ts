import badges from "../../config/badges.json";
import CommBus, { Command } from "../CommBus";

export class JsonBadgeCollection {
  private commandBus: CommBus;

  constructor(commandBus: CommBus) {
    this.commandBus = commandBus;
    this.commandBus.listenEvent("nfc-hit", this.findBadgeFromNfc);
  }
  findBadgeFromNfc = (command: Command) => {
    const nfcTrace = command.payload?.trace as string;
    const badge = badges.find((candidate) => candidate.id === nfcTrace);
    if (badge)
      this.commandBus.fireEvent({
        label: "badge-hit",
        type: "info",
        message: `🪪 Badge reconnu: ${badge.name}`,
        payload: {
          data: badge,
        },
      });
    else
      this.commandBus.fireEvent({
        label: "badge-miss",
        type: "warning",
        message: `⚠️ Badge non reconnu: ${nfcTrace}`,
        payload: {
          data: nfcTrace,
        },
      });
  };
  getList = () => {
    return badges;
  };
}
