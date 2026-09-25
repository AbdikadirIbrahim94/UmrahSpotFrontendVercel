import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  booking_id: number;

  @Column()
  method: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ default: "USD" })
  currency: string;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({
    type: "enum",
    enum: ["success", "failed", "pending"],
    default: "pending",
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
