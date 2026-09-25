import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("bookings2")
export class Booking2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  reservation_number: string;

  @Column({ unique: true })
  booking_number: string;

  @Column({ nullable: true })
  user_id: number;

  @Column()
  hotel_id: number;

  @Column({ type: "date" })
  check_in: string;

  @Column({ type: "date" })
  check_out: string;

  @Column({ type: "int" })
  total_guests: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total_price: number;

  @Column({ length: 10 })
  currency: string;

  @Column({
    type: "enum",
    enum: ["booked", "cancelled", "completed"],
    default: "booked",
  })
  status: string;

  @Column({
    type: "enum",
    enum: ["pending", "paid", "failed"],
    default: "pending",
  })
  payment_status: string;

  @Column({ type: "text", nullable: true })
  cancellation_policy: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
