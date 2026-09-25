import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

interface BookingExtra {
  name: string;
  price: number;
}

@Entity("booking_rooms")
export class BookingRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  booking_id: number;

  @Column()
  deal_id: number;

  @Column()
  hotel_id: number;

  @Column()
  room_id: number;
  
  @Column()
  room_option_id: number;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: "json", nullable: true })
  extras: BookingExtra[];

  @Column({ type: "decimal", precision: 10, scale: 2 })
  room_total: number;

  @Column({ type: "date" })
  check_in: string;

  @Column({ type: "date" })
  check_out: string;
}
