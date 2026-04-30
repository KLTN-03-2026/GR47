import { useState } from "react";
import {
    ClipboardList, Search, ShieldAlert,
    Eye, Clock, PlayCircle, CheckCircle2, XCircle, Lock
} from "lucide-react";

export const ManageOrders = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [displaySearch, setDisplaySearch] = useState(""); // Lưu từ khóa khi bấm Enter
    const [notification, setNotification] = useState({ type: "", message: "" });

    // Dữ liệu giả lập danh sách Đơn hàng (Mục 2)
    const [orders] = useState([
        { id: "BK-8899", client: "Lê Minh Tuấn (0901...)", cleaner: "Nguyễn Văn A", status: "IN_PROGRESS", amount: 350000, date: "04/04/2026" },
        { id: "BK-9911", client: "Trần Thị Lan (0988...)", cleaner: "Chưa có người nhận", status: "PENDING", amount: 280000, date: "04/04/2026" },
        { id: "BK-7722", client: "Phạm Hữu D (0911...)", cleaner: "Trần Thị B", status: "COMPLETED", amount: 450000, date: "03/04/2026" },
        { id: "BK-6633", client: "Ngô Thanh E (0944...)", cleaner: "Lê Văn C", status: "CANCELLED", amount: 300000, date: "03/04/2026" },
        { id: "BK-5544", client: "Vũ Đình F (0933...)", cleaner: "Phạm Hữu D", status: "COMPLETED", amount: 500000, date: "02/04/2026" },
    ]);

    // Hoạt động: Tìm kiếm (Nhập và Enter)
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setDisplaySearch(searchTerm);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(displaySearch.toLowerCase()) ||
        order.client.toLowerCase().includes(displaySearch.toLowerCase())
    );

    // Hiển thị thông báo
    const showToast = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 3000);
    };

    // Hoạt động: Giám sát (Read-only) - Thất bại khi cố tình sửa
    const handleRowClick = () => {
        showToast("error", "Giao diện giám sát chỉ cho phép xem (Read-only). Bạn không có quyền can thiệp thay đổi trạng thái đơn hàng đang chạy.");
    };

    // Helper render Badge trạng thái
    const renderStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return <span className="badge-status-orange"><Clock size={12} /> Chờ nhận</span>;
            case "IN_PROGRESS":
                return <span className="badge-status-blue"><PlayCircle size={12} /> Đang dọn</span>;
            case "COMPLETED":
                return <span className="badge-status-emerald"><CheckCircle2 size={12} /> Hoàn thành</span>;
            case "CANCELLED":
                return <span className="badge-status-red"><XCircle size={12} /> Đã hủy</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* Header & Tìm kiếm */}
            <div className="card-white card-header">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <ClipboardList size={24} className="text-blue-600" /> Giám sát Đơn hàng
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1">
                        <Lock size={14} className="text-slate-400" /> Chế độ Read-only: Theo dõi luồng hoạt động thời gian thực.
                    </p>
                </div>

                {/* Mục 1: Text box tìm kiếm */}
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Nhập mã đơn / SĐT và nhấn Enter..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            {/* Thông báo lỗi quyền truy cập */}
            {notification.message && (
                <div className="alert-error">
                    <ShieldAlert size={20} className="shrink-0" />
                    {notification.message}
                </div>
            )}

            {/* Mục 2: Table - Danh sách đơn hàng */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest font-black">
                                <th className="p-4">Mã Đơn</th>
                                <th className="p-4">Khách hàng (Client)</th>
                                <th className="p-4">Người dọn (Cleaner)</th>
                                <th className="p-4">Giá trị</th>
                                <th className="p-4">Ngày đặt</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-right">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-700">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400">
                                        <Search size={32} className="mx-auto mb-2 text-slate-300" />
                                        Không tìm thấy đơn hàng nào phù hợp với "{displaySearch}".
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={handleRowClick}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-4 font-black text-slate-900 group-hover:text-blue-600 transition-colors">#{order.id}</td>
                                        <td className="p-4">{order.client}</td>
                                        <td className={`p-4 ${order.status === 'PENDING' ? 'text-slate-400 italic' : ''}`}>
                                            {order.cleaner}
                                        </td>
                                        <td className="p-4 font-bold text-emerald-600">{order.amount.toLocaleString()}đ</td>
                                        <td className="p-4 text-slate-500 text-xs">{order.date}</td>
                                        <td className="p-4 text-center">
                                            {renderStatusBadge(order.status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};