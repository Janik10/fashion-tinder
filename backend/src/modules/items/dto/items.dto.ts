import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MEN = 'men',
  WOMEN = 'women',
  UNISEX = 'unisex',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
}

export class ItemDto {
  @IsString()
  name: string;

  @IsString()
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
  tags: string[];

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEnum(Season)
  @IsOptional()
  season?: Season;
}

export class ImportItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}

export class FeedQueryDto {
  @IsString()
  @IsOptional()
  cursor?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(Season)
  season?: Season;
}