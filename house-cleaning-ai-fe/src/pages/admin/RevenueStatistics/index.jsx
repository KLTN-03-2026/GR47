import { useState, useEffect } from "react";
import {
    Wallet, TrendingUp, ArrowUpRight, ArrowDownRight,
    Calendar, Download, Filter, BarChart3, Receipt, CheckCircle2
} from "lucide-react";

export const AdminRevenueStatistics = () => {
    const [yearFilter, setYearFilter] = useState("2026");
    const [status, setStatus] = useState("loading"); // loading | success | error
    const [revenueData, setRevenueData] = useState(null);

    // ==========================================
    // LOGIC CALL API LẤY THỐNG KÊ DOANH THU
    // ==========================================
    const fetchRevenueData = async (year) => {
        setStatus("loading");

        try {
            const token = localStorage.getItem("admin_token");
            if (!token) throw new Error("Chưa xác thực Admin");

            const baseUrl = import.meta.env.VITE_API_BASE_ADMIN_URL;

            // Tạm thời comment API thực tế để sếp test UI
            /*
            const response = await fetch(`${baseUrl}/revenue-stats?year=${year}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);
            setRevenueData(result.data);
            */

            // ==========================================
            // MOCK DATA ĐỂ TEST GIAO DIỆN (Sếp xóa đi khi có API thật)
            // ==========================================
            setTimeout(() => {
                const mockData = {
                    totalRevenue: 854500000,
                    growthRate: 15.2,
                    totalOrders: 1245,
                    averageOrderValue: 686000,
                    monthlyChart: [
                        { month: "T1", value: 45000000, percent: 45 },
                        { month: "T2", value: 38000000, percent: 38 },
                        { month: "T3", value: 65000000, percent: 65 },
                        { month: "T4", value: 82000000, percent: 82 },
                        { month: "T5", value: 100000000, percent: 100 }, // Max
                        { month: "T6", value: 95000000, percent: 95 },
                        { month: "T7", value: 75000000, percent: 75 },
                        { month: "T8", value: 68000000, percent: 68 },
                        { month: "T9", value: 88000000, percent: 88 },
                        { month: "T10", value: 92000000, percent: 92 },
                        { month: "T11", value: 0, percent: 0 },
                        { month: "T12", value: 0, percent: 0 },
                    ],
                    recentTransactions: [
                        { id: "TRX-8829", customer: "Nguyễn Văn An", date: "15/05/2026", amount: 1250000, service: "Dọn dẹp sau xây dựng" },
                        { id: "TRX-8828", customer: "Trần Thị Bích", date: "14/05/2026", amount: 450000, service: "Dọn dẹp tiêu chuẩn" },
                        { id: "TRX-8827", customer: "Lê Hoàng Nam", date: "14/05/2026", amount: 850000, service: "Vệ sinh sofa, rèm" },
                        { id: "TRX-8826", customer: "Phạm Thu Hà", date: "13/05/2026", amount: 600000, service: "Tổng vệ sinh định kỳ" },
                        { id: "TRX-8825", customer: "Vũ Đại Dương", date: "13/05/2026", amount: 1500000, service: "Dọn dẹp văn phòng" },
                    ]
                };
                setRevenueData(mockData);
                setStatus("success");
            }, 800);

        } catch (error) {
            console.error("❌ Lỗi Fetch Revenue:", error);
            setStatus("error");
        }
    };

    useEffect(() => {
        fetchRevenueData(yearFilter);
    }, [yearFilter]);

    return (
        <div className="space-y-6 animate-fade-in pb-10">

            {/* HEADER */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <BarChart3 className="text-green-600" /> Thống Kê Doanh Thu
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Phân tích dòng tiền và sự tăng trưởng của nền tảng.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
                        <Calendar size={18} className="text-gray-400" />
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="bg-transparent font-bold text-sm text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="2026">Năm 2026</option>
                            <option value="2025">Năm 2025</option>
                            <option value="2024">Năm 2024</option>
                        </select>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-md">
                        <Download size={16} /> Xuất Excel
                    </button>
                </div>
            </div>

            {/* KPI CARDS MÀU XANH LÁ CHỦ ĐẠO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1: Tổng Doanh Thu */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-green-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-xs font-black text-green-100 uppercase tracking-widest mb-2">Tổng Doanh Thu {yearFilter}</p>
                            {status === "loading" ? (
                                <div className="h-10 w-40 bg-white/20 rounded-lg animate-pulse mb-3"></div>
                            ) : (
                                <h3 className="text-4xl font-black mb-3">
                                    {revenueData?.totalRevenue.toLocaleString()} <span className="text-xl font-medium">đ</span>
                                </h3>
                            )}
                            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                                <ArrowUpRight size={14} /> +{revenueData?.growthRate || 0}% so với năm ngoái
                            </div>
                        </div>
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                            <Wallet size={28} />
                        </div>
                    </div>
                </div>

                {/* Card 2 & 3: Secondary KPIs */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Receipt size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            <TrendingUp size={12} /> Tăng trưởng ổn định
                        </span>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tổng Số Đơn Hoàn Thành</p>
                    {status === "loading" ? (
                        <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    ) : (
                        <h3 className="text-3xl font-black text-gray-900">{revenueData?.totalOrders.toLocaleString()} <span className="text-base text-gray-500 font-medium">đơn</span></h3>
                    )}
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={12} /> Tối ưu tốt
                        </span>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Giá Trị Đơn Trung Bình (AOV)</p>
                    {status === "loading" ? (
                        <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
                    ) : (
                        <h3 className="text-3xl font-black text-gray-900">{revenueData?.averageOrderValue.toLocaleString()} <span className="text-base text-gray-500 font-medium">đ</span></h3>
                    )}
                </div>
            </div>

            {/* CHART & GIAO DỊCH GẦN ĐÂY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* BIỂU ĐỒ 12 THÁNG */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xl font-black text-gray-900">Biểu đồ Doanh thu năm {yearFilter}</h2>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>

                    <div className="relative h-[300px] flex items-end justify-between gap-1 sm:gap-4">
                        {status === "loading" ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-8 w-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            revenueData?.monthlyChart.map((item, index) => (
                                <div key={index} className="flex flex-col items-center flex-1 group h-full justify-end relative">

                                    {/* Tooltip Hover */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-gray-900 text-white text-[10px] sm:text-xs font-bold px-2 py-1.5 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                                        {(item.value / 1000000).toFixed(1)} Tr
                                    </div>

                                    {/* Cột Bar */}
                                    <div className="w-full max-w-[40px] bg-gray-50 rounded-t-xl h-[85%] relative flex items-end overflow-hidden">
                                        <div
                                            className={`w-full rounded-t-xl transition-all duration-1000 ease-out 
                                                ${item.percent > 80 ? 'bg-green-500 group-hover:bg-green-600' : 'bg-green-300 group-hover:bg-green-400'}`}
                                            style={{ height: `${item.percent}%` }}
                                        ></div>
                                    </div>

                                    <span className="text-xs font-bold text-gray-400 mt-3">{item.month}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* GIAO DỊCH GẦN ĐÂY */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-gray-900">Giao dịch mới nhất</h2>
                        <span className="text-xs font-bold text-green-600 cursor-pointer hover:underline">Xem tất cả</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {status === "loading" ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            revenueData?.recentTransactions.map((trx, index) => (
                                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{trx.customer}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{trx.service}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-green-600">+{trx.amount.toLocaleString()}đ</p>
                                        <p className="text-[10px] font-medium text-gray-400">{trx.date}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};