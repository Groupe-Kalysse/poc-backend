import * as dotenv from "dotenv";
import {DataSource} from "typeorm";
import { Reservation } from "./Reservation";

dotenv.config();
const {DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD} = process.env

export const dataSource = new DataSource({
    entities:[Reservation],
    synchronize: true,
    logging: false,

    type: "postgres",
    host: DB_HOST,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
})