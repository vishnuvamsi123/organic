import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { IsInt, Min } from 'class-validator';

@Entity()
export class DeliveryPartner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  phone!: string;

  @Column('float')
  lat!: number;
  @Column('float')
  lon!: number;

  @Column('float')
  @Min(0)
  rating!: number; // average rating

  @Column('int')
  @Min(0)
  reviewCount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
