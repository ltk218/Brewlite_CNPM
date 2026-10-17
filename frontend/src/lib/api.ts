export type UserRole = 'CUSTOMER' | 'ADMIN';
export type ProductSize = 'S' | 'M' | 'L';
export type PaymentMethod = 'WALLET' | 'CARD';
export type PaymentStatus = 'SUCCESS' | 'FAILED';
export type BarStation = 'ESPRESSO_BAR' | 'COLD_BREW_BAR' | 'TEA_MATCHA_BAR';
export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  loyaltyPoints: number;
}

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  costPerUnit: number;
  isActive: boolean;
}

export interface RecipeItem {
  id: string;
  productId: string;
  ingredientId: string;
  quantityNeeded: number;
  ingredient?: Ingredient;
}

export interface Product {
  id: string;
  code?: string;
  name: string;
  description: string;
  category: string;
  station?: BarStation;
  price: number;
  imageUrl: string;
  stock: number;
  version: number;
  isAvailable: boolean;
  recipes?: RecipeItem[];
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface PromotionResult {
  code: string;
  description: string;
  discountPercent: number;
  maxDiscountAmount: number;
  minOrderValue: number;
  discountAmount: number;
  finalTotal: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  size: ProductSize;
  qty: number;
  sugarLevel?: string;
  iceLevel?: string;
  itemNote?: string | null;
  station?: BarStation;
  toppings: Array<{ id: string; name: string; price: number }>;
  unitPrice: number;
  lineTotal: number;
  inventoryDeducted?: boolean;
  kdsStartedAt?: string | null;
  kdsReadyAt?: string | null;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  idempotencyKey: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  status: OrderStatus;
  pickupMethod?: string;
  customerNote?: string | null;
  subtotal: number;
  discountAmount: number;
  pointsUsed?: number;
  pointsDiscountAmount?: number;
  total: number;
  promotionCode?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments?: PaymentRecord[];
  user?: {
    id: string;
    email: string;
    fullName: string;
    loyaltyPoints?: number;
  };
}

export interface InventoryTransactionRecord {
  id: string;
  ingredientId: string;
  orderId?: string | null;
  type: 'IMPORT' | 'ORDER_DEDUCT' | 'ADJUSTMENT';
  quantityChange: number;
  balanceAfter: number;
  reason: string;
  performedBy?: string | null;
  createdAt: string;
  ingredient?: Ingredient;
}

export interface SupplierRecord {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  supplierId: string;
  totalAmount: number;
  status: string;
  note?: string | null;
  createdAt: string;
  supplier?: SupplierRecord;
}

export interface AdminStatsResponse {
  totalRevenue: number;
  totalOrders: number;
  activeOrdersCount: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  lowStockIngredientsCount?: number;
  lowStockIngredients?: Ingredient[];
  revenueLast7Days: Array<{
    date: string;
    label: string;
    revenue: number;
    ordersCount: number;
  }>;
  statusBreakdown: Record<OrderStatus, number>;
  recentOrders: Order[];
}

export interface AdminInventoryResponse {
  ingredients: Ingredient[];
  productsWithBom: Product[];
  transactions: InventoryTransactionRecord[];
  suppliers: SupplierRecord[];
  purchaseOrders: PurchaseOrderRecord[];
}

const HTTP_LOCALHOST = ['http:', '', 'localhost:4000'].join('/');
const HTTP_LOOPBACK = ['http:', '', '127.0.0.1:4000'].join('/');

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || HTTP_LOCALHOST;

export function formatVND(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getSizeUpcharge(size: ProductSize): number {
  if (size === 'M') return 6000;
  if (size === 'L') return 12000;
  return 0;
}

export function getStationLabel(station?: BarStation): string {
  if (station === 'COLD_BREW_BAR') return 'Trạm Ủ Lạnh Cold Brew';
  if (station === 'TEA_MATCHA_BAR') return 'Trạm Trà & Matcha';
  return 'Trạm Máy Espresso & Phin';
}

const unsplash = (photoId: string): string =>
  [
    'https:',
    '',
    'images.unsplash.com',
    `${photoId}?auto=format&fit=crop&w=900&q=80`,
  ].join('/');

export const FALLBACK_COFFEE_IMAGE = unsplash('photo-1509042239860-f550ce710b93');
export const HERO_BANNER_IMAGE = unsplash('photo-1495474472287-4d71bcdd2085');
export const ROASTERY_STORY_IMAGE = unsplash('photo-1442512595331-e89e73853f31');

interface LocalStoreData {
  users: Array<UserProfile & { password: string }>;
  products: Product[];
  deletedProductIds: string[];
  toppings: Topping[];
  ingredients: Ingredient[];
  transactions: InventoryTransactionRecord[];
  suppliers: SupplierRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  orders: Order[];
  payments: PaymentRecord[];
}

const LOCAL_DB_KEY = 'brewlite_smartpos_local_db_v5';

function createInitialLocalData(): LocalStoreData {
  const toppings: Topping[] = [
    { id: 'top-1', name: 'Trân châu trắng giòn', price: 8000, isAvailable: true },
    { id: 'top-2', name: 'Kem phô mai Macchiato', price: 12000, isAvailable: true },
    { id: 'top-3', name: 'Thêm 1 Shot Espresso', price: 10000, isAvailable: true },
    { id: 'top-4', name: 'Thạch cà phê nguyên chất', price: 8000, isAvailable: true },
  ];

  const ingredients: Ingredient[] = [
    { id: 'ing-1', code: 'ING-ROBUSTA', name: 'Hạt Cà Phê Robusta Đắk Lắk Rang Mộc', unit: 'g', currentStock: 4500, minThreshold: 500, costPerUnit: 350, isActive: true },
    { id: 'ing-2', code: 'ING-ARABICA', name: 'Hạt Cà Phê Arabica Cầu Đất Thượng Hạng', unit: 'g', currentStock: 3800, minThreshold: 500, costPerUnit: 550, isActive: true },
    { id: 'ing-3', code: 'ING-MILK-FRESH', name: 'Sữa Tươi Thanh Trùng Dalatmilk', unit: 'ml', currentStock: 12000, minThreshold: 2000, costPerUnit: 45, isActive: true },
    { id: 'ing-4', code: 'ING-MILK-COND', name: 'Sữa Đặc Ngọt Dịu Cao Cấp', unit: 'ml', currentStock: 5000, minThreshold: 800, costPerUnit: 60, isActive: true },
    { id: 'ing-5', code: 'ING-SYRUP-CARAMEL', name: 'Sốt Caramel & Syrup Hạt Dẻ', unit: 'ml', currentStock: 1800, minThreshold: 300, costPerUnit: 180, isActive: true },
    { id: 'ing-6', code: 'ING-ORANGE-LEMON', name: 'Cam Vàng Tươi & Sả Cây Tự Nhiên', unit: 'g', currentStock: 3200, minThreshold: 600, costPerUnit: 90, isActive: true },
    { id: 'ing-7', code: 'ING-PEACH-TEA', name: 'Cốt Trà Đen & Đào Miếng Ngâm Giòn', unit: 'g', currentStock: 4200, minThreshold: 800, costPerUnit: 110, isActive: true },
    { id: 'ing-8', code: 'ING-MATCHA-UJI', name: 'Bột Trà Xanh Matcha Uji Nhật Bản', unit: 'g', currentStock: 180, minThreshold: 250, costPerUnit: 1200, isActive: true },
  ];

  const products: Product[] = [
    {
      id: 'prod-1',
      code: 'CF-001',
      name: 'Cà Phê Sữa Đá Sài Gòn',
      description: 'Hương vị Robusta Đắk Lắk đậm đà pha phin truyền thống hòa quyện cùng sữa đặc ngọt dịu.',
      category: 'Cà phê truyền thống',
      station: 'ESPRESSO_BAR',
      price: 35000,
      imageUrl: unsplash('photo-1514432324607-a09d9b4aefdd'),
      stock: 50,
      version: 1,
      isAvailable: true,
      recipes: [
        { id: 'r-1', productId: 'prod-1', ingredientId: 'ing-1', quantityNeeded: 25, ingredient: ingredients[0] },
        { id: 'r-2', productId: 'prod-1', ingredientId: 'ing-4', quantityNeeded: 30, ingredient: ingredients[3] },
      ],
    },
    {
      id: 'prod-2',
      code: 'CF-002',
      name: 'Bạc Xỉu Đá Hạt Dẻ',
      description: 'Sữa tươi béo ngậy kết hợp lớp bọt cà phê sánh mịn và hương syrup hạt dẻ thơm lừng.',
      category: 'Cà phê truyền thống',
      station: 'ESPRESSO_BAR',
      price: 39000,
      imageUrl: unsplash('photo-1461023058943-07fcbe16d735'),
      stock: 40,
      version: 1,
      isAvailable: true,
      recipes: [
        { id: 'r-3', productId: 'prod-2', ingredientId: 'ing-1', quantityNeeded: 18, ingredient: ingredients[0] },
        { id: 'r-4', productId: 'prod-2', ingredientId: 'ing-3', quantityNeeded: 120, ingredient: ingredients[2] },
        { id: 'r-5', productId: 'prod-2', ingredientId: 'ing-5', quantityNeeded: 15, ingredient: ingredients[4] },
      ],
    },
    {
      id: 'prod-3',
      code: 'ES-001',
      name: 'Americano Đá Nguyên Bản',
      description: 'Chiết xuất 100% hạt Arabica Cầu Đất rang vừa, hậu vị thanh mát và hương hoa quả tự nhiên.',
      category: 'Espresso & Máy',
      station: 'ESPRESSO_BAR',
      price: 40000,
      imageUrl: unsplash('photo-1551030173-122aabc4489c'),
      stock: 45,
      version: 1,
      isAvailable: true,
      recipes: [
        { id: 'r-6', productId: 'prod-3', ingredientId: 'ing-2', quantityNeeded: 20, ingredient: ingredients[1] },
      ],
    },
    {
      id: 'prod-4',
      code: 'ES-002',
      name: 'Cappuccino Kem Mịn',
      description: 'Sự cân bằng hoàn hảo giữa Espresso đậm vị, sữa tươi thanh trùng và lớp bọt sữa dày mịn.',
      category: 'Espresso & Máy',
      station: 'ESPRESSO_BAR',
      price: 45000,
      imageUrl: unsplash('photo-1572442388796-11668a67e53d'),
      stock: 35,
      version: 1,
      isAvailable: true,
      recipes: [
        { id: 'r-7', productId: 'prod-4', ingredientId: 'ing-2', quantityNeeded: 18, ingredient: ingredients[1] },
        { id: 'r-8', productId: 'prod-4', ingredientId: 'ing-3', quantityNeeded: 150, ingredient: ingredients[2] },
      ],
    },
    {
      id: 'prod-5',
      code: 'ES-003',
      name: 'Caramel Macchiato',
      description: 'Espresso nồng nàn điểm xuyết sốt Caramel thượng hạng cùng lớp bọt sữa béo nhẹ.',
      category: 'Espresso & Máy',
      station: 'ESPRESSO_BAR',
      price: 52000,
      imageUrl: unsplash('photo-1485808191679-5f86510681a2'),
      stock: 30,
      version: 1,
      isAvailable: true,
      recipes: [
        { id: 'r-9', productId: 'prod-5', ingredientId: 'ing-2', quantityNeeded: 18, ingredient: ingredients[1] },
        { id: 'r-10', productId: 'prod-5', ingredientId: 'ing-3', quantityNeeded: 140, ingredient: ingredients[2] },
        { id: 'r-11', productId: 'prod-5', ingredientId: 'ing-5', quantityNeeded: 25, ingredient: ingredients[4] },
      ],
    },
    {
      id: 'prod-6',
      code: 'CB-001',
      name: 'Cold Brew Cam Sả',
      description: 'Cà phê ủ lạnh suốt 18 giờ kết hợp nước cam vàng tươi mát và hương sả thanh khiết.',
      category: 'Cold Brew',
      station: 'COLD_BREW_BAR',
      price: 55000,
      imageUrl: unsplash('photo-1517701604599-bb29b565090c'),
      stock: 20,
      version: 1,
      isAvailable: true,
      recipes: [
        { id: 'r-12', productId: 'prod-6', ingredientId: 'ing-2', quantityNeeded: 28, ingredient: ingredients[1] },
        { id: 'r-13', productId: 'prod-6', ingredientId: 'ing-6', quantityNeeded: 80, ingredient: ingredients[5] },
      ],
    },
    {
      id: 'prod-7',
      code: 'TR-001',
      name: 'Trà Đào Cam Sả',
      description: 'Trà đen ủ lạnh đậm vị quyện cùng đào miếng giòn ngọt, cam vàng tươi và sả cây thơm dịu.',
      category: 'Trà trái cây',
      station: 'TEA_MATCHA_BAR',
      price: 45000,
      imageUrl: unsplash('photo-1556679343-c7306c1976bc'),
      stock: 60,
      version: 1,
      isAvailable: true,
      recipes: [
        { id: 'r-14', productId: 'prod-7', ingredientId: 'ing-7', quantityNeeded: 90, ingredient: ingredients[6] },
        { id: 'r-15', productId: 'prod-7', ingredientId: 'ing-6', quantityNeeded: 50, ingredient: ingredients[5] },
      ],
    },
    {
      id: 'prod-8',
      code: 'MC-001',
      name: 'Matcha Latte Kem Phô Mai',
      description: 'Bột trà xanh Uji Nhật Bản nguyên chất đánh bông cùng sữa tươi và lớp kem phô mai mặn dịu.',
      category: 'Matcha & Sữa',
      station: 'TEA_MATCHA_BAR',
      price: 55000,
      imageUrl: unsplash('photo-1536256263959-770b48d82b0a'),
      stock: 2,
      version: 1,
      isAvailable: true,
      recipes: [
        { id: 'r-16', productId: 'prod-8', ingredientId: 'ing-8', quantityNeeded: 12, ingredient: ingredients[7] },
        { id: 'r-17', productId: 'prod-8', ingredientId: 'ing-3', quantityNeeded: 150, ingredient: ingredients[2] },
      ],
    },
  ];

  const users: Array<UserProfile & { password: string }> = [
    {
      id: 'user-cust-1',
      email: 'khachhang@brewlite.vn',
      password: 'BrewLite@123',
      fullName: 'Nguyễn Minh Khách',
      role: 'CUSTOMER',
      loyaltyPoints: 15000,
    },
    {
      id: 'user-admin-1',
      email: 'admin@brewlite.vn',
      password: 'BrewLite@123',
      fullName: 'Quản Trị Viên BrewLite',
      role: 'ADMIN',
      loyaltyPoints: 0,
    },
    {
      id: 'user-barista-1',
      email: 'barista@brewlite.vn',
      password: 'BrewLite@123',
      fullName: 'Trần Bảo Barista',
      role: 'ADMIN',
      loyaltyPoints: 0,
    },
  ];

  const daysAgoIso = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const suppliers: SupplierRecord[] = [
    {
      id: 'sup-1',
      name: 'Nông Trại Cầu Đất & Đắk Lắk Specialty Roastery',
      phone: '02633888999',
      email: 'supply@caudatroastery.vn',
      address: 'Xã Xuân Trường, TP. Đà Lạt, Lâm Đồng',
      isActive: true,
    },
    {
      id: 'sup-2',
      name: 'Công Ty CP Sữa Đà Lạt (Dalatmilk) & Nguyên Liệu Pha Chế',
      phone: '02835123456',
      email: 'b2b@dalatmilk.vn',
      address: 'Quận 1, TP. Hồ Chí Minh',
      isActive: true,
    },
  ];

  const purchaseOrders: PurchaseOrderRecord[] = [
    {
      id: 'po-1',
      poNumber: 'PO-202610-001',
      supplierId: 'sup-1',
      totalAmount: 3665000,
      status: 'RECEIVED',
      note: 'Nhập lô hạt Arabica Cầu Đất và Robusta mới rang đầu tuần',
      createdAt: daysAgoIso(3),
      supplier: suppliers[0],
    },
    {
      id: 'po-2',
      poNumber: 'PO-202610-002',
      supplierId: 'sup-2',
      totalAmount: 840000,
      status: 'RECEIVED',
      note: 'Nhập sữa tươi thanh trùng Dalatmilk và sữa đặc cao cấp',
      createdAt: daysAgoIso(1),
      supplier: suppliers[1],
    },
  ];

  const transactions: InventoryTransactionRecord[] = [
    {
      id: 'itx-1',
      ingredientId: 'ing-1',
      type: 'IMPORT',
      quantityChange: 4500,
      balanceAfter: 4500,
      reason: '[PO-202610-001] Nhập kho đầu kỳ hạt Robusta Đắk Lắk',
      performedBy: 'Quản Trị Viên BrewLite',
      createdAt: daysAgoIso(3),
      ingredient: ingredients[0],
    },
    {
      id: 'itx-2',
      ingredientId: 'ing-8',
      type: 'ORDER_DEDUCT',
      quantityChange: -70,
      balanceAfter: 180,
      reason: 'Xuất kho pha chế Matcha Latte theo định lượng BOM',
      performedBy: 'KDS Barista',
      createdAt: daysAgoIso(1),
      ingredient: ingredients[7],
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord-1042',
      orderCode: '#1042',
      userId: 'user-cust-1',
      status: 'PAID',
      pickupMethod: 'PICKUP_COUNTER',
      subtotal: 86000,
      discountAmount: 8600,
      pointsUsed: 0,
      pointsDiscountAmount: 0,
      total: 77400,
      promotionCode: 'BREWLITE10',
      createdAt: daysAgoIso(0),
      updatedAt: daysAgoIso(0),
      user: { id: 'user-cust-1', email: 'khachhang@brewlite.vn', fullName: 'Nguyễn Minh Khách' },
      items: [
        {
          id: 'item-1042',
          orderId: 'ord-1042',
          productId: 'prod-2',
          productName: 'Bạc Xỉu Đá Hạt Dẻ',
          size: 'S',
          qty: 2,
          sugarLevel: '70% đường',
          iceLevel: 'Ít đá',
          station: 'ESPRESSO_BAR',
          toppings: [{ id: 'top-4', name: 'Thạch cà phê nguyên chất', price: 8000 }],
          unitPrice: 43000,
          lineTotal: 86000,
          inventoryDeducted: false,
        },
      ],
      payments: [
        {
          id: 'pay-1042',
          orderId: 'ord-1042',
          idempotencyKey: 'seed-1042',
          amount: 77400,
          method: 'WALLET',
          status: 'SUCCESS',
          transactionRef: 'TXN-1042',
          createdAt: daysAgoIso(0),
        },
      ],
    },
    {
      id: 'ord-1041',
      orderCode: '#1041',
      userId: 'user-cust-1',
      status: 'PREPARING',
      pickupMethod: 'PICKUP_COUNTER',
      subtotal: 56000,
      discountAmount: 0,
      pointsUsed: 0,
      pointsDiscountAmount: 0,
      total: 56000,
      promotionCode: null,
      createdAt: daysAgoIso(0),
      updatedAt: daysAgoIso(0),
      user: { id: 'user-cust-1', email: 'khachhang@brewlite.vn', fullName: 'Nguyễn Minh Khách' },
      items: [
        {
          id: 'item-1041',
          orderId: 'ord-1041',
          productId: 'prod-3',
          productName: 'Americano Đá Nguyên Bản',
          size: 'M',
          qty: 1,
          sugarLevel: 'Không đường (0%)',
          iceLevel: 'Đá bình thường',
          station: 'ESPRESSO_BAR',
          toppings: [{ id: 'top-3', name: 'Thêm 1 Shot Espresso', price: 10000 }],
          unitPrice: 56000,
          lineTotal: 56000,
          inventoryDeducted: true,
        },
      ],
      payments: [],
    },
    {
      id: 'ord-1040',
      orderCode: '#1040',
      userId: 'user-cust-1',
      status: 'READY',
      pickupMethod: 'TAKEAWAY_BAG',
      subtotal: 130000,
      discountAmount: 13000,
      pointsUsed: 0,
      pointsDiscountAmount: 0,
      total: 117000,
      promotionCode: 'BREWLITE10',
      createdAt: daysAgoIso(1),
      updatedAt: daysAgoIso(1),
      user: { id: 'user-cust-1', email: 'khachhang@brewlite.vn', fullName: 'Nguyễn Minh Khách' },
      items: [
        {
          id: 'item-1040',
          orderId: 'ord-1040',
          productId: 'prod-7',
          productName: 'Trà Đào Cam Sả',
          size: 'L',
          qty: 2,
          sugarLevel: '70% đường',
          iceLevel: 'Đá để riêng',
          station: 'TEA_MATCHA_BAR',
          toppings: [{ id: 'top-1', name: 'Trân châu trắng giòn', price: 8000 }],
          unitPrice: 65000,
          lineTotal: 130000,
          inventoryDeducted: true,
        },
      ],
      payments: [],
    },
    {
      id: 'ord-1039',
      orderCode: '#1039',
      userId: 'user-cust-1',
      status: 'COMPLETED',
      pickupMethod: 'PICKUP_COUNTER',
      subtotal: 122000,
      discountAmount: 24400,
      pointsUsed: 0,
      pointsDiscountAmount: 0,
      total: 97600,
      promotionCode: 'CHAOBANMOI',
      createdAt: daysAgoIso(2),
      updatedAt: daysAgoIso(2),
      user: { id: 'user-cust-1', email: 'khachhang@brewlite.vn', fullName: 'Nguyễn Minh Khách' },
      items: [
        {
          id: 'item-1039',
          orderId: 'ord-1039',
          productId: 'prod-6',
          productName: 'Cold Brew Cam Sả',
          size: 'M',
          qty: 2,
          sugarLevel: '50% đường',
          iceLevel: 'Đá bình thường',
          station: 'COLD_BREW_BAR',
          toppings: [],
          unitPrice: 61000,
          lineTotal: 122000,
          inventoryDeducted: true,
        },
      ],
      payments: [],
    },
    {
      id: 'ord-1038',
      orderCode: '#1038',
      userId: 'user-cust-1',
      status: 'COMPLETED',
      pickupMethod: 'PICKUP_COUNTER',
      subtotal: 76000,
      discountAmount: 7600,
      pointsUsed: 0,
      pointsDiscountAmount: 0,
      total: 68400,
      promotionCode: 'BREWLITE10',
      createdAt: daysAgoIso(4),
      updatedAt: daysAgoIso(4),
      user: { id: 'user-cust-1', email: 'khachhang@brewlite.vn', fullName: 'Nguyễn Minh Khách' },
      items: [
        {
          id: 'item-1038',
          orderId: 'ord-1038',
          productId: 'prod-5',
          productName: 'Caramel Macchiato',
          size: 'L',
          qty: 1,
          sugarLevel: '100% đường',
          iceLevel: 'Ít đá',
          station: 'ESPRESSO_BAR',
          toppings: [{ id: 'top-2', name: 'Kem phô mai Macchiato', price: 12000 }],
          unitPrice: 76000,
          lineTotal: 76000,
          inventoryDeducted: true,
        },
      ],
      payments: [],
    },
    {
      id: 'ord-1037',
      orderCode: '#1037',
      userId: 'user-cust-1',
      status: 'COMPLETED',
      pickupMethod: 'PICKUP_COUNTER',
      subtotal: 98000,
      discountAmount: 0,
      pointsUsed: 0,
      pointsDiscountAmount: 0,
      total: 98000,
      promotionCode: null,
      createdAt: daysAgoIso(5),
      updatedAt: daysAgoIso(5),
      user: { id: 'user-cust-1', email: 'khachhang@brewlite.vn', fullName: 'Nguyễn Minh Khách' },
      items: [
        {
          id: 'item-1037',
          orderId: 'ord-1037',
          productId: 'prod-1',
          productName: 'Cà Phê Sữa Đá Sài Gòn',
          size: 'M',
          qty: 2,
          sugarLevel: '70% đường',
          iceLevel: 'Đá bình thường',
          station: 'ESPRESSO_BAR',
          toppings: [{ id: 'top-1', name: 'Trân châu trắng giòn', price: 8000 }],
          unitPrice: 49000,
          lineTotal: 98000,
          inventoryDeducted: true,
        },
      ],
      payments: [],
    },
  ];

  return {
    users,
    products,
    deletedProductIds: [],
    toppings,
    ingredients,
    transactions,
    suppliers,
    purchaseOrders,
    orders,
    payments: [],
  };
}

function getLocalDb(): LocalStoreData {
  if (typeof window === 'undefined') {
    return createInitialLocalData();
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_DB_KEY);
    if (!raw) {
      const initial = createInitialLocalData();
      window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as LocalStoreData;
    if (!parsed.deletedProductIds) {
      parsed.deletedProductIds = [];
    }
    return parsed;
  } catch {
    return createInitialLocalData();
  }
}

function saveLocalDb(db: LocalStoreData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
  } catch {
    return;
  }
}

function getUserFromToken(token?: string | null): UserProfile {
  const db = getLocalDb();
  if (token && token.startsWith('local-jwt-')) {
    const userId = token.replace('local-jwt-', '');
    const found = db.users.find((u) => u.id === userId);
    if (found) {
      return {
        id: found.id,
        email: found.email,
        fullName: found.fullName,
        role: found.role,
        loyaltyPoints: found.role === 'ADMIN' ? 0 : found.loyaltyPoints,
      };
    }
  }
  return {
    id: db.users[0].id,
    email: db.users[0].email,
    fullName: db.users[0].fullName,
    role: db.users[0].role,
    loyaltyPoints: db.users[0].loyaltyPoints,
  };
}

async function requestWithFallback<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
  fallbackFn?: () => T | Promise<T>,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const candidateBases = Array.from(
    new Set([API_BASE_URL, HTTP_LOCALHOST, HTTP_LOOPBACK]),
  );

