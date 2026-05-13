import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, ShieldAlert, X } from "lucide-react";

const penaltyOptions = [
  { value: "LOCK_5_MIN", label: "Khóa nhận đơn 5 phút" },
  { value: "LOCK_30_MIN", label: "Khóa nhận đơn 30 phút" },
  { value: "LOCK_1_HOUR", label: "Khóa nhận đơn 1 giờ" },
  { value: "LOCK_6_HOUR", label: "Khóa nhận đơn 6 giờ" },
  { value: "LOCK_24_HOUR", label: "Khóa nhận đơn 24 giờ" },
  { value: "ACCOUNT_LOCK", label: "Khóa tài khoản vô thời hạn" },
];

export default function PenaltyModal({ isOpen, complaintId, cleanerName, onClose, onSuccess }) {
  const [penaltyType, setPenaltyType] = useState("LOCK_1_HOUR");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setPenaltyType("LOCK_1_HOUR");
    setReason("");
    setNote("");
    setError("");
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (reason.trim().length < 10) {
      setError("Lý do xử phạt cần ít nhất 10 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
      const response = await fetch(`${API_BASE}/complaints/${complaintId}/penalize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ penaltyType, reason: reason.trim(), note: note.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể xử phạt cleaner.");
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
              <ShieldAlert size={20} className="text-red-600" /> Xử phạt cleaner
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{cleanerName || "Cleaner"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Loại xử phạt</label>
            <select
              value={penaltyType}
              onChange={(event) => setPenaltyType(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
            >
              {penaltyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Lý do xử phạt</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 500))}
              className="h-24 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
              placeholder="Nhập lý do cụ thể để lưu vào lịch sử khiếu nại..."
            />
            <p className="mt-1 text-xs font-medium text-slate-400">{reason.length}/500</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Ghi chú nội bộ</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 500))}
              className="h-16 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
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
            <button type="submit" disabled={loading || reason.trim().length < 10} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              {loading && <Loader2 size={16} className="animate-spin" />} Xác nhận xử phạt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
