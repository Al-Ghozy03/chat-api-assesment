import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization;

    if (!token) throw new UnauthorizedException('Unauthorized');

    try {
      const decode = await this.jwtService.decode(token?.split(' ')[1]);
      this.jwtService.verify(token?.split(' ')[1]);
      request.id = decode?.id;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new UnauthorizedException('Token has expired');

      if (error instanceof JsonWebTokenError)
        throw new UnauthorizedException('Invalid token signature');

      throw error;
    }
  }
}
