import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("booking_customers")
export class BookingCustomer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  booking_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  postal_code: string;

  @Column({ type: "text", nullable: true })
  special_requests: string;
}
