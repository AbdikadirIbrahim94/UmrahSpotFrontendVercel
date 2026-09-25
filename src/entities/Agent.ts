  import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";

  @Entity("agents")
  export class Agent {
    @PrimaryGeneratedColumn()
    id: number;

    // Personal Details
    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    phone_number: string;

    // Authentication
    @Column()
    password: string;

    // Business Details (Optional)
    @Column({ nullable: true })
    agency_name: string;

    @Column({ nullable: true, unique: true })
    agency_code: string;

    @Column({ nullable: true })
    tax_id: string; // GST, VAT, EIN, etc.

    @Column({ nullable: true })
    company_name: string;

    // Location (Optional)
    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    postal_code: string;

    // Account
    @Column({ default: false })
    is_verified: boolean;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
  }