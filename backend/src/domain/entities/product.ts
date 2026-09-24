import { Result, ok, err } from '../result/result';
import { InsufficientStockError } from '../errors/domain-error';

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl: string;
  createdAt?: Date;
}

/**
 * Product aggregate. Owns the stock invariant: stock can never go below zero.
 */
export class Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priceInCents: number;
  private _stock: number;
  readonly imageUrl: string;
  readonly createdAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    // Coerce numeric fields: some DB drivers return integer columns as strings.
    this.priceInCents = Number(props.priceInCents);
    this._stock = Number(props.stock);
    this.imageUrl = props.imageUrl;
    this.createdAt = props.createdAt ?? new Date();
  }

  get stock(): number {
    return this._stock;
  }

  hasStock(quantity: number): boolean {
    return this._stock >= quantity;
  }

  /**
   * Decrements stock by `quantity`. Returns a failure on the ROP track if there
   * is not enough stock, keeping the invariant intact.
   */
  decrementStock(quantity: number): Result<Product, InsufficientStockError> {
    if (quantity <= 0) {
      return ok(this);
    }
    if (!this.hasStock(quantity)) {
      return err(new InsufficientStockError(this._stock, quantity));
    }
    this._stock -= quantity;
    return ok(this);
  }
}
