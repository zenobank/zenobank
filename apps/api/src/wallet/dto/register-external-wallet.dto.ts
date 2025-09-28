import {
  IsString,
  IsNotEmpty,
  IsEthereumAddress,
  IsUUID,
} from 'class-validator';

export class RegisterExternalWalletDto {
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  address: string;

  @IsString()
  @IsNotEmpty()
  storeId: string;
}
