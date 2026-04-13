import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList,
    Clock,
    Calendar,
    ChevronRight,
    PackageOpen,
    Filter,
    AlertCircle
} from "lucide-react";

export const ClientOrderList = () => {
    const navigate = useNavigate();

    // 1. Định nghĩa các Tab lọc
    const tabs = [
        { id: "ALL", label: "Tất cả" },
        { id: "WAITING", label: "Đang chờ" },
        { id: "IN_PROGRESS", label: "Đang tiến hành" },
        { id: "COMPLETED", label: "Hoàn thành" },
        { id: "CANCELLED", label: "Đã hủy" },
    ];

    const [activeTab, setActiveTab] = useState("ALL");

    // 2. States quản lý dữ liệu thật
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm phiên dịch mã trạng thái BE -> FE
    const mapStatusBEtoFE = (beStatus) => {
        const status = String(beStatus);
        if (status === "1") return "WAITING";
        // 2 (Đã nhận/Đang di chuyển), 3 (Đang làm việc) gom chung vào Đang tiến hành
        if (status === "2" || status === "3") return "IN_PROGRESS";
        if (status === "4") return "COMPLETED";
        return "CANCELLED"; // Các trạng thái còn lại (hủy, lỗi...)
    };

    // 3. GỌI API LẤY DATA THẬT
    useEffect(() => {
        const fetchMyOrders = async () => {
            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
                const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

                if (!token) throw new Error("Vui lòng đăng nhập để xem đơn hàng.");

                const response = await fetch(`${API_URL}/my-bookings`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Xào nấu lại data từ BE cho vừa vặn với UI FE
                    const mappedOrders = (result.data || []).map(order => {
                        const dateObj = new Date(order.Service_Date);
                        return {
                            id: order._id,
                            date: dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                            time: dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                            total: order.Total_Amount,
                            status: mapStatusBEtoFE(order.Booking_Status)
                        };
                    });
                    setOrders(mappedOrders);
                } else {
                    throw new Error(result.message || "Lỗi khi tải danh sách đơn hàng.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyOrders();
    }, []);

    // 4. Logic lọc danh sách theo Tab
    const filteredOrders = activeTab === "ALL"
        ? orders
        : orders.filter(order => order.status === activeTab);

    // 5. Helper hiển thị màu sắc trạng thái
    const getStatusStyle = (status) => {
        switch (status) {
            case "WAITING": return { text: "Đang chờ", color: "text-orange-600 bg-orange-50 border-orange-100" };
            case "IN_PROGRESS": return { text: "Đang tiến hành", color: "text-blue-600 bg-blue-50 border-blue-100" };
            case "COMPLETED": return { text: "Hoàn thành", color: "text-green-600 bg-green-50 border-green-100" };
            case "CANCELLED": return { text: "Đã hủy", color: "text-red-600 bg-red-50 border-red-100" };
            default: return { text: status, color: "text-gray-600 bg-gray-50 border-gray-100" };
        }
    };

    // =====================================
    // RENDER UI
    // =====================================
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle size={50} className="text-red-400 mb-4" />
                <p className="font-bold text-gray-700">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black">
                    Tải lại trang
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
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
                            const statusStyle = getStatusStyle(order.status);
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => navigate(`/order-detail/${order.id}`)}
                                    className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                                            <PackageOpen size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-lg">Mã đơn: #{order.id.slice(-6).toUpperCase()}</h3>
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
                                            <p className="text-xl font-black text-green-600">{order.total?.toLocaleString()}đ</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${statusStyle.color} uppercase tracking-tighter`}>
                                                {statusStyle.text}
                                            </span>
                                            <ChevronRight className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" size={20} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* Hiển thị thất bại: Chưa có đơn hàng */
                        <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-200 text-center animate-fade-in-up">
                            <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                <Filter size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Không tìm thấy đơn hàng</h3>
                            <p className="text-gray-500 mt-2 font-medium">Dường như bạn chưa có đơn dịch vụ nào trong mục này.</p>
                            <button
                                onClick={() => navigate("/")}
                                className="mt-6 px-8 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 active:scale-95 transition-all shadow-lg shadow-green-200"
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