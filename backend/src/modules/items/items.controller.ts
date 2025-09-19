import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ItemsService } from './items.service';

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  getFeed(@Query('cursor') cursor?: string) {
    return this.itemsService.getFeed(cursor);
  }

  @UseGuards(JwtAuthGuard)
  @Get('items/:id')
  getItem(@Param('id') id: string) {
    return this.itemsService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items/import')
  importItems(
    @Body()
    items: Array<{
      name: string;
      brand: string;
      price: number;
      currency?: string;
      images: string[];
      tags: string[];
      gender?: string;
      season?: string;
    }>,
  ) {
    return this.itemsService.importItems(items);
  }
}