import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ScanSearch, Clock, Maximize2,
    Trash2, CalendarCheck, RefreshCw, ChevronLeft, Info
} from "lucide-react";

export const ClientAIQuoteResult = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. LẤY DATA TỪ HOME PAGE GỬI QUA
    // Lưu ý: HomePage gửi { state: { aiData: result.data } }
    const rawAiData = location.state?.aiData;

    useEffect(() => {
        if (!rawAiData) {
            navigate("/", { replace: true });
        }
    }, [rawAiData, navigate]);

    if (!rawAiData) return null;

    // 2. BIẾN ĐỔI DATA (Đã sửa Key theo đúng JSON thực tế của sếp)
    const mapMessiness = (status) => {
        if (status === 'low') return "Thấp";
        if (status === 'medium') return "Trung Bình";
        if (status === 'high') return "Cao";
        return "Trung Bình";
    };

    const calcEstimatedHours = () => {
        // Sửa: estimated_area_m2 -> area
        const area = rawAiData?.details?.area || 0;
        const baseHours = area / 10;
        // Giả định tối thiểu 2 giờ làm việc
        return Math.max(2, Math.round(baseHours * 10) / 10);
    };

    // Chuẩn hóa dữ liệu để hiển thị lên UI
    const aiData = {
        area: rawAiData?.details?.area || 0,
        messiness: mapMessiness(rawAiData?.details?.clutter_status),
        estimatedHours: calcEstimatedHours(),
        totalPrice: rawAiData?.final_price_vnd || 0,
        // Lưu thêm các thông số gốc để tí nữa gửi sang trang Booking
        rawDetails: rawAiData?.details
    };

    // 3. UI HELPER TẠO MÀU SẮC
    const getMessinessColor = (level) => {
        switch (level) {
            case "Thấp": return "text-green-600 bg-green-50 border-green-200";
            case "Trung Bình": return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "Cao": return "text-red-600 bg-red-50 border-red-200";
            default: return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
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

                {/* Bố cục chính */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* CỘT TRÁI (8/12): Thông số bóc tách */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Info size={20} className="text-green-600" /> Tham số AI bóc tách
                            </h2>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Diện tích */}
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

                                {/* Mức độ bừa bộn */}
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

                            <div className="mt-8 rounded-2xl bg-green-50/50 p-6 border border-green-100">
                                <h3 className="text-sm font-bold text-green-800 mb-2 uppercase tracking-wider">Phân tích hệ thống:</h3>
                                <p className="text-sm text-green-700 leading-relaxed italic">
                                    "Dựa trên hình ảnh, AI nhận diện không gian với diện tích ước tính {aiData.area}m² và mức độ bừa bộn {aiData.messiness.toLowerCase()}. Chi phí đã được tính toán dựa trên thuật toán nhận diện vật dụng thực tế để đảm bảo chất lượng dọn dẹp chuyên sâu."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI (4/12): Tổng kết */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 rounded-3xl border border-green-100 bg-white p-8 shadow-xl shadow-green-900/5">
                            <h2 className="mb-6 text-xl font-black text-gray-900">Tổng kết báo giá</h2>

                            <div className="space-y-6">
                                {/* Thời gian */}
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3 text-gray-500 font-medium">
                                        <Clock size={18} />
                                        <span>Dự kiến làm việc:</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">{aiData.estimatedHours}h</span>
                                </div>

                                {/* Chi phí */}
                                <div className="rounded-2xl bg-green-600 p-6 text-white shadow-lg shadow-green-200">
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-80">Tổng chi phí tạm tính</p>
                                    <div className="mt-2 flex items-baseline justify-between">
                                        <span className="text-3xl font-black tracking-tight">
                                            {(aiData.totalPrice || 0).toLocaleString('vi-VN')}
                                        </span>
                                        <span className="text-lg font-bold uppercase pl-1">VNĐ</span>
                                    </div>
                                </div>

                                {/* Nút Tiếp tục */}
                                <button
                                    onClick={() => navigate("/booking-info", { state: { aiData: aiData } })}
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

                <div className="mt-12 text-center text-gray-400 text-sm font-medium">
                    Báo giá AI được phân tích lúc {new Date().toLocaleTimeString('vi-VN')} • Đơn giá: {(rawAiData?.details?.price_per_m2 || 0).toLocaleString('vi-VN')} VNĐ/m²
                </div>
            </div>
        </div>
    );
};