import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateStoreDto } from './dtos/create-store.dto';
import { StoreResponseDto } from './dtos/store-response.dto';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { type AuthenticatedRequest } from 'src/auth/auth.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Post('/store')
  @ApiOperation({ summary: 'Create a new store' })
  async createStore(@Body() body: CreateStoreDto): Promise<StoreResponseDto> {
    return this.usersService.createStore(body);
  }
  @UseGuards(AuthGuard)
  @Get('test')
  async getMe(@Req() req: AuthenticatedRequest): Promise<any> {
    this.logger.log(req.user);
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
