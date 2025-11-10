import type { MixedList } from "typeorm";
import { CommandLog } from "./CommandLog";
import { Locker } from "./Locker";

// biome-ignore lint/complexity/noBannedTypes: Using same type as TypeORM library
const entities: MixedList<Function> = [CommandLog, Locker];
export default entities;
