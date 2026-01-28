import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UnauthorizedException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { RefreshTokenGuard } from './refresh-token.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get()
  get(): string {
    return 'Auth Controller';
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    const data = await this.userService.create(body);
    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.authService.login(user);
    const isProd = process.env.NODE_ENV === 'production';
    const refreshTokenExpired = process.env.REFRESH_TOKEN_EXPIRED
      ? parseInt(process.env.REFRESH_TOKEN_EXPIRED)
      : 604800000;

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd, // set to true in production with HTTPS
      sameSite: isProd ? 'none' : 'lax',
      // Note: SameSite=None requires Secure in modern browsers.
      maxAge: refreshTokenExpired, // 7 days
    });

    return {
      accessToken: tokens.accessToken,
      user: {
        ...user,
        password: undefined,
        refreshTokenHash: undefined,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: RequestWithUser) {
    const user = await this.userService.findOne(req.user.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      password: undefined,
      refreshTokenHash: undefined,
    };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('req.user', req.user);
    const userRequest = req.user;
    const user = await this.userService.findOne(userRequest.id);

    if (!userRequest) {
      throw new UnauthorizedException('Unauthorized');
    }

    const tokens = await this.authService.refreshTokens(
      userRequest.id,
      userRequest.refreshToken,
    );

    const isProd = process.env.NODE_ENV === 'production';
    const refreshTokenExpired = process.env.REFRESH_TOKEN_EXPIRED
      ? parseInt(process.env.REFRESH_TOKEN_EXPIRED)
      : 604800000;

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd, // set to true in production with HTTPS
      sameSite: isProd ? 'none' : 'lax',
      // Note: SameSite=None requires Secure in modern browsers.
      maxAge: refreshTokenExpired, // 7 days
    });

    return {
      accessToken: tokens.accessToken,
      user: {
        ...user,
        password: undefined,
        refreshTokenHash: undefined,
      },
    };
  }

  @Post('logout')
  async logout(
    @Body() dto: LogoutDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(dto.id);
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }
}
