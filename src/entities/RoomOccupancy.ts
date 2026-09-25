import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from "typeorm";
import { RoomType } from "./RoomType";
import { RoomPrice } from "./RoomPrice";
import { Room } from "./Room";
import { RoomOccupancyPhoto } from "./RoomOccupancyPhoto";

@Entity("room_occupancies")
export class RoomOccupancy {
  @PrimaryGeneratedColumn()
  id: number;
  
  @ManyToOne(() => Room, (room) => room.occupancies, { onDelete: "CASCADE" })
  @JoinColumn({ name: "room_id" })
  room: Room;

  @Column()
  room_id: number;
 
  @Column({ type: "varchar", length: 255, nullable: true })
  room_option_id: string;

  @Column({ type: "text" })
  occupancy: string; // Double, Triple, Quad

  // RoomOccupancy entity
  prices?: RoomPrice[];

  @Column({ type: "int", nullable: true })
  rooms_left: number;

  @OneToMany(
    () => RoomOccupancyPhoto,
    (photo) => photo.roomOccupancy
  )
  photos: RoomOccupancyPhoto[];

  @Column({ type: "int" })
  max_guests: number;

  @Column({ nullable: true })
  image_url: string;

   // ⭐ New Field: Website Description
  @Column({ type: "text", nullable: true })
  website_description: string;

  // ⭐ New Field: Base Meal Plan
  @Column({ type: "varchar", length: 255, nullable: true })
  base_meal_plan: string;

  // @OneToMany(() => RoomPrice, (price) => price.occupancy)
  // prices: RoomPrice[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
