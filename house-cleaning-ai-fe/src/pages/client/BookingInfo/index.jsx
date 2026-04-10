import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Calendar, Clock, MapPin, FileText,
    Check, AlertCircle, ChevronLeft, CreditCard
} from "lucide-react";

export const ClientBookingInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. HỨNG DỮ LIỆU TỪ TRANG AI RESULT
    const aiResultData = location.state?.aiData;

    useEffect(() => {
        if (!aiResultData) {
            navigate("/", { replace: true });
        }
    }, [aiResultData, navigate]);

    // Giá gốc từ AI
    const initialPrice = aiResultData?.totalPrice || 0;

    const [formData, setFormData] = useState({
        date: "",
        time: "",
        address: "",
        notes: "",
        voucher: "",
    });

    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. MAPPING MESS LEVEL (Để gửi lên BE là số 1, 2, 3)
    const getMessLevelNumber = (text) => {
        if (text === "Thấp") return 1;
        if (text === "Trung Bình") return 2;
        if (text === "Cao") return 3;
        return 1;
    };

    const handleApplyVoucher = () => {
        if (formData.voucher.toUpperCase() === "MYAPP2026") {
            setAppliedVoucher({ code: "MYAPP2026", discount: 50000 });
            setErrors((prev) => ({ ...prev, voucher: "" }));
        } else {
            setErrors((prev) => ({ ...prev, voucher: "Mã không hợp lệ" }));
            setAppliedVoucher(null);
        }
    };

    // 3. XỬ LÝ GỬI ĐƠN LÊN BACKEND
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validate cơ bản tại FE
        if (!formData.address) {
            setErrors({ address: "Vui lòng nhập địa chỉ để Cleaner tìm đến bạn" });
            return;
        }
        if (!formData.date || !formData.time) {
            setErrors({ time: "Vui lòng chọn đầy đủ ngày và giờ bắt đầu làm việc" });
            return;
        }

        setIsSubmitting(true);

        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
            console.log("Token đang có là:", token);
            
            // Gộp ngày và giờ thành chuỗi ISO (Ví dụ: 2026-04-15T09:00:00)
            const serviceDateTime = `${formData.date}T${formData.time}:00`;
            const finalPrice = initialPrice - (appliedVoucher?.discount || 0);

            // Payload chuẩn cho API createBooking
            const payload = {
                Total_Amount: finalPrice,
                Service_Date: serviceDateTime,
                Service_Address: formData.address,
                Notes: formData.notes,
                Image_Url: aiResultData.originalImageId || "image_default.png", // Image_Id từ AI
                Area_m2: aiResultData.area,
                Mess_Level: getMessLevelNumber(aiResultData.messiness),
                Price: initialPrice // Giá hạng mục trước giảm giá
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
                // Thành công: Sang trang thanh toán hoặc danh sách đơn hàng
                console.log("Booking created:", result.bookingId);
                navigate("/payment", { state: { bookingId: result.bookingId, amount: finalPrice } });
            } else {
                throw new Error(result.message || "Không thể tạo đơn hàng");
            }

        } catch (error) {
            setErrors({ global: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const finalPrice = initialPrice - (appliedVoucher?.discount || 0);

    if (!aiResultData) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto animate-fade-in-up">

                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
                >
                    <ChevronLeft size={18} /> Quay lại kết quả AI
                </button>

                <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Hoàn tất đặt lịch</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-10">

                            {/* Thông báo lỗi chung nếu API tạch */}
                            {errors.global && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 font-bold text-sm">
                                    <AlertCircle size={18} /> {errors.global}
                                </div>
                            )}

                            {/* 1. Date/Time */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                    <Calendar className="text-green-600" size={20} /> 1. Thời gian làm việc
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold"
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <input
                                        type="time"
                                        className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${errors.time ? 'border-red-500' : 'border-gray-100'} focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold`}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                                {errors.time && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.time}</p>}
                            </section>

                            {/* 2. Địa chỉ */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                    <MapPin className="text-green-600" size={20} /> 2. Địa chỉ nhà chi tiết
                                </h3>
                                <textarea
                                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                                    className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${errors.address ? 'border-red-500' : 'border-gray-100'} focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[120px] font-medium`}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                                {errors.address && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.address}</p>}
                            </section>

                            {/* 3. Ghi chú */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                    <FileText className="text-green-600" size={20} /> 3. Ghi chú cho Cleaner
                                </h3>
                                <textarea
                                    placeholder="Lưu ý: Nhà có thú cưng, mang thêm máy hút bụi, v.v..."
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[100px] font-medium"
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </section>
                        </div>
                    </div>

                    {/* CỘT PHẢI: TÓM TẮT & CHỐT ĐƠN */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-green-100 shadow-xl shadow-green-900/5 sticky top-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6">Tóm tắt thanh toán</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Giá dịch vụ (AI):</span>
                                    <span className="text-gray-900 font-bold">{initialPrice.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Diện tích bóc tách:</span>
                                    <span className="text-gray-900 font-bold">{aiResultData.area} m²</span>
                                </div>

                                {/* Mã Voucher */}
                                <div className="pt-6 border-t border-gray-50">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="MÃ GIẢM GIÁ"
                                            className="flex-grow px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-green-500 outline-none text-sm font-bold uppercase"
                                            onChange={(e) => setFormData({ ...formData, voucher: e.target.value })}
                                        />
                                        <button
                                            onClick={handleApplyVoucher}
                                            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                                        >
                                            ÁP DỤNG
                                        </button>
                                    </div>
                                    {errors.voucher && <p className="mt-2 text-[10px] font-bold text-red-500">{errors.voucher}</p>}
                                    {appliedVoucher && <p className="mt-2 text-[10px] font-bold text-green-600 flex items-center gap-1"><Check size={12} /> Đã giảm {appliedVoucher.discount.toLocaleString()}đ</p>}
                                </div>

                                {/* Tổng thanh toán */}
                                <div className="pt-6 border-t border-gray-100 mt-6">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-gray-900">Thành tiền</span>
                                        <div className="text-right">
                                            {appliedVoucher && <p className="text-xs text-red-500 line-through mb-1">{initialPrice.toLocaleString()}đ</p>}
                                            <p className="text-3xl font-black text-green-600 leading-none">{finalPrice.toLocaleString()}đ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all flex items-center justify-center gap-2
                                ${isSubmitting ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700 text-white active:scale-[0.98]'}`}
                            >
                                {isSubmitting ? (
                                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Xác nhận đặt lịch <Check size={24} /></>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                <CreditCard size={12} /> Bảo mật & An toàn
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};