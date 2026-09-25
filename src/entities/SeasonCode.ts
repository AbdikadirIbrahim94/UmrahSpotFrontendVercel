import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("season_codes")
export class SeasonCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text",
    unique: true,
    nullable: false
  })
  season_code_id: string;

  @Column({
    type: "text",
    nullable: false
  })
  name: string;

  @Column({
    type: "text",
    nullable: false
  })
  description: string;

  @Column({ type: "date", nullable: false })
  start_date: string; 

  @Column({ type: "date", nullable: false })
  end_date: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