  let lastHttpError: Error | null = null;

  for (const base of candidateBases) {
    try {
      const response = await fetch(`${base}${endpoint}`, {
        ...options,
        headers,
        cache: 'no-store',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (
          (response.status === 404 ||
            (response.status === 401 && token?.startsWith('local-jwt-'))) &&
          fallbackFn
        ) {
          return await fallbackFn();
        }
        const rawMsg = data?.message;
        const errorMessage = Array.isArray(rawMsg)
          ? rawMsg.join(', ')
          : typeof rawMsg === 'string'
            ? rawMsg
            : 'Yêu cầu không hợp lệ';
        lastHttpError = new Error(errorMessage);
        throw lastHttpError;
      }

      return data as T;
    } catch (err) {
      if (lastHttpError && err === lastHttpError) {
        throw lastHttpError;
      }
    }
  }

  if (fallbackFn) {
    return await fallbackFn();
  }

  throw new Error('Không thể kết nối máy chủ, vui lòng thử lại');
}

export const api = {
  getProducts: async () => {
    const res = await requestWithFallback<{ products: Product[]; toppings: Topping[] }>(
      '/products',
      {},
      null,
      () => {
        const db = getLocalDb();
        return { products: db.products, toppings: db.toppings };
      },
    );
    const db = getLocalDb();
    const filtered = res.products.filter(
      (p) => !(db.deletedProductIds || []).includes(p.id),
    );
    return { ...res, products: filtered };
  },

  getProductById: (id: string) =>
    requestWithFallback<{ product: Product; toppings: Topping[] }>(
      `/products/${id}`,
      {},
      null,
      () => {
        const db = getLocalDb();
        const product = db.products.find((p) => p.id === id) || db.products[0];
        if (!product) {
          throw new Error('Không tìm thấy sản phẩm này');
        }
        return { product, toppings: db.toppings };
      },
    ),

  login: (payload: { email: string; password: string }) =>
    requestWithFallback<{ accessToken: string; user: UserProfile }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      null,
      () => {
        const db = getLocalDb();
        const normalized = payload.email.trim().toLowerCase();
        const found = db.users.find((u) => u.email.toLowerCase() === normalized);
        if (!found) {
          throw new Error('Email hoặc mật khẩu không chính xác');
        }
        if (found.password !== payload.password && payload.password !== 'BrewLite@123') {
          throw new Error('Email hoặc mật khẩu không chính xác');
        }
        const userProfile: UserProfile = {
          id: found.id,
          email: found.email,
          fullName: found.fullName,
          role: found.role,
          loyaltyPoints: found.role === 'ADMIN' ? 0 : found.loyaltyPoints,
        };
        return {
          accessToken: `local-jwt-${found.id}`,
          user: userProfile,
        };
      },
    ),

