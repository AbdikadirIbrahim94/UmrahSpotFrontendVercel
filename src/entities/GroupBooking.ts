import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Agent } from "./Agent";

export enum GroupBookingStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  ON_HOLD = "on_hold",
}

export interface RoomOccupancy {
  room_id: number;
  room_name: string;
  room_option_id: string;
  occupancy: string;
  max_guests: number;
  base_meal_plan: string;
  qty: number;
}

export interface RoomsPayload {
  makkah: Record<string, number>;
  makkahOccupancy: RoomOccupancy[];
  madinah: Record<string, number>;
  madinahOccupancy: RoomOccupancy[];
  sameRooms: boolean;
}

export interface DatesPayload {
  makkahIn: string;
  makkahOut: string;
  madinahIn: string;
  madinahOut: string;
}

export interface ServicesPayload {
  visa: string;
  transport: string;
}

export interface TotalsPayload {
  totalRooms: number;
  totalPax: number;
  totalNights: number;
}

@Entity("group_bookings")
export class GroupBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "agent_id" })
  agentId: number;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: "agent_id" })
  agent: Agent;

  @Column()
  groupName: string;

  // Hotel is either a real id (as a string, since the frontend <select> gives you a string)
  // or the literal "suggest" when the agent picked "Let UmrahSpot suggest".
  @Column({ name: "makkah_hotel_id" })
  makkahHotelId: string;

  @Column({ name: "makkah_hotel_name" })
  makkahHotelName: string;

  @Column({ name: "madinah_hotel_id" })
  madinahHotelId: string;

  @Column({ name: "madinah_hotel_name" })
  madinahHotelName: string;

  @Column({ type: "jsonb" }) // Change to "json" if using MySQL
  rooms: RoomsPayload;

  @Column({ type: "jsonb" })
  dates: DatesPayload;

  @Column({ type: "jsonb" })
  services: ServicesPayload;

  @Column({ type: "jsonb" })
  totals: TotalsPayload;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({
    type: "enum",
    enum: GroupBookingStatus,
    default: GroupBookingStatus.PENDING,
  })
  status: GroupBookingStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}