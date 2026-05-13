import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Gift,
  History,
  MessageSquareWarning,
  RefreshCcw,
  Search,
  ShieldAlert,
  Star,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import PenaltyModal from "../../../layouts/components/admin/ManageDisputes/PenaltyModal";
import RefundModal from "../../../layouts/components/admin/ManageDisputes/RefundModal";
import PromoCodeModal from "../../../layouts/components/admin/ManageDisputes/PromoCodeModal";
import HideComplaintModal from "../../../layouts/components/admin/ManageDisputes/HideComplaintModal";
import ComplaintHistory from "../../../layouts/components/admin/ManageDisputes/ComplaintHistory";

const statusMeta = {
  RESOLVED: "Đã giải quyết",
  REJECTED: "Từ chối",
  PENDING: "Chờ xử lý",
};

const getBookingAmount = (complaint) =>
  Number(complaint?.Booking_Id?.Total_Amount || complaint?.Booking_Id?.Price || 0);

export const ManageDisputes = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displaySearch, setDisplaySearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modals, setModals] = useState({
    penalty: false,
    refund: false,
    promo: false,
    hide: false,
    history: false,
  });

  const showToast = (type, message) => {
    setNotification({ type, message });
    window.setTimeout(() => setNotification({ type: "", message: "" }), 3500);
  };

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
      const query = new URLSearchParams({ page: "1", limit: "50", search: displaySearch }).toString();
      const response = await fetch(`${API_BASE}/complaints?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tải danh sách khiếu nại.");
      }
      setDisputes(result.data || []);
    } catch (error) {
      showToast("error", error.message || "Lỗi kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [displaySearch]);

  const updateDispute = async (id, payload, successMessage) => {
    try {
      const token = localStorage.getItem("admin_token");
      const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
      const response = await fetch(`${API_BASE}/complaints/${id}/resolve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể cập nhật khiếu nại.");
      }
      setDisputes((prev) => prev.map((item) => (item._id === id ? result.data : item)));
      showToast("success", successMessage);
    } catch (error) {
      showToast("error", error.message || "Lỗi kết nối máy chủ.");
    }
  };

  const openModal = (modalName, complaint) => {
    setSelectedComplaint(complaint);
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    if (modalName !== "history") window.setTimeout(() => setSelectedComplaint(null), 200);
  };

  const handleModalSuccess = (modalName, message) => {
    closeModal(modalName);
    showToast("success", message || "Cập nhật khiếu nại thành công.");
    fetchDisputes();
  };

  const handleDeleteReview = (id) => {
    if (!window.confirm("Ẩn đánh giá này khỏi hệ thống?")) return;
    updateDispute(id, { status: "RESOLVED", isReviewHidden: true }, "Đã ẩn đánh giá liên quan đến khiếu nại.");
  };

  const stats = useMemo(() => {
    const total = disputes.length;
    const pending = disputes.filter((item) => item.Status !== "RESOLVED" && item.Status !== "REJECTED").length;
    const refunded = disputes.filter((item) => item.Is_Refunded).length;
    return { total, pending, refunded };
  }, [disputes]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
              <MessageSquareWarning size={24} className="text-orange-500" /> Xử lý khiếu nại & đánh giá
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Theo dõi khiếu nại, hoàn tiền, tặng mã bù trải nghiệm và kiểm duyệt đánh giá.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm lý do, chi tiết, bình luận..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setDisplaySearch(searchTerm);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setDisplaySearch(searchTerm)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800"
            >
              <Search size={16} /> Tìm
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tổng khiếu nại</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-orange-500">Chờ xử lý</p>
            <p className="mt-1 text-2xl font-black text-orange-700">{stats.pending}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Đã hoàn tiền</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">{stats.refunded}</p>
          </div>
        </div>
      </div>

      {notification.message && (
        <div className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-bold shadow-sm ${notification.type === "error" ? "border-red-200 bg-red-50 text-red-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {notification.type === "error" ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
          {notification.message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500">
                <th className="p-4">Đơn & người liên quan</th>
                <th className="p-4">Nội dung khiếu nại</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400">
                    <RefreshCcw size={30} className="mx-auto mb-2 animate-spin text-orange-400" />
                    <p className="font-bold">Đang tải danh sách khiếu nại...</p>
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400">
                    <CheckCircle2 size={30} className="mx-auto mb-2 text-emerald-400" />
                    <p className="font-bold">Hiện không có khiếu nại nào cần xử lý.</p>
                  </td>
                </tr>
              ) : (
                disputes.map((dp) => {
                  const orderId = dp.Booking_Id?._id || dp.Booking_Id || "";
                  const clientName = dp.Client_Id?.Full_Name || "Khách hàng";
                  const cleanerName = dp.Cleaner_Id?.Full_Name || "Cleaner";
                  const cleanerId = dp.Cleaner_Id?._id || dp.Cleaner_Id;
                  const rating = dp.Rating_Id?.Stars ?? dp.Stars ?? 0;
                  const review = dp.Rating_Id?.Comment || dp.Comment || "Không có bình luận";
                  const isReviewHidden = dp.Rating_Id?.Is_Hidden || dp.Is_Review_Hidden;
                  const code = dp._id.slice(-6).toUpperCase();

                  return (
                    <tr key={dp._id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-black text-slate-900">#{code}</span>
                          <span className="text-xs font-bold text-slate-500">
                            Đơn: <span className="text-blue-600">#{String(orderId).slice(-8).toUpperCase()}</span>
                          </span>
                          <div className="mt-2 space-y-1">
                            <p className="flex items-center gap-1 text-xs font-medium text-slate-600">
                              <User size={12} /> <span className="font-bold">Khách:</span> {clientName}
                            </p>
                            <button
                              type="button"
                              onClick={() => cleanerId && navigate(`/admin/cleaners/${cleanerId}/penalties`, { state: { cleanerName } })}
                              className="flex items-center gap-1 text-left text-xs font-medium text-slate-600 hover:text-red-600"
                            >
                              <ArrowRight size={12} className="text-slate-400" /> <span className="font-bold">Cleaner:</span> {cleanerName}
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="space-y-3">
                          <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
                            <p className="mb-1 flex items-center gap-1 text-xs font-black text-orange-800">
                              <AlertTriangle size={12} /> Lý do khiếu nại
                            </p>
                            <p className="text-sm font-bold text-orange-950">{dp.Reason || "Chưa có lý do"}</p>
                            {dp.Detail && <p className="mt-1 text-xs font-medium leading-5 text-orange-900/80">{dp.Detail}</p>}
                          </div>

                          <div className={`rounded-xl border p-3 ${isReviewHidden ? "border-slate-200 bg-slate-100" : "border-slate-200 bg-white"}`}>
                            <div className="mb-1 flex items-center gap-1">
                              {[...Array(5)].map((_, index) => (
                                <Star key={index} size={13} className={index < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                              ))}
                              {isReviewHidden && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600">Đã ẩn</span>}
                            </div>
                            <p className={`text-xs font-medium leading-5 ${isReviewHidden ? "text-slate-400 line-through" : "text-slate-700"}`}>"{review}"</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-center align-middle">
                        {dp.Status === "RESOLVED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            <CheckCircle2 size={12} /> {statusMeta.RESOLVED}
                          </span>
                        ) : dp.Status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                            {statusMeta.REJECTED}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-orange-700">
                            {statusMeta.PENDING}
                          </span>
                        )}
                        {dp.Is_Refunded && <div className="mt-2 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">Đã hoàn tiền</div>}
                        {dp.Is_Hidden && <div className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Đã ẩn</div>}
                      </td>

                      <td className="p-4 align-middle">
                        <div className="flex flex-col items-end gap-2">
                          <button type="button" onClick={() => openModal("penalty", dp)} className="flex w-40 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white">
                            <Zap size={14} /> Xử phạt
                          </button>
                          <button type="button" onClick={() => openModal("refund", dp)} disabled={dp.Is_Refunded} className={`flex w-40 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${dp.Is_Refunded ? "cursor-not-allowed bg-slate-100 text-slate-400" : "border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"}`}>
                            <RefreshCcw size={14} /> {dp.Is_Refunded ? "Đã hoàn" : "Hoàn tiền"}
                          </button>
                          <button type="button" onClick={() => openModal("promo", dp)} className="flex w-40 items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-600 transition-all hover:bg-violet-600 hover:text-white">
                            <Gift size={14} /> Tặng mã
                          </button>
                          <button type="button" onClick={() => openModal("hide", dp)} disabled={dp.Is_Hidden} className={`flex w-40 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${dp.Is_Hidden ? "cursor-not-allowed bg-slate-100 text-slate-400" : "border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white"}`}>
                            <Eye size={14} /> {dp.Is_Hidden ? "Đã ẩn" : "Ẩn khiếu nại"}
                          </button>
                          <button type="button" onClick={() => openModal("history", dp)} className="flex w-40 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-700 hover:text-white">
                            <History size={14} /> Xem lịch sử
                          </button>
                          <button type="button" onClick={() => handleDeleteReview(dp._id)} disabled={isReviewHidden} className={`flex w-40 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${isReviewHidden ? "cursor-not-allowed bg-slate-100 text-slate-400" : "border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"}`}>
                            <Trash2 size={14} /> {isReviewHidden ? "Đã ẩn review" : "Ẩn review"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PenaltyModal
        isOpen={modals.penalty}
        complaintId={selectedComplaint?._id}
        cleanerName={selectedComplaint?.Cleaner_Id?.Full_Name}
        onClose={() => closeModal("penalty")}
        onSuccess={(_, message) => handleModalSuccess("penalty", message)}
      />
      <RefundModal
        isOpen={modals.refund}
        complaintId={selectedComplaint?._id}
        bookingAmount={getBookingAmount(selectedComplaint)}
        clientName={selectedComplaint?.Client_Id?.Full_Name}
        onClose={() => closeModal("refund")}
        onSuccess={(_, message) => handleModalSuccess("refund", message)}
      />
      <PromoCodeModal
        isOpen={modals.promo}
        complaintId={selectedComplaint?._id}
        clientName={selectedComplaint?.Client_Id?.Full_Name}
        onClose={() => closeModal("promo")}
        onSuccess={(_, message) => handleModalSuccess("promo", message)}
      />
      <HideComplaintModal
        isOpen={modals.hide}
        complaintId={selectedComplaint?._id}
        complainantName={selectedComplaint?.Client_Id?.Full_Name}
        onClose={() => closeModal("hide")}
        onSuccess={(_, message) => handleModalSuccess("hide", message)}
      />
      <ComplaintHistory
        isOpen={modals.history}
        complaintId={selectedComplaint?._id}
        complaintCode={selectedComplaint?._id?.slice(-6).toUpperCase()}
        onClose={() => closeModal("history")}
      />
    </div>
  );
};
