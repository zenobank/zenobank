import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBinanceConfigDto {
  @IsString()
  @IsNotEmpty()
  binanceId: string;

  @IsString()
  @IsNotEmpty()
  binanceApiKey: string;

  @IsString()
  @IsNotEmpty()
  binanceSecretKey: string;
}

export class UpdateBinanceConfigDto extends PartialType(
  CreateBinanceConfigDto,
) {}
