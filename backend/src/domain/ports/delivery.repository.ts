import { Result } from '../result/result';
import { Delivery } from '../entities/delivery';
import { PersistenceError } from '../errors/domain-error';

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface DeliveryRepository {
  save(delivery: Delivery): Promise<Result<Delivery, PersistenceError>>;
  findById(id: string): Promise<Result<Delivery | null, PersistenceError>>;
}
