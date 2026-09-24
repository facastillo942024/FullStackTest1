export interface CustomerProps {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt?: Date;
}

export class Customer {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly createdAt: Date;

  constructor(props: CustomerProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.email = props.email;
    this.phoneNumber = props.phoneNumber;
    this.createdAt = props.createdAt ?? new Date();
  }
}
