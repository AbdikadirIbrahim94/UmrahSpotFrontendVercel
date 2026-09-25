import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Hotel } from "./Hotel";

@Entity("hotel_photos")
export class HotelPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hotel_id: number;

  @Column({ type: 'int', default: 0 })
  position: number;  // ✅ Add this field

  @ManyToOne(() => Hotel, (hotel) => hotel.photos, { onDelete: "CASCADE" })
  @JoinColumn({ name: "hotel_id" })
  hotel: Hotel;

  @Column()
  image_url: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;
}
