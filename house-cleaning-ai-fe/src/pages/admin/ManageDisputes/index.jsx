import { useEffect, useState } from "react";
import {
    MessageSquareWarning, Search, RefreshCcw,
    Trash2, CheckCircle2, ShieldAlert, Star,
    User, AlertTriangle, ArrowRight
} from "lucide-react";

export const ManageDisputes = () => {
    // Trạng thái thông báo
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [disputes, setDisputes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [displaySearch, setDisplaySearch] = useState("");

    const showToast = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 3000);
    };

    const fetchDisputes = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
            const query = new URLSearchParams({
                page: "1",
                limit: "50",
                search: displaySearch
            }).toString();

            const response = await fetch(`${API_BASE}/complaints?${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setDisputes(result.data || []);
            } else {
                showToast("error", result.message || "Không thể tải danh sách khiếu nại.");
            }
        } catch (error) {
            showToast("error", "Lỗi kết nối máy chủ.");
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
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setDisputes((prev) => prev.map((item) => item._id === id ? result.data : item));
                showToast("success", successMessage);
            } else {
                showToast("error", result.message || "Không thể cập nhật khiếu nại.");
            }
        } catch (error) {
            showToast("error", "Lỗi kết nối máy chủ.");
        }
    };

    // Hoạt động: Hoàn tiền (Mục 2)
    const handleRefund = (id) => {
        if (!window.confirm("Xác nhận hoàn tiền cho Khách hàng của đơn này?")) return;
        updateDispute(id, { status: "RESOLVED", isRefunded: true }, `Đã đánh dấu hoàn tiền cho khiếu nại ${id.slice(-6).toUpperCase()}.`);
    };

    // Hoạt động: Xóa bình luận (Mục 3)
    const handleDeleteReview = (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn ẨN/XÓA đánh giá này khỏi hệ thống?")) return;
        updateDispute(id, { status: "RESOLVED", isReviewHidden: true }, `Đã ẩn review của khiếu nại ${id.slice(-6).toUpperCase()}.`);
    };

    const filteredDisputes = disputes;

    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* Header */}
            <div className="card-white card-header">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <MessageSquareWarning size={24} className="text-orange-500" /> Xử lý Khiếu nại & Đánh giá
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Giải quyết tranh chấp, hoàn tiền và kiểm duyệt các đánh giá rác.
                    </p>
                </div>

                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text" placeholder="Tìm theo ID, Khách hàng..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") setDisplaySearch(searchTerm);
                        }}
                    />
                </div>
            </div>

            {/* Thông báo Toast */}
            {notification.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm border animate-shake
          ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    {notification.type === "error" ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
                    {notification.message}
                </div>
            )}

            {/* Mục 1: Table - Danh sách khiếu nại */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest font-black">
                                <th className="p-4 w-1/4">Thông tin Đơn & Đối tượng</th>
                                <th className="p-4 w-1/3">Nội dung Khiếu nại / Review</th>
                                <th className="p-4 text-center w-1/6">Trạng thái</th>
                                <th className="p-4 text-right">Thao tác xử lý</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400 font-bold">
                                        <RefreshCcw size={32} className="mx-auto mb-2 animate-spin text-orange-400" />
                                        Đang tải danh sách khiếu nại...
                                    </td>
                                </tr>
                            ) : filteredDisputes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400 font-medium">
                                        <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
                                        Tuyệt vời! Hiện không có khiếu nại nào cần xử lý.
                                    </td>
                                </tr>
                            ) : (
                                filteredDisputes.map((dp) => {
                                    const orderId = dp.Booking_Id?._id || dp.Booking_Id || "";
                                    const clientName = dp.Client_Id?.Full_Name || "Khách hàng";
                                    const cleanerName = dp.Cleaner_Id?.Full_Name || "Người dọn";
                                    const review = dp.Comment || "Không có bình luận";
                                    const rating = dp.Stars || 0;

                                    return (
                                    <tr key={dp._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">

                                        {/* Cột 1: Thông tin */}
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-black text-slate-900">#{dp._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                    Đơn: <span className="text-blue-600 cursor-pointer hover:underline">#{String(orderId).slice(-8).toUpperCase()}</span>
                                                </span>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                                        <User size={12} /> <span className="font-bold">Khách:</span> {clientName}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                                        <ArrowRight size={12} className="text-slate-400" /> <span className="font-bold">Đối tác:</span> {cleanerName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Cột 2: Nội dung & Review */}
                                        <td className="p-4">
                                            <div className="space-y-3">
                                                {/* Lý do khiếu nại */}
                                                <div className="bg-orange-50 border border-orange-100 p-2.5 rounded-lg">
                                                    <p className="text-xs font-bold text-orange-800 flex items-center gap-1 mb-1">
                                                        <AlertTriangle size={12} /> Lý do khiếu nại:
                                                    </p>
                                                    <p className="text-xs font-medium text-orange-900">{dp.Reason}</p>
                                                    {dp.Detail && <p className="text-xs text-orange-900/80 mt-1">{dp.Detail}</p>}
                                                </div>

                                                {/* Đánh giá (Review) */}
                                                <div className={`p-2.5 rounded-lg border ${dp.Is_Review_Hidden ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-200'}`}>
                                                    <div className="flex items-center gap-1 mb-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                                                        ))}
                                                        {dp.Is_Review_Hidden && <span className="ml-2 text-[10px] font-bold text-red-500 bg-red-100 px-1.5 rounded">(Đã ẩn)</span>}
                                                    </div>
                                                    <p className={`text-xs font-medium ${dp.Is_Review_Hidden ? 'text-slate-400 italic line-through' : 'text-slate-700'}`}>
                                                        "{review}"
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Cột 3: Trạng thái */}
                                        <td className="p-4 text-center align-middle">
                                            {dp.Status === "RESOLVED" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    <CheckCircle2 size={12} /> Đã giải quyết
                                                </span>
                                            ) : dp.Status === "REJECTED" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    Từ chối
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                                                    Chờ xử lý
                                                </span>
                                            )}
                                            {dp.Is_Refunded && (
                                                <div className="mt-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                                                    Đã hoàn tiền
                                                </div>
                                            )}
                                        </td>

                                        {/* Cột 4: Thao tác */}
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col items-end gap-2">
                                                {/* Mục 2: Button Hoàn tiền */}
                                                <button
                                                    onClick={() => handleRefund(dp._id)}
                                                    disabled={dp.Is_Refunded}
                                                    className={`w-36 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                            ${dp.Is_Refunded
                                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                            : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white"}`}
                                                >
                                                    <RefreshCcw size={14} /> {dp.Is_Refunded ? "Đã Refund" : "Hoàn tiền (Refund)"}
                                                </button>

                                                {/* Mục 3: Button Xóa bình luận */}
                                                <button
                                                    onClick={() => handleDeleteReview(dp._id)}
                                                    disabled={dp.Is_Review_Hidden}
                                                    className={`w-36 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                            ${dp.Is_Review_Hidden
                                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                            : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white"}`}
                                                >
                                                    <Trash2 size={14} /> {dp.Is_Review_Hidden ? "Đã Xóa/Ẩn" : "Xóa Review"}
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

        </div>
    );
};
