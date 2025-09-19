import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VotesService } from './votes.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('session')
  createSession(
    @CurrentUser() user: any,
    @Body('itemIds') itemIds?: string[],
  ) {
    return this.votesService.createSession(user.id, itemIds);
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  joinSession(@Body('code') code: string) {
    return this.votesService.joinSession(code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cast')
  castVote(
    @CurrentUser() user: any,
    @Body() vote: { sessionId: string; itemId: string; value: number },
  ) {
    return this.votesService.castVote(
      vote.sessionId,
      user.id,
      vote.itemId,
      vote.value,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('result/:sessionId')
  getResults(@Param('sessionId') sessionId: string) {
    return this.votesService.getSessionResults(sessionId);
  }
}