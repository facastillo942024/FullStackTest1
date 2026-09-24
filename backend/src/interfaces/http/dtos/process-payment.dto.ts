import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';

export class CardDto {
  @ApiProperty({ example: '4242424242424242' })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'cvc must be 3 or 4 digits' })
  cvc!: string;

  @ApiProperty({ example: '08' })
  @IsString()
  @Matches(/^\d{1,2}$/, { message: 'expMonth must be 1-2 digits' })
  expMonth!: string;

  @ApiProperty({ example: '28' })
  @IsString()
  @Matches(/^\d{2}$/, { message: 'expYear must be 2 digits (YY)' })
  expYear!: string;

  @ApiProperty({ example: 'JUAN PEREZ' })
  @IsString()
  @IsNotEmpty()
  cardHolder!: string;
}

export class ProcessPaymentDto {
  @ApiProperty({ type: CardDto })
  @ValidateNested()
  @Type(() => CardDto)
  card!: CardDto;
}
