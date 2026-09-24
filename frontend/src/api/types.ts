export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl: string;
}

export type TransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'ERROR';

export interface TransactionView {
  id: string;
  status: TransactionStatus;
  gatewayTransactionId: string | null;
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  amountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalInCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  productId: string;
  quantity: number;
  customer: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  delivery: {
    addressLine: string;
    city: string;
    region: string;
    postalCode: string;
  };
}

export interface PayPayload {
  card: {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
  };
}

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
}
