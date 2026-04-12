import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft, MapPin, Clock, Banknote,
    Maximize2, Trash2, ShieldCheck, AlertCircle,
    ImageIcon, Sparkles, CheckCircle2, User
} from "lucide-react";

export const CleanerPendingOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [apiMessage, setApiMessage] = useState(""); // Lưu message từ BE trả về

    const MESS_LEVEL_MAP = { 1: 'Thấp', 2: 'Trung Bình', 3: 'Cao' };

    const calcDuration = (area) => {
        if (!area) return "Không xác định";
        const hours = Math.max(2, Math.round((area / 10) * 10) / 10);
        return `${hours} giờ làm việc`;
    };

    // 1. LẤY DATA CHI TIẾT KHI VÀO TRANG
    useEffect(() => {
        const fetchOrderDetail = async () => {
            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
                const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");

                const response = await fetch(`${API_URL}/get-booking-detail-waiting/${id}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const data = result.data;
                    setOrderData({
                        id: data._id,
                        roomImage: data.AI_Details?.Image_Url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
                        aiAnalysis: {
                            area: data.AI_Details?.Area_m2 || 0,
                            messiness: MESS_LEVEL_MAP[data.AI_Details?.Mess_Level] || "Bình thường",
                            detectLabels: ["Phân tích bởi CleanAI"]
                        },
                        details: {
                            customer: data.Client_Name || "Khách ẩn danh",
                            phone: data.Client_Phone || "Không có SĐT",
                            address: data.Service_Address,
                            startTime: new Date(data.Service_Date).toLocaleString('vi-VN', {
                                weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                            }),
                            duration: calcDuration(data.AI_Details?.Area_m2),
                            income: data.Total_Amount
                        }
                    });
                } else {
                    throw new Error(result.message || "Không thể lấy chi tiết đơn hàng.");
                }
            } catch (err) {
                setFetchError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchOrderDetail();
    }, [id]);

    // 2. HÀM GỌI API NHẬN ĐƠN (ACCEPT BOOKING) - ĐÃ CÓ CHỐT CHẶN RACE CONDITION
    const handleAcceptOrder = async () => {
        setStatus("loading");
        setApiMessage("");

        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
            const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");

            // Gọi API nhận đơn sếp vừa viết ở Backend
            const response = await fetch(`${API_URL}/accept-booking/${id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // TRƯỜNG HỢP 1: THÀNH CÔNG (Bạn là người nhanh nhất)
                setStatus("success");
                setApiMessage(result.message);

                // Chuyển sang trang tiến độ làm việc sau 2s
                setTimeout(() => {
                    navigate(`/cleaner/order-progress/${id}`, {
                        state: { passedOrderData: orderData }
                    });
                }, 2000);
            } else {
                // TRƯỜNG HỢP 2: THẤT BẠI (Bị hớt tay trên - Lỗi 409)
                setStatus("error");
                setApiMessage(result.message || "Đơn hàng không còn khả dụng.");
            }
        } catch (err) {
            setStatus("error");
            setApiMessage("Lỗi kết nối máy chủ. Vui lòng thử lại!");
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (fetchError) return <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 text-center"><AlertCircle size={50} className="text-red-400 mb-4" /><p className="font-bold">{fetchError}</p></div>;

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 animate-fade-in-up">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-600 transition-colors">
                    <ChevronLeft size={20} /> Quay lại danh sách đơn chờ
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* CỘT TRÁI: ẢNH VÀ AI */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <ImageIcon size={18} className="text-gray-400" /> Hiện trạng thực tế
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                                    <Sparkles size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">AI Phân tích</span>
                                </div>
                            </div>

                            <div className="relative aspect-video bg-gray-100">
                                <img src={orderData.roomImage} alt="Room" className="w-full h-full object-cover" />
                                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                    <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/20 shadow-sm">Phân tích bởi CleanAI</span>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Diện tích</p>
                                    <div className="flex items-center gap-2 text-2xl font-black text-gray-800">
                                        <Maximize2 size={24} className="text-green-600" /> {orderData.aiAnalysis.area} m²
                                    </div>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mức độ bừa bộn</p>
                                    <div className="flex items-center gap-2 text-2xl font-black text-orange-600">
                                        <Trash2 size={24} /> {orderData.aiAnalysis.messiness}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: THÔNG TIN VÀ NÚT NHẬN */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                            <div className="p-6 sm:p-8 border-b border-gray-100 bg-[#1a1c23] text-white">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã đơn hàng</span>
                                    <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1 rounded-full uppercase">Đang chờ nhận</span>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">#{orderData.id.slice(-6).toUpperCase()}</h2>
                            </div>

                            <div className="p-6 sm:p-8 space-y-8">
                                <div className="flex items-end justify-between bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                    <div>
                                        <p className="text-[10px] font-bold text-green-800/60 uppercase tracking-widest mb-1.5">Thu nhập thực nhận</p>
                                        <p className="text-3xl font-black text-green-600 tracking-tight">{orderData.details.income.toLocaleString()}đ</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-right">Khách hàng</p>
                                        <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5 justify-end">
                                            <User size={14} className="text-gray-400" /> {orderData.details.customer}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 border border-gray-100 shadow-sm"><MapPin size={22} /></div>
                                        <div className="pt-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Địa điểm làm việc</p>
                                            <p className="text-[15px] font-bold text-gray-800 leading-relaxed mt-1.5">{orderData.details.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 border border-gray-100 shadow-sm"><Clock size={22} /></div>
                                        <div className="pt-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thời gian dự kiến</p>
                                            <p className="text-[15px] font-bold text-gray-800 mt-1.5">{orderData.details.startTime}</p>
                                            <p className="text-xs text-green-600 font-bold mt-1 bg-green-50 w-fit px-2 py-0.5 rounded-md">Dự kiến: {orderData.details.duration}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 border border-gray-100 shadow-sm"><ShieldCheck size={22} /></div>
                                        <div className="pt-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số điện thoại liên hệ</p>
                                            <p className="text-[15px] font-bold text-gray-800 mt-1.5">{orderData.details.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* THÔNG BÁO KẾT QUẢ TỪ API */}
                                {status === "success" && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 font-bold text-sm animate-fade-in shadow-sm">
                                        <CheckCircle2 size={24} /> {apiMessage}
                                    </div>
                                )}

                                {status === "error" && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm animate-shake shadow-sm">
                                        <AlertCircle size={24} /> {apiMessage}
                                    </div>
                                )}

                                {/* NÚT NHẬN ĐƠN */}
                                {status !== "success" && (
                                    <button
                                        onClick={handleAcceptOrder}
                                        disabled={status === "loading" || status === "error"}
                                        className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 relative
                                            ${status === "loading" ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
                                                status === "error" ? "bg-gray-50 text-gray-300 cursor-not-allowed" :
                                                    "bg-[#16a34a] text-white hover:bg-[#15803d] shadow-xl shadow-green-900/20 active:scale-[0.98]"}`}
                                    >
                                        {status === "loading" ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 border-3 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                                <span>Đang xử lý...</span>
                                            </div>
                                        ) : (
                                            <>NHẬN ĐƠN HÀNG NGAY <ShieldCheck size={24} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};