import { Controller, Get, UseGuards, Request, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';

interface JwtRequestUser {
  userId: string;
  email: string;
  userType: 'patient' | 'doctor';
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: Request & { user: JwtRequestUser }) {
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user,
      },
    };
  }
}
