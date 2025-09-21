import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService, ImportResult } from './admin.service';
import { ImportItemsDto, ToggleItemDto } from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard) // TODO: Add admin role guard
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File): Promise<ImportResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    return this.adminService.importItemsFromCsv(file.buffer);
  }

  @Post('import/json')
  async importJson(@Body() dto: ImportItemsDto): Promise<ImportResult> {
    return this.adminService.importItemsFromJson(dto.items);
  }

  @Get('template/csv')
  async getCsvTemplate() {
    const template = await this.adminService.getImportTemplate();
    return { template };
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Patch('items/:id/toggle')
  async toggleItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleItemDto,
  ) {
    return this.adminService.toggleItemActive(id, dto.active);
  }

  @Delete('items/:id')
  async deleteItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteItem(id);
  }
}