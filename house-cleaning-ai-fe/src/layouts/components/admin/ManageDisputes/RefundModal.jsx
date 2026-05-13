import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, RotateCcw, X } from "lucide-react";

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export default function RefundModal({ isOpen, complaintId, bookingAmount, clientName, onClose, onSuccess }) {
  const maxRefund = Number(bookingAmount || 0);
  const [amount, setAmount] = useState(maxRefund);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setAmount(maxRefund);
    setReason("");
    setNote("");
    setError("");
  }, [isOpen, maxRefund]);

  const percent = useMemo(() => {
    if (!maxRefund) return 0;
    return Math.min(100, Math.round((Number(amount || 0) / maxRefund) * 100));
  }, [amount, maxRefund]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const refundAmount = Math.floor(Number(amount || 0));
    if (refundAmount <= 0) {
      setError("Số tiền hoàn phải lớn hơn 0.");
      return;
    }
    if (maxRefund > 0 && refundAmount > maxRefund) {
      setError(`Số tiền hoàn không được vượt quá ${formatMoney(maxRefund)}.`);
      return;
    }
    if (reason.trim().length < 10) {
      setError("Lý do hoàn tiền cần ít nhất 10 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
      const response = await fetch(`${API_BASE}/complaints/${complaintId}/refund`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: refundAmount, reason: reason.trim(), note: note.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể hoàn tiền.");
      }
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
              <RotateCcw size={20} className="text-emerald-600" /> Hoàn tiền khiếu nại
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{clientName || "Khách hàng"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Số tiền đơn hàng</p>
            <p className="mt-1 text-2xl font-black text-emerald-800">{formatMoney(maxRefund)}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Số tiền hoàn</label>
            <input
              type="number"
              min="1000"
              max={maxRefund || undefined}
              step="1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
            />
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Lý do hoàn tiền</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 500))}
              className="h-24 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              placeholder="Nhập lý do hoàn tiền cho khách..."
            />
            <p className="mt-1 text-xs font-medium text-slate-400">{reason.length}/500</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Ghi chú nội bộ</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 500))}
              className="h-16 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
              placeholder="Tùy chọn"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
              Hủy
            </button>
            <button type="submit" disabled={loading || !amount || reason.trim().length < 10} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              {loading && <Loader2 size={16} className="animate-spin" />} Hoàn tiền
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
