import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { PaymentGatewayModule } from '../infrastructure/payment-gateway/payment-gateway.module';
import { AdaptersModule } from '../infrastructure/adapters/adapters.module';
import { GetProductsUseCase } from './use-cases/get-products.use-case';
import { GetProductByIdUseCase } from './use-cases/get-product-by-id.use-case';
import { CreateTransactionUseCase } from './use-cases/create-transaction.use-case';
import { ProcessPaymentUseCase } from './use-cases/process-payment.use-case';
import { GetTransactionUseCase } from './use-cases/get-transaction.use-case';

const USE_CASES = [
  GetProductsUseCase,
  GetProductByIdUseCase,
  CreateTransactionUseCase,
  ProcessPaymentUseCase,
  GetTransactionUseCase,
];

@Module({
  imports: [DatabaseModule, PaymentGatewayModule, AdaptersModule],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class ApplicationModule {}
