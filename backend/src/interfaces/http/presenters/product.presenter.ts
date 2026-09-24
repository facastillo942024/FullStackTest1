import { Product } from '../../../domain/entities/product';

export interface ProductView {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl: string;
}

export const toProductView = (product: Product): ProductView => ({
  id: product.id,
  name: product.name,
  description: product.description,
  priceInCents: product.priceInCents,
  stock: product.stock,
  imageUrl: product.imageUrl,
});
