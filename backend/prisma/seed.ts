import {
  PrismaClient,
  UserRole,
  OrderStatus,
  ProductSize,
  PaymentMethod,
  PaymentStatus,
  BarStation,
  InventoryTxType,
  Product,
  Topping,
  Ingredient,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const unsplashUrl = (photoId: string): string =>
  ['https:', '', 'images.unsplash.com', `${photoId}?auto=format&fit=crop&w=800&q=80`].join('/');

interface SampleOrderSeed {
  orderCode: string;
  status: OrderStatus;
  daysOffset: number;
  productIndex: number;
  size: ProductSize;
  qty: number;
  sugarLevel: string;
  iceLevel: string;
  toppingIndices: number[];
  discountAmount: number;
  promotionCode: string | null;
  method: PaymentMethod;
}

export async function runDatabaseSeed(client: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash('BrewLite@123', 10);

  const customer = await client.user.upsert({
    where: { email: 'khachhang@brewlite.vn' },
    update: {
      passwordHash,
      fullName: 'Nguyễn Minh Khách',
      phone: '0909123456',
      role: UserRole.CUSTOMER,
      loyaltyPoints: 15000,
      totalSpent: 485000,
    },
    create: {
      email: 'khachhang@brewlite.vn',
      passwordHash,
      fullName: 'Nguyễn Minh Khách',
      phone: '0909123456',
      role: UserRole.CUSTOMER,
      loyaltyPoints: 15000,
      totalSpent: 485000,
    },
  });

  const adminUser = await client.user.upsert({
    where: { email: 'admin@brewlite.vn' },
    update: {
      passwordHash,
      fullName: 'Quản Trị Viên BrewLite',
      phone: '0909888999',
      role: UserRole.ADMIN,
      loyaltyPoints: 0,
    },
    create: {
      email: 'admin@brewlite.vn',
      passwordHash,
      fullName: 'Quản Trị Viên BrewLite',
      phone: '0909888999',
      role: UserRole.ADMIN,
      loyaltyPoints: 0,
    },
  });

  await client.user.upsert({
    where: { email: 'barista@brewlite.vn' },
    update: {
      passwordHash,
      fullName: 'Trần Bảo Barista',
      phone: '0909777666',
      role: UserRole.ADMIN,
      loyaltyPoints: 0,
    },
    create: {
      email: 'barista@brewlite.vn',
      passwordHash,
      fullName: 'Trần Bảo Barista',
      phone: '0909777666',
      role: UserRole.ADMIN,
      loyaltyPoints: 0,
    },
  });

  await client.auditLog.deleteMany({});
  await client.purchaseOrderItem.deleteMany({});
  await client.purchaseOrder.deleteMany({});
  await client.supplier.deleteMany({});
  await client.inventoryTransaction.deleteMany({});
  await client.recipe.deleteMany({});
  await client.ingredient.deleteMany({});
  await client.loyaltyTransaction.deleteMany({});
  await client.payment.deleteMany({});
  await client.orderItem.deleteMany({});
  await client.order.deleteMany({});
  await client.productVariant.deleteMany({});
  await client.product.deleteMany({});
  await client.category.deleteMany({});
  await client.modifierOption.deleteMany({});
  await client.modifierGroup.deleteMany({});
  await client.topping.deleteMany({});
  await client.promotion.deleteMany({});

  const categoriesData: Array<{
    name: string;
    station: BarStation;
    displayOrder: number;
  }> = [
    { name: 'Cà phê truyền thống', station: BarStation.ESPRESSO_BAR, displayOrder: 1 },
    { name: 'Espresso & Máy', station: BarStation.ESPRESSO_BAR, displayOrder: 2 },
    { name: 'Cold Brew', station: BarStation.COLD_BREW_BAR, displayOrder: 3 },
    { name: 'Trà trái cây', station: BarStation.TEA_MATCHA_BAR, displayOrder: 4 },
    { name: 'Matcha & Sữa', station: BarStation.TEA_MATCHA_BAR, displayOrder: 5 },
  ];

  const categoryMap = new Map<string, { id: string; station: BarStation }>();
  for (const c of categoriesData) {
    const createdCat = await client.category.create({ data: c });
    categoryMap.set(c.name, { id: createdCat.id, station: createdCat.station });
  }

  await client.modifierGroup.create({
    data: {
      name: 'Mức đường (Sugar Level)',
      isRequired: true,
      isMultiple: false,
      minSelect: 1,
      maxSelect: 1,
      options: {
        create: [
          { name: '100% đường (Tiêu chuẩn)', price: 0 },
          { name: '70% đường (Ít ngọt)', price: 0 },
          { name: '50% đường (Vừa nhẹ)', price: 0 },
          { name: '30% đường', price: 0 },
          { name: 'Không đường (0%)', price: 0 },
        ],
      },
    },
  });

  await client.modifierGroup.create({
    data: {
      name: 'Mức đá (Ice Level)',
      isRequired: true,
      isMultiple: false,
      minSelect: 1,
      maxSelect: 1,
      options: {
        create: [
          { name: 'Đá bình thường', price: 0 },
          { name: 'Ít đá', price: 0 },
          { name: 'Đá để riêng', price: 0 },
          { name: 'Không đá', price: 0 },
        ],
      },
    },
  });

  const toppingsData: Array<{ name: string; price: number; isAvailable: boolean }> = [
    { name: 'Trân châu trắng giòn', price: 8000, isAvailable: true },
    { name: 'Kem phô mai Macchiato', price: 12000, isAvailable: true },
    { name: 'Thêm 1 Shot Espresso', price: 10000, isAvailable: true },
    { name: 'Thạch cà phê nguyên chất', price: 8000, isAvailable: true },
  ];

  const createdToppings: Topping[] = [];
  for (const item of toppingsData) {
    const t = await client.topping.create({ data: item });
    createdToppings.push(t);
  }

  const ingredientsData: Array<{
    code: string;
    name: string;
    unit: string;
    currentStock: number;
    minThreshold: number;
    costPerUnit: number;
  }> = [
    { code: 'ING-ROBUSTA', name: 'Hạt Cà Phê Robusta Đắk Lắk Rang Mộc', unit: 'g', currentStock: 4500, minThreshold: 500, costPerUnit: 350 },
    { code: 'ING-ARABICA', name: 'Hạt Cà Phê Arabica Cầu Đất Thượng Hạng', unit: 'g', currentStock: 3800, minThreshold: 500, costPerUnit: 550 },
    { code: 'ING-MILK-FRESH', name: 'Sữa Tươi Thanh Trùng Dalatmilk', unit: 'ml', currentStock: 12000, minThreshold: 2000, costPerUnit: 45 },
    { code: 'ING-MILK-COND', name: 'Sữa Đặc Ngọt Dịu Cao Cấp', unit: 'ml', currentStock: 5000, minThreshold: 800, costPerUnit: 60 },
    { code: 'ING-SYRUP-CARAMEL', name: 'Sốt Caramel & Syrup Hạt Dẻ', unit: 'ml', currentStock: 1800, minThreshold: 300, costPerUnit: 180 },
    { code: 'ING-ORANGE-LEMON', name: 'Cam Vàng Tươi & Sả Cây Tự Nhiên', unit: 'g', currentStock: 3200, minThreshold: 600, costPerUnit: 90 },
    { code: 'ING-PEACH-TEA', name: 'Cốt Trà Đen & Đào Miếng Ngâm Giòn', unit: 'g', currentStock: 4200, minThreshold: 800, costPerUnit: 110 },
    { code: 'ING-MATCHA-UJI', name: 'Bột Trà Xanh Matcha Uji Nhật Bản', unit: 'g', currentStock: 180, minThreshold: 250, costPerUnit: 1200 },
  ];

  const createdIngredients: Ingredient[] = [];
  for (const ing of ingredientsData) {
    const createdIng = await client.ingredient.create({ data: ing });
    createdIngredients.push(createdIng);
  }

  const productsData: Array<{
    code: string;
    name: string;
    description: string;
    category: string;
    price: number;
    imageUrl: string;
    stock: number;
    isAvailable: boolean;
    bom: Array<{ ingIndex: number; qty: number }>;
  }> = [
    {
      code: 'CF-001',
      name: 'Cà Phê Sữa Đá Sài Gòn',
      description: 'Hương vị Robusta Đắk Lắk đậm đà pha phin truyền thống hòa quyện cùng sữa đặc ngọt dịu.',
      category: 'Cà phê truyền thống',
      price: 35000,
      imageUrl: unsplashUrl('photo-1514432324607-a09d9b4aefdd'),
      stock: 50,
      isAvailable: true,
      bom: [
        { ingIndex: 0, qty: 25 },
        { ingIndex: 3, qty: 30 },
      ],
    },
    {
      code: 'CF-002',
      name: 'Bạc Xỉu Đá Hạt Dẻ',
      description: 'Sữa tươi béo ngậy kết hợp lớp bọt cà phê sánh mịn và hương syrup hạt dẻ thơm lừng.',
      category: 'Cà phê truyền thống',
      price: 39000,
      imageUrl: unsplashUrl('photo-1461023058943-07fcbe16d735'),
      stock: 40,
      isAvailable: true,
      bom: [
        { ingIndex: 0, qty: 18 },
        { ingIndex: 2, qty: 120 },
        { ingIndex: 4, qty: 15 },
      ],
    },
    {
      code: 'ES-001',
      name: 'Americano Đá Nguyên Bản',
      description: 'Chiết xuất 100% hạt Arabica Cầu Đất rang vừa, hậu vị thanh mát và hương hoa quả tự nhiên.',
      category: 'Espresso & Máy',
      price: 40000,
      imageUrl: unsplashUrl('photo-1551030173-122aabc4489c'),
      stock: 45,
      isAvailable: true,
      bom: [{ ingIndex: 1, qty: 20 }],
    },
    {
      code: 'ES-002',
      name: 'Cappuccino Kem Mịn',
      description: 'Sự cân bằng hoàn hảo giữa Espresso đậm vị, sữa tươi thanh trùng và lớp bọt sữa dày mịn.',
      category: 'Espresso & Máy',
      price: 45000,
      imageUrl: unsplashUrl('photo-1572442388796-11668a67e53d'),
      stock: 35,
      isAvailable: true,
      bom: [
        { ingIndex: 1, qty: 18 },
        { ingIndex: 2, qty: 150 },
      ],
    },
    {
      code: 'ES-003',
      name: 'Caramel Macchiato',
      description: 'Espresso nồng nàn điểm xuyết sốt Caramel thượng hạng cùng lớp bọt sữa béo nhẹ.',
      category: 'Espresso & Máy',
      price: 52000,
      imageUrl: unsplashUrl('photo-1485808191679-5f86510681a2'),
      stock: 30,
      isAvailable: true,
      bom: [
        { ingIndex: 1, qty: 18 },
        { ingIndex: 2, qty: 140 },
        { ingIndex: 4, qty: 25 },
      ],
    },
    {
      code: 'CB-001',
      name: 'Cold Brew Cam Sả',
      description: 'Cà phê ủ lạnh suốt 18 giờ kết hợp nước cam vàng tươi mát và hương sả thanh khiết.',
      category: 'Cold Brew',
      price: 55000,
      imageUrl: unsplashUrl('photo-1517701604599-bb29b565090c'),
      stock: 20,
      isAvailable: true,
      bom: [
        { ingIndex: 1, qty: 28 },
        { ingIndex: 5, qty: 80 },
      ],
    },
    {
      code: 'TR-001',
      name: 'Trà Đào Cam Sả',
      description: 'Trà đen ủ lạnh đậm vị quyện cùng đào miếng giòn ngọt, cam vàng tươi và sả cây thơm dịu.',
      category: 'Trà trái cây',
      price: 45000,
      imageUrl: unsplashUrl('photo-1556679343-c7306c1976bc'),
      stock: 60,
      isAvailable: true,
      bom: [
        { ingIndex: 6, qty: 90 },
        { ingIndex: 5, qty: 50 },
      ],
    },
    {
      code: 'MC-001',
      name: 'Matcha Latte Kem Phô Mai',
      description: 'Bột trà xanh Uji Nhật Bản nguyên chất đánh bông cùng sữa tươi và lớp kem phô mai mặn dịu.',
      category: 'Matcha & Sữa',
      price: 55000,
      imageUrl: unsplashUrl('photo-1536256263959-770b48d82b0a'),
      stock: 2,
      isAvailable: true,
      bom: [
        { ingIndex: 7, qty: 12 },
        { ingIndex: 2, qty: 150 },
      ],
    },
  ];

  const createdProducts: Product[] = [];
  for (const p of productsData) {
    const catInfo = categoryMap.get(p.category);
    const prod = await client.product.create({
      data: {
        code: p.code,
        categoryId: catInfo?.id,
        name: p.name,
        description: p.description,
        category: p.category,
        station: catInfo?.station ?? BarStation.ESPRESSO_BAR,
        price: p.price,
        imageUrl: p.imageUrl,
        stock: p.stock,
        isAvailable: p.isAvailable,
        variants: {
          create: [
            { size: ProductSize.S, priceAdjustment: 0, sku: `${p.code}-S` },
            { size: ProductSize.M, priceAdjustment: 6000, sku: `${p.code}-M` },
            { size: ProductSize.L, priceAdjustment: 12000, sku: `${p.code}-L` },
          ],
        },
        recipes: {
          create: p.bom.map((b) => ({
            ingredientId: createdIngredients[b.ingIndex].id,
            quantityNeeded: b.qty,
          })),
        },
      },
    });
    createdProducts.push(prod);
  }

  const supplier = await client.supplier.create({
    data: {
      name: 'Nông Trại Cầu Đất & Đắk Lắk Specialty Roastery',
      phone: '02633888999',
      email: 'supply@caudatroastery.vn',
      address: 'Xã Xuân Trường, TP. Đà Lạt, Lâm Đồng',
      isActive: true,
    },
  });

  const supplierMilk = await client.supplier.create({
    data: {
      name: 'Công Ty CP Sữa Đà Lạt (Dalatmilk) & Nguyên Liệu Pha Chế',
      phone: '02835123456',
      email: 'b2b@dalatmilk.vn',
      address: 'Quận 1, TP. Hồ Chí Minh',
      isActive: true,
    },
  });

  await client.purchaseOrder.create({
    data: {
      poNumber: 'PO-202610-001',
      supplierId: supplier.id,
      totalAmount: 3665000,
      status: 'RECEIVED',
      note: 'Nhập lô hạt Arabica Cầu Đất và Robusta mới rang đầu tuần',
      items: {
        create: [
          {
            ingredientId: createdIngredients[0].id,
            quantity: 4500,
            unitPrice: 350,
            lineTotal: 1575000,
          },
          {
            ingredientId: createdIngredients[1].id,
            quantity: 3800,
            unitPrice: 550,
            lineTotal: 2090000,
          },
        ],
      },
    },
  });

  await client.purchaseOrder.create({
    data: {
      poNumber: 'PO-202610-002',
      supplierId: supplierMilk.id,
      totalAmount: 840000,
      status: 'RECEIVED',
      note: 'Nhập sữa tươi thanh trùng Dalatmilk và sữa đặc cao cấp',
      items: {
        create: [
          {
            ingredientId: createdIngredients[2].id,
            quantity: 12000,
            unitPrice: 45,
            lineTotal: 540000,
          },
          {
            ingredientId: createdIngredients[3].id,
            quantity: 5000,
            unitPrice: 60,
            lineTotal: 300000,
          },
        ],
      },
    },
  });

  await client.inventoryTransaction.createMany({
    data: [
      {
        ingredientId: createdIngredients[0].id,
        type: InventoryTxType.IMPORT,
        quantityChange: 4500,
        balanceAfter: 4500,
        reason: 'Nhập kho đầu kỳ theo phiếu PO-202610-001',
        performedBy: adminUser.fullName,
      },
      {
        ingredientId: createdIngredients[1].id,
        type: InventoryTxType.IMPORT,
        quantityChange: 3800,
        balanceAfter: 3800,
        reason: 'Nhập kho đầu kỳ theo phiếu PO-202610-001',
        performedBy: adminUser.fullName,
      },
      {
        ingredientId: createdIngredients[7].id,
        type: InventoryTxType.ORDER_DEDUCT,
        quantityChange: -70,
        balanceAfter: 180,
        reason: 'Xuất kho pha chế Matcha Latte theo định lượng BOM',
        performedBy: 'Hệ thống KDS Barista',
      },
    ],
  });

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  await client.promotion.createMany({
    data: [
      {
        code: 'BREWLITE10',
        description: 'Giảm 10%, tối đa 20.000đ cho đơn từ 40.000đ',
        discountPercent: 10,
        maxDiscountAmount: 20000,
        minOrderValue: 40000,
        usageLimit: 500,
        usedCount: 12,
        isActive: true,
        expiresAt: nextYear,
      },
      {
        code: 'CHAOBANMOI',
        description: 'Giảm 20%, tối đa 30.000đ cho đơn từ 80.000đ',
        discountPercent: 20,
        maxDiscountAmount: 30000,
        minOrderValue: 80000,
        usageLimit: 300,
        usedCount: 5,
        isActive: true,
        expiresAt: nextYear,
      },
    ],
  });

  const now = new Date();
  const daysAgo = (days: number): Date => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  const sampleOrders: SampleOrderSeed[] = [
    {
      orderCode: '#1037',
      status: OrderStatus.COMPLETED,
      daysOffset: 5,
      productIndex: 0,
      size: ProductSize.M,
      qty: 2,
      sugarLevel: '70% đường',
      iceLevel: 'Đá bình thường',
      toppingIndices: [0],
      discountAmount: 0,
      promotionCode: null,
      method: PaymentMethod.WALLET,
    },
    {
      orderCode: '#1038',
      status: OrderStatus.COMPLETED,
      daysOffset: 4,
      productIndex: 4,
      size: ProductSize.L,
      qty: 1,
      sugarLevel: '100% đường',
      iceLevel: 'Ít đá',
      toppingIndices: [1],
      discountAmount: 7600,
      promotionCode: 'BREWLITE10',
      method: PaymentMethod.CARD,
    },
    {
      orderCode: '#1039',
      status: OrderStatus.COMPLETED,
      daysOffset: 2,
      productIndex: 5,
      size: ProductSize.M,
      qty: 2,
      sugarLevel: '50% đường',
      iceLevel: 'Đá bình thường',
      toppingIndices: [],
      discountAmount: 24400,
      promotionCode: 'CHAOBANMOI',
      method: PaymentMethod.WALLET,
    },
    {
      orderCode: '#1040',
      status: OrderStatus.READY,
      daysOffset: 1,
      productIndex: 6,
      size: ProductSize.L,
      qty: 2,
      sugarLevel: '70% đường',
      iceLevel: 'Đá để riêng',
      toppingIndices: [0],
      discountAmount: 13000,
      promotionCode: 'BREWLITE10',
      method: PaymentMethod.WALLET,
    },
    {
      orderCode: '#1041',
      status: OrderStatus.PREPARING,
      daysOffset: 0,
      productIndex: 2,
      size: ProductSize.M,
      qty: 1,
      sugarLevel: 'Không đường (0%)',
      iceLevel: 'Đá bình thường',
      toppingIndices: [2],
      discountAmount: 0,
      promotionCode: null,
      method: PaymentMethod.CARD,
    },
    {
      orderCode: '#1042',
      status: OrderStatus.PAID,
      daysOffset: 0,
      productIndex: 1,
      size: ProductSize.S,
      qty: 2,
      sugarLevel: '70% đường',
      iceLevel: 'Ít đá',
      toppingIndices: [3],
      discountAmount: 8600,
      promotionCode: 'BREWLITE10',
      method: PaymentMethod.WALLET,
    },
  ];

  for (const sample of sampleOrders) {
    const product = createdProducts[sample.productIndex];
    const sizeUpcharge = sample.size === ProductSize.S ? 0 : sample.size === ProductSize.M ? 6000 : 12000;
    const selectedToppings = sample.toppingIndices.map((idx: number) => ({
      id: createdToppings[idx].id,
      name: createdToppings[idx].name,
      price: createdToppings[idx].price,
    }));
    const toppingsSum = selectedToppings.reduce((acc: number, t: { price: number }) => acc + t.price, 0);
    const unitPrice = product.price + sizeUpcharge + toppingsSum;
    const lineTotal = unitPrice * sample.qty;
    const subtotal = lineTotal;
    const total = subtotal - sample.discountAmount;
    const createdAt = daysAgo(sample.daysOffset);

    const createdOrder = await client.order.create({
      data: {
        orderCode: sample.orderCode,
        userId: customer.id,
        status: sample.status,
        pickupMethod: 'PICKUP_COUNTER',
        subtotal,
        discountAmount: sample.discountAmount,
        total,
        promotionCode: sample.promotionCode,
        createdAt,
        updatedAt: createdAt,
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              size: sample.size,
              qty: sample.qty,
              sugarLevel: sample.sugarLevel,
              iceLevel: sample.iceLevel,
              station: product.station,
              toppings: selectedToppings,
              unitPrice,
              lineTotal,
              inventoryDeducted: sample.status !== OrderStatus.PAID,
              kdsStartedAt: sample.status !== OrderStatus.PAID ? createdAt : null,
            },
          ],
        },
        payments: {
          create: [
            {
              idempotencyKey: `seed-idem-${sample.orderCode}`,
              amount: total,
              method: sample.method,
              status: PaymentStatus.SUCCESS,
              transactionRef: `TXN-${sample.orderCode.replace('#', '')}`,
              createdAt,
            },
          ],
        },
      },
    });

    const pointsEarned = Math.floor(total * 0.05);
    if (pointsEarned > 0) {
      await client.loyaltyTransaction.create({
        data: {
          userId: customer.id,
          orderId: createdOrder.id,
          points: pointsEarned,
          balanceAfter: 15000,
          type: 'EARN',
          description: `Tích điểm hoàn 5% đơn hàng ${sample.orderCode}`,
          createdAt,
        },
      });
    }
  }

  await client.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED_INIT',
      entityType: 'DATABASE',
      entityId: 'BREWLITE-V2',
      details: 'Khởi tạo cơ sở dữ liệu BrewLite Roastery kèm định lượng BOM & trạm pha chế KDS',
    },
  });
}

if (require.main === module) {
  runDatabaseSeed(prisma)
    .then(() => {
      console.log('Seed dữ liệu mẫu BrewLite SmartPOS hoàn tất thành công!');
    })
    .catch((err) => {
      console.error('Lỗi khi chạy seed dữ liệu:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
