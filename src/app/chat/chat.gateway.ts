import { Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { SupabaseClient } from '@supabase/supabase-js';
import { Server, Socket } from 'socket.io';
import { SUPABASE_CLIENT } from 'src/supabase/supabase.module';
import { SendMessage } from './chat.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    console.log('joined', room);
  }

  @SubscribeMessage('sendMessage')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessage,
  ) {
    console.log('Retrieve message: ', data);

    const { error } = await this.supabase.from('messages').insert({
      chat_id: data.chat_id,
      sender_id: data.sender_id,
      content: data.content,
      attachment_url: data.attachment_url,
    });
    if (error) console.error(`Error insert message : ${error}`);
    this.server.to(data.room_code).emit('retrieveMessage', data);
  }
}
