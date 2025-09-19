import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InteractionsService } from './interactions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('like/:itemId')
  like(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.interactionsService.like(user.id, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pass/:itemId')
  pass(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.interactionsService.pass(user.id, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save/:itemId')
  save(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.interactionsService.save(user.id, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('likes')
  getLikes(@CurrentUser() user: any) {
    return this.interactionsService.getUserLikes(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('saves')
  getSaves(@CurrentUser() user: any) {
    return this.interactionsService.getUserSaves(user.id);
  }
}