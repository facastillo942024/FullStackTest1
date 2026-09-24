import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction.use-case';
import { ProcessPaymentUseCase } from '../../../application/use-cases/process-payment.use-case';
import { GetTransactionUseCase } from '../../../application/use-cases/get-transaction.use-case';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';
import {
  toTransactionView,
  TransactionView,
} from '../presenters/transaction.presenter';
import { DomainHttpException } from '../filters/domain-exception.filter';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly processPayment: ProcessPaymentUseCase,
    private readonly getTransaction: GetTransactionUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a PENDING transaction (customer + delivery + amounts)',
  })
  @ApiResponse({ status: 201, description: 'Transaction created (PENDING)' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  async create(@Body() dto: CreateTransactionDto): Promise<TransactionView> {
    const result = await this.createTransaction.execute({
      productId: dto.productId,
      quantity: dto.quantity,
      customer: dto.customer,
      delivery: dto.delivery,
    });
    if (result.isErr) {
      throw new DomainHttpException(result.error);
    }
    return toTransactionView(result.value);
  }

  @Post(':id/pay')
  @ApiOperation({
    summary: 'Process the payment of a PENDING transaction via the gateway',
  })
  @ApiResponse({ status: 201, description: 'Transaction settled' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 422, description: 'Invalid card' })
  @ApiResponse({ status: 502, description: 'Payment gateway error' })
  async pay(
    @Param('id') id: string,
    @Body() dto: ProcessPaymentDto,
  ): Promise<TransactionView> {
    const result = await this.processPayment.execute({
      transactionId: id,
      card: dto.card,
    });
    if (result.isErr) {
      throw new DomainHttpException(result.error);
    }
    return toTransactionView(result.value);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction status by id' })
  @ApiResponse({ status: 200, description: 'The transaction' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string): Promise<TransactionView> {
    const result = await this.getTransaction.execute(id);
    if (result.isErr) {
      throw new DomainHttpException(result.error);
    }
    return toTransactionView(result.value);
  }
}