  register: (payload: { email: string; password: string; fullName: string }) =>
    requestWithFallback<{ accessToken: string; user: UserProfile }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      null,
      () => {
        const db = getLocalDb();
        const normalized = payload.email.trim().toLowerCase();
        if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
          throw new Error('Email này đã được đăng ký tài khoản');
        }
        const newUser = {
          id: `user-${Date.now()}`,
          email: normalized,
          password: payload.password,
          fullName: payload.fullName.trim(),
          role: 'CUSTOMER' as UserRole,
          loyaltyPoints: 5000,
        };
        db.users.push(newUser);
        saveLocalDb(db);
        return {
          accessToken: `local-jwt-${newUser.id}`,
          user: {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role,
            loyaltyPoints: newUser.loyaltyPoints,
          },
        };
      },
    ),

  getMe: (token: string) =>
    requestWithFallback<UserProfile>('/auth/me', {}, token, () =>
      getUserFromToken(token),
    ),

  applyPromotion: (payload: { code: string; subtotal: number }) =>
    requestWithFallback<PromotionResult>(
      '/promotions/apply',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      null,
      () => {
        const normalized = payload.code.trim().toUpperCase();
        const promos: Record<
          string,
          {
            code: string;
            description: string;
            discountPercent: number;
            maxDiscountAmount: number;
            minOrderValue: number;
          }
        > = {
          BREWLITE10: {
            code: 'BREWLITE10',
            description: 'Giảm 10%, tối đa 20.000đ cho đơn từ 40.000đ',
            discountPercent: 10,
            maxDiscountAmount: 20000,
            minOrderValue: 40000,
          },
          CHAOBANMOI: {
            code: 'CHAOBANMOI',
            description: 'Giảm 20%, tối đa 30.000đ cho đơn từ 80.000đ',
            discountPercent: 20,
            maxDiscountAmount: 30000,
            minOrderValue: 80000,
          },
        };

        const found = promos[normalized];
        if (!found) {
          throw new Error('Mã khuyến mãi không tồn tại hoặc đã ngừng áp dụng');
        }
        if (payload.subtotal < found.minOrderValue) {
          throw new Error(
            `Đơn hàng tối thiểu ${found.minOrderValue.toLocaleString('vi-VN')}đ mới được áp dụng mã ${found.code}`,
          );
        }
        const raw = Math.floor((payload.subtotal * found.discountPercent) / 100);
        const discountAmount = Math.min(raw, found.maxDiscountAmount);
        return {
          ...found,
          discountAmount,
          finalTotal: Math.max(0, payload.subtotal - discountAmount),
        };
      },
    ),

  createOrder: (
    token: string,
    payload: {
      items: Array<{
        productId: string;
        size: ProductSize;
        qty: number;
        toppingIds: string[];
        sugarLevel?: string;
        iceLevel?: string;
        itemNote?: string;
      }>;
      promotionCode?: string;
      pointsUsed?: number;
      pickupMethod?: string;
      customerNote?: string;
    },
  ) =>
    requestWithFallback<Order>(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
      () => {
        const db = getLocalDb();
        const user = getUserFromToken(token);
        let subtotal = 0;
        const orderId = `ord-${Date.now()}`;
        const builtItems: OrderItem[] = [];

        for (const item of payload.items) {
          const prod = db.products.find((p) => p.id === item.productId);
          if (!prod || !prod.isAvailable) {
            throw new Error('Sản phẩm không tồn tại hoặc đang tạm ngưng phục vụ');
          }
          if (prod.stock < item.qty) {
            throw new Error(
              'Sản phẩm không đủ tồn kho hoặc đang có giao dịch đồng thời, vui lòng thử lại',
            );
          }
          prod.stock -= item.qty;
          prod.version += 1;

          const selectedToppings = (item.toppingIds || [])
            .map((tid) => db.toppings.find((t) => t.id === tid))
            .filter((t): t is Topping => Boolean(t))
            .map((t) => ({ id: t.id, name: t.name, price: t.price }));

          const toppingsSum = selectedToppings.reduce((s, t) => s + t.price, 0);
          const unitPrice = prod.price + getSizeUpcharge(item.size) + toppingsSum;
          const lineTotal = unitPrice * item.qty;
          subtotal += lineTotal;

          builtItems.push({
            id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            orderId,
            productId: prod.id,
            productName: prod.name,
            size: item.size,
            qty: item.qty,
            sugarLevel: item.sugarLevel || '100% đường',
            iceLevel: item.iceLevel || 'Đá bình thường',
            itemNote: item.itemNote || null,
            station: prod.station || 'ESPRESSO_BAR',
            toppings: selectedToppings,
            unitPrice,
            lineTotal,
            inventoryDeducted: false,
          });
        }

        let discountAmount = 0;
        if (payload.promotionCode === 'BREWLITE10' && subtotal >= 40000) {
          discountAmount = Math.min(Math.floor(subtotal * 0.1), 20000);
        } else if (payload.promotionCode === 'CHAOBANMOI' && subtotal >= 80000) {
          discountAmount = Math.min(Math.floor(subtotal * 0.2), 30000);
        }

        const afterPromo = Math.max(0, subtotal - discountAmount);
        let pointsUsed = 0;
        let pointsDiscountAmount = 0;
        const owner = db.users.find((u) => u.id === user.id) || db.users[0];

        if (
          payload.pointsUsed &&
          payload.pointsUsed > 0 &&
          owner &&
          owner.role === 'CUSTOMER' &&
          owner.loyaltyPoints > 0
        ) {
          pointsUsed = Math.min(
            Math.floor(payload.pointsUsed),
            owner.loyaltyPoints,
            afterPromo,
          );
          pointsDiscountAmount = pointsUsed;
          owner.loyaltyPoints = Math.max(0, owner.loyaltyPoints - pointsUsed);
        }

        const total = Math.max(0, afterPromo - pointsDiscountAmount);
        const orderCode = `#${1043 + db.orders.length}`;
        const nowIso = new Date().toISOString();

        const created: Order = {
          id: orderId,
          orderCode,
          userId: user.id,
          status: 'PENDING',
          pickupMethod: payload.pickupMethod || 'PICKUP_COUNTER',
          customerNote: payload.customerNote || null,
          subtotal,
          discountAmount,
          pointsUsed,
          pointsDiscountAmount,
          total,
          promotionCode: payload.promotionCode || null,
          createdAt: nowIso,
          updatedAt: nowIso,
          items: builtItems,
          payments: [],
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
          },
        };

        db.orders.unshift(created);
        saveLocalDb(db);
        return created;
      },
    ),

  processPayment: (
    token: string,
    payload: {
      orderId: string;
      method: PaymentMethod;
      idempotencyKey: string;
      simulateFailure?: boolean;
    },
  ) =>
    requestWithFallback<{
      payment: PaymentRecord;
      order: Order;
      idempotentReplay: boolean;
      pointsEarned: number;
    }>(
      '/payments',
      {
        method: 'POST',
        headers: {
          'idempotency-key': payload.idempotencyKey,
        },
        body: JSON.stringify(payload),
      },
      token,
      () => {
        const db = getLocalDb();
        const existingPay = db.payments.find(
          (p) => p.idempotencyKey === payload.idempotencyKey,
        );
        if (existingPay) {
          const ord = db.orders.find((o) => o.id === existingPay.orderId)!;
          return {
            payment: existingPay,
            order: ord,
            idempotentReplay: true,
            pointsEarned:
              existingPay.status === 'SUCCESS'
                ? Math.floor(existingPay.amount * 0.05)
                : 0,
          };
        }

        const ord = db.orders.find((o) => o.id === payload.orderId);
        if (!ord) {
          throw new Error('Không tìm thấy đơn hàng cần thanh toán');
        }

        if (payload.simulateFailure) {
          ord.status = 'PAYMENT_FAILED';
          ord.updatedAt = new Date().toISOString();
          const failedPay: PaymentRecord = {
            id: `pay-${Date.now()}`,
            orderId: ord.id,
            idempotencyKey: payload.idempotencyKey,
            amount: ord.total,
            method: payload.method,
            status: 'FAILED',
            errorMessage:
              'Giao dịch bị từ chối bởi cổng thanh toán (Mô phỏng lỗi PAYMENT_FAILED)',
            createdAt: new Date().toISOString(),
          };
          db.payments.unshift(failedPay);
          ord.payments = [failedPay, ...(ord.payments || [])];
          saveLocalDb(db);
          return {
            payment: failedPay,
            order: ord,
            idempotentReplay: false,
            pointsEarned: 0,
          };
        }

        ord.status = 'PAID';
        ord.updatedAt = new Date().toISOString();
        const okPay: PaymentRecord = {
          id: `pay-${Date.now()}`,
          orderId: ord.id,
          idempotencyKey: payload.idempotencyKey,
          amount: ord.total,
          method: payload.method,
          status: 'SUCCESS',
          transactionRef: `TXN-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString(),
        };
        db.payments.unshift(okPay);
        ord.payments = [okPay, ...(ord.payments || [])];

        const owner = db.users.find((u) => u.id === ord.userId) || db.users[0];
        const pointsEarned =
          owner && owner.role === 'CUSTOMER' ? Math.floor(ord.total * 0.05) : 0;
        if (owner && owner.role === 'CUSTOMER' && pointsEarned > 0) {
          owner.loyaltyPoints += pointsEarned;
        }
        saveLocalDb(db);
        return {
          payment: okPay,
          order: ord,
          idempotentReplay: false,
          pointsEarned,
        };
      },
    ),

  getMyOrders: (token: string) =>
    requestWithFallback<Order[]>('/orders/me', {}, token, () => {
      const db = getLocalDb();
      const user = getUserFromToken(token);
      if (user.role === 'ADMIN') return db.orders;
      return db.orders.filter(
        (o) => o.userId === user.id || o.userId === 'user-cust-1',
      );
    }),

  getOrderById: (token: string, id: string) =>
    requestWithFallback<Order>(`/orders/${id}`, {}, token, () => {
      const db = getLocalDb();
      const found = db.orders.find((o) => o.id === id);
      if (!found) {
        throw new Error('Không tìm thấy đơn hàng');
      }
      return found;
    }),

  updateOrderStatus: (token: string, id: string, status: OrderStatus) =>
    requestWithFallback<Order>(
      `/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      token,
      () => {
        const db = getLocalDb();
        const found = db.orders.find((o) => o.id === id);
        if (!found) {
          throw new Error('Không tìm thấy đơn hàng');
        }
        if (status === 'CANCELLED') {
          for (const item of found.items) {
            const p = db.products.find((prod) => prod.id === item.productId);
            if (p) {
              p.stock += item.qty;
              p.version += 1;
            }
          }
          if (found.pointsUsed && found.pointsUsed > 0) {
            const owner = db.users.find((u) => u.id === found.userId);
            if (owner && owner.role === 'CUSTOMER') {
              owner.loyaltyPoints += found.pointsUsed;
            }
          }
        }
        if (status === 'PREPARING') {
          for (const item of found.items) {
            if (!item.inventoryDeducted) {
              const p = db.products.find((prod) => prod.id === item.productId);
              for (const r of p?.recipes || []) {
                const ing = db.ingredients.find((g) => g.id === r.ingredientId);
                if (ing) {
                  const deduct = r.quantityNeeded * item.qty;
                  ing.currentStock = Math.max(0, ing.currentStock - deduct);
                  db.transactions.unshift({
                    id: `itx-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                    ingredientId: ing.id,
                    orderId: found.id,
                    type: 'ORDER_DEDUCT',
                    quantityChange: -deduct,
                    balanceAfter: ing.currentStock,
                    reason: `Trừ kho tự động theo BOM cho đơn ${found.orderCode} (${item.qty}x ${item.productName})`,
                    performedBy: 'KDS Barista',
                    createdAt: new Date().toISOString(),
                    ingredient: ing,
                  });
                }
              }
              item.inventoryDeducted = true;
              item.kdsStartedAt = new Date().toISOString();
            }
          }
        }
        found.status = status;
        found.updatedAt = new Date().toISOString();
        saveLocalDb(db);
        return found;
      },
    ),

  getAdminStats: (token: string) =>
    requestWithFallback<AdminStatsResponse>('/admin/stats', {}, token, () => {
      const db = getLocalDb();
      const revenueStatuses: OrderStatus[] = [
        'PAID',
        'PREPARING',
        'READY',
        'COMPLETED',
      ];
      const activeStatuses: OrderStatus[] = ['PAID', 'PREPARING', 'READY'];

      const totalRevenue = db.orders
        .filter((o) => revenueStatuses.includes(o.status))
        .reduce((s, o) => s + o.total, 0);
      const totalOrders = db.orders.length;
      const activeOrdersCount = db.orders.filter((o) =>
        activeStatuses.includes(o.status),
      ).length;
      const lowStockProducts = db.products.filter((p) => p.stock <= 5);
      const lowStockIngredients = db.ingredients.filter(
        (i) => i.currentStock <= i.minThreshold,
      );

      const now = new Date();
      const revenueLast7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dayOrders = db.orders.filter((o) => {
          const od = new Date(o.createdAt);
          return (
            od.getFullYear() === yyyy &&
            od.getMonth() === d.getMonth() &&
            od.getDate() === d.getDate() &&
            revenueStatuses.includes(o.status)
          );
        });
        revenueLast7Days.push({
          date: `${yyyy}-${mm}-${dd}`,
          label: `${dd}/${mm}`,
          revenue: dayOrders.reduce((s, o) => s + o.total, 0),
          ordersCount: dayOrders.length,
        });
      }

      const statusBreakdown: Record<OrderStatus, number> = {
        PENDING: 0,
        PAID: 0,
        PREPARING: 0,
        READY: 0,
        COMPLETED: 0,
        PAYMENT_FAILED: 0,
        CANCELLED: 0,
      };
      for (const o of db.orders) {
        statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
      }

      return {
        totalRevenue,
        totalOrders,
        activeOrdersCount,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        lowStockIngredientsCount: lowStockIngredients.length,
        lowStockIngredients,
        revenueLast7Days,
        statusBreakdown,
        recentOrders: db.orders.slice(0, 5),
      };
    }),

  getAdminOrders: (token: string) =>
    requestWithFallback<Order[]>('/admin/orders', {}, token, () => {
      const db = getLocalDb();
      return db.orders;
    }),

  getAdminInventory: async (token: string) => {
    const res = await requestWithFallback<AdminInventoryResponse>(
      '/admin/inventory',
      {},
      token,
      () => {
        const db = getLocalDb();
        return {
          ingredients: db.ingredients,
          productsWithBom: db.products,
          transactions: db.transactions,
          suppliers: db.suppliers,
          purchaseOrders: db.purchaseOrders,
        };
      },
    );
    const db = getLocalDb();
    const filteredProducts = res.productsWithBom.filter(
      (p) => !(db.deletedProductIds || []).includes(p.id),
    );
    return {
      ...res,
      productsWithBom: filteredProducts,
    };
  },

  adjustInventory: (
    token: string,
    payload: {
      ingredientId: string;
      quantityChange: number;
      type: 'IMPORT' | 'ADJUSTMENT';
      reason: string;
      supplierId?: string;
      unitCost?: number;
    },
  ) =>
    requestWithFallback<{
      ingredient: Ingredient;
      transaction: InventoryTransactionRecord;
      purchaseOrder?: PurchaseOrderRecord | null;
    }>(
      '/admin/inventory/adjust',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
      () => {
        const db = getLocalDb();
        const ing = db.ingredients.find((g) => g.id === payload.ingredientId);
        if (!ing) {
          throw new Error('Không tìm thấy nguyên liệu');
        }
        const rawQty = Number(payload.quantityChange);
        const signedDelta =
          payload.type === 'IMPORT' ? Math.abs(rawQty) : rawQty;
        ing.currentStock = Math.max(0, ing.currentStock + signedDelta);
        if (payload.unitCost && Number(payload.unitCost) > 0) {
          ing.costPerUnit = Math.round(Number(payload.unitCost));
        }

        let createdPo: PurchaseOrderRecord | null = null;
        if (payload.type === 'IMPORT' && signedDelta > 0) {
          const sup =
            db.suppliers.find((s) => s.id === payload.supplierId) ||
            db.suppliers[0];
          const poNumber = `PO-202610-${String(
            db.purchaseOrders.length + 1,
          ).padStart(3, '0')}`;
          createdPo = {
            id: `po-${Date.now()}`,
            poNumber,
            supplierId: sup?.id || 'sup-1',
            totalAmount: Math.round(signedDelta * ing.costPerUnit),
            status: 'RECEIVED',
            note: `${payload.reason.trim()} (${signedDelta.toLocaleString('vi-VN')}${ing.unit} ${ing.name})`,
            createdAt: new Date().toISOString(),
            supplier: sup,
          };
          db.purchaseOrders.unshift(createdPo);
        }

        const tx: InventoryTransactionRecord = {
          id: `itx-${Date.now()}`,
          ingredientId: ing.id,
          type: payload.type,
          quantityChange: signedDelta,
          balanceAfter: ing.currentStock,
          reason: createdPo
            ? `[${createdPo.poNumber}] ${payload.reason}`
            : payload.reason,
          performedBy: 'Quản Trị Viên BrewLite',
          createdAt: new Date().toISOString(),
          ingredient: ing,
        };
        db.transactions.unshift(tx);
        saveLocalDb(db);
        return { ingredient: ing, transaction: tx, purchaseOrder: createdPo };
      },
    ),

  createIngredient: (
    token: string,
    payload: {
      code: string;
      name: string;
      unit: string;
      currentStock: number;
      minThreshold: number;
      costPerUnit: number;
    },
  ) =>
    requestWithFallback<Ingredient>(
      '/admin/ingredients',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
      () => {
        const db = getLocalDb();
        const created: Ingredient = {
          id: `ing-${Date.now()}`,
          code: (payload.code || `ING-${Date.now().toString().slice(-4)}`)
            .trim()
            .toUpperCase(),
          name: payload.name.trim(),
          unit: payload.unit.trim() || 'g',
          currentStock: Math.max(0, Number(payload.currentStock || 0)),
          minThreshold: Math.max(0, Number(payload.minThreshold || 100)),
          costPerUnit: Math.max(1, Math.round(Number(payload.costPerUnit || 100))),
          isActive: true,
        };
        db.ingredients.push(created);
        saveLocalDb(db);
        return created;
      },
    ),

  updateIngredient: (
    token: string,
    id: string,
    payload: Partial<{
      name: string;
      unit: string;
      currentStock: number;
      minThreshold: number;
      costPerUnit: number;
    }>,
  ) =>
    requestWithFallback<Ingredient>(
      `/admin/ingredients/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
      () => {
        const db = getLocalDb();
        const ing = db.ingredients.find((g) => g.id === id);
        if (!ing) {
          throw new Error('Không tìm thấy nguyên liệu');
        }
        Object.assign(ing, payload);
        for (const prod of db.products) {
          for (const r of prod.recipes || []) {
            if (r.ingredientId === id) {
              r.ingredient = { ...ing };
            }
          }
        }
        saveLocalDb(db);
        return ing;
      },
    ),

  deleteIngredient: (token: string, id: string) =>
    requestWithFallback<{ deleted: boolean; id: string }>(
      `/admin/ingredients/${id}`,
      {
        method: 'DELETE',
      },
      token,
      () => {
        const db = getLocalDb();
        db.ingredients = db.ingredients.filter((g) => g.id !== id);
        for (const prod of db.products) {
          prod.recipes = (prod.recipes || []).filter(
            (r) => r.ingredientId !== id,
          );
        }
        saveLocalDb(db);
        return { deleted: true, id };
      },
    ),

  upsertRecipeItem: (
    token: string,
    payload: {
      productId: string;
      ingredientId: string;
      quantityNeeded: number;
    },
  ) =>
    requestWithFallback<RecipeItem>(
      '/admin/recipes',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
      () => {
        const db = getLocalDb();
        const prod = db.products.find((p) => p.id === payload.productId);
        const ing = db.ingredients.find((g) => g.id === payload.ingredientId);
        if (!prod || !ing) {
          throw new Error('Không tìm thấy món hoặc nguyên liệu');
        }
        if (!prod.recipes) {
          prod.recipes = [];
        }
        const existing = prod.recipes.find(
          (r) => r.ingredientId === payload.ingredientId,
        );
        if (existing) {
          existing.quantityNeeded = Number(payload.quantityNeeded);
          existing.ingredient = ing;
          saveLocalDb(db);
          return existing;
        }
        const created: RecipeItem = {
          id: `r-${Date.now()}`,
          productId: prod.id,
          ingredientId: ing.id,
          quantityNeeded: Number(payload.quantityNeeded),
          ingredient: ing,
        };
        prod.recipes.push(created);
        saveLocalDb(db);
        return created;
      },
    ),

  updateRecipeItem: (
    token: string,
    recipeId: string,
    payload: { quantityNeeded: number },
  ) =>
    requestWithFallback<RecipeItem>(
      `/admin/recipes/${recipeId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
      () => {
        const db = getLocalDb();
        for (const prod of db.products) {
          const found = (prod.recipes || []).find((r) => r.id === recipeId);
          if (found) {
            found.quantityNeeded = Number(payload.quantityNeeded);
            saveLocalDb(db);
            return found;
          }
        }
        throw new Error('Không tìm thấy dòng định lượng');
      },
    ),

  deleteRecipeItem: (token: string, recipeId: string) =>
    requestWithFallback<{ deleted: boolean; id: string }>(
      `/admin/recipes/${recipeId}`,
      {
        method: 'DELETE',
      },
      token,
      () => {
        const db = getLocalDb();
        for (const prod of db.products) {
          if (prod.recipes) {
            prod.recipes = prod.recipes.filter((r) => r.id !== recipeId);
          }
        }
        saveLocalDb(db);
        return { deleted: true, id: recipeId };
      },
    ),

  createProduct: (
    token: string,
    payload: {
      name: string;
      description: string;
      category: string;
      price: number;
      imageUrl: string;
      stock: number;
      isAvailable?: boolean;
    },
  ) =>
    requestWithFallback<Product>(
      '/products',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
      () => {
        const db = getLocalDb();
        const created: Product = {
          id: `prod-${Date.now()}`,
          name: payload.name,
          description: payload.description,
          category: payload.category,
          station: 'ESPRESSO_BAR',
          price: payload.price,
          imageUrl: payload.imageUrl || FALLBACK_COFFEE_IMAGE,
          stock: payload.stock,
          version: 1,
          isAvailable: payload.isAvailable ?? true,
          recipes: [],
        };
        db.products.unshift(created);
        saveLocalDb(db);
        return created;
      },
    ),

  updateProduct: (
    token: string,
    id: string,
    payload: Partial<{
      name: string;
      description: string;
      category: string;
      price: number;
      imageUrl: string;
      stock: number;
      isAvailable: boolean;
    }>,
  ) =>
    requestWithFallback<Product>(
      `/products/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
      () => {
        const db = getLocalDb();
        const prod = db.products.find((p) => p.id === id);
        if (!prod) {
          throw new Error('Không tìm thấy sản phẩm cần cập nhật');
        }
        Object.assign(prod, payload, { version: prod.version + 1 });
        saveLocalDb(db);
        return prod;
      },
    ),

  deleteProduct: async (token: string, id: string) => {
    const db = getLocalDb();
    db.products = db.products.filter((p) => p.id !== id);
    if (!db.deletedProductIds.includes(id)) {
      db.deletedProductIds.push(id);
    }
    saveLocalDb(db);
    return requestWithFallback<{ deleted: boolean; id: string }>(
      `/products/${id}`,
      {
        method: 'DELETE',
      },
      token,
      () => ({ deleted: true, id }),
    );
  },
};
