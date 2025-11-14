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

  @SubscribeMessage('userStatus')
  async userStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { user_id: number; status: string },
  ) {
    console.log('Retrieve status user: ', data);
    const { data: v, error } = await this.supabase
      .from('users')
      .update({
        status: data.status,
        last_online: new Date().toISOString(),
      })
      .eq('id', data.user_id)
      .select()
      .single();
    if (error) console.error(`Error insert message : ${error}`);
    this.server.emit('retrieveUserStatus', v);
  }
}
