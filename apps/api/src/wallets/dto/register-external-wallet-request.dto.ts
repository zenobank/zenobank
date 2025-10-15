import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEthereumAddress } from 'class-validator';

export class RegisterExternalWalletDto {
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  @Transform(({ value }) => value.toLowerCase())
  address: string;
}
