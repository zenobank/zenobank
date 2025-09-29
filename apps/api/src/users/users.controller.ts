import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { type AuthenticatedRequest } from 'src/auth/auth.interface';
import { UserResponseDto } from './dtos/user-response.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get the current user data',
  })
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
    return this.usersService.bootstrap(req.userId);
  }
}
