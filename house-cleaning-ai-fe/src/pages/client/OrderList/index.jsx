import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    Clock,
    Calendar,
    ChevronRight,
    PackageOpen,
    AlertCircle,
    CheckCircle2,
    PlayCircle,
    XCircle,
    Cpu,
    Banknote
} from "lucide-react";

export const ClientOrderList = () => {
    const navigate = useNavigate();

    // Khởi tạo hiệu ứng AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: "ease-out-cubic",
        });
    }, []);

    // 1. Định nghĩa các Tab lọc
    const tabs = [
        { id: "ALL", label: "Tất cả luồng" },
        { id: "WAITING", label: "Đang chờ" },
        { id: "IN_PROGRESS", label: "Đang thi công" },
        { id: "COMPLETED", label: "Hoàn thành" },
        { id: "CANCELLED", label: "Đã hủy" },
    ];

    const [activeTab, setActiveTab] = useState("ALL");

    // 2. States quản lý dữ liệu
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm phiên dịch mã trạng thái BE -> FE
    const mapStatusBEtoFE = (beStatus) => {
        const status = String(beStatus);
        if (status === "1") return "WAITING";
        if (status === "2" || status === "3") return "IN_PROGRESS";
        if (status === "4") return "COMPLETED";
        return "CANCELLED";
    };

    // 3. GỌI API LẤY DATA
    useEffect(() => {
        const fetchMyOrders = async () => {
            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
                const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

                if (!token) throw new Error("Yêu cầu xác thực bảo mật để truy cập luồng dữ liệu.");

                const response = await fetch(`${API_URL}/my-bookings`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const mappedOrders = (result.data || []).map(order => {
                        const dateObj = new Date(order.Service_Date);
                        return {
                            id: order._id,
                            shortId: order._id.slice(-6).toUpperCase(),
                            date: dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                            time: dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                            total: order.Total_Amount,
                            status: mapStatusBEtoFE(order.Booking_Status)
                        };
                    });
                    setOrders(mappedOrders);
                } else {
                    throw new Error(result.message || "Lỗi đồng bộ dữ liệu.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyOrders();
    }, []);

    // Gọi refresh AOS mỗi khi đổi Tab để nó tính toán lại DOM
    useEffect(() => {
        setTimeout(() => {
            AOS.refresh();
        }, 100);
    }, [activeTab, orders]);

    // 4. Logic lọc danh sách theo Tab
    const filteredOrders = activeTab === "ALL"
        ? orders
        : orders.filter(order => order.status === activeTab);

    // 5. Helper giao diện Card chuẩn Cyber/Tech
    const getStatusStyle = (status) => {
        switch (status) {
            case "WAITING": return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", line: "bg-orange-500", icon: <Clock size={14} />, label: "Chờ xác nhận" };
            case "IN_PROGRESS": return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", line: "bg-blue-500", icon: <PlayCircle size={14} className="animate-pulse" />, label: "Đang thi công" };
            case "COMPLETED": return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", line: "bg-emerald-500", icon: <CheckCircle2 size={14} />, label: "Hoàn thành" };
            case "CANCELLED": return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", line: "bg-red-500", icon: <XCircle size={14} />, label: "Đã hủy" };
            default: return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", line: "bg-gray-500", icon: <AlertCircle size={14} />, label: "Không rõ" };
        }
    };

    // =====================================
    // RENDER UI
    // =====================================
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Đang đồng bộ dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 text-center">
                <div data-aos="zoom-in" className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                    <AlertCircle size={40} />
                </div>
                <h2 data-aos="fade-up" className="text-2xl font-black text-slate-900 mb-2">Truy xuất thất bại</h2>
                <p data-aos="fade-up" data-aos-delay="100" className="font-medium text-slate-500 mb-8 max-w-md">{error}</p>
                <button data-aos="fade-up" data-aos-delay="200" onClick={() => window.location.reload()} className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg">
                    Tái khởi động Module
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-10 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
            <div className="max-w-6xl mx-auto">

                {/* COMMAND CENTER HEADER */}
                <div data-aos="fade-down" className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden mb-8">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-green-50 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3.5 bg-green-100 text-green-600 rounded-2xl shadow-inner border border-green-200">
                            <Cpu size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Trung tâm Dịch vụ</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">Giám sát và quản lý các luồng yêu cầu của bạn</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/")}
                        className="relative z-10 px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2 group"
                    >
                        Khởi tạo yêu cầu mới <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* MODULE TABS (Phễu lọc) */}
                <div data-aos="fade-right" data-aos-delay="100" className="flex items-center gap-3 overflow-x-auto pb-2 mb-6 no-scrollbar">
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 rounded-[14px] text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2
                                    ${activeTab === tab.id
                                        ? "bg-slate-900 text-white shadow-md transform scale-105"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
                            >
                                {tab.label}
                                {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MODULE DATA GRID */}
                {/* Trick React: Dùng key={activeTab} để re-render và kích hoạt lại AOS mỗi khi đổi Tab */}
                <div key={activeTab} className="space-y-6">
                    {filteredOrders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrders.map((order, index) => {
                                const style = getStatusStyle(order.status);
                                return (
                                    <div
                                        key={order.id}
                                        data-aos="fade-up"
                                        data-aos-delay={index * 100} // Stagger effect bằng AOS
                                        onClick={() => navigate(`/order-detail/${order.id}`)}
                                        className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:border-green-300 hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col overflow-hidden relative"
                                    >
                                        {/* Top Color Indicator Line */}
                                        <div className={`absolute top-0 left-0 w-full h-1.5 ${style.line} transition-all duration-500 group-hover:h-2`}></div>

                                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center relative overflow-hidden">
                                            {/* Hiệu ứng lướt sáng CSS */}
                                            <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 transform -skew-x-12 transition-all duration-700 group-hover:left-full"></div>

                                            <div className="flex flex-col relative z-10">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mã dịch vụ</span>
                                                <span className="font-black text-slate-800 text-base">#{order.shortId}</span>
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${style.bg} ${style.border} ${style.text} relative z-10`}>
                                                {style.icon}
                                                <span className="text-[11px] font-black uppercase tracking-wider">{style.label}</span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-grow space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-green-100 transition-colors duration-300">
                                                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                                        <Calendar size={14} className="group-hover:text-green-500 transition-colors" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Lịch trình</span>
                                                    </div>
                                                    <p className="font-bold text-slate-700 text-sm">{order.date}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-green-100 transition-colors duration-300">
                                                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                                        <Clock size={14} className="group-hover:text-green-500 transition-colors" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Thời gian</span>
                                                    </div>
                                                    <p className="font-bold text-slate-700 text-sm">{order.time}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-auto group-hover:bg-green-50/50 transition-colors duration-300">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                                    <Banknote size={12} /> Tổng giá trị
                                                </p>
                                                <p className="text-xl font-black text-green-600">{order.total?.toLocaleString()}đ</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300 group-hover:scale-110">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div data-aos="zoom-in" className="bg-white rounded-[2rem] p-16 border border-slate-200 shadow-sm text-center">
                            <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-inner border border-slate-100">
                                <PackageOpen size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Kho dữ liệu trống</h3>
                            <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                                Dường như chưa có bản ghi dữ liệu nào khớp với phân loại <span className="font-bold text-slate-700 border-b border-slate-300">"{tabs.find(t => t.id === activeTab)?.label}"</span>.
                            </p>
                        </div>
                    )}
                </div>

                {filteredOrders.length > 0 && (
                    <div data-aos="fade-in" data-aos-delay="500">
                        <p className="mt-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Đồng bộ theo thời gian thực
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};