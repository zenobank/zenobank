import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CheckoutsService } from './checkouts.service';

@Controller('checkouts')
export class CheckoutsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}
  //   @Post('')
  //   async createCheckout(@Body() createCheckoutDto: CreateCheckoutDto) {
  //     return this.checkoutsService.createCheckout(createCheckoutDto);
  //   }

  //   @Get(':id')
  //   async getCheckout(@Param('id') id: string) {
  //     return this.checkoutsService.getCheckout(id);
  //   }
  //   @Patch(':id')
  //   async updateCheckout(
  //     @Param('id') id: string,
  //     @Body() updateCheckoutDto: UpdateCheckoutDto,
  //   ) {
  //     return this.checkoutsService.updateCheckout(id, updateCheckoutDto);
  //   }
}
