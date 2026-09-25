import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "deal" })
export class Deal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: true })
  hotel_id: number;

  @Column({ type: "int", nullable: true })
  room_id: number;

  @Column({ type: "int", nullable: true })
  room_occupancy_id: number;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 50 })
  discount_type: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  deal_price: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  actual_price: number;

  @Column({ type: "date" })
  start_date: string;

  @Column({ type: "date" })
  end_date: string;

  @Column({
    type: "enum",
    enum: ["active", "inactive","soldout"],
    default: "active",
  })
  status: string;

  @Column({ type: "int", nullable: true })
  rooms_left: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
