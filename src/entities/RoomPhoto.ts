// src/entities/RoomPhoto.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Room } from "./Room";

@Entity("room_photos")
export class RoomPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, (room) => room.photos, { onDelete: "CASCADE" })
  @JoinColumn({ name: "room_id" })
  room: Room;

  @Column()
  room_id: number;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column()
  image_url: string;

  @CreateDateColumn()
  created_at: Date;
}
