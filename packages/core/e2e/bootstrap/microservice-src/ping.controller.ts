import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('ping')
export class PingController {
  @MessagePattern('ping')
  handlePing(): string {
    return 'pong';
  }
}
