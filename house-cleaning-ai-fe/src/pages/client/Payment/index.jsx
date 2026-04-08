import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Banknote,
    Wallet,
    CreditCard,
    ShieldCheck,
    ChevronLeft,
    Lock,
    AlertCircle,
    QrCode
} from "lucide-react";

export const ClientPayment = () => {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState("cash"); // Mặc định là Tiền mặt
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    // Danh sách các phương thức thanh toán (Mục 1 đến 5)
    const paymentMethods = [
        {
            id: "cash",
            title: "Thanh toán Tiền mặt",
            description: "Thanh toán trực tiếp cho nhân viên sau khi hoàn thành",
            icon: <Banknote className="text-green-600" size={24} />,
        },
        {
            id: "momo",
            title: "Ví MoMo",
            description: "Thanh toán qua ví điện tử MoMo nhanh chóng",
            icon: <Wallet className="text-pink-500" size={24} />,
        },
        {
            id: "vnpay",
            title: "VNPAY",
            description: "Cổng thanh toán VNPAY (ATM / QR Code)",
            icon: <QrCode className="text-blue-600" size={24} />,
        },
        {
            id: "ipay",
            title: "CleanAI iPay",
            description: "Ví độc quyền tích điểm và ưu đãi từ hệ thống",
            icon: <ShieldCheck className="text-green-700" size={24} />,
        },
        {
            id: "card",
            title: "Thẻ ngân hàng / Tín dụng",
            description: "Visa, Mastercard, JCB qua cổng bảo mật",
            icon: <CreditCard className="text-purple-600" size={24} />,
        },
    ];

    // Logic gọi API Thanh toán (Hoạt động)
    const handlePayment = () => {
        setIsProcessing(true);
        setError("");

        // Giả lập gọi API
        setTimeout(() => {
            // Giả lập trường hợp hệ thống bảo trì (Thất bại)
            const isMaintenance = Math.random() < 0.1; // 10% tỉ lệ lỗi bảo trì

            if (isMaintenance && selectedMethod !== "cash") {
                setError("Hệ thống thanh toán đang bảo trì");
                setIsProcessing(false);
            } else {
                // Thành công: Nếu là điện tử thì mở WebView (giả lập), nếu tiền mặt thì xong luôn
                console.log(`Tiến hành thanh toán qua: ${selectedMethod}`);
                alert("Thanh toán thành công! Đang chuyển hướng đến chi tiết đơn hàng.");
                navigate("/order-detail/BK123"); // Chuyển về trang Chi tiết đơn (Status PAID)
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                {/* Quay lại trang UI_09 */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
                >
                    <ChevronLeft size={18} /> Quay lại thông tin đặt lịch
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* Header */}
                    <div className="p-8 border-b border-gray-50">
                        <h1 className="text-2xl font-black text-gray-900">Chọn phương thức thanh toán</h1>
                        <p className="text-sm text-gray-500 mt-1">Vui lòng chọn cổng thanh toán phù hợp để hoàn tất đơn hàng</p>
                    </div>

                    <div className="p-8">
                        {/* Danh sách Radio Buttons (Mục 1 -> 5) */}
                        <div className="space-y-4">
                            {paymentMethods.map((method) => (
                                <label
                                    key={method.id}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all hover:border-green-200
                    ${selectedMethod === method.id
                                            ? "border-green-600 bg-green-50/50 ring-1 ring-green-600"
                                            : "border-gray-100 bg-white"}`}
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

                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${selectedMethod === method.id ? "border-green-600 bg-green-600" : "border-gray-200"}`}>
                                        {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Thông báo lỗi (Thất bại) */}
                        {error && (
                            <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-2 animate-shake">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        {/* Nút bấm & Tóm tắt (Mục 4 Button) */}
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
                                    <>Tiến hành thanh toán</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chân trang bảo mật */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 opacity-30 grayscale pointer-events-none">
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" className="h-6" alt="MoMo" />
                    <img src="https://vnpay.vn/wp-content/uploads/2020/07/vnpay-logo.png" className="h-4" alt="VNPAY" />
                    <p className="text-xs font-black">PCI DSS COMPLIANT</p>
                </div>
            </div>
        </div>
    );
};