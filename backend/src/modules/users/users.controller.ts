import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateProfile(
    @CurrentUser() user: any,
    @Body() updateData: { avatarUrl?: string; bio?: string; sizes?: any },
  ) {
    return this.usersService.updateProfile(user.id, updateData);
  }
}