import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ProductOrmEntity } from './entities/product.orm-entity';
import { CustomerOrmEntity } from './entities/customer.orm-entity';
import { DeliveryOrmEntity } from './entities/delivery.orm-entity';
import { TransactionOrmEntity } from './entities/transaction.orm-entity';

loadEnv();

export const buildDataSourceOptions = (
  env: NodeJS.ProcessEnv = process.env,
): DataSourceOptions => ({
  type: 'postgres',
  host: env.DB_HOST ?? 'localhost',
  port: Number(env.DB_PORT ?? 5432),
  username: env.DB_USERNAME ?? 'postgres',
  password: env.DB_PASSWORD ?? 'postgres',
  database: env.DB_NAME ?? 'checkout_db',
  entities: [
    ProductOrmEntity,
    CustomerOrmEntity,
    DeliveryOrmEntity,
    TransactionOrmEntity,
  ],
  synchronize: (env.DB_SYNCHRONIZE ?? 'false') === 'true',
  logging: (env.DB_LOGGING ?? 'false') === 'true',
});

export const AppDataSource = new DataSource(buildDataSourceOptions());
