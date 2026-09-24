import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'products' })
export class ProductOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'price_in_cents', type: 'integer' })
  priceInCents!: number;

  @Column({ type: 'integer' })
  stock!: number;

  @Column({ name: 'image_url', type: 'varchar', length: 1024 })
  imageUrl!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
