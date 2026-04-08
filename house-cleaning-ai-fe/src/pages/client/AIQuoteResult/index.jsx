import { useNavigate } from "react-router-dom";
import {
    ScanSearch,
    Clock,
    Banknote,
    Maximize2,
    Trash2,
    CalendarCheck,
    RefreshCw,
    ChevronLeft,
    Info
} from "lucide-react";

export const ClientAIQuoteResult = () => {
    const navigate = useNavigate();

    // Dữ liệu giả lập
    const aiData = {
        area: 45,
        messiness: "Trung Bình",
        estimatedHours: 4.5,
        totalPrice: 450000,
    };

    const getMessinessColor = (level) => {
        switch (level) {
            case "Thấp": return "text-green-600 bg-green-50 border-green-200";
            case "Trung Bình": return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "Cao": return "text-red-600 bg-red-50 border-red-200";
            default: return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header & Điều hướng */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <button
                            onClick={() => navigate("/")}
                            className="group mb-2 flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-green-600 transition-all"
                        >
                            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                            Quay lại tải ảnh
                        </button>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <ScanSearch className="text-green-600" size={32} />
                            Báo giá chi tiết từ AI
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <RefreshCw size={18} /> Chụp lại ảnh
                        </button>
                    </div>
                </div>

                {/* Bố cục chính: Trải rộng 2 cột trên Desktop */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* CỘT TRÁI (8/12): Thông số bóc tách chi tiết */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Info size={20} className="text-green-600" /> Tham số AI bóc tách
                            </h2>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Mục 1: Diện tích */}
                                <div className="group relative rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all hover:border-green-300 hover:bg-white hover:shadow-md">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                                        <Maximize2 size={24} />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Diện tích ước tính</p>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-gray-900">{aiData.area}</span>
                                        <span className="text-lg font-bold text-gray-400">m²</span>
                                    </div>
                                </div>

                                {/* Mục 1 tiếp: Mức độ bừa bộn */}
                                <div className="group relative rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all hover:border-green-300 hover:bg-white hover:shadow-md">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                                        <Trash2 size={24} />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Mức độ bừa bộn</p>
                                    <div className={`mt-2 inline-flex rounded-full border px-4 py-1 text-lg font-bold ${getMessinessColor(aiData.messiness)}`}>
                                        {aiData.messiness}
                                    </div>
                                </div>
                            </div>

                            {/* Ghi chú thêm (Label View bổ sung) */}
                            <div className="mt-8 rounded-2xl bg-green-50/50 p-6 border border-green-100">
                                <h3 className="text-sm font-bold text-green-800 mb-2 uppercase tracking-wider">Phân tích hệ thống:</h3>
                                <p className="text-sm text-green-700 leading-relaxed italic">
                                    "Dựa trên hình ảnh, AI nhận diện không gian có nhiều đồ đạc cần sắp xếp lại. Thời gian xử lý dự kiến đã bao gồm việc phân loại và dọn dẹp chuyên sâu."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI (4/12): Tổng kết & Chốt đặt lịch (Sticky) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 rounded-3xl border border-green-100 bg-white p-8 shadow-xl shadow-green-900/5">
                            <h2 className="mb-6 text-xl font-black text-gray-900">Tổng kết báo giá</h2>

                            <div className="space-y-6">
                                {/* Mục 2: Thời gian dự kiến */}
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3 text-gray-500 font-medium">
                                        <Clock size={18} />
                                        <span>Dự kiến làm việc:</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{aiData.estimatedHours}h</span>
                                </div>

                                {/* Mục 2 tiếp: Tổng chi phí */}
                                <div className="rounded-2xl bg-green-600 p-6 text-white shadow-lg shadow-green-200">
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-80">Tổng chi phí tạm tính</p>
                                    <div className="mt-2 flex items-baseline justify-between">
                                        <span className="text-3xl font-black tracking-tight">
                                            {aiData.totalPrice.toLocaleString('vi-VN')}
                                        </span>
                                        <span className="text-lg font-bold uppercase">VNĐ</span>
                                    </div>
                                </div>

                                {/* Mục 3: Nút Tiếp tục (Nút chính) */}
                                <button
                                    onClick={() => navigate("/booking-info")}
                                    className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-green-900 py-4 text-lg font-bold text-white transition-all hover:bg-black hover:shadow-xl active:scale-[0.98]"
                                >
                                    Tiếp tục đặt lịch
                                    <CalendarCheck size={22} className="transition-transform group-hover:rotate-12" />
                                </button>

                                <p className="text-center text-xs text-gray-400">
                                    Bấm tiếp tục để chọn địa chỉ và thời gian phục vụ cụ thể.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer ghi chú nhanh */}
                <div className="mt-12 text-center text-gray-400 text-sm">
                    Báo giá AI được cập nhật lúc {new Date().toLocaleTimeString('vi-VN')} • Mã yêu cầu: #AI-2026-X99
                </div>
            </div>
        </div>
    );
};