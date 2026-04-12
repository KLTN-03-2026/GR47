import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Banknote, ShieldCheck, ChevronLeft, Lock, AlertCircle, CheckCircle2
} from "lucide-react";

export const ClientPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. HỨNG DATA & KIỂM TRA ĐIỀU KIỆN
    const bookingPayload = location.state?.bookingPayload;

    useEffect(() => {
        if (!bookingPayload) {
            navigate("/", { replace: true });
        }
    }, [bookingPayload, navigate]);

    const [selectedMethod, setSelectedMethod] = useState("CASH"); // 'CASH' hoặc 'IPAY'
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    const paymentMethods = [
        {
            id: "CASH",
            value: 1, // Gửi về BE là 1
            title: "Thanh toán Tiền mặt",
            description: "Trả tiền trực tiếp cho Cleaner sau khi hoàn tất công việc",
            icon: <Banknote className="text-green-600" size={24} />,
        },
        {
            id: "IPAY",
            value: 2, // Gửi về BE là 2
            title: "Ví CleanAI iPay",
            description: "Thanh toán nhanh, bảo mật và nhận thêm 5% điểm thưởng",
            icon: <ShieldCheck className="text-green-700" size={24} />,
        }
    ];

    const getMessLevelNumber = (text) => {
        const levels = { "Thấp": 1, "Trung Bình": 2, "Cao": 3 };
        return levels[text] || 1;
    };

    // 2. XỬ LÝ THANH TOÁN & GỌI API
    const handlePayment = async () => {
        setIsProcessing(true);
        setError("");

        const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

        if (!token) {
            setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            setIsProcessing(false);
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;

            // Format lại thời gian chuẩn ISO cho Database
            const serviceDateTime = `${bookingPayload.date}T${bookingPayload.time}:00`;
            const aiData = bookingPayload.aiResultData;

            // CHỐT HẠ PAYLOAD GỬI LÊN BACKEND
            const payload = {
                Total_Amount: bookingPayload.finalPrice,
                Service_Date: serviceDateTime,
                Service_Address: bookingPayload.address,
                Notes: bookingPayload.notes,
                // FIX: Gửi đúng URL ảnh hoặc Base64 từ kết quả AI
                Image_Url: aiData.imageUrl || "default_room.png",
                Area_m2: aiData.area,
                Mess_Level: getMessLevelNumber(aiData.messiness),
                Price: bookingPayload.initialPrice,
                // Chuyển ID phương thức thành số để BE dễ xử lý
                Payment_Method: selectedMethod === "CASH" ? 1 : 2
            };

            const response = await fetch(`${API_URL}/create-booking`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Thành công: Chuyển hướng ngay sang trang chi tiết với hiệu ứng "thắng lợi"
                navigate(`/order-detail/${result.bookingId}`, {
                    replace: true,
                    state: { showSuccessModal: true }
                });
            } else {
                throw new Error(result.message || "Không thể tạo đơn hàng lúc này");
            }
        } catch (err) {
            setError(err.message);
            console.error("Payment Error:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!bookingPayload) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-3xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-all"
                >
                    <ChevronLeft size={18} /> Quay lại bước trước
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-green-900/5 border border-gray-100 overflow-hidden">
                    {/* Header đơn hàng */}
                    <div className="p-8 sm:p-10 border-b border-gray-50 bg-gradient-to-r from-white to-green-50/30">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Thanh toán</h1>
                                <p className="text-gray-500 text-sm mt-1">Vui lòng chọn cách thức bạn muốn thanh toán</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng tiền</span>
                                <p className="text-3xl font-black text-green-600 leading-none mt-1">
                                    {bookingPayload.finalPrice.toLocaleString()}đ
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10">
                        {/* Danh sách phương thức */}
                        <div className="space-y-4">
                            {paymentMethods.map((method) => (
                                <label
                                    key={method.id}
                                    className={`group flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300
                                    ${selectedMethod === method.id
                                            ? "border-green-600 bg-green-50/50 shadow-md ring-1 ring-green-600"
                                            : "border-gray-100 bg-white hover:border-green-200"}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden"
                                        checked={selectedMethod === method.id}
                                        onChange={() => setSelectedMethod(method.id)}
                                    />
                                    <div className={`p-4 rounded-2xl transition-colors ${selectedMethod === method.id ? "bg-white text-green-600" : "bg-gray-50 text-gray-400"}`}>
                                        {method.icon}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-black ${selectedMethod === method.id ? "text-green-900" : "text-gray-900"}`}>
                                                {method.title}
                                            </p>
                                            {selectedMethod === method.id && <CheckCircle2 size={16} className="text-green-600" />}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">{method.description}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === method.id ? "border-green-600 bg-green-600" : "border-gray-200"}`}>
                                        <div className={`w-2 h-2 rounded-full bg-white transition-transform ${selectedMethod === method.id ? "scale-100" : "scale-0"}`} />
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Thông báo lỗi */}
                        {error && (
                            <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3 animate-shake">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        {/* Nút bấm & Bảo mật */}
                        <div className="mt-12 flex flex-col items-center gap-6">
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className={`group relative w-full py-5 rounded-[2rem] font-black text-xl text-white transition-all duration-300 overflow-hidden
                                ${isProcessing
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-gray-900 hover:bg-green-600 active:scale-[0.97] shadow-xl shadow-gray-200 hover:shadow-green-200"}`}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>ĐANG XỬ LÝ...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        XÁC NHẬN ĐẶT LỊCH <ChevronLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>

                            <div className="flex items-center gap-4 text-gray-400">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full">
                                    <Lock size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">SSL Secure</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Powered by CleanAI Pay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};