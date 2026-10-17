import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AdminService, CreatedPurchaseOrder } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { AuthenticatedUser, CurrentUser, Roles } from '../common/decorators';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('orders')
  async getOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('inventory')
  async getInventory() {
    return this.adminService.getInventoryOverview();
  }

@Post('inventory/adjust')
async adjustInventory(
  @CurrentUser() user: AuthenticatedUser,
  @Body()
  body: {
    ingredientId: string;
    quantityChange: number;
    type: 'IMPORT' | 'ADJUSTMENT';
    reason: string;
    supplierId?: string;
    unitCost?: number;
  },
): Promise<{
  ingredient: unknown;
  transaction: unknown;
  purchaseOrder: CreatedPurchaseOrder | null;
}> {
  return this.adminService.adjustIngredientStock({
    ...body,
    performedBy: user.fullName,
  });
}

  @Post('ingredients')
  async createIngredient(
    @Body()
    body: {
      code: string;
      name: string;
      unit: string;
      currentStock: number;
      minThreshold: number;
      costPerUnit: number;
    },
  ) {
    return this.adminService.createIngredient(body);
  }

  @Patch('ingredients/:id')
  async updateIngredient(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      unit: string;
      currentStock: number;
      minThreshold: number;
      costPerUnit: number;
    }>,
  ) {
    return this.adminService.updateIngredient(id, body);
  }

  @Delete('ingredients/:id')
  async deleteIngredient(@Param('id') id: string) {
    return this.adminService.deleteIngredient(id);
  }

  @Post('recipes')
  async upsertRecipe(
    @Body()
    body: {
      productId: string;
      ingredientId: string;
      quantityNeeded: number;
    },
  ) {
    return this.adminService.upsertRecipeItem(body);
  }

  @Patch('recipes/:id')
  async updateRecipe(
    @Param('id') id: string,
    @Body() body: { quantityNeeded: number },
  ) {
    return this.adminService.updateRecipeItem(id, body.quantityNeeded);
  }

  @Delete('recipes/:id')
  async deleteRecipe(@Param('id') id: string) {
    return this.adminService.deleteRecipeItem(id);
  }
}
