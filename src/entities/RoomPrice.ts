import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  Unique
} from "typeorm";
import { Hotel } from "./Hotel";
import { RoomOccupancy } from "./RoomOccupancy";
import { SeasonCode } from "./SeasonCode";

@Entity("room_prices")
@Unique("IDX_UNIQUE_ROOM_PRICE", [
  "hotel_id",
  "room_option_id",
  "season_code",
  "start_date",
  "end_date",
  "day_type"
])
@Index("IDX_ROOM_PRICES_HOTEL_SEASON", ["hotel_id", "season_code"])
@Index("IDX_ROOM_PRICES_DATE_RANGE", ["start_date", "end_date"])
export class RoomPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  hotel_id: string;

  @Column({ type: "varchar", length: 255 })
  room_option_id: string;

  @Column({ type: "varchar", length: 255 })
  season_code: string;

  // Date range for pricing
  @Column({ type: "date" })
  start_date: Date;

  @Column({ type: "date" })
  end_date: Date;

  // Day type
  @Column({ 
    type: "varchar", 
    length: 20,
    comment: "WEEKDAY or WEEKEND"
  })
  day_type: "WEEKDAY" | "WEEKEND";

  // Base cost
  @Column({ 
    type: "decimal", 
    precision: 10, 
    scale: 2,
    comment: "Base cost in Saudi Riyals"
  })
  cost_sar: number | null;

  // Meal plan costs
  @Column({ 
    type: "decimal", 
    precision: 10, 
    scale: 2,
    nullable: true,
    comment: "Half Board cost in Saudi Riyals"
  })
  hb_cost_sar: number | null;

  @Column({ 
    type: "decimal", 
    precision: 10, 
    scale: 2,
    nullable: true,
    comment: "Full Board cost in Saudi Riyals"
  })
  fb_cost_sar: number | null;

  // Upgrade costs
  @Column({ 
    type: "decimal", 
    precision: 10, 
    scale: 2,
    default: 0,
    comment: "Bed & Breakfast upgrade cost"
  })
  bb_upgrade_sar: number | null;

  @Column({ 
    type: "decimal", 
    precision: 10, 
    scale: 2,
    default: 0,
    comment: "Half Board upgrade cost"
  })
  hb_upgrade_sar: number | null;

  @Column({ 
    type: "decimal", 
    precision: 10, 
    scale: 2,
    default: 0,
    comment: "Full Board upgrade cost"
  })
  fb_upgrade_sar: number | null;

  @Column({ 
    type: "decimal", 
    precision: 10, 
    scale: 2,
    default: 0,
    comment: "Selling price in USD"
  })
  selling_price_usd: number | null;

  @Column({ type: "varchar", length: 255 })
  unique_key: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}