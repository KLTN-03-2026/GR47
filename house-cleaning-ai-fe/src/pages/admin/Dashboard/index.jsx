import { useState, useEffect } from "react";
import {
    TrendingUp, CheckCircle2, Users,
    Calendar, AlertCircle, RefreshCw,
    Wallet, ArrowUpRight, ArrowDownRight
} from "lucide-react";

export const AdminDashboard = () => {
    const [timeFilter, setTimeFilter] = useState("today"); // today | week | month
    const [status, setStatus] = useState("loading"); // loading | success | error
    const [dashboardData, setDashboardData] = useState(null);

    // Giả lập Dữ liệu
    const fetchDashboardData = (filter) => {
        setStatus("loading");

        setTimeout(() => {
            // Giả lập Thất bại: Lỗi truy vấn
            if (filter === "month") {
                setStatus("error");
                return;
            }

            // Giả lập Thành công
            const mockData = {
                today: {
                    kpi: { revenue: 15400000, completedOrders: 42, activeCleaners: 18 },
                    chart: [
                        { label: "08:00", value: 20 }, { label: "10:00", value: 45 },
                        { label: "12:00", value: 30 }, { label: "14:00", value: 80 },
                        { label: "16:00", value: 65 }, { label: "18:00", value: 90 },
                        { label: "20:00", value: 50 },
                    ]
                },
                week: {
                    kpi: { revenue: 105800000, completedOrders: 315, activeCleaners: 45 },
                    chart: [
                        { label: "T2", value: 50 }, { label: "T3", value: 60 },
                        { label: "T4", value: 40 }, { label: "T5", value: 70 },
                        { label: "T6", value: 85 }, { label: "T7", value: 100 },
                        { label: "CN", value: 90 },
                    ]
                }
            };

            setDashboardData(mockData[filter]);
            setStatus("success");
        }, 1000);
    };

    useEffect(() => {
        fetchDashboardData(timeFilter);
    }, [timeFilter]);

    return (
        <div className="space-y-6">

            {/* Header & Lọc thời gian */}
            <div className="card-white card-header">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Thống kê Tổng quan</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Giám sát hiệu suất hoạt động của nền tảng CleanAI.</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                    <Calendar size={18} className="text-slate-400 ml-2" />
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="bg-transparent font-bold text-sm text-slate-700 outline-none pr-4 py-1 cursor-pointer"
                    >
                        <option value="today">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này (Test Lỗi)</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Doanh thu */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tổng Doanh Thu</p>
                            {status === "loading" ? (
                                <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse mb-2"></div>
                            ) : status === "error" ? (
                                <div className="text-2xl font-black text-slate-300 mb-2">--- VNĐ</div>
                            ) : (
                                <div className="text-3xl font-black text-slate-900 mb-2">
                                    {dashboardData?.kpi.revenue.toLocaleString()}đ
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                                <ArrowUpRight size={14} /> +12.5% so với kỳ trước
                            </div>
                        </div>
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><Wallet size={24} /></div>
                    </div>
                </div>

                {/* Đơn hoàn thành */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Đơn Hoàn Thành</p>
                            {status === "loading" ? (
                                <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse mb-2"></div>
                            ) : status === "error" ? (
                                <div className="text-2xl font-black text-slate-300 mb-2">---</div>
                            ) : (
                                <div className="text-3xl font-black text-slate-900 mb-2">
                                    {dashboardData?.kpi.completedOrders} <span className="text-lg font-medium text-slate-500">đơn</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                                <ArrowUpRight size={14} /> +5.2% so với kỳ trước
                            </div>
                        </div>
                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl"><CheckCircle2 size={24} /></div>
                    </div>
                </div>

                {/* Cleaner hoạt động */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cleaner Hoạt Động</p>
                            {status === "loading" ? (
                                <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mb-2"></div>
                            ) : status === "error" ? (
                                <div className="text-2xl font-black text-slate-300 mb-2">---</div>
                            ) : (
                                <div className="text-3xl font-black text-slate-900 mb-2">
                                    {dashboardData?.kpi.activeCleaners} <span className="text-lg font-medium text-slate-500">người</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-xs font-bold text-red-500">
                                <ArrowDownRight size={14} /> -2.1% so với kỳ trước
                            </div>
                        </div>
                        <div className="bg-orange-100 text-orange-600 p-3 rounded-xl"><Users size={24} /></div>
                    </div>
                </div>

            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                        <TrendingUp size={20} />
                    </div>
                    <h2 className="text-lg font-black text-slate-900">Biểu đồ Doanh thu</h2>
                </div>

                <div className="flex-grow relative flex items-center justify-center">

                    {/* Loading */}
                    {status === "loading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    )}

                    {/* Thất bại: Lỗi truy vấn */}
                    {status === "error" && (
                        <div className="text-center animate-shake z-10 bg-red-50 p-8 rounded-2xl border border-red-100 max-w-sm w-full">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Lỗi truy vấn dữ liệu</h3>
                            <p className="text-sm font-medium text-slate-500 mb-6">Không thể kết nối đến máy chủ phân tích. Dữ liệu tháng này tạm thời không khả dụng.</p>
                            <button
                                onClick={() => setTimeFilter("today")}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
                            >
                                <RefreshCw size={16} /> Quay lại Hôm nay
                            </button>
                        </div>
                    )}

                    {/* Thành công: Biểu đồ */}
                    {status === "success" && dashboardData && (
                        <div className="w-full flex items-end justify-between gap-2 sm:gap-6 px-4 mt-6">
                            {dashboardData.chart.map((point, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-end flex-1 h-[250px] group">
                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded mb-2 whitespace-nowrap">
                                        {point.value}%
                                    </div>
                                    {/* Thanh Track & Cột */}
                                    <div className="w-full max-w-[60px] bg-slate-100 rounded-t-lg h-[200px] relative flex items-end">
                                        <div
                                            className="w-full bg-blue-500 group-hover:bg-blue-600 transition-all duration-700 ease-out rounded-t-lg"
                                            style={{ height: `${point.value}%` }}
                                        ></div>
                                    </div>
                                    {/* Nhãn X */}
                                    <div className="text-xs font-bold text-slate-400 mt-3 truncate">{point.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};