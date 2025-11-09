import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
