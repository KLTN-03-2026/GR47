import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    FileText,
    Ticket,
    Check,
    AlertCircle,
    ChevronLeft,
    CreditCard
} from "lucide-react";

export const ClientBookingInfo = () => {
    const navigate = useNavigate();

    // Dữ liệu ban đầu từ AI (giả sử nhận được từ trang trước)
    const initialPrice = 450000;

    const [formData, setFormData] = useState({
        date: "",
        time: "",
        address: "",
        notes: "",
        voucher: "",
    });

    const [appliedVoucher, setAppliedVoucher] = useState(null); // { code: 'SALE20', discount: 50000 }
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Logic kiểm tra thời gian (Mục Thất bại 1: Phải cách hiện tại ít nhất 2 giờ)
    const validateTime = (selectedDate, selectedTime) => {
        if (!selectedDate || !selectedTime) return true;
        const now = new Date();
        const bookingDateTime = new Date(`${selectedDate}T${selectedTime}`);
        const diffInMs = bookingDateTime - now;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        return diffInHours >= 2;
    };

    // 2. Logic Áp dụng Voucher (Mục 4 & Thất bại 2)
    const handleApplyVoucher = () => {
        if (formData.voucher.toUpperCase() === "MYAPP2026") {
            setAppliedVoucher({ code: "MYAPP2026", discount: 50000 });
            setErrors((prev) => ({ ...prev, voucher: "" }));
        } else {
            setErrors((prev) => ({ ...prev, voucher: "Mã không hợp lệ hoặc đã hết lượt" }));
            setAppliedVoucher(null);
        }
    };

    // 3. Logic Xác nhận tạo đơn (Mục 6 & Thất bại 3)
    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.address) newErrors.address = "Thông báo lỗi nếu thiếu Địa chỉ";
        if (!validateTime(formData.date, formData.time)) {
            newErrors.time = "Thời gian bắt đầu phải cách hiện tại ít nhất 2 giờ";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        // Giả lập lưu vào DB (Trạng thái WAITING)
        setTimeout(() => {
            console.log("Đơn lưu vào DB thành công, Booking ID: #BK123");
            navigate("/payment"); // Chuyển sang trang Thanh toán
        }, 1500);
    };

    const finalPrice = initialPrice - (appliedVoucher?.discount || 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Quay lại */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
                >
                    <ChevronLeft size={18} /> Thay đổi báo giá AI
                </button>

                <h1 className="text-3xl font-black text-gray-900 mb-8">Hoàn tất đặt lịch</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN (Mục 1, 2, 3) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">

                            {/* Mục 1: Date/Time Picker */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Calendar className="text-green-600" size={20} /> 1. Chọn thời gian làm việc
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <input
                                        type="time"
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.time ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-green-500 outline-none`}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                                {errors.time && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.time}</p>}
                            </section>

                            {/* Mục 2: Địa chỉ chi tiết */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <MapPin className="text-green-600" size={20} /> 2. Địa chỉ nhà chi tiết
                                </h3>
                                <div className="relative">
                                    <textarea
                                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-green-500 outline-none min-h-[100px]`}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                    <button className="absolute bottom-3 right-3 text-xs font-bold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 flex items-center gap-1">
                                        <MapPin size={12} /> Chọn trên bản đồ
                                    </button>
                                </div>
                                {errors.address && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {errors.address}</p>}
                            </section>

                            {/* Mục 3: Ghi chú bổ sung */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText className="text-green-600" size={20} /> 3. Ghi chú cho Cleaner
                                </h3>
                                <textarea
                                    placeholder="Ví dụ: Nhà có chó mèo, mã số cửa là 1234, mang thêm dụng cụ lau kính..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none min-h-[100px]"
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </section>
                        </div>
                    </div>

                    {/* CỘT PHẢI: TÓM TẮT & THANH TOÁN (Mục 4, 5, 6) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-green-100 shadow-xl shadow-green-900/5 sticky top-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6">Chi tiết đơn hàng</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500">
                                    <span>Giá dịch vụ (AI):</span>
                                    <span className="font-bold text-gray-800">{initialPrice.toLocaleString()}đ</span>
                                </div>

                                {/* Mục 4: Mã Voucher */}
                                <div className="pt-4 border-t border-gray-50">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Mã giảm giá</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nhập mã..."
                                            className="flex-grow px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-green-500 outline-none text-sm uppercase"
                                            onChange={(e) => setFormData({ ...formData, voucher: e.target.value })}
                                        />
                                        <button
                                            onClick={handleApplyVoucher}
                                            className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                    {errors.voucher && <p className="mt-1.5 text-[10px] font-bold text-red-500">{errors.voucher}</p>}
                                    {appliedVoucher && <p className="mt-1.5 text-[10px] font-bold text-green-600 flex items-center gap-1"><Check size={12} /> Đã áp dụng mã {appliedVoucher.code}</p>}
                                </div>

                                {/* Mục 5: Label Tổng tiền cuối cùng */}
                                <div className="pt-4 border-t border-gray-100 mt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-gray-900">Tổng thanh toán</span>
                                        <div className="text-right">
                                            {appliedVoucher && <p className="text-xs text-red-500 line-through mb-1">{initialPrice.toLocaleString()}đ</p>}
                                            <p className="text-3xl font-black text-green-600 leading-none">{finalPrice.toLocaleString()}đ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mục 6: Nút Xác nhận tạo đơn */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Xác nhận đặt lịch <Check size={24} /></>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                <CreditCard size={12} /> Bảo mật & An toàn 100%
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};