import { Injectable, OnModuleInit, OnModuleDestroy, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { runDatabaseSeed } from '../../prisma/seed';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap {
  async onModuleInit() {
    await this.$connect();
  }

  async onApplicationBootstrap() {
    try {
      const [productCount, ingredientCount] = await Promise.all([
        this.product.count(),
        this.ingredient.count(),
      ]);
      if (productCount === 0 || ingredientCount === 0) {
        await this.ensureSeedData();
      }
    } catch {
      return;
    }
  }

  async ensureSeedData() {
    try {
      await runDatabaseSeed(this);
    } catch {
      return;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
