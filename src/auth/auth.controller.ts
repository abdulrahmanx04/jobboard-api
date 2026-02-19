import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, CreateAuthDto, EmailDto, LoginDto, PasswordDto } from './dto/create-auth.dto';
import { User } from 'src/common/decorators/current.user';
import type {  UserData } from 'src/common/interfaces/all.interfaces';
import { JwtAuthGuard } from 'src/common/guards/authguard';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Throttle({default: {limit: 10, ttl: 60000}})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({default: {limit: 3, ttl: 60000}})
  @Post('register')
  create(@Body() dto: CreateAuthDto) {
    return this.authService.create(dto);
  }


  @Get('/verify-email/:token')
  findOne(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('/resend-email')
  resendVerification(@Body() dto: EmailDto) {
    return this.authService.resendVerification(dto)
  }
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('/login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Put('/change-password')
  changePassword(@Body()dto: ChangePasswordDto,@User() userData:  UserData) {
    return this.authService.changePassword(dto,userData)
  }
  
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('/forgot-password')
  forgotPassword(@Body() dto: EmailDto) {
    return this.authService.forgotPassword(dto)
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('/reset-password/:token')
  resetPassword(@Param('token') token: string,@Body() dto: PasswordDto) {
    return this.authService.resetPassword(token,dto)
  }

  
}
