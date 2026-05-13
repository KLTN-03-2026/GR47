import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Gift, Loader2, Ticket, X } from "lucide-react";

const toDateInput = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
};

export default function PromoCodeModal({ isOpen, complaintId, clientName, onClose, onSuccess }) {
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState(toDateInput(14));
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setDiscountPercentage(10);
    setMaxDiscountAmount("");
    setExpiryDate(toDateInput(14));
    setReason("");
    setNote("");
    setGeneratedCode("");
    setError("");
  }, [isOpen]);

  const summary = useMemo(() => {
    const max = Number(maxDiscountAmount || 0);
    return max > 0
      ? `Giảm ${discountPercentage}%, tối đa ${max.toLocaleString("vi-VN")}đ`
      : `Giảm ${discountPercentage}%, không giới hạn mức giảm`;
  }, [discountPercentage, maxDiscountAmount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (discountPercentage < 1 || discountPercentage > 100) {
      setError("Phần trăm giảm phải nằm trong khoảng 1 - 100%.");
      return;
    }
    if (!expiryDate || new Date(expiryDate) <= new Date()) {
      setError("Ngày hết hạn phải lớn hơn hôm nay.");
      return;
    }
    if (reason.trim().length < 10) {
      setError("Lý do tặng mã cần ít nhất 10 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
      const response = await fetch(`${API_BASE}/complaints/${complaintId}/gift-promo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discountPercentage: Number(discountPercentage),
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
          expiryDate,
          reason: reason.trim(),
          note: note.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tạo mã khuyến mãi.");
      }
      const code = result.data?.Promotion_Code?.Code || result.data?.promoCode?.Code || result.data?.Code || result.promoCode || "";
      setGeneratedCode(code || "Đã tạo mã");
      onSuccess?.(result.data, result.message);
    } catch (err) {
      setError(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
              <Gift size={20} className="text-violet-600" /> Tặng mã khuyến mãi
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{clientName || "Khách hàng"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {generatedCode ? (
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Ticket size={28} />
            </div>
            <p className="text-sm font-bold text-slate-500">Mã đã tạo</p>
            <p className="mt-2 text-3xl font-black tracking-widest text-slate-900">{generatedCode}</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800">
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Mức giảm</label>
              <input
                type="range"
                min="1"
                max="100"
                value={discountPercentage}
                onChange={(event) => setDiscountPercentage(Number(event.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="mt-1 flex justify-between text-xs font-black text-slate-500">
                <span>1%</span>
                <span className="text-violet-700">{discountPercentage}%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Giảm tối đa</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={maxDiscountAmount}
                  onChange={(event) => setMaxDiscountAmount(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                  placeholder="Không giới hạn"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Hết hạn</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(event) => setExpiryDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Lý do tặng mã</label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value.slice(0, 500))}
                className="h-20 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                placeholder="Ví dụ: bù trải nghiệm cho khiếu nại đã xác minh..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Ghi chú nội bộ</label>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, 500))}
                className="h-14 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                placeholder="Tùy chọn"
              />
            </div>

            <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 text-sm font-bold text-violet-800">{summary}</div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={loading} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
                Hủy
              </button>
              <button type="submit" disabled={loading || reason.trim().length < 10} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                {loading && <Loader2 size={16} className="animate-spin" />} Tạo mã
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
