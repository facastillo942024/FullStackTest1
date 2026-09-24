import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { ProductsController } from './controllers/products.controller';
import { TransactionsController } from './controllers/transactions.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [ProductsController, TransactionsController, HealthController],
})
export class HttpModule {}
