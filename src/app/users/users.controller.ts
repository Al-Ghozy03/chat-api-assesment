import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/utilities/guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.userService.register(data);
  }

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.userService.login(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listUser(@Req() req) {
    return this.userService.list(req?.id);
  }
}
