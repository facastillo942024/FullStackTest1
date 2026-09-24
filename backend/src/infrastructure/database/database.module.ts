import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductOrmEntity } from './entities/product.orm-entity';
import { CustomerOrmEntity } from './entities/customer.orm-entity';
import { DeliveryOrmEntity } from './entities/delivery.orm-entity';
import { TransactionOrmEntity } from './entities/transaction.orm-entity';
import { TypeormProductRepository } from './repositories/typeorm-product.repository';
import { TypeormCustomerRepository } from './repositories/typeorm-customer.repository';
import { TypeormDeliveryRepository } from './repositories/typeorm-delivery.repository';
import { TypeormTransactionRepository } from './repositories/typeorm-transaction.repository';
import { PRODUCT_REPOSITORY } from '../../domain/ports/product.repository';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository';
import { DELIVERY_REPOSITORY } from '../../domain/ports/delivery.repository';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository';

const ENTITIES = [
  ProductOrmEntity,
  CustomerOrmEntity,
  DeliveryOrmEntity,
  TransactionOrmEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: ENTITIES,
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
        logging: config.get<string>('DB_LOGGING') === 'true',
      }),
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: TypeormProductRepository,
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: TypeormCustomerRepository,
    },
    {
      provide: DELIVERY_REPOSITORY,
      useClass: TypeormDeliveryRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TypeormTransactionRepository,
    },
  ],
  exports: [
    PRODUCT_REPOSITORY,
    CUSTOMER_REPOSITORY,
    DELIVERY_REPOSITORY,
    TRANSACTION_REPOSITORY,
  ],
})
export class DatabaseModule {}
