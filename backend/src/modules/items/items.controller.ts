import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ItemsService } from './items.service';
import { FeedQueryDto, ImportItemsDto } from './dto/items.dto';

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  getFeed(@Query() query: FeedQueryDto, @CurrentUser() user: any) {
    return this.itemsService.getFeed(query, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('items/:id')
  getItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items/import')
  importItems(@Body() dto: ImportItemsDto) {
    return this.itemsService.importItems(dto.items);
  }
}