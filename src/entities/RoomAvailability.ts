import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Room } from "./Room.js";

@Entity()
export class RoomAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => Room, (room) => room.availability)
  // room: Room;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ nullable: true })
  reason: string;
}
