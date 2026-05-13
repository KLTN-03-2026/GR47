import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Unlock,
} from "lucide-react";

const penaltyLabels = {
  LOCK_5_MIN: "Khóa nhận đơn 5 phút",
  LOCK_30_MIN: "Khóa nhận đơn 30 phút",
  LOCK_1_HOUR: "Khóa nhận đơn 1 giờ",
  LOCK_6_HOUR: "Khóa nhận đơn 6 giờ",
  LOCK_24_HOUR: "Khóa nhận đơn 24 giờ",
  ACCOUNT_LOCK: "Khóa tài khoản",
};

const formatDate = (value) => {
  if (!value) return "Vô thời hạn";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const CleanerPenalties = () => {
  const { cleanerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cleanerName = location.state?.cleanerName || "Cleaner";
  const [status, setStatus] = useState("loading");
  const [penalties, setPenalties] = useState([]);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [liftingId, setLiftingId] = useState("");

  const fetchPenalties = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const token = localStorage.getItem("admin_token");
      const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
      const query = new URLSearchParams({ isActive: filter, limit: "100" }).toString();
      const response = await fetch(`${API_BASE}/cleaners/${cleanerId}/penalties?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tải lịch sử xử phạt.");
      }
      setPenalties(result.data || []);
      setStatus("success");
    } catch (error) {
      setMessage(error.message || "Lỗi kết nối máy chủ.");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, [cleanerId, filter]);

  const stats = useMemo(() => {
    const active = penalties.filter((item) => item.Is_Active).length;
    return { total: penalties.length, active, lifted: penalties.length - active };
  }, [penalties]);

  const handleLiftPenalty = async (penalty) => {
    const reason = window.prompt("Nhập lý do gỡ phạt sớm:");
    if (!reason?.trim()) return;

    setLiftingId(penalty._id);
    setMessage("");
    try {
      const token = localStorage.getItem("admin_token");
      const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
      const response = await fetch(`${API_BASE}/penalties/${penalty._id}/lift`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể gỡ xử phạt.");
      }
      setMessage(result.message || "Đã gỡ xử phạt.");
      fetchPenalties();
    } catch (error) {
      setMessage(error.message || "Lỗi kết nối máy chủ.");
    } finally {
      setLiftingId("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
              <ShieldAlert size={24} className="text-red-600" /> Lịch sử xử phạt cleaner
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">{cleanerName}</p>
          </div>
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[
              ["all", "Tất cả"],
              ["true", "Đang hiệu lực"],
              ["false", "Đã gỡ/hết hạn"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg px-3 py-2 text-xs font-black transition ${filter === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tổng bản ghi</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-red-500">Đang hiệu lực</p>
            <p className="mt-1 text-2xl font-black text-red-700">{stats.active}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Đã gỡ/hết hạn</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">{stats.lifted}</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-bold">Đang tải lịch sử xử phạt...</p>
          </div>
        )}

        {status === "error" && (
          <div className="p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <p className="mb-4 text-sm font-bold text-slate-600">{message}</p>
            <button type="button" onClick={fetchPenalties} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white">
              <RefreshCcw size={16} /> Tải lại
            </button>
          </div>
        )}

        {status === "success" && penalties.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
            <p className="text-sm font-bold">Không có bản ghi xử phạt phù hợp bộ lọc.</p>
          </div>
        )}

        {status === "success" && penalties.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500">
                  <th className="p-4">Xử phạt</th>
                  <th className="p-4">Lý do</th>
                  <th className="p-4">Thời hạn</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {penalties.map((item) => {
                  const active = item.Is_Active;
                  return (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 align-top">
                        <p className="font-black text-slate-900">{penaltyLabels[item.Penalty_Type] || item.Penalty_Type}</p>
                        <p className="mt-1 text-xs font-bold text-slate-400">Đơn #{String(item.Booking_Id?._id || item.Booking_Id || "").slice(-8).toUpperCase()}</p>
                      </td>
                      <td className="p-4 align-top">
                        <p className="font-semibold leading-6 text-slate-700">{item.Reason}</p>
                        {item.Note && <p className="mt-2 rounded-xl bg-slate-50 p-2 text-xs font-medium text-slate-500">{item.Note}</p>}
                        {item.Lifted_Reason && <p className="mt-2 rounded-xl bg-emerald-50 p-2 text-xs font-bold text-emerald-700">Lý do gỡ: {item.Lifted_Reason}</p>}
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-start gap-2 text-xs font-bold text-slate-500">
                          <Clock3 size={15} className="mt-0.5" />
                          <div>
                            <p>Bắt đầu: {formatDate(item.Penalty_Start_Date || item.createdAt)}</p>
                            <p className="mt-1">Kết thúc: {formatDate(item.Penalty_End_Date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center align-top">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${active ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {active ? "Đang hiệu lực" : "Đã gỡ/hết hạn"}
                        </span>
                      </td>
                      <td className="p-4 text-right align-top">
                        <button
                          type="button"
                          disabled={!active || liftingId === item._id}
                          onClick={() => handleLiftPenalty(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {liftingId === item._id ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                          Gỡ phạt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
