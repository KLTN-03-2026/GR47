import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList,
    Clock,
    Calendar,
    ChevronRight,
    PackageOpen,
    Filter
} from "lucide-react";

export const ClientOrderList = () => {
    const navigate = useNavigate();

    // 1. Định nghĩa các Tab lọc (Mục 1)
    const tabs = [
        { id: "ALL", label: "Tất cả" },
        { id: "WAITING", label: "Đang chờ" },
        { id: "IN_PROGRESS", label: "Đang tiến hành" },
        { id: "COMPLETED", label: "Hoàn thành" },
        { id: "CANCELLED", label: "Đã hủy" },
    ];

    const [activeTab, setActiveTab] = useState("ALL");

    // Dữ liệu mẫu (Danh sách đối tượng - Mục 2)
    const mockOrders = [
        { id: "BK001", date: "2026-03-30", time: "09:00", total: 450000, status: "WAITING" },
        { id: "BK002", date: "2026-03-25", time: "14:30", total: 320000, status: "COMPLETED" },
        { id: "BK003", date: "2026-04-05", time: "08:00", total: 500000, status: "IN_PROGRESS" },
        { id: "BK004", date: "2026-03-20", time: "10:00", total: 280000, status: "CANCELLED" },
    ];

    // Logic lọc danh sách (Hoạt động Lọc danh sách)
    const filteredOrders = activeTab === "ALL"
        ? mockOrders
        : mockOrders.filter(order => order.status === activeTab);

    // Helper hiển thị màu sắc trạng thái
    const getStatusStyle = (status) => {
        switch (status) {
            case "WAITING": return { text: "Đang chờ", color: "text-orange-600 bg-orange-50 border-orange-100" };
            case "IN_PROGRESS": return { text: "Đang tiến hành", color: "text-blue-600 bg-blue-50 border-blue-100" };
            case "COMPLETED": return { text: "Hoàn thành", color: "text-green-600 bg-green-50 border-green-100" };
            case "CANCELLED": return { text: "Đã hủy", color: "text-red-600 bg-red-50 border-red-100" };
            default: return { text: status, color: "text-gray-600 bg-gray-50 border-gray-100" };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Header trang */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-green-600 rounded-2xl text-white shadow-lg shadow-green-200">
                        <ClipboardList size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Đơn hàng của tôi</h1>
                        <p className="text-sm text-gray-500 font-medium">Theo dõi và quản lý lịch sử đặt dịch vụ</p>
                    </div>
                </div>

                {/* Mục 1: Tabs lọc */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                  ${activeTab === tab.id
                                        ? "bg-green-600 text-white shadow-md shadow-green-200"
                                        : "text-gray-500 hover:text-green-600 hover:bg-green-50"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mục 2: Danh sách các đơn hàng (List/Card) */}
                <div className="space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                            const status = getStatusStyle(order.status);
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => navigate(`/order-detail/${order.id}`)} // Hoạt động Xem chi tiết
                                    className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                            <PackageOpen size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-lg">Mã đơn: {order.id}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <Calendar size={14} /> {order.date}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <Clock size={14} /> {order.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50">
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng tiền</p>
                                            <p className="text-xl font-black text-green-600">{order.total.toLocaleString()}đ</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${status.color} uppercase tracking-tighter`}>
                                                {status.text}
                                            </span>
                                            <ChevronRight className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" size={20} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* Hiển thị thất bại: Chưa có đơn hàng */
                        <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-200 text-center">
                            <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                <Filter size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Chưa có đơn hàng nào</h3>
                            <p className="text-gray-500 mt-2">Dường như bạn chưa đặt dịch vụ nào trong mục này.</p>
                            <button
                                onClick={() => navigate("/")}
                                className="mt-6 px-8 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                            >
                                Đặt dịch vụ ngay
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer trang */}
                <p className="mt-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Hiển thị tối đa 20 đơn hàng gần nhất
                </p>
            </div>
        </div>
    );
};