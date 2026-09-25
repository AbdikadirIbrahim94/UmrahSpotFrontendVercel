import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Hotel } from "./Hotel";

@Entity("hotel_markup_rates")
export class HotelMarkupRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  hotel_id: number;

  // Relation without foreign key constraint (handled on model side)
  @ManyToOne(() => Hotel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "hotel_id" })
  hotel: Hotel;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: false, default: 0 })
  fee_buffer_rate: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: false, default: 0 })
  profit_margin_rate: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: false, default: 0 })
  total_markup_rate: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}