import { Product } from '../../../domain/entities/product';
import { ProductOrmEntity } from '../entities/product.orm-entity';

export class ProductMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    return new Product({
      id: orm.id,
      name: orm.name,
      description: orm.description,
      priceInCents: orm.priceInCents,
      stock: orm.stock,
      imageUrl: orm.imageUrl,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.priceInCents = domain.priceInCents;
    orm.stock = domain.stock;
    orm.imageUrl = domain.imageUrl;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
