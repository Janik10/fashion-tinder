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
  @Post('sessions')
  createSession(
    @CurrentUser() user: any,
    @Body('itemIds') itemIds?: string[],
  ) {
    return this.votesService.createSession(user.id, itemIds);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  getSessions(@CurrentUser() user: any) {
    return this.votesService.getUserSessions(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions/:sessionId')
  getSession(@Param('sessionId') sessionId: string) {
    return this.votesService.getSession(sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/:sessionId/vote')
  castVote(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string,
    @Body() vote: { itemId: string; vote: boolean },
  ) {
    return this.votesService.castVote(
      sessionId,
      user.id,
      vote.itemId,
      vote.vote ? 1 : 0,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  joinSession(@Body('code') code: string) {
    return this.votesService.joinSession(code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('result/:sessionId')
  getResults(@Param('sessionId') sessionId: string) {
    return this.votesService.getSessionResults(sessionId);
  }
}