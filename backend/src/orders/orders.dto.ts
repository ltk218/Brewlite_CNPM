import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, ProductSize } from '@prisma/client';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsEnum(ProductSize, { message: 'Size đồ uống phải là S, M hoặc L' })
  size!: ProductSize;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  qty!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  toppingIds?: string[];

  @IsOptional()
  @IsString()
  sugarLevel?: string;

  @IsOptional()
  @IsString()
  iceLevel?: string;

  @IsOptional()
  @IsString()
  itemNote?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 món' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  promotionCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pointsUsed?: number;

  @IsOptional()
  @IsString()
  pickupMethod?: string;

  @IsOptional()
  @IsString()
  customerNote?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Trạng thái đơn hàng không hợp lệ' })
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}
