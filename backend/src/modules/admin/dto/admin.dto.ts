import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  season?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}

export class ImportItemsDto {
  @IsArray()
  @Type(() => ImportItemDto)
  items: ImportItemDto[];
}

export class ToggleItemDto {
  @IsBoolean()
  active: boolean;
}