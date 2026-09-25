import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Hotel } from "./Hotel";
import { RoomType } from "./RoomType";
import { RoomPhoto } from "./RoomPhoto";
import { RoomPrice } from "./RoomPrice";
import { RoomOccupancy } from "./RoomOccupancy";
import { RoomExtra } from "./RoomExtra";

@Entity("rooms")
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  @JoinColumn({ name: "hotel_id" })
  hotel: Hotel;

  @Column({ nullable: true })
  hotel_id: number;

  @Column({ nullable: false, unique: true, type: "text" })
  room_name_id: string;

  @Column({ type: "jsonb" })
  view_from_room: string[];

  @ManyToOne(() => RoomType, (rt) => rt.rooms)
  @JoinColumn({ name: "room_type_id" })
  room_type: RoomType;

  @Column({ nullable: true })
  room_type_id: number;

  @Column()
  name: string;

  @OneToMany(() => RoomPhoto, (photo) => photo.room)
  photos: RoomPhoto[];

  @OneToMany(() => RoomExtra, (rs) => rs.room)
  room_extras: RoomExtra[];

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "int", nullable: true })
  max_guests: number;

  @Column({ nullable: true })
  bed_type: string;

  @Column({ type: "int", nullable: true })
  size_sqft: number;

  // NEW FIELDS ↓↓↓

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  base_price: number;

  // @Column({ type: "int", nullable: true })
  // default_occupancy_id: number;
  @OneToMany(() => RoomOccupancy, (occ) => occ.room)
  occupancies: RoomOccupancy[];

  // @OneToMany(() => RoomPrice, (price) => price.room)
  // prices: RoomPrice[];

  // END NEW FIELDS ↑↑↑

  @Column({ default: true })
  refundable: boolean;

  @Column({ type: "int", default: 48 })
  free_cancellation_hours: number;

  @Column({ default: false })
  breakfast_included: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price_per_night: number;

  @Column({ nullable: true })
  view_type: string;

  @Column({ type: "varchar", nullable: true })
  image_url: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
