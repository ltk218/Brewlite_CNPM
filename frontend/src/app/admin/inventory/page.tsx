'use client';

import React, { useEffect, useState } from 'react';
import {
  Boxes,
  Flame,
  History,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  X,
  Truck,
  Plus,
  Trash2,
  Save,
  Edit3,
} from 'lucide-react';
import {
  AdminInventoryResponse,
  api,
  formatDateTime,
  formatVND,
  Ingredient,
} from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';

export default function AdminInventoryPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<AdminInventoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'STOCK' | 'BOM' | 'HISTORY'>(
    'STOCK',
  );
  const [toast, setToast] = useState<string | null>(null);

  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [adjustType, setAdjustType] = useState<'IMPORT' | 'ADJUSTMENT'>(
    'IMPORT',
  );
  const [quantityChange, setQuantityChange] = useState<number>(500);
  const [unitCostInput, setUnitCostInput] = useState<number>(350);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('sup-1');
  const [reason, setReason] = useState<string>(
    'Nhập lô nguyên liệu mới từ nhà cung cấp',
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [showCreateIngModal, setShowCreateIngModal] = useState<boolean>(false);
  const [newIngForm, setNewIngForm] = useState({
    code: '',
    name: '',
    unit: 'g',
    currentStock: 1000,
    minThreshold: 200,
    costPerUnit: 200,
  });

  const [editingIng, setEditingIng] = useState<Ingredient | null>(null);
  const [editIngForm, setEditIngForm] = useState({
    name: '',
    unit: 'g',
    minThreshold: 200,
    costPerUnit: 200,
  });

  const [recipeDrafts, setRecipeDrafts] = useState<Record<string, number>>({});
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null);
  const [addingToProductId, setAddingToProductId] = useState<string | null>(
    null,
  );
  const [newBomIngredientId, setNewBomIngredientId] = useState<string>('');
  const [newBomQty, setNewBomQty] = useState<number>(20);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInventory = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminInventory(token);
      setData(res);
      const drafts: Record<string, number> = {};
      for (const prod of res.productsWithBom || []) {
        for (const r of prod.recipes || []) {
          drafts[r.id] = r.quantityNeeded;
        }
      }
      setRecipeDrafts(drafts);
      if (res.suppliers && res.suppliers.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(res.suppliers[0].id);
      }
      if (
        res.ingredients &&
        res.ingredients.length > 0 &&
        !newBomIngredientId
      ) {
        setNewBomIngredientId(res.ingredients[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải dữ liệu kho & BOM',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedIngredient) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.adjustInventory(token, {
        ingredientId: selectedIngredient.id,
        quantityChange: Number(quantityChange),
        type: adjustType,
        reason,
        supplierId: selectedSupplierId,
        unitCost:
          adjustType === 'IMPORT'
            ? Number(unitCostInput)
            : selectedIngredient.costPerUnit,
      });
      setSelectedIngredient(null);
      await fetchInventory();
      if (res.purchaseOrder) {
        showToastMsg(
          `Đã lập phiếu nhập ${res.purchaseOrder.poNumber} và cộng tồn kho thành công!`,
        );
      } else {
        showToastMsg('Đã cập nhật kiểm kê tồn kho nguyên liệu thành công!');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể cập nhật nguyên liệu',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createIngredient(token, newIngForm);
      setShowCreateIngModal(false);
      setNewIngForm({
        code: '',
        name: '',
        unit: 'g',
        currentStock: 1000,
        minThreshold: 200,
        costPerUnit: 200,
      });
      await fetchInventory();
      showToastMsg(`Đã thêm nguyên liệu mới "${created.name}" vào kho!`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tạo nguyên liệu mới',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingIng) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.updateIngredient(token, editingIng.id, {
        name: editIngForm.name,
        unit: editIngForm.unit,
        minThreshold: Number(editIngForm.minThreshold),
        costPerUnit: Number(editIngForm.costPerUnit),
      });
      setEditingIng(null);
      await fetchInventory();
      showToastMsg('Đã cập nhật thông tin & giá vốn nguyên liệu!');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể sửa nguyên liệu',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIngredient = async (ing: Ingredient) => {
    if (!token) return;
    setError(null);
    try {
      await api.deleteIngredient(token, ing.id);
      await fetchInventory();
      showToastMsg(`Đã xóa nguyên liệu "${ing.name}" khỏi danh mục kho`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể xóa nguyên liệu',
      );
    }
  };

  const handleSaveRecipeQty = async (recipeId: string) => {
    if (!token) return;
    const nextQty = Number(recipeDrafts[recipeId]);
    if (!nextQty || nextQty <= 0) {
      setError('Định lượng nguyên liệu phải lớn hơn 0');
      return;
    }
    setSavingRecipeId(recipeId);
    setError(null);
    try {
      await api.updateRecipeItem(token, recipeId, { quantityNeeded: nextQty });
      await fetchInventory();
      showToastMsg('Đã cập nhật định lượng công thức BOM và tính lại giá vốn!');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể cập nhật định lượng BOM',
      );
    } finally {
      setSavingRecipeId(null);
    }
  };

  const handleDeleteRecipeItem = async (recipeId: string) => {
    if (!token) return;
    setError(null);
    try {
      await api.deleteRecipeItem(token, recipeId);
      await fetchInventory();
      showToastMsg('Đã xóa nguyên liệu khỏi công thức định lượng của món!');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể xóa dòng định lượng',
      );
    }
  };

  const handleAddBomItem = async (productId: string) => {
    if (!token || !newBomIngredientId) return;
    const qty = Number(newBomQty);
    if (!qty || qty <= 0) {
      setError('Vui lòng nhập định lượng lớn hơn 0');
      return;
    }
    setError(null);
    try {
      await api.upsertRecipeItem(token, {
        productId,
        ingredientId: newBomIngredientId,
        quantityNeeded: qty,
      });
      setAddingToProductId(null);
      setNewBomQty(20);
      await fetchInventory();
      showToastMsg('Đã thêm nguyên liệu vào bảng định lượng công thức (BOM)!');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể thêm nguyên liệu vào công thức',
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-72 bg-white rounded-xl" />
        <div className="h-96 bg-white border border-[#E6DCD2] rounded-2xl" />
      </div>
    );
  }

  const ingredients = data?.ingredients || [];
  const productsWithBom = data?.productsWithBom || [];
  const transactions = data?.transactions || [];
  const suppliers = data?.suppliers || [];
  const purchaseOrders = data?.purchaseOrders || [];
  const lowStockCount = ingredients.filter(
    (i) => i.currentStock <= i.minThreshold,
  ).length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#2C1810] text-amber-200 text-xs sm:text-sm font-bold shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2C1810]">
            Kho Nguyên Liệu Thô & Định Lượng Công Thức (BOM)
          </h1>
          <p className="text-sm text-[#795548]">
            Quản lý tồn kho nguyên liệu, lập phiếu nhập hàng PO và chỉnh sửa
            công thức định lượng cho từng món
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchInventory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#E6DCD2] text-xs sm:text-sm font-bold text-[#2C1810] hover:bg-[#FDFBF7]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới kho</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateIngModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3E2723] text-white text-xs sm:text-sm font-bold hover:bg-[#2C1810] shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Thêm nguyên liệu mới</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#795548]">
            Tổng danh mục nguyên liệu
          </p>
          <p className="text-2xl font-extrabold text-[#2C1810] mt-1 tabular-nums">
            {ingredients.length} loại
          </p>
          <p className="text-xs text-[#795548] mt-1">
            Hạt cà phê, sữa tươi, bột matcha, trái cây
          </p>
        </div>

        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#795548]">
            Cảnh báo dưới định mức
          </p>
          <p className="text-2xl font-extrabold text-red-600 mt-1 tabular-nums">
            {lowStockCount} nguyên liệu
          </p>
          <p className="text-xs text-[#795548] mt-1">
            Cần lập phiếu nhập bổ sung từ nhà cung cấp
          </p>
        </div>

        <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#795548]">
            Phiếu nhập kho gần nhất
          </p>
          <p className="text-2xl font-extrabold text-[#B45309] mt-1 tabular-nums">
            {purchaseOrders[0]?.poNumber || 'PO-202610-001'}
          </p>
          <p className="text-xs text-[#795548] mt-1 truncate">
            {purchaseOrders[0]?.note ||
              purchaseOrders[0]?.supplier?.name ||
              'Cầu Đất Specialty Roastery'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('STOCK')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'STOCK'
              ? 'bg-[#3E2723] text-white shadow-sm'
              : 'bg-white text-[#795548] border border-[#E6DCD2]'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>1. Tồn kho Nguyên liệu ({ingredients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BOM')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'BOM'
              ? 'bg-[#3E2723] text-white shadow-sm'
              : 'bg-white text-[#795548] border border-[#E6DCD2]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>
            2. Bảng định lượng công thức BOM ({productsWithBom.length} món)
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-[#3E2723] text-white shadow-sm'
              : 'bg-white text-[#795548] border border-[#E6DCD2]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>
            3. Phiếu nhập hàng PO ({purchaseOrders.length}) & Lịch sử Kho
          </span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-semibold">
          {error}
        </div>
      )}

      {activeTab === 'STOCK' && (
        <div className="bg-white border border-[#E6DCD2] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-[#E6DCD2] text-[11px] font-bold uppercase tracking-wider text-[#795548]">
                  <th className="py-3.5 px-5">Mã NL</th>
                  <th className="py-3.5 px-5">Tên nguyên liệu</th>
                  <th className="py-3.5 px-5">Tồn hiện tại</th>
                  <th className="py-3.5 px-5">Ngưỡng tối thiểu</th>
                  <th className="py-3.5 px-5">Giá vốn / ĐVT</th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Thao tác quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DCD2] text-sm">
                {ingredients.map((ing) => {
                  const isLow = ing.currentStock <= ing.minThreshold;
                  return (
                    <tr key={ing.id} className="hover:bg-[#FDFBF7]">
                      <td className="py-3.5 px-5 font-extrabold text-xs text-[#5D4037]">
                        {ing.code}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-[#2C1810]">
                        {ing.name}
                      </td>
                      <td className="py-3.5 px-5 font-extrabold tabular-nums text-[#2C1810]">
                        {ing.currentStock.toLocaleString('vi-VN')} {ing.unit}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-[#795548] tabular-nums">
                        {ing.minThreshold.toLocaleString('vi-VN')} {ing.unit}
                      </td>
                      <td className="py-3.5 px-5 text-xs font-bold text-[#B45309] tabular-nums">
                        {formatVND(ing.costPerUnit)} / {ing.unit}
                      </td>
                      <td className="py-3.5 px-5">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Sắp hết hàng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Đủ định mức
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIngredient(ing);
                              setAdjustType('IMPORT');
                              setQuantityChange(1000);
                              setUnitCostInput(ing.costPerUnit);
                              setReason(`Nhập bổ sung ${ing.name}`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810]"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                            <span>Lập phiếu nhập</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingIng(ing);
                              setEditIngForm({
                                name: ing.name,
                                unit: ing.unit,
                                minThreshold: ing.minThreshold,
                                costPerUnit: ing.costPerUnit,
                              });
                            }}
                            title="Sửa thông tin nguyên liệu"
                            className="p-1.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-[#3E2723] hover:bg-[#EFE8DF]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteIngredient(ing)}
                            title="Xóa nguyên liệu"
                            className="p-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {activeTab === 'BOM' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {productsWithBom.map((prod) => {
            const recipes = prod.recipes || [];
            const costPrice = recipes.reduce((sum, r) => {
              const currentQty =
                recipeDrafts[r.id] !== undefined
                  ? Number(recipeDrafts[r.id])
                  : r.quantityNeeded;
              const unitCost =
                r.ingredient?.costPerUnit ||
                ingredients.find((g) => g.id === r.ingredientId)?.costPerUnit ||
                0;
              return sum + currentQty * unitCost;
            }, 0);
            const profit = prod.price - costPrice;
            const marginPct =
              prod.price > 0 ? Math.round((profit / prod.price) * 100) : 0;

            return (
              <div
                key={prod.id}
                className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 border-b border-[#E6DCD2] pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-[#B45309] uppercase">
                        {prod.category}
                      </span>
                      <h3 className="text-base font-extrabold text-[#2C1810]">
                        {prod.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#795548] block">
                        Giá bán Size S
                      </span>
                      <span className="text-sm font-extrabold text-[#B45309] tabular-nums">
                        {formatVND(prod.price)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#5D4037]">
                        Định lượng nguyên liệu cho 1 ly (Sửa / Xóa trực tiếp):
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingToProductId(
                            addingToProductId === prod.id ? null : prod.id,
                          );
                          if (ingredients.length > 0 && !newBomIngredientId) {
                            setNewBomIngredientId(ingredients[0].id);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-[#B45309] hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm nguyên liệu</span>
                      </button>
                    </div>

                    {recipes.length === 0 ? (
                      <p className="text-xs text-[#795548] italic py-2">
                        Chưa có nguyên liệu nào trong công thức. Hãy bấm
                        &ldquo;Thêm nguyên liệu&rdquo; để thiết lập định lượng.
                      </p>
                    ) : (
                      <ul className="space-y-2 text-xs">
                        {recipes.map((r) => {
                          const ingObj =
                            r.ingredient ||
                            ingredients.find((g) => g.id === r.ingredientId);
                          const draftQty =
                            recipeDrafts[r.id] !== undefined
                              ? recipeDrafts[r.id]
                              : r.quantityNeeded;
                          const isChanged =
                            Number(draftQty) !== Number(r.quantityNeeded);
                          const lineCost =
                            Number(draftQty) * (ingObj?.costPerUnit || 0);

                          return (
                            <li
                              key={r.id}
                              className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2]"
                            >
                              <div className="min-w-[140px] flex-1">
                                <span className="font-bold text-[#2C1810] block">
                                  {ingObj?.name || 'Nguyên liệu'}
                                </span>
                                <span className="text-[11px] text-[#795548] tabular-nums">
                                  Giá vốn: {formatVND(lineCost)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={1}
                                  step="any"
                                  value={draftQty}
                                  onChange={(e) =>
                                    setRecipeDrafts((prev) => ({
                                      ...prev,
                                      [r.id]: Number(e.target.value),
                                    }))
                                  }
                                  className="w-20 px-2.5 py-1.5 rounded-lg bg-white border border-[#E6DCD2] text-xs font-extrabold text-[#3E2723] tabular-nums focus:outline-none focus:border-[#3E2723]"
                                />
                                <span className="text-xs font-bold text-[#795548] w-6">
                                  {ingObj?.unit || 'g'}
                                </span>

                                <button
                                  type="button"
                                  disabled={
                                    !isChanged || savingRecipeId === r.id
                                  }
                                  onClick={() => handleSaveRecipeQty(r.id)}
                                  title="Lưu định lượng"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#3E2723] text-white text-[11px] font-bold hover:bg-[#2C1810] disabled:bg-stone-200 disabled:text-[#795548] transition-colors"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>Lưu</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecipeItem(r.id)}
                                  title="Xóa nguyên liệu khỏi công thức"
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {addingToProductId === prod.id && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5 mt-2">
                        <p className="text-xs font-extrabold text-[#2C1810]">
                          Thêm nguyên liệu vào công thức {prod.name}:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <select
                            value={newBomIngredientId}
                            onChange={(e) =>
                              setNewBomIngredientId(e.target.value)
                            }
                            className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white border border-[#E6DCD2] text-xs font-semibold text-[#2C1810]"
                          >
                            {ingredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} ({ing.unit})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={newBomQty}
                            onChange={(e) =>
                              setNewBomQty(Number(e.target.value))
                            }
                            placeholder="Định lượng"
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#E6DCD2] text-xs font-bold tabular-nums"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setAddingToProductId(null)}
                            className="px-3 py-1 rounded-lg border border-[#E6DCD2] bg-white text-xs font-bold text-[#795548]"
                          >
                            Đóng
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddBomItem(prod.id)}
                            className="px-3.5 py-1 rounded-lg bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810]"
                          >
                            Lưu vào công thức
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6DCD2] flex items-center justify-between text-xs">
                  <span className="text-[#795548]">
                    Giá vốn 1 ly:{' '}
                    <strong className="text-[#2C1810] tabular-nums">
                      {formatVND(costPrice)}
                    </strong>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold tabular-nums">
                    Lợi nhuận gộp: {formatVND(profit)} ({marginPct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#2C1810] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B45309]" />
                <span>
                  Danh sách Phiếu Nhập Hàng (Purchase Orders -{' '}
                  {purchaseOrders.length} phiếu)
                </span>
              </h3>
              {ingredients.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const firstIng = ingredients[0];
                    setSelectedIngredient(firstIng);
                    setAdjustType('IMPORT');
                    setQuantityChange(1000);
                    setUnitCostInput(firstIng.costPerUnit);
                    setReason(`Nhập lô nguyên liệu ${firstIng.name}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810]"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Tạo phiếu nhập kho mới</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchaseOrders.map((po) => (
                <div
                  key={po.id}
                  className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[#2C1810]">
                        {po.poNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-[#795548]">
                        • {formatDateTime(po.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#3E2723]">
                      NCC: {po.supplier?.name || 'Nhà cung cấp chính'}
                    </p>
                    <p className="text-xs text-[#795548]">{po.note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-[#B45309] tabular-nums block">
                      {formatVND(po.totalAmount)}
                    </span>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      ĐÃ NHẬP KHO ({po.status})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E6DCD2] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E6DCD2]">
              <h3 className="text-sm font-extrabold text-[#2C1810]">
                Nhật ký Giao dịch Kho (Tự động trừ BOM & Nhập kho)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDFBF7] border-b border-[#E6DCD2] text-[11px] font-bold uppercase tracking-wider text-[#795548]">
                    <th className="py-3 px-5">Thời gian</th>
                    <th className="py-3 px-5">Nguyên liệu</th>
                    <th className="py-3 px-5">Loại GD</th>
                    <th className="py-3 px-5">Biến động</th>
                    <th className="py-3 px-5">Tồn sau GD</th>
                    <th className="py-3 px-5">Lý do & Người thực hiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DCD2] text-xs sm:text-sm">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3 px-5 text-xs text-[#795548] whitespace-nowrap">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="py-3 px-5 font-bold text-[#2C1810]">
                        {tx.ingredient?.name || tx.ingredientId}
                      </td>
                      <td className="py-3 px-5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            tx.type === 'IMPORT'
                              ? 'bg-emerald-50 text-emerald-800'
                              : tx.type === 'ORDER_DEDUCT'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-5 font-extrabold tabular-nums ${
                          tx.quantityChange >= 0
                            ? 'text-emerald-700'
                            : 'text-red-600'
                        }`}
                      >
                        {tx.quantityChange >= 0 ? '+' : ''}
                        {tx.quantityChange} {tx.ingredient?.unit || ''}
                      </td>
                      <td className="py-3 px-5 font-bold tabular-nums text-[#2C1810]">
                        {tx.balanceAfter} {tx.ingredient?.unit || ''}
                      </td>
                      <td className="py-3 px-5 text-xs text-[#795548]">
                        <strong className="text-[#2C1810]">
                          {tx.performedBy || 'Hệ thống'}:
                        </strong>{' '}
                        {tx.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6DCD2] pb-3">
              <h3 className="text-base font-extrabold text-[#2C1810]">
                Phiếu Nhập Kho / Kiểm Kê
              </h3>
              <button
                type="button"
                onClick={() => setSelectedIngredient(null)}
                className="p-1 rounded-lg text-[#795548]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C1810]">
                  Chọn nguyên liệu
                </label>
                <select
                  value={selectedIngredient.id}
                  onChange={(e) => {
                    const found = ingredients.find(
                      (g) => g.id === e.target.value,
                    );
                    if (found) {
                      setSelectedIngredient(found);
                      setUnitCostInput(found.costPerUnit);
                      setReason(`Nhập bổ sung ${found.name}`);
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm font-bold text-[#2C1810]"
                >
                  {ingredients.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Tồn: {g.currentStock} {g.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustType('IMPORT');
                    setQuantityChange(1000);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    adjustType === 'IMPORT'
                      ? 'bg-[#3E2723] text-white border-[#3E2723]'
                      : 'bg-[#FDFBF7] text-[#2C1810] border-[#E6DCD2]'
                  }`}
                >
                  Lập Phiếu Nhập Hàng (+)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdjustType('ADJUSTMENT');
                    setQuantityChange(-100);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    adjustType === 'ADJUSTMENT'
                      ? 'bg-[#3E2723] text-white border-[#3E2723]'
                      : 'bg-[#FDFBF7] text-[#2C1810] border-[#E6DCD2]'
                  }`}
                >
                  Kiểm kê / Hủy hàng (+/-)
                </button>
              </div>

              {adjustType === 'IMPORT' && suppliers.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Nhà cung cấp (Tự động sinh mã phiếu PO)
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-semibold text-[#2C1810]"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Số lượng ({selectedIngredient.unit})
                  </label>
                  <input
                    type="number"
                    required
                    value={quantityChange}
                    onChange={(e) => setQuantityChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm font-bold tabular-nums"
                  />
                </div>

                {adjustType === 'IMPORT' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#2C1810]">
                      Đơn giá nhập / {selectedIngredient.unit}
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={unitCostInput}
                      onChange={(e) => setUnitCostInput(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm font-bold text-[#B45309] tabular-nums"
                    />
                  </div>
                )}
              </div>

              {adjustType === 'IMPORT' && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#5D4037]">
                    Thành tiền phiếu nhập:
                  </span>
                  <span className="font-extrabold text-[#B45309] tabular-nums">
                    {formatVND(
                      Math.abs(Number(quantityChange)) * Number(unitCostInput),
                    )}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C1810]">
                  Ghi chú phiếu nhập / Lý do kiểm kê
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIngredient(null)}
                  className="px-4 py-2 rounded-xl border border-[#E6DCD2] text-xs font-bold text-[#795548]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810]"
                >
                  {submitting ? 'Đang lưu...' : 'Xác nhận lưu phiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateIngModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6DCD2] pb-3">
              <h3 className="text-base font-extrabold text-[#2C1810]">
                Thêm Nguyên Liệu Thô Mới
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateIngModal(false)}
                className="p-1 rounded-lg text-[#795548]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIngredient} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Mã nguyên liệu
                  </label>
                  <input
                    type="text"
                    required
                    value={newIngForm.code}
                    onChange={(e) =>
                      setNewIngForm({
                        ...newIngForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ING-COCOA"
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Đơn vị tính
                  </label>
                  <select
                    value={newIngForm.unit}
                    onChange={(e) =>
                      setNewIngForm({ ...newIngForm, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold"
                  >
                    <option value="g">Gram (g)</option>
                    <option value="ml">Millilit (ml)</option>
                    <option value="quả">Quả / Trái</option>
                    <option value="hộp">Hộp</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C1810]">
                  Tên nguyên liệu
                </label>
                <input
                  type="text"
                  required
                  value={newIngForm.name}
                  onChange={(e) =>
                    setNewIngForm({ ...newIngForm, name: e.target.value })
                  }
                  placeholder="VD: Bột Cacao Nguyên Chất Đắk Lắk"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Tồn ban đầu
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newIngForm.currentStock}
                    onChange={(e) =>
                      setNewIngForm({
                        ...newIngForm,
                        currentStock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Ngưỡng cảnh báo
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newIngForm.minThreshold}
                    onChange={(e) =>
                      setNewIngForm({
                        ...newIngForm,
                        minThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Giá vốn / ĐVT
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newIngForm.costPerUnit}
                    onChange={(e) =>
                      setNewIngForm({
                        ...newIngForm,
                        costPerUnit: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold text-[#B45309] tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateIngModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6DCD2] text-xs font-bold text-[#795548]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810]"
                >
                  Thêm vào kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingIng && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6DCD2] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6DCD2] pb-3">
              <h3 className="text-base font-extrabold text-[#2C1810]">
                Sửa nguyên liệu: {editingIng.code}
              </h3>
              <button
                type="button"
                onClick={() => setEditingIng(null)}
                className="p-1 rounded-lg text-[#795548]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateIngredient} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2C1810]">
                  Tên nguyên liệu
                </label>
                <input
                  type="text"
                  required
                  value={editIngForm.name}
                  onChange={(e) =>
                    setEditIngForm({ ...editIngForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Đơn vị
                  </label>
                  <input
                    type="text"
                    required
                    value={editIngForm.unit}
                    onChange={(e) =>
                      setEditIngForm({ ...editIngForm, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Ngưỡng tối thiểu
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editIngForm.minThreshold}
                    onChange={(e) =>
                      setEditIngForm({
                        ...editIngForm,
                        minThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C1810]">
                    Giá vốn / ĐVT
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editIngForm.costPerUnit}
                    onChange={(e) =>
                      setEditIngForm({
                        ...editIngForm,
                        costPerUnit: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FDFBF7] border border-[#E6DCD2] text-xs font-bold text-[#B45309] tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingIng(null)}
                  className="px-4 py-2 rounded-xl border border-[#E6DCD2] text-xs font-bold text-[#795548]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-[#2C1810]"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
