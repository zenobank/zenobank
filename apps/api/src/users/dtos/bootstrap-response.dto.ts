import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BootstrapResponseDto {
  @Expose()
  @ApiProperty({
    example: false,
  })
  alreadyExists: boolean;
}
