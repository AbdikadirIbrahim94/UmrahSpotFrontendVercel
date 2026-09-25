import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { City } from "./City";
import { Room } from "./Room";
import { Review } from "./Review";
import { HotelPhoto } from "./HotelPhoto";

@Entity("hotels")
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable:false,
    unique:true,
    type:"text"
  })
  name_id:string

  // RELATION: Many hotels -> one city
  @ManyToOne(() => City, (city) => city.hotels, { onDelete: "CASCADE" })
  @JoinColumn({ name: "city_id" })
  city: City;

  @OneToMany(() => Review, (review) => review.hotel)
  reviews: Review[];

  @OneToMany(() => HotelPhoto, (photo) => photo.hotel)
  photos: HotelPhoto[];

  @Column({ nullable: true })
  city_id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, type: "int" })
  distance_haram_mitres: number | null;

  @Column({ nullable: true, type: "int" })
  distance_haram_minutes: number | null;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({type:"text" , nullable:false})
  location_map_url:string

  @Column({type:"text" , nullable:true})
  child_policy:string

  @Column({type:"text" , nullable:true})
  cancellation_policy:string

  @Column({ type: "varchar", nullable: true })
  youtube_video_url: string | null;

  @Column({ type: "float", default: 0 })
  rating: number;

  @Column({ type: "text", nullable: false })
  check_in_from: string;

  @Column({ type: "text", nullable: false })
  check_out_until: string;

  @Column({ type: "varchar", nullable: true })
  google_comments_url: string | null;

  @Column({ type: "varchar", nullable: true })
  image_url: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price: number | null;

  @Column({ type: "jsonb", nullable: true })
  amenities: any;

  @Column({ type: "jsonb", nullable: true })
  services: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  nearby_places: Record<string, any>;

  // RELATION: One hotel -> many rooms
  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
