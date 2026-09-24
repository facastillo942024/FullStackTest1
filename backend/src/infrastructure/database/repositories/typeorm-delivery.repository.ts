import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result, fromPromise } from '../../../domain/result/result';
import { Delivery } from '../../../domain/entities/delivery';
import { PersistenceError } from '../../../domain/errors/domain-error';
import { DeliveryRepository } from '../../../domain/ports/delivery.repository';
import { DeliveryOrmEntity } from '../entities/delivery.orm-entity';
import { DeliveryMapper } from '../mappers/delivery.mapper';

const toPersistenceError = (reason: unknown): PersistenceError =>
  new PersistenceError(
    reason instanceof Error ? reason.message : String(reason),
  );

@Injectable()
export class TypeormDeliveryRepository implements DeliveryRepository {
  constructor(
    @InjectRepository(DeliveryOrmEntity)
    private readonly repo: Repository<DeliveryOrmEntity>,
  ) {}

  async save(delivery: Delivery): Promise<Result<Delivery, PersistenceError>> {
    const result = await fromPromise(
      this.repo.save(DeliveryMapper.toOrm(delivery)),
      toPersistenceError,
    );
    return result.map(DeliveryMapper.toDomain);
  }

  async findById(
    id: string,
  ): Promise<Result<Delivery | null, PersistenceError>> {
    const result = await fromPromise(
      this.repo.findOne({ where: { id } }),
      toPersistenceError,
    );
    return result.map((row) => (row ? DeliveryMapper.toDomain(row) : null));
  }
}
