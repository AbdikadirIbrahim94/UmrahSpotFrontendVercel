import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Room } from "./Room";

@Entity("room_extras")
export class RoomExtra {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, (room) => room, { onDelete: "CASCADE" })
  @JoinColumn({ name: "room_id" })
  room: Room;

  @Column({ nullable: true })
  room_id: number;

  @Column()
  name: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  created_at: Date;
}
