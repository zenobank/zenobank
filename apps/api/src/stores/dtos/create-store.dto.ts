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

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'my-store.com',
  })
  @MaxLength(256)
  domain: string;

  @IsNotEmpty()
  @IsEthereumAddress()
  @ApiProperty({
    example: '0xc429e068b65b3462f0e422b3ea388a7a37b23bff',
  })
  @Transform(({ value }) => value?.toLowerCase())
  walletAddress: string;
}
