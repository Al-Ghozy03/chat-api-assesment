import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
}
