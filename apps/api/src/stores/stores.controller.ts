import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from 'src/stores/dtos/create-store.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // @UseGuards(AuthGuard)
  // @Post()
  // @ApiOperation({ summary: 'Create a new store' })
  // async createStore(@Body() createStoreDto: CreateStoreDto) {
  //   return this.storesService.createStore(createStoreDto);
  // }
}
