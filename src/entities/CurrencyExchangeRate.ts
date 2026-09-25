import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from "typeorm";

@Entity("currency_exchange_rates")
export class CurrencyExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 10, nullable: false })
  from_currency: string;

  @Column({ type: "varchar", length: 10, nullable: false })
  to_currency: string;

  @Column({ type: "decimal", precision: 12, scale: 8, nullable: false })
  market_rate: number;

  @Column({ type: "decimal", precision: 12, scale: 8, nullable: false })
  umrahspot_rate: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}