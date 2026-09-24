/**
 * Application-level command shapes. These are plain data structures used to
 * pass intent into the use cases, independent of the HTTP/transport layer.
 */

export interface CustomerInput {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface DeliveryInput {
  addressLine: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface CardInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface CreateTransactionCommand {
  productId: string;
  quantity: number;
  customer: CustomerInput;
  delivery: DeliveryInput;
}

export interface ProcessPaymentCommand {
  transactionId: string;
  card: CardInput;
}
