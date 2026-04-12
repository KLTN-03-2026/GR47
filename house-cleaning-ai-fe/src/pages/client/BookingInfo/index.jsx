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

    const handleApplyVoucher = () => {
        if (formData.voucher.toUpperCase() === "MYAPP2026") {
            setAppliedVoucher({ code: "MYAPP2026", discount: 50000 });
            setErrors((prev) => ({ ...prev, voucher: "" }));
        } else {
            setErrors((prev) => ({ ...prev, voucher: "Mã không hợp lệ" }));
            setAppliedVoucher(null);
        }
    };

    // 2. XỬ LÝ CHUYỂN SANG TRANG THANH TOÁN (KHÔNG GỌI API TẠI ĐÂY NỮA)
    const handleProceedToPayment = (e) => {
        e.preventDefault();
        setErrors({});

        // Validate cơ bản
        if (!formData.address) {
            setErrors({ address: "Vui lòng nhập địa chỉ để Cleaner tìm đến bạn" });
            return;
        }
        if (!formData.date || !formData.time) {
            setErrors({ time: "Vui lòng chọn đầy đủ ngày và giờ bắt đầu làm việc" });
            return;
        }

        const finalPrice = initialPrice - (appliedVoucher?.discount || 0);

        // Gom tất cả data vào một cục để mang sang trang Thanh Toán
        const bookingPayload = {
            ...formData, // date, time, address, notes
            finalPrice,
            initialPrice,
            aiResultData // area, messiness, originalImageId...
        };

        // Chuyển trang và mang theo data
        navigate("/payment", { state: { bookingPayload } });
    };

    const finalPrice = initialPrice - (appliedVoucher?.discount || 0);

    if (!aiResultData) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors">
                    <ChevronLeft size={18} /> Quay lại kết quả AI
                </button>

                <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Thông tin đặt lịch</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* FORM INPUT */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-10">
                            {/* ... (Các thẻ section Calendar, MapPin, FileText GIỮ NGUYÊN NHƯ CŨ) ... */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                    <Calendar className="text-green-600" size={20} /> 1. Thời gian làm việc
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="date" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold" onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                    <input type="time" className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${errors.time ? 'border-red-500' : 'border-gray-100'} focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold`} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                                {errors.time && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.time}</p>}
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                    <MapPin className="text-green-600" size={20} /> 2. Địa chỉ nhà chi tiết
                                </h3>
                                <textarea placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${errors.address ? 'border-red-500' : 'border-gray-100'} focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[120px] font-medium`} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                {errors.address && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.address}</p>}
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                    <FileText className="text-green-600" size={20} /> 3. Ghi chú cho Cleaner
                                </h3>
                                <textarea placeholder="Lưu ý: Nhà có thú cưng, mang thêm máy hút bụi, v.v..." className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[100px] font-medium" onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                            </section>
                        </div>
                    </div>

                    {/* TÓM TẮT & SUBMIT */}
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
                                        <input type="text" placeholder="MÃ GIẢM GIÁ" className="flex-grow px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-green-500 outline-none text-sm font-bold uppercase" onChange={(e) => setFormData({ ...formData, voucher: e.target.value })} />
                                        <button onClick={handleApplyVoucher} className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors">ÁP DỤNG</button>
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

                            {/* Nút này giờ chỉ chuyển trang chứ chưa gọi API */}
                            <button
                                onClick={handleProceedToPayment}
                                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Tiếp tục thanh toán <ChevronLeft className="rotate-180" size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};