import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,  } from "typeorm";
import { RoomOccupancy } from "./RoomOccupancy";
import { Hotel } from "./Hotel";
import { RoomPhoto } from "./RoomPhoto";
import { Room } from "./Room";

@Entity("room_type")
export class RoomType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable:false,type:"text"})
  name: string;

  @OneToMany(() => Room, (room) => room.room_type)
  rooms: Room[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}