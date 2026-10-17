'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Save,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import {
  api,
  FALLBACK_COFFEE_IMAGE,
  formatVND,
  Product,
} from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';

export default function AdminProductsPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [draftEdits, setDraftEdits] = useState<
    Record<string, { price: number; stock: number; isAvailable: boolean }>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'Espresso & Máy',
    price: 45000,
    imageUrl: FALLBACK_COFFEE_IMAGE,
    stock: 30,
    isAvailable: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts();
      setProducts(data.products);
      const initialDrafts: Record<
        string,
        { price: number; stock: number; isAvailable: boolean }
      > = {};
      for (const p of data.products) {
        initialDrafts[p.id] = {
          price: p.price,
          stock: p.stock,
          isAvailable: p.isAvailable,
        };
      }
      setDraftEdits(initialDrafts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải danh sách thực đơn',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveRow = async (productId: string) => {
    if (!token) return;
    const draft = draftEdits[productId];
    if (!draft) return;

    setSavingId(productId);
    setError(null);
    try {
      const updated = await api.updateProduct(token, productId, {
        price: Number(draft.price),
        stock: Number(draft.stock),
        isAvailable: draft.isAvailable,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updated : p)),
      );
      showToast(`Đã cập nhật "${updated.name}" thành công`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể lưu thay đổi sản phẩm',
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !productToDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteProduct(token, productToDelete.id);
      const removedName = productToDelete.name;
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
      showToast(`Đã xóa món "${removedName}" khỏi thực đơn`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể xóa sản phẩm này',
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const created = await api.createProduct(token, {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
      });
      setProducts((prev) => [created, ...prev]);
      setDraftEdits((prev) => ({
        ...prev,
        [created.id]: {
          price: created.price,
          stock: created.stock,
          isAvailable: created.isAvailable,
        },
      }));
      setShowCreateModal(false);
      setNewProduct({
        name: '',
        description: '',
        category: 'Espresso & Máy',
        price: 45000,
        imageUrl: FALLBACK_COFFEE_IMAGE,
        stock: 30,
        isAvailable: true,
      });
      showToast(`Đã thêm món "${created.name}" vào thực đơn`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thêm món mới');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#3E2723] text-white text-xs sm:text-sm font-bold shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2C1810]">
            Quản lý Thực đơn & Tồn kho
          </h1>
          <p className="text-sm text-[#795548]">
            Cập nhật nhanh số lượng tồn kho (stock), giá bán, trạng thái phục vụ hoặc xóa món
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchProducts}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#E6DCD2] text-xs sm:text-sm font-bold text-[#2C1810] hover:bg-[#FDFBF7]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3E2723] text-white text-xs sm:text-sm font-bold hover:bg-[#2C1810] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm món mới</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white border border-[#E6DCD2] rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E6DCD2] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-[#E6DCD2] text-[11px] font-bold uppercase tracking-wider text-[#795548]">
                  <th className="py-3.5 px-5">Sản phẩm</th>
                  <th className="py-3.5 px-5">Danh mục</th>
                  <th className="py-3.5 px-5">Giá bán (VNĐ)</th>
                  <th className="py-3.5 px-5">Tồn kho (Stock)</th>
                  <th className="py-3.5 px-5">Trạng thái mở bán</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DCD2] text-sm">
                {products.map((product) => {
                  const draft = draftEdits[product.id] ?? {
                    price: product.price,
                    stock: product.stock,
                    isAvailable: product.isAvailable,
                  };
                  const isDirty =
                    Number(draft.price) !== product.price ||
                    Number(draft.stock) !== product.stock ||
                    draft.isAvailable !== product.isAvailable;

                  return (
                    <tr key={product.id} className="hover:bg-[#FDFBF7]/60">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl || FALLBACK_COFFEE_IMAGE}
                            alt={product.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                FALLBACK_COFFEE_IMAGE;
                            }}
                            className="w-12 h-12 rounded-xl object-cover bg-[#EFE8DF] border border-[#E6DCD2] shrink-0"
                          />
                          <div>
                            <p className="font-bold text-[#2C1810]">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#795548] line-clamp-1 max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDFBF7] border border-[#E6DCD2] text-[#2C1810]">
                          {product.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <input
                          type="number"
                          min={1000}
                          step={1000}
                          value={draft.price}
                          onChange={(e) =>
                            setDraftEdits((prev) => ({
                              ...prev,
                              [product.id]: {
                                ...draft,
                                price: Number(e.target.value),
                              },
                            }))
                          }
                          className="w-28 px-3 py-1.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm font-bold text-[#B45309] tabular-nums focus:outline-none focus:border-[#3E2723]"
                        />
                        <span className="block text-[11px] text-[#795548] mt-0.5 tabular-nums">
                          Hiện tại: {formatVND(product.price)}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={draft.stock}
                            onChange={(e) =>
                              setDraftEdits((prev) => ({
                                ...prev,
                                [product.id]: {
                                  ...draft,
                                  stock: Math.max(0, Number(e.target.value)),
                                },
                              }))
                            }
                            className={`w-20 px-3 py-1.5 rounded-xl border text-sm font-bold tabular-nums focus:outline-none ${
                              draft.stock <= 5
                                ? 'bg-red-50 border-red-300 text-red-700'
                                : 'bg-[#FDFBF7] border-[#E6DCD2] text-[#2C1810]'
                            }`}
                          />
                          <span className="text-xs text-[#795548]">ly</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <button
                          type="button"
                          onClick={() =>
                            setDraftEdits((prev) => ({
                              ...prev,
                              [product.id]: {
                                ...draft,
                                isAvailable: !draft.isAvailable,
                              },
                            }))
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                            draft.isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-100 text-[#795548] border-[#E6DCD2]'
                          }`}
                        >
                          {draft.isAvailable ? 'Đang mở bán' : 'Tạm ngưng'}
                        </button>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={!isDirty || savingId === product.id}
                            onClick={() => handleSaveRow(product.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810] disabled:bg-stone-200 disabled:text-[#795548] transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>
                              {savingId === product.id ? 'Đang lưu...' : 'Lưu'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            title="Xóa món này khỏi thực đơn"
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6DCD2] pb-3">
              <h3 className="text-base font-extrabold text-[#2C1810]">
                Xác nhận xóa món khỏi Thực đơn
              </h3>
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="p-1 rounded-lg text-[#795548]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#5D4037] leading-relaxed">
              Bạn có chắc chắn muốn xóa món{' '}
              <strong className="text-[#2C1810]">{productToDelete.name}</strong>{' '}
              khỏi thực đơn quán không? Thao tác này sẽ gỡ món khỏi trang đặt
              hàng của khách.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#E6DCD2] text-xs font-bold text-[#795548]"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa món'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6DCD2] pb-3">
              <h2 className="text-lg font-extrabold text-[#2C1810]">
                Thêm đồ uống mới vào Thực đơn
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-[#795548] hover:bg-[#FDFBF7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C1810]">
                  Tên đồ uống
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="VD: Cold Brew Mơ Đào"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Danh mục
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm"
                  >
                    <option value="Cà phê truyền thống">Cà phê truyền thống</option>
                    <option value="Espresso & Máy">Espresso & Máy</option>
                    <option value="Cold Brew">Cold Brew</option>
                    <option value="Trà trái cây">Trà trái cây</option>
                    <option value="Matcha & Sữa">Matcha & Sữa</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Giá bán chuẩn Size S (VNĐ)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Số lượng tồn kho ban đầu
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    URL Hình ảnh
                  </label>
                  <input
                    type="url"
                    required
                    value={newProduct.imageUrl}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, imageUrl: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C1810]">
                  Mô tả hương vị
                </label>
                <textarea
                  rows={2}
                  required
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả ngắn gọn nguyên liệu và hương vị..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6DCD2]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6DCD2] text-xs font-bold text-[#795548]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810] disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Tạo sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
