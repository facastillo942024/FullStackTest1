import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'deliveries' })
export class DeliveryOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @Column({ name: 'address_line', type: 'varchar', length: 512 })
  addressLine!: string;

  @Column({ type: 'varchar', length: 128 })
  city!: string;

  @Column({ type: 'varchar', length: 128 })
  region!: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 32 })
  postalCode!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
