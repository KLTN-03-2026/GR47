import { useState, useEffect } from "react";
import {
    ClipboardList, Search, ShieldAlert,
    Eye, Clock, PlayCircle, CheckCircle2, XCircle, Lock,
    ChevronLeft, ChevronRight, RefreshCw, X, MapPin, FileText, Calendar, User, Briefcase
} from "lucide-react";

export const BOOKING_STATUS = {
    WAITING: 1,
    ACCEPTED: 2,
    IN_PROGRESS: 3,
    COMPLETED: 4,
    CANCELLED: 0
};

export const PAYMENT_STATUS = {
    UNPAID: "0",
    PAID: "1"
};

export const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [displaySearch, setDisplaySearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                search: displaySearch
            }).toString();

            const response = await fetch(`${API_BASE}/get-all-bookings?${queryParams}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setOrders(result.data);
                setTotalPages(result.pagination.totalPages || 1);
            } else {
                showToast("error", result.message || "Lỗi tải dữ liệu đơn hàng.");
            }
        } catch (error) {
            showToast("error", "Lỗi kết nối máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentPage, displaySearch]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setDisplaySearch(searchTerm);
            setCurrentPage(1);
        }
    };

    const showToast = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 3500);
    };

    const renderStatusBadge = (status) => {
        switch (Number(status)) {
            case BOOKING_STATUS.WAITING:
                return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit border border-orange-200"><Clock size={12} /> Chờ nhận</span>;
            case BOOKING_STATUS.ACCEPTED:
                return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit border border-indigo-200"><CheckCircle2 size={12} /> Đã nhận</span>;
            case BOOKING_STATUS.IN_PROGRESS:
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit border border-blue-200"><PlayCircle size={12} /> Đang dọn</span>;
            case BOOKING_STATUS.COMPLETED:
                return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit border border-emerald-200"><CheckCircle2 size={12} /> Hoàn thành</span>;
            case BOOKING_STATUS.CANCELLED:
                return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit border border-red-200"><XCircle size={12} /> Đã hủy</span>;
            default:
                return <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 w-fit border border-slate-200">Không xác định</span>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <ClipboardList size={28} className="text-blue-600" /> Giám sát Đơn hàng
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                        <Lock size={14} className="text-slate-400" /> Chế độ Read-only: Theo dõi luồng hoạt động thời gian thực.
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Nhập mã đơn / Tên Khách..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="p-2.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors border border-slate-200 bg-white shadow-sm"
                    >
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {notification.message && (
                <div className={`fixed top-24 right-6 z-[60] p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xl border animate-shake ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    <ShieldAlert size={20} className="shrink-0" />
                    {notification.message}
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-[0.2em] font-black">
                                <th className="p-6">Mã Đơn</th>
                                <th className="p-6">Khách hàng</th>
                                <th className="p-6">Người dọn</th>
                                <th className="p-6">Giá trị</th>
                                <th className="p-6">Ngày làm việc</th>
                                <th className="p-6">Trạng thái</th>
                                <th className="p-6 text-right">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center">
                                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-20 text-center text-slate-400">
                                        <Search size={48} className="mx-auto mb-4 text-slate-200" />
                                        <p className="font-bold">Không tìm thấy đơn hàng nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-6 font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="p-6">
                                            <p className="font-bold text-slate-900">{order.Client_Id?.Full_Name || "Khách ẩn danh"}</p>
                                            <p className="text-xs text-slate-400">{order.Client_Id?.Phone_Number || "N/A"}</p>
                                        </td>
                                        <td className="p-6">
                                            {order.Cleaner_Id ? (
                                                <>
                                                    <p className="font-bold text-slate-900">{order.Cleaner_Id.Full_Name}</p>
                                                    <p className="text-xs text-slate-400">{order.Cleaner_Id.Phone_Number}</p>
                                                </>
                                            ) : (
                                                <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">Chưa có người nhận</span>
                                            )}
                                        </td>
                                        <td className="p-6 font-black text-emerald-600">
                                            {(order.Total_Amount || 0).toLocaleString()}đ
                                        </td>
                                        <td className="p-6">
                                            <p className="font-bold text-slate-900">{new Date(order.Service_Date).toLocaleDateString("vi-VN")}</p>
                                            <p className="text-xs text-slate-400">{new Date(order.Service_Date).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="p-6">
                                            {renderStatusBadge(order.Booking_Status)}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-4 py-2 bg-slate-900 text-white hover:bg-blue-600 rounded-xl transition-all shadow-md font-bold text-xs flex items-center gap-1.5 ml-auto active:scale-95"
                                            >
                                                <Eye size={14} /> Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 bg-white w-fit mx-auto p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center px-4 font-black text-sm text-slate-700">
                        Trang <span className="text-blue-600 mx-1.5">{currentPage}</span> / <span className="text-slate-300 ml-1.5">{totalPages}</span>
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">

                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    Chi tiết Đơn hàng <span className="text-blue-600">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                                </h2>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                    Tạo lúc: {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 space-y-6 bg-slate-50/30">
                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái đơn</p>
                                    {renderStatusBadge(selectedOrder.Booking_Status)}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thanh toán</p>
                                    {String(selectedOrder.Payment_Status) === PAYMENT_STATUS.PAID ? (
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã thanh toán</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200">Chưa thanh toán</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4 border-b border-slate-50 pb-2">
                                        <User size={14} /> Khách hàng
                                    </h3>
                                    <p className="font-bold text-slate-900">{selectedOrder.Client_Id?.Full_Name}</p>
                                    <p className="text-sm text-slate-500 mt-1">{selectedOrder.Client_Id?.Phone_Number}</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4 border-b border-slate-50 pb-2">
                                        <Briefcase size={14} /> Người dọn (Cleaner)
                                    </h3>
                                    {selectedOrder.Cleaner_Id ? (
                                        <>
                                            <p className="font-bold text-slate-900">{selectedOrder.Cleaner_Id.Full_Name}</p>
                                            <p className="text-sm text-slate-500 mt-1">{selectedOrder.Cleaner_Id.Phone_Number}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm italic text-orange-500 font-bold">Hệ thống đang chờ người dọn...</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><Calendar size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian làm việc</p>
                                        <p className="font-bold text-slate-900 text-sm mt-0.5">{new Date(selectedOrder.Service_Date).toLocaleString("vi-VN")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><MapPin size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ dọn dẹp</p>
                                        <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.Service_Address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0"><FileText size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ghi chú của khách</p>
                                        <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.Notes || "Không có ghi chú"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tổng thanh toán</span>
                            <span className="text-2xl font-black text-emerald-600">{(selectedOrder.Total_Amount || 0).toLocaleString()} VNĐ</span>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};