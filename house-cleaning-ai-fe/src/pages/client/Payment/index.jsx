import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Banknote, ShieldCheck, ChevronLeft, Lock, AlertCircle
} from "lucide-react";

export const ClientPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hứng toàn bộ dữ liệu từ trang điền thông tin
    const bookingPayload = location.state?.bookingPayload;

    // Bắt lỗi F5 (Chặn nếu không có data)
    useEffect(() => {
        if (!bookingPayload) {
            navigate("/", { replace: true });
        }
    }, [bookingPayload, navigate]);

    const [selectedMethod, setSelectedMethod] = useState("CASH"); // 'CASH' hoặc 'IPAY'
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    // Chỉ giữ lại 2 phương thức sếp yêu cầu
    const paymentMethods = [
        {
            id: "CASH",
            title: "Thanh toán Tiền mặt",
            description: "Thanh toán trực tiếp cho nhân viên sau khi hoàn thành",
            icon: <Banknote className="text-green-600" size={24} />,
        },
        {
            id: "IPAY",
            title: "CleanAI iPay",
            description: "Ví độc quyền tích điểm và ưu đãi từ hệ thống",
            icon: <ShieldCheck className="text-green-700" size={24} />,
        }
    ];

    const getMessLevelNumber = (text) => {
        const levels = { "Thấp": 1, "Trung Bình": 2, "Cao": 3 };
        return levels[text] || 1;
    };

    // CHÍNH THỨC GỌI API CREATE BOOKING TẠI ĐÂY
    const handlePayment = async () => {
        setIsProcessing(true);
        setError("");

        const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

        if (!token) {
            setError("Phiên đăng nhập không tồn tại. Vui lòng đăng nhập lại!");
            setIsProcessing(false);
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;

            const serviceDateTime = `${bookingPayload.date}T${bookingPayload.time}:00`;
            const aiData = bookingPayload.aiResultData;

            // Payload gộp chung gửi cho BE
            const payload = {
                Total_Amount: bookingPayload.finalPrice,
                Service_Date: serviceDateTime,
                Service_Address: bookingPayload.address,
                Notes: bookingPayload.notes,
                Image_Url: aiData.originalImageId || "default_room.png",
                Area_m2: aiData.area,
                Mess_Level: getMessLevelNumber(aiData.messiness),
                Price: bookingPayload.initialPrice,
                Payment_Method: selectedMethod // 'CASH' hoặc 'IPAY' gửi về BE
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
                // Đặt thành công, vác bookingId chạy về trang Chi tiết đơn hàng
                navigate(`/order-detail/${result.bookingId}`, { replace: true });
            } else {
                throw new Error(result.message || "Lỗi khi tạo đơn hàng");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!bookingPayload) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="max-w-3xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
                >
                    <ChevronLeft size={18} /> Quay lại thông tin đặt lịch
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50">
                        <h1 className="text-2xl font-black text-gray-900">Chọn phương thức thanh toán</h1>
                        <p className="text-sm text-gray-500 mt-1">Đơn hàng trị giá: <strong className="text-green-600">{bookingPayload.finalPrice.toLocaleString()}đ</strong></p>
                    </div>

                    <div className="p-8">
                        <div className="space-y-4">
                            {paymentMethods.map((method) => (
                                <label
                                    key={method.id}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all hover:border-green-200
                                    ${selectedMethod === method.id ? "border-green-600 bg-green-50/50 ring-1 ring-green-600" : "border-gray-100 bg-white"}`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden"
                                        checked={selectedMethod === method.id}
                                        onChange={() => setSelectedMethod(method.id)}
                                    />
                                    <div className={`p-3 rounded-xl ${selectedMethod === method.id ? "bg-white shadow-sm" : "bg-gray-50"}`}>
                                        {method.icon}
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`font-bold ${selectedMethod === method.id ? "text-green-900" : "text-gray-900"}`}>
                                            {method.title}
                                        </p>
                                        <p className="text-xs text-gray-500">{method.description}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === method.id ? "border-green-600 bg-green-600" : "border-gray-200"}`}>
                                        {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {error && (
                            <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-2 animate-shake">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Lock size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Thanh toán bảo mật</span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-all flex items-center justify-center gap-3
                                ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 active:scale-95 shadow-green-200"}`}
                            >
                                {isProcessing ? (
                                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Xác nhận đặt đơn {bookingPayload.finalPrice.toLocaleString()}đ</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};