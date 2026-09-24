import { Customer } from '../../../domain/entities/customer';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';

export class CustomerMapper {
  static toDomain(orm: CustomerOrmEntity): Customer {
    return new Customer({
      id: orm.id,
      fullName: orm.fullName,
      email: orm.email,
      phoneNumber: orm.phoneNumber,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: Customer): CustomerOrmEntity {
    const orm = new CustomerOrmEntity();
    orm.id = domain.id;
    orm.fullName = domain.fullName;
    orm.email = domain.email;
    orm.phoneNumber = domain.phoneNumber;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
