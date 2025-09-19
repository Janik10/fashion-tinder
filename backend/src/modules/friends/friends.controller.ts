import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FriendsService } from './friends.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('request')
  requestFriend(
    @CurrentUser() user: any,
    @Body('username') username: string,
  ) {
    return this.friendsService.requestFriendship(user.id, username);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accept/:userId')
  acceptFriend(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    return this.friendsService.acceptFriendship(user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getFriends(@CurrentUser() user: any) {
    return this.friendsService.getFriends(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('compatibility/:userId')
  getCompatibility(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    return this.friendsService.getCompatibility(user.id, userId);
  }
}