import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("hotel_extras")
export class HotelExtra {
  @PrimaryGeneratedColumn()
  id: number;

  // either "amenity" or "nearby_place"
  @Column({ type: "varchar", length: 50 })
  type: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  thumbnail: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
