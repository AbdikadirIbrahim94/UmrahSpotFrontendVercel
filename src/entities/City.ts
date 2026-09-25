import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Hotel } from "./Hotel";

@Entity("cities")
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  // RELATION: One city -> many hotels
  @OneToMany(() => Hotel, (hotel) => hotel.city)
  hotels: Hotel[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
