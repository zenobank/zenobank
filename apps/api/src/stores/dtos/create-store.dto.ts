import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEthereumAddress,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My Store',
  })
  @MaxLength(256)
  name: string;
}
