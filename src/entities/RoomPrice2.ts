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

@Unique([
    "room_option_id",
    "season_code",
    "start_date",
    "end_date"
])
@Entity("room_prices_v2")
export class RoomPriceV2 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    room_option_id: string;

    @Column({
        type: "varchar",
        length: 255,
        nullable: true,
    })
    season_code!: string | null;

    @Column({ type: "date" })
    start_date: Date;

    @Column({ type: "date" })
    end_date: Date;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2
    })
    weekday_price: number;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2
    })
    weekend_price: number;

    @Column({
        type: "int",
        nullable: true,
        default: 1
    })
    minimum_stay: number | null;

    @Column()
    unique_key: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}