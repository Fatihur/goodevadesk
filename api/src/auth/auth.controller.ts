import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { SessionGuard } from '../common/guards/session.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/http.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.login(dto);
    response.cookie('gd_session', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', expires: result.expiresAt, path: '/' });
    return result.user;
  }

  @Post('logout')
  @UseGuards(SessionGuard)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = request.cookies?.gd_session as string | undefined;
    if (token) await this.auth.logout(token);
    response.clearCookie('gd_session', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
