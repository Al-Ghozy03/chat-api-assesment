import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from 'src/supabase/supabase.module';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
    private readonly jwtService: JwtService,
  ) {}
  async register(body: RegisterDto) {
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', body.email)
      .maybeSingle();

    if (existingUser) {
      throw new ConflictException('Email has been used');
    }

    const hashed = await bcrypt.hash(body.password, 15);

    const { data, error } = await this.supabase
      .from('users')
      .insert({
        email: body.email,
        password: hashed,
        name: body.name,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }
    const token = this.jwtService.sign({
      id: data.id,
      name: data.name,
      email: data.email,
    });
    return {
      message: 'success',
      data,
      token,
    };
  }
}
