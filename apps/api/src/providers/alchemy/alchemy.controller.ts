import { Body, Controller, Post } from '@nestjs/common';

@Controller('providers/alchemy')
export class AlchemyController {
  // TODO: OJO, QUE SE PARA EL WEBHOOK SI FALLA
  @Post('webhook/')
  async handleWebhook(@Body() body: any) {
    console.log(body);
    return { received: true };
  }
}
