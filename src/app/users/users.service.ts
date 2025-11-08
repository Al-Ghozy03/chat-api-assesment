import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from 'src/supabase/supabase.module';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

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
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
      },
      token,
    };
  }

  async login(body: LoginDto) {
    try {
      const { data: existingUser, error } = await this.supabase
        .from('users')
        .select('id,name,password,email')
        .eq('email', body.email)
        .maybeSingle();

      if (error) throw new BadRequestException(error);

      if (!existingUser) {
        throw new NotFoundException('Email not found');
      }
      const checkPassword = await bcrypt.compare(
        body.password,
        existingUser.password,
      );
      if (!checkPassword)
        throw new UnauthorizedException('Wrong password, try again!');
      const token = this.jwtService.sign({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      });

      return {
        message: 'success',
        data: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }
}
