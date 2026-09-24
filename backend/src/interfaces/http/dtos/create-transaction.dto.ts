import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CustomerDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+573001112233' })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;
}

export class DeliveryDto {
  @ApiProperty({ example: 'Calle 123 # 45-67' })
  @IsString()
  @IsNotEmpty()
  addressLine!: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  @IsNotEmpty()
  region!: string;

  @ApiProperty({ example: '110111' })
  @IsString()
  @IsNotEmpty()
  postalCode!: string;
}

export class CreateTransactionDto {
  @ApiProperty({ example: '2f8b1c4e-1111-2222-3333-444455556666' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ type: CustomerDto })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  @ApiProperty({ type: DeliveryDto })
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery!: DeliveryDto;
}
