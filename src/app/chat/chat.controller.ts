import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GenerateRoomcodeDto } from './dto/generateRoomCode.dto';
import { JwtAuthGuard } from 'src/utilities/guards/jwt.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('generate-room-code')
  generateRoomCode(@Body() data: GenerateRoomcodeDto) {
    return this.chatService.generateRoomcode(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getListChat(@Req() req) {
    return this.chatService.listChat(req.id);
  }
}
