import { Delivery } from '../../../domain/entities/delivery';
import { DeliveryOrmEntity } from '../entities/delivery.orm-entity';

export class DeliveryMapper {
  static toDomain(orm: DeliveryOrmEntity): Delivery {
    return new Delivery({
      id: orm.id,
      customerId: orm.customerId,
      addressLine: orm.addressLine,
      city: orm.city,
      region: orm.region,
      postalCode: orm.postalCode,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: Delivery): DeliveryOrmEntity {
    const orm = new DeliveryOrmEntity();
    orm.id = domain.id;
    orm.customerId = domain.customerId;
    orm.addressLine = domain.addressLine;
    orm.city = domain.city;
    orm.region = domain.region;
    orm.postalCode = domain.postalCode;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
