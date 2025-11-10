import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CommandLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  label: string;

  @Column()
  type: "error" | "warning" | "info" | "debug";

  @Column()
  message: string;

  @Column()
  payload?: string; // TODO: Record<string, string>;

  @Column()
  createdAt: Date;
}
