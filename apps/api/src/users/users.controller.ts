import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStoreDto } from './dtos/create-store.dto';
import { StoreResponseDto } from './dtos/store-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/store')
  @ApiOperation({ summary: 'Create a new store' })
  async createStore(@Body() body: CreateStoreDto): Promise<StoreResponseDto> {
    return this.usersService.createStore(body);
  }
}
