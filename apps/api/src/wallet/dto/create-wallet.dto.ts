import { IsString, IsNotEmpty, IsEthereumAddress } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  address: string;
}
