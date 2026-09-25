// src/entities/RoomOccupancyPhoto.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { RoomOccupancy } from "./RoomOccupancy";

@Entity("room_occupancy_photos")
export class RoomOccupancyPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => RoomOccupancy,
    (occupancy) => occupancy.photos,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "room_occupancy_id" })
  roomOccupancy: RoomOccupancy;

  @Column()
  room_occupancy_id: number;

  @Column()
  image_url: string;

  @CreateDateColumn()
  created_at: Date;
}
