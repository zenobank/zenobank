import { ApiProperty } from '@nestjs/swagger';
import { Transaction, TransactionStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'The transaction hash',
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsString()
  hash: string;

  @ApiProperty({
    description: 'The sender address of the transaction',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  })
  @IsString()
  fromAddress: string;

  @ApiProperty({
    description: 'The receiver address of the transaction',
    example: '0x3da344c7a39ec1fd2431b6faa4048b89f6f5f0bc',
  })
  @IsString()
  toAddress: string;

  @ApiProperty({
    description: 'The title of the transaction',
    example: 'Transfer',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The number of confirmations of the transaction',
    example: 10,
  })
  @IsNumber()
  confirmations: number;

  @ApiProperty({
    description: 'The status of the transaction',
    example: TransactionStatus.PENDING,
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}
