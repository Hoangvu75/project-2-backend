import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PROSPECT = 'prospect'
}

export enum PreferredChannel {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  SOCIAL_MEDIA = 'social_media',
  IN_STORE = 'in_store',
  WEBSITE = 'website'
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'simple-enum',
    enum: CustomerStatus,
    default: CustomerStatus.PROSPECT
  })
  status: CustomerStatus;

  @Column({
    type: 'simple-enum',
    enum: PreferredChannel,
    default: PreferredChannel.EMAIL
  })
  preferredChannel: PreferredChannel;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  socialMediaHandle: string;

  @Column({ nullable: true })
  whatsappNumber: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ default: true })
  marketingOptIn: boolean;

  @Column({ nullable: true })
  lastContactDate: Date;

  @Column({ nullable: true })
  customerSince: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 