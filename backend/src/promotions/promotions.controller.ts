import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { ApplyPromotionDto } from './promotions.dto';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  async listActive() {
    return this.promotionsService.listActive();
  }

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  async apply(@Body() dto: ApplyPromotionDto) {
    return this.promotionsService.applyPromotion(dto);
  }
}
