import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  EyeOff,
  Gift,
  Loader2,
  RotateCcw,
  ShieldAlert,
  X,
} from "lucide-react";

const actionMeta = {
  RESOLVE: { label: "Giải quyết", icon: CheckCircle2, color: "emerald" },
  REJECT: { label: "Từ chối", icon: AlertTriangle, color: "slate" },
  PENALIZE: { label: "Xử phạt", icon: ShieldAlert, color: "red" },
  REFUND: { label: "Hoàn tiền", icon: RotateCcw, color: "blue" },
  GIFT_PROMO: { label: "Tặng mã", icon: Gift, color: "violet" },
  HIDE: { label: "Ẩn khiếu nại", icon: EyeOff, color: "orange" },
  LIFT_PENALTY: { label: "Gỡ phạt", icon: CheckCircle2, color: "emerald" },
};

const colorClasses = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  red: "bg-red-50 text-red-700 ring-red-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
};

const formatDate = (value) => {
  if (!value) return "Không rõ thời gian";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function ComplaintHistory({ isOpen, complaintId, complaintCode, onClose }) {
  const [status, setStatus] = useState("idle");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !complaintId) return;

    const fetchHistory = async () => {
      setStatus("loading");
      setError("");
      try {
        const token = localStorage.getItem("admin_token");
        const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
        const response = await fetch(`${API_BASE}/complaints/${complaintId}/history?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Không thể tải lịch sử khiếu nại.");
        }
        setHistory(result.data || []);
        setStatus("success");
      } catch (err) {
        setError(err.message || "Lỗi kết nối máy chủ.");
        setStatus("error");
      }
    };

    fetchHistory();
  }, [isOpen, complaintId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm">
      <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-black text-slate-900">Lịch sử xử lý</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Khiếu nại #{complaintCode}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {status === "loading" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm font-bold">Đang tải lịch sử...</p>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {status === "success" && history.length === 0 && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
              Chưa có hành động xử lý nào.
            </div>
          )}

          {status === "success" && history.length > 0 && (
            <ol className="relative space-y-4 before:absolute before:left-5 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200">
              {history.map((item) => {
                const meta = actionMeta[item.Action_Type] || { label: item.Action_Type || "Cập nhật", icon: Clock3, color: "slate" };
                const Icon = meta.icon;
                return (
                  <li key={item._id} className="relative flex gap-4">
                    <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${colorClasses[meta.color]}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-black text-slate-900">{meta.label}</p>
                        <span className="text-xs font-bold text-slate-400">{formatDate(item.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{item.Description || "Không có mô tả."}</p>
                      {item.Notes && (
                        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-500">
                          {item.Notes}
                        </div>
                      )}
                      <p className="mt-3 text-xs font-bold text-slate-400">
                        Admin: {item.Admin_Id?.Full_Name || item.Admin_Id?.Email || "Hệ thống"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </aside>
    </div>
  );
}
