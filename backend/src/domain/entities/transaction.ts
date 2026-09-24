export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface TransactionProps {
  id: string;
  wompiTransactionId?: string | null;
  customerId: string;
  productId: string;
  deliveryId: string;
  quantity: number;
  amountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  status: TransactionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Transaction aggregate. Encapsulates the state machine of a payment:
 * PENDING -> APPROVED | DECLINED | ERROR.
 */
export class Transaction {
  readonly id: string;
  private _gatewayTransactionId: string | null;
  readonly customerId: string;
  readonly productId: string;
  readonly deliveryId: string;
  readonly quantity: number;
  readonly amountInCents: number;
  readonly baseFeeInCents: number;
  readonly deliveryFeeInCents: number;
  private _status: TransactionStatus;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this._gatewayTransactionId = props.wompiTransactionId ?? null;
    this.customerId = props.customerId;
    this.productId = props.productId;
    this.deliveryId = props.deliveryId;
    this.quantity = Number(props.quantity);
    // Coerce to numbers defensively: values may originate from env/config or a
    // DB driver that returns integers as strings, which would break arithmetic.
    this.amountInCents = Number(props.amountInCents);
    this.baseFeeInCents = Number(props.baseFeeInCents);
    this.deliveryFeeInCents = Number(props.deliveryFeeInCents);
    this._status = props.status;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get status(): TransactionStatus {
    return this._status;
  }

  get gatewayTransactionId(): string | null {
    return this._gatewayTransactionId;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Total amount charged to the customer (product + fees). */
  get totalInCents(): number {
    return this.amountInCents + this.baseFeeInCents + this.deliveryFeeInCents;
  }

  isFinalized(): boolean {
    return this._status !== 'PENDING';
  }

  linkGatewayTransaction(gatewayId: string): void {
    this._gatewayTransactionId = gatewayId;
    this.touch();
  }

  markApproved(gatewayId?: string): void {
    if (gatewayId) {
      this._gatewayTransactionId = gatewayId;
    }
    this._status = 'APPROVED';
    this.touch();
  }

  markDeclined(gatewayId?: string): void {
    if (gatewayId) {
      this._gatewayTransactionId = gatewayId;
    }
    this._status = 'DECLINED';
    this.touch();
  }

  markError(): void {
    this._status = 'ERROR';
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
