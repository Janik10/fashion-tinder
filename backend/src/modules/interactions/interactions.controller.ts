import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InteractionsService } from './interactions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InteractionParamDto, UserIdDto } from './dto/interactions.dto';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('like/:itemId')
  like(
    @CurrentUser() user: UserIdDto,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.interactionsService.like(user.id, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pass/:itemId')
  pass(
    @CurrentUser() user: UserIdDto,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.interactionsService.pass(user.id, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save/:itemId')
  save(
    @CurrentUser() user: UserIdDto,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.interactionsService.save(user.id, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('likes')
  getLikes(@CurrentUser() user: UserIdDto) {
    return this.interactionsService.getUserLikes(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('saves')
  getSaves(@CurrentUser() user: UserIdDto) {
    return this.interactionsService.getUserSaves(user.id);
  }
}