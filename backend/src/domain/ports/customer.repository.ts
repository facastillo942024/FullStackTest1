import { Result } from '../result/result';
import { Customer } from '../entities/customer';
import { PersistenceError } from '../errors/domain-error';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepository {
  save(customer: Customer): Promise<Result<Customer, PersistenceError>>;
  findById(id: string): Promise<Result<Customer | null, PersistenceError>>;
}
