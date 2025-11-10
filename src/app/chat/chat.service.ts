import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from 'src/supabase/supabase.module';
import { GenerateRoomcodeDto } from './dto/generateRoomCode.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ChatService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async listMessages(userId: number, chatId: number) {
    try {
      const { data: existChat, error: errorExistChat } = await this.supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .maybeSingle();

      if (errorExistChat)
        throw new InternalServerErrorException(errorExistChat);
      if (!existChat)
        throw new UnprocessableEntityException("Chat doesn't exist");
      if (existChat.user_1 !== userId && existChat.user_2 !== userId)
        throw new UnauthorizedException(
          'You are not authorized to view this messages',
        );
      const { data, error } = await this.supabase
        .from('messages')
        .select(
          `
            id,
            content,
            attachment_url,
            created_at,
            chat:chats!messages_chat_id_fkey (
              id,
              room_code,
              created_at,
              user1:users!chats_user_1_fkey (
                id,
                name,
                email,
                avatar_url
              ),
              user2:users!chats_user_2_fkey (
                id,
                name,
                email,
                avatar_url
              )
            ),
            sender:users!messages_sender_id_fkey (
              id,
              name,
              email,
              avatar_url
            )
          `,
        )
        .eq('chat_id', chatId);

      if (error) throw new InternalServerErrorException(error);
      return data;
    } catch (er) {
      console.error(er);
      throw er;
    }
  }

  async listChat(userId: number) {
    try {
      const { data, error } = await this.supabase
        .from('chats')
        .select(
          ` 
              id,
              room_code,
              user1:users!chats_user_1_fkey (
                id,
                name,
                email,
                avatar_url
              ),
              user2:users!chats_user_2_fkey (
                id,
                name,
                email,
                avatar_url
              ),
              messages:messages(
                id,
                chat_id,
                sender_id,
                content,
                attachment_url,
                created_at
              )
              created_at
          `,
        )
        .or(`user_1.eq.${userId},user_2.eq.${userId}`)
        .order('created_at', { foreignTable: 'messages', ascending: true });
      if (error) throw new InternalServerErrorException(error);
      return {
        message: 'success',
        data,
      };
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async generateRoomcode(body: GenerateRoomcodeDto) {
    try {
      const checkUser1 = await this.checkUserId(body.user_1);
      if (!checkUser1) throw new NotFoundException('User 1 not found');

      const checkUser2 = await this.checkUserId(body.user_2);
      if (!checkUser2) throw new NotFoundException('User 2 not found');

      const { data: checkRoom, error: errorRoom } = await this.supabase
        .from('chats')
        .select('*')
        .or(
          `and(user_1.eq.${body.user_1},user_2.eq.${body.user_2}),and(user_1.eq.${body.user_2},user_2.eq.${body.user_1})`,
        )
        .maybeSingle();
      if (errorRoom) throw new InternalServerErrorException(errorRoom);
      if (!checkRoom) {
        const roomCode = this.generateRandomString(7);
        const insert = await this.supabase
          .from('chats')
          .insert({
            user_1: body.user_1,
            user_2: body.user_2,
            room_code: roomCode,
          })
          .select()
          .single();
        return {
          message: 'success',
          data: {
            id: insert.data.id,
            user_1: insert.data.user_1,
            user_2: insert.data.user_2,
            room_code: insert.data.room_code,
          },
        };
      }
      return {
        message: 'success',
        data: {
          id: checkRoom.id,
          user_1: checkRoom.user_1,
          user_2: checkRoom.user_2,
          room_code: checkRoom.room_code,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async checkUserId(id: number) {
    const { data } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return data;
  }

  generateRandomString = (length: number) => {
    return randomBytes(length).toString('hex');
  };
}
