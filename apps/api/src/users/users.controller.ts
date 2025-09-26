import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStoreDto } from './dtos/create-store.dto';
import { StoreResponseDto } from './dtos/store-response.dto';
import { UsersService } from './users.service';
import { UserResponseDto } from './dtos/user-response.dto';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Post('/store')
  @ApiOperation({ summary: 'Create a new store' })
  async createStore(@Body() body: CreateStoreDto): Promise<StoreResponseDto> {
    return this.usersService.createStore(body);
  }
  // @Get('me')
  // async getMe(@Req() req: Request): Promise<UserResponseDto> {

  //   const user = await this.usersService.getUser('');
  //   if (!user) {
  //     throw new NotFoundException();
  //   }
  //   return user;
  // }
}
