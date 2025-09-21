import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as csv from 'csv-parse';
import { Readable } from 'stream';

interface ImportItem {
  name: string;
  brand: string;
  price: number;
  currency?: string;
  images: string[];
  tags: string[];
  gender?: string;
  season?: string;
  active?: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async importItemsFromCsv(fileBuffer: Buffer): Promise<ImportResult> {
    try {
      const items = await this.parseCsvToItems(fileBuffer);
      return this.importItems(items);
    } catch (error) {
      throw new BadRequestException(`CSV parsing failed: ${error.message}`);
    }
  }

  async importItemsFromJson(data: any[]): Promise<ImportResult> {
    try {
      const items = this.validateJsonItems(data);
      return this.importItems(items);
    } catch (error) {
      throw new BadRequestException(`JSON validation failed: ${error.message}`);
    }
  }

  private async parseCsvToItems(fileBuffer: Buffer): Promise<ImportItem[]> {
    return new Promise((resolve, reject) => {
      const items: ImportItem[] = [];
      const errors: string[] = [];
      
      const stream = Readable.from(fileBuffer);
      const parser = csv.parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      parser.on('data', (row: any) => {
        try {
          const item = this.parseCsvRow(row);
          items.push(item);
        } catch (error) {
          errors.push(`Row ${items.length + 1}: ${error.message}`);
        }
      });

      parser.on('error', (error) => {
        reject(error);
      });

      parser.on('end', () => {
        if (errors.length > 0) {
          reject(new Error(`Parsing errors: ${errors.join(', ')}`));
        }
        resolve(items);
      });

      stream.pipe(parser);
    });
  }

  private parseCsvRow(row: any): ImportItem {
    if (!row.name || !row.brand || !row.price) {
      throw new Error('Missing required fields: name, brand, price');
    }

    const price = parseFloat(row.price);
    if (isNaN(price) || price < 0) {
      throw new Error('Invalid price value');
    }

    const images = row.images ? row.images.split(';').map((img: string) => img.trim()) : [];
    if (images.length === 0) {
      throw new Error('At least one image URL is required');
    }

    const tags = row.tags ? row.tags.split(';').map((tag: string) => tag.trim().toLowerCase()) : [];

    return {
      name: row.name.trim(),
      brand: row.brand.trim(),
      price,
      currency: row.currency?.trim() || 'USD',
      images,
      tags,
      gender: row.gender?.trim() || null,
      season: row.season?.trim() || null,
      active: row.active ? row.active.toLowerCase() === 'true' : true,
    };
  }

  private validateJsonItems(data: any[]): ImportItem[] {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    return data.map((item, index) => {
      if (!item.name || !item.brand || !item.price) {
        throw new Error(`Item ${index + 1}: Missing required fields: name, brand, price`);
      }

      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      if (isNaN(price) || price < 0) {
        throw new Error(`Item ${index + 1}: Invalid price value`);
      }

      if (!item.images || !Array.isArray(item.images) || item.images.length === 0) {
        throw new Error(`Item ${index + 1}: At least one image URL is required`);
      }

      return {
        name: item.name.trim(),
        brand: item.brand.trim(),
        price,
        currency: item.currency || 'USD',
        images: item.images,
        tags: item.tags || [],
        gender: item.gender || null,
        season: item.season || null,
        active: item.active !== undefined ? item.active : true,
      };
    });
  }

  private async importItems(items: ImportItem[]): Promise<ImportResult> {
    const errors: string[] = [];
    let imported = 0;
    let failed = 0;

    // Import in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        await this.prisma.item.createMany({
          data: batch,
          skipDuplicates: true,
        });
        imported += batch.length;
      } catch (error) {
        failed += batch.length;
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      imported,
      failed,
      errors,
    };
  }

  async getImportTemplate(): Promise<string> {
    const headers = [
      'name',
      'brand', 
      'price',
      'currency',
      'images',
      'tags',
      'gender',
      'season',
      'active'
    ];

    const exampleRow = [
      'Vintage Denim Jacket',
      'Levi\'s',
      '89.99',
      'USD',
      'https://example.com/jacket1.jpg;https://example.com/jacket2.jpg',
      'vintage;denim;casual;unisex',
      'unisex',
      'fall',
      'true'
    ];

    return [headers.join(','), exampleRow.join(',')].join('\n');
  }

  async getStats() {
    const [totalItems, activeItems, brands, tags] = await Promise.all([
      this.prisma.item.count(),
      this.prisma.item.count({ where: { active: true } }),
      this.prisma.item.groupBy({
        by: ['brand'],
        _count: { brand: true },
        orderBy: { _count: { brand: 'desc' } },
        take: 10,
      }),
      this.prisma.item.findMany({
        select: { tags: true },
        where: { active: true },
      }),
    ]);

    // Count unique tags
    const tagCounts = new Map<string, number>();
    tags.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalItems,
      activeItems,
      inactiveItems: totalItems - activeItems,
      topBrands: brands.map(b => ({ brand: b.brand, count: b._count.brand })),
      topTags,
      uniqueBrands: brands.length,
      uniqueTags: tagCounts.size,
    };
  }

  async toggleItemActive(itemId: string, active: boolean) {
    return this.prisma.item.update({
      where: { id: itemId },
      data: { active },
    });
  }

  async deleteItem(itemId: string) {
    // First delete related records
    await Promise.all([
      this.prisma.like.deleteMany({ where: { itemId } }),
      this.prisma.save.deleteMany({ where: { itemId } }),
      this.prisma.pass.deleteMany({ where: { itemId } }),
    ]);

    return this.prisma.item.delete({
      where: { id: itemId },
    });
  }
}