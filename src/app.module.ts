import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './app/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SIGN,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
  exports: [],
})
export class AppModule {}
