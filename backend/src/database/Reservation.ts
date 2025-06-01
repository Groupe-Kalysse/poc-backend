import {BaseEntity,Entity,PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm"

@Entity()
export class Reservation extends BaseEntity {
    @PrimaryGeneratedColumn()
    readonly id:number;

    @Column()
    lockerNumber:number;

    @Column()
    badgeTrace:string;

    @CreateDateColumn()
    createdAt: Date;
}