import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("booking_tajpark")
export class BookingTajpark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  stripe_payment_id: string;

  @Column()
  guest_name: string;

  @Column()
  guest_email: string;

  @Column({ type: "jsonb", nullable: true })
  guest_details: any;

  @Column({ type: "date" })
  check_in: string;

  @Column({ type: "date" })
  check_out: string;

  @Column({ type: "jsonb" })
  rooms: any;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  amount_paid: number;

  @Column({
    default: "pending",
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}