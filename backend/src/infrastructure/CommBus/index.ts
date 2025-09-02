import chalk from "chalk";

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
        console.log(chalk.red(message));
        break;
      case "warning":
        console.log(chalk.yellow(message));
        break;
      case "info":
        console.log(chalk.green(message));
        break;
      case "debug":
        console.log(chalk.cyan(message));
        break;
    }
  }
}
