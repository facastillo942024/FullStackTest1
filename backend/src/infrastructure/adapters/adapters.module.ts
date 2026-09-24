import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ID_GENERATOR } from '../../domain/ports/id-generator.port';
import { FEES_PROVIDER } from '../../domain/ports/fees.port';
import { UuidIdGenerator } from './uuid-id-generator';
import { ConfigFeesProvider } from './config-fees.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: ID_GENERATOR,
      useClass: UuidIdGenerator,
    },
    {
      provide: FEES_PROVIDER,
      useClass: ConfigFeesProvider,
    },
  ],
  exports: [ID_GENERATOR, FEES_PROVIDER],
})
export class AdaptersModule {}
