import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Phone, Lock, KeyRound, ChevronLeft,
    AlertCircle, CheckCircle2, ShieldCheck
} from "lucide-react";

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Nhập SĐT, 2: Nhập OTP & Đổi MK

    const [formData, setFormData] = useState({
        phone: "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [countdown, setCountdown] = useState(0);
    const [status, setStatus] = useState("idle"); // idle | loading | error | success
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Đếm ngược 60s OTP
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    // Hoạt động: Gửi mã OTP (Mục 1 & 2)
    const handleSendOTP = (e) => {
        e.preventDefault();
        if (!formData.phone) return;

        setStatus("loading");
        setErrorMsg("");

        setTimeout(() => {
            // Giả lập Thất bại: Số điện thoại không tồn tại
            if (formData.phone === "0000000000") {
                setErrorMsg("Số điện thoại không tồn tại trong hệ thống.");
                setStatus("error");
                return;
            }

            // Giả lập Thành công
            setStep(2);
            setCountdown(60);
            setStatus("idle");
        }, 1500);
    };

    // Hoạt động: Xác nhận đổi Mật khẩu (Mục 3, 4 & 5)
    const handleResetPassword = (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setErrorMsg("Mật khẩu xác nhận không khớp.");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setErrorMsg("");

        setTimeout(() => {
            // Giả lập Thất bại: OTP sai hoặc hết hạn
            if (formData.otp === "111111") {
                setErrorMsg("Mã OTP không chính xác hoặc đã hết hạn.");
                setStatus("error");
                return;
            }

            // Giả lập Thành công
            setStatus("success");
            setTimeout(() => navigate("/login"), 2500);
        }, 1500);
    };

    if (status === "success") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Đổi mật khẩu thành công!</h2>
                    <p className="text-gray-500 font-medium leading-relaxed mb-8">
                        Bạn đã lấy lại quyền truy cập tài khoản. Vui lòng đăng nhập bằng mật khẩu mới để tiếp tục.
                    </p>
                    <p className="text-green-600 font-bold text-sm animate-pulse">Đang chuyển hướng về trang Đăng nhập...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

                {/* Nút quay lại */}
                <button
                    onClick={() => step === 2 ? setStep(1) : navigate(-1)}
                    className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-green-600 mb-8 transition-colors"
                >
                    <ChevronLeft size={18} /> {step === 2 ? "Quay lại" : "Về trang đăng nhập"}
                </button>

                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={28} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">Lấy lại mật khẩu</h2>
                    <p className="text-gray-500 mt-2 font-medium text-sm">
                        {step === 1 ? "Nhập số điện thoại đã đăng ký để nhận mã OTP." : "Nhập mã OTP và tạo mật khẩu mới an toàn."}
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-bold animate-shake">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {step === 1 ? (
                    // BƯỚC 1: NHẬP SĐT
                    <form onSubmit={handleSendOTP} className="space-y-6 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2">Số điện thoại</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    required name="phone" type="text" placeholder="Ví dụ: 0901234567"
                                    className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl focus:bg-gray-50 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none text-sm font-bold transition-all"
                                    value={formData.phone} onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={status === "loading" || !formData.phone}
                            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-200 flex justify-center items-center"
                        >
                            {status === "loading" ? <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Nhận mã OTP"}
                        </button>
                    </form>
                ) : (
                    // BƯỚC 2: NHẬP OTP & MK MỚI
                    <form onSubmit={handleResetPassword} className="space-y-5 animate-slide-in-right">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2 flex justify-between">
                                Mã xác thực OTP
                                <span className={countdown > 0 ? "text-orange-500" : "text-green-600 cursor-pointer hover:underline"} onClick={() => countdown === 0 && handleSendOTP({ preventDefault: () => { } })}>
                                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
                                </span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <KeyRound size={18} />
                                </div>
                                <input
                                    required name="otp" type="text" maxLength="6" placeholder="Nhập 6 số"
                                    className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl focus:bg-gray-50 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none text-lg font-black tracking-[0.5em] transition-all text-center"
                                    value={formData.otp} onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2">Mật khẩu mới</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                                <input
                                    required name="newPassword" type="password" placeholder="Tạo mật khẩu mới"
                                    className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl focus:bg-gray-50 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none text-sm font-bold transition-all"
                                    value={formData.newPassword} onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                                <input
                                    required name="confirmPassword" type="password" placeholder="Xác nhận mật khẩu mới"
                                    className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl focus:bg-gray-50 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none text-sm font-bold transition-all"
                                    value={formData.confirmPassword} onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={status === "loading"}
                            className="w-full mt-2 py-4 bg-[#1a1c23] text-white rounded-2xl font-black text-lg hover:bg-black active:scale-[0.98] transition-all shadow-lg flex justify-center items-center"
                        >
                            {status === "loading" ? <div className="h-6 w-6 border-2 border-gray-500 border-t-white rounded-full animate-spin" /> : "Xác nhận & Đổi mật khẩu"}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};