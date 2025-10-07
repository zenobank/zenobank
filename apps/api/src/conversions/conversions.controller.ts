import { Controller, Get, Query } from '@nestjs/common';
import { ConversionsService } from './conversions.service';

@Controller('conversions')
export class ConversionsController {
  constructor(private readonly conversionsService: ConversionsService) {}
  //   @Get('convert')
  //   async convert(
  //     @Query('from') from: string,
  //     @Query('to') to: string,
  //     @Query('amount') amount: string,
  //   ) {
  //     return this.conversionsService.convert({ from, to, amount });
  //   }
}
