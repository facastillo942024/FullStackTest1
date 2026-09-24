import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IdGeneratorPort } from '../../domain/ports/id-generator.port';

@Injectable()
export class UuidIdGenerator implements IdGeneratorPort {
  generate(): string {
    return uuidv4();
  }
}
