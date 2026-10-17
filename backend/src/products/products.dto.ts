import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên món không được để trống' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mô tả món không được để trống' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  category!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1000, { message: 'Giá bán tối thiểu là 1.000đ' })
  price!: number;

  @IsString()
  @IsNotEmpty({ message: 'URL hình ảnh không được để trống' })
  imageUrl!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Tồn kho không được âm' })
  stock!: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
