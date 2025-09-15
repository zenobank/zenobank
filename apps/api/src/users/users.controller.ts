import { Body, Controller, Post } from '@nestjs/common';
import { CreateStoreDto } from './dtos/create-store.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/store')
  async createStore(@Body() body: CreateStoreDto) {
    return this.usersService.createStore(body);
  }
}
