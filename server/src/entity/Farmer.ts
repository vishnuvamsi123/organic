import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Product } from './Product';
import { Review } from './Review';

@Entity()
export class Farmer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('float')
  rating!: number; // average rating, default 0

  @Column('int')
  reviewCount!: number; // number of reviews received

  @Column('float')
  lat!: number; // geographic location

  @Column('float')
  lon!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ unique: true, nullable: true })
email?: string;

@Column({ unique: true, nullable: true })
phone?: string;

@Column({ nullable: true })
passwordHash?: string;

  // Relations (optional for now)
  @OneToMany(() => Product, (product) => product.farmer)
  products?: Product[];

  @OneToMany(() => Review, (review) => review.farmer)
  reviews?: Review[];
}
