import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ItemsService } from './items.service';
import { FeedQueryDto, ImportItemsDto } from './dto/items.dto';

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  getFeed(@Query() query: FeedQueryDto) {
    return this.itemsService.getFeed(query);
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