import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './payments.dto';
import { JwtAuthGuard } from '../common/guards';
import { AuthenticatedUser, CurrentUser } from '../common/decorators';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async processPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ProcessPaymentDto,
    @Headers('idempotency-key') headerIdempotencyKey?: string,
  ) {
    return this.paymentsService.processPayment(user, dto, headerIdempotencyKey);
  }
}
