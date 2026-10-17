import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ApplyPromotionDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã khuyến mãi' })
  code!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Tổng tạm tính không hợp lệ' })
  subtotal!: number;
}
