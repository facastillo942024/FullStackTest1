export interface DeliveryProps {
  id: string;
  customerId: string;
  addressLine: string;
  city: string;
  region: string;
  postalCode: string;
  createdAt?: Date;
}

export class Delivery {
  readonly id: string;
  readonly customerId: string;
  readonly addressLine: string;
  readonly city: string;
  readonly region: string;
  readonly postalCode: string;
  readonly createdAt: Date;

  constructor(props: DeliveryProps) {
    this.id = props.id;
    this.customerId = props.customerId;
    this.addressLine = props.addressLine;
    this.city = props.city;
    this.region = props.region;
    this.postalCode = props.postalCode;
    this.createdAt = props.createdAt ?? new Date();
  }
}
