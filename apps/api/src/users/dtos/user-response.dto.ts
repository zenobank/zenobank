import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { StoreResponseDto } from 'src/stores/dtos/store-response.dto';

export class UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @Type(() => StoreResponseDto)
  @ApiProperty({
    description: 'The user&apos;s stores',
    type: [StoreResponseDto],
  })
  stores: StoreResponseDto[];
}
