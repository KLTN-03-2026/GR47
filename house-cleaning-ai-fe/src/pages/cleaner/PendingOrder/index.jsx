import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft, MapPin, Clock, Banknote,
    Maximize2, Trash2, ShieldCheck, AlertCircle,
    ImageIcon, Sparkles, CheckCircle2, User
} from "lucide-react";

export const CleanerPendingOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("idle"); // idle | loading | success | error

    // Dữ liệu giả lập theo đúng mục 1 & 2 trong ảnh
    const orderData = {
        id: id || "BK-8899",
        roomImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
        aiAnalysis: {
            area: 45,
            messiness: "Trung Bình",
            detectLabels: ["Nhiều rác bề mặt", "Sàn gỗ cần lau kỹ", "Có vật nuôi"]
        },
        details: {
            customer: "Lê Minh Tuấn",
            address: "215 Lê Hồng Phong, Phường 4, Quận 5, TP.HCM",
            startTime: "09:00 - Thứ Hai, 30/03/2026",
            duration: "4.5 giờ làm việc",
            income: 350000
        }
    };

    // Hoạt động: Nhận đơn (Mục 3)
    const handleAcceptOrder = () => {
        setStatus("loading");

        // Giả lập logic xử lý thực tế
        setTimeout(() => {
            // Giả lập tỉ lệ thất bại: 10% đơn bị người khác nhận mất (Thất bại)
            const isFastEnough = Math.random() > 0.1;

            if (isFastEnough) {
                setStatus("success"); // Trạng thái ACCEPTED
                setTimeout(() => navigate("/cleaner/order-progress/:id"), 2000);
            } else {
                setStatus("error"); // Trạng thái Người khác nhận
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-8 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Nút quay lại */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-600 transition-colors"
                >
                    <ChevronLeft size={20} /> Quay lại danh sách đơn chờ
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* CỘT TRÁI (7/12): ẢNH PHÒNG & AI PHÂN TÍCH (Mục 1) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <ImageIcon size={18} className="text-gray-400" /> Hiện trạng thực tế
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                                    <Sparkles size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">AI Phân tích</span>
                                </div>
                            </div>

                            {/* Ảnh phòng */}
                            <div className="relative aspect-video">
                                <img
                                    src={orderData.roomImage}
                                    alt="Room Analysis"
                                    className="w-full h-full object-cover"
                                />
                                {/* Labels của AI */}
                                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                    {orderData.aiAnalysis.detectLabels.map(label => (
                                        <span key={label} className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10">
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Thông số bóc tách */}
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Diện tích bóc tách</p>
                                    <div className="flex items-center gap-2 text-xl font-black text-gray-800">
                                        <Maximize2 size={20} className="text-green-600" /> {orderData.aiAnalysis.area} m²
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mức độ bừa bộn</p>
                                    <div className="flex items-center gap-2 text-xl font-black text-orange-600">
                                        <Trash2 size={20} /> {orderData.aiAnalysis.messiness}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI (5/12): THÔNG TIN ĐƠN & NÚT NHẬN (Mục 2 & 3) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                            {/* Header chi tiết đơn */}
                            <div className="p-6 border-b border-gray-100 bg-[#1a1c23] text-white">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã đơn hàng</span>
                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Đang chờ</span>
                                </div>
                                <h2 className="text-2xl font-black">#{orderData.id}</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Thông tin thu nhập */}
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Thu nhập thực nhận</p>
                                        <p className="text-3xl font-black text-green-600">{orderData.details.income.toLocaleString()}đ</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-right">Khách hàng</p>
                                        <p className="text-sm font-bold text-gray-800 flex items-center gap-1 justify-end">
                                            <User size={14} /> {orderData.details.customer}
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-gray-50" />

                                {/* Thông tin địa chỉ & thời gian */}
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="p-2.5 bg-gray-100 rounded-xl text-gray-400 h-fit">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Địa điểm làm việc</p>
                                            <p className="text-sm font-bold text-gray-800 leading-relaxed mt-1">{orderData.details.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="p-2.5 bg-gray-100 rounded-xl text-gray-400 h-fit">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thời gian dự kiến</p>
                                            <p className="text-sm font-bold text-gray-800 mt-1">{orderData.details.startTime}</p>
                                            <p className="text-xs text-gray-400 font-medium mt-0.5 italic">Thời gian dọn: {orderData.details.duration}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hoạt động Thành công / Thất bại */}
                                {status === "success" && (
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 font-bold text-sm animate-fade-in">
                                        <CheckCircle2 size={20} /> Nhận đơn thành công! Đang chuyển trang...
                                    </div>
                                )}

                                {status === "error" && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 font-bold text-sm animate-shake">
                                        <AlertCircle size={20} /> Rất tiếc, đơn này đã được người khác nhận mất.
                                    </div>
                                )}

                                {/* Nút Nhận đơn (Mục 3) */}
                                {status !== "success" && (
                                    <button
                                        onClick={handleAcceptOrder}
                                        disabled={status === "loading" || status === "error"}
                                        className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all
                      ${status === "loading"
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : status === "error"
                                                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                                    : "bg-[#16a34a] text-white hover:bg-[#15803d] active:scale-[0.98] shadow-lg shadow-green-900/10"}`}
                                    >
                                        {status === "loading" ? (
                                            <div className="h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>Nhận đơn hàng ngay <ShieldCheck size={22} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-[10px] font-bold text-gray-400 leading-relaxed px-10">
                            * Lưu ý: Khi nhận đơn, bạn cam kết sẽ có mặt đúng giờ và hoàn thành công việc theo tiêu chuẩn của CleanAI.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};