import { CommandLog } from "../Database/entities/CommandLog";

export type Command = {
  label: string;
  type: "error" | "warning" | "info" | "debug";
  message: string;
  payload?: Record<string, unknown>;
};

export type Handler = (
  command: Command & { datetime: Date }
) => void | Promise<void>;

export default class CommBus {
  private handlers = new Map<string, Handler[]>();

  listenEvent(commandType: string, handler: Handler) {
    const existing = this.handlers.get(commandType) || [];
    if (!existing.includes(handler)) {
      this.handlers.set(commandType, [...existing, handler]);
    }
  }

  async fireEvent(command: Command) {
    let handlers = this.handlers.get(command.label);
    if (!handlers || handlers.length === 0) handlers = [];

    const allHandlers = [...handlers, this.logger];
    await Promise.all(
      allHandlers.map((handler) =>
        handler({ ...command, datetime: new Date() })
      )
    );
  }

  getListeners() {
    return this.handlers;
  }

  logger(command: Command & { datetime: Date }) {
    const message = `${command.datetime.toLocaleDateString(
      "fr"
    )} ${command.datetime.toLocaleTimeString("fr")} ${command.message} (${
      command.type
    })`;
    switch (command.type) {
      case "error":
        console.error(message);
        break;
      case "warning":
        console.warn(message);
        break;
      case "info":
        console.info(message);
        break;
      case "debug":
        console.debug(message);
        break;
    }
    CommandLog.create({
      createdAt: new Date(),
      label: command.label,
      payload: JSON.stringify(command.payload || {}),
      message: command.message,
      type: command.type,
    }).save();
  }
}
