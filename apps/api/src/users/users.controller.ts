import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateStoreDto } from '../stores/dtos/create-store.dto';
import { StoreResponseDto } from '../stores/dtos/store-response.dto';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { type AuthenticatedRequest } from 'src/auth/auth.interface';
import { UserResponseDto } from './dtos/user-response.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    const user = await this.usersService.getUser(req.userId);

    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @ApiOperation({
    summary: 'Create initial backend resources for the newly signed-up user',
  })
  @UseGuards(AuthGuard)
  @Post('me/bootstrap')
  async bootstrap(@Req() req: AuthenticatedRequest): Promise<any> {
    // COOKIES
    console.log(req.cookies);
    return this.usersService.bootstrap(req.userId);
  }

  @UseGuards(AuthGuard)
  @Get('test')
  async test(@Req() req: AuthenticatedRequest) {
    console.log(req.userId);
    return 'test';
  }
}
