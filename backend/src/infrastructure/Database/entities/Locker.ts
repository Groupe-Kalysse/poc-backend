import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Locker extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  lockerNumber: string;

  @Column()
  status: "open" | "closed" | "claimed";

  @Column({ nullable: true })
  unlockBadge?: string;

  @Column({ nullable: true })
  unlockCode?: string;
}
