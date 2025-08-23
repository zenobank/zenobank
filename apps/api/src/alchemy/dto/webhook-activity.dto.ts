import { IsString } from 'class-validator';

export class WebhookActivityDto {
  @IsString()
  address: string;

  @IsString()
  network: string;
}
