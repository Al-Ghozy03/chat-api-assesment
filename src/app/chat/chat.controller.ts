import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GenerateRoomcodeDto } from './dto/generateRoomCode.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('generate-room-code')
  generateRoomCode(@Body() data: GenerateRoomcodeDto) {
    return this.chatService.generateRoomcode(data);
  }
}
