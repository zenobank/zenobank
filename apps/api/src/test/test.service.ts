import { Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';

@Injectable()
export class TestService {
  create(createTestDto: CreateTestDto) {
    console.log(createTestDto);
    return 'This action adds a new test';
  }
}
