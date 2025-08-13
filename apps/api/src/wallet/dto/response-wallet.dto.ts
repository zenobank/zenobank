import { IsNotEmpty, IsString } from 'class-validator';

export class WalletWebhookResponseDto {
  @IsString()
  @IsNotEmpty()
  webhookId: string;

  @IsString()
  @IsNotEmpty()
  network: string;
}
