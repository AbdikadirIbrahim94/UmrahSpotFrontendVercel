import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Hotel } from "./Hotel.js";

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable:false,
    unique:true,
    type:String
  })
  name: string; // e.g., Makkah, Madina

  @Column({ nullable: true })
  country: string;

  // @OneToMany(() => Hotel, (hotel) => hotel.location)
  // hotels: Hotel[];
}
