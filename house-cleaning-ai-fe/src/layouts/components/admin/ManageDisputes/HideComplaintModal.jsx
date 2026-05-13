import { useEffect, useState } from "react";
import { AlertTriangle, EyeOff, Loader2, X } from "lucide-react";

const hideReasons = [
  { value: "DUPLICATE", label: "Khiếu nại trùng lặp" },
  { value: "SPAM", label: "Spam hoặc không hợp lệ" },
  { value: "INAPPROPRIATE", label: "Nội dung không phù hợp" },
  { value: "RESOLVED_OFFLINE", label: "Đã xử lý ngoài hệ thống" },
  { value: "OTHER", label: "Lý do khác" },
];

export default function HideComplaintModal({ isOpen, complaintId, complainantName, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setReason("");
    setNote("");
    setError("");
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!reason) {
      setError("Vui lòng chọn lý do ẩn khiếu nại.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
      const response = await fetch(`${API_BASE}/complaints/${complaintId}/hide`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, note: note.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể ẩn khiếu nại.");
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
              <EyeOff size={20} className="text-orange-600" /> Ẩn khiếu nại
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{complainantName || "Người gửi khiếu nại"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-sm font-semibold text-orange-800">
            Khiếu nại sẽ bị ẩn khỏi phía khách hàng và cleaner, nhưng admin vẫn xem được lịch sử xử lý.
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Lý do ẩn</label>
            <div className="space-y-2">
              {hideReasons.map((item) => (
                <label key={item.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:bg-orange-50">
                  <input
                    type="radio"
                    name="hideReason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={(event) => setReason(event.target.value)}
                    className="h-4 w-4 accent-orange-600"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Ghi chú nội bộ</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 500))}
              className="h-16 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
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
            <button type="submit" disabled={loading || !reason} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-black text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              {loading && <Loader2 size={16} className="animate-spin" />} Ẩn khiếu nại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
