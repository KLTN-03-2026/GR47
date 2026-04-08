import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    User, Phone, Lock, Check, ShieldCheck,
    Smile, Cpu, Fingerprint, AlertCircle
} from "lucide-react";

export const ClientRegister = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [status, setStatus] = useState("idle"); // idle | loading | success
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Hàm gọi API Đăng ký
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // 1. Validate ở Frontend trước cho nhanh
        if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu không khớp. Vui lòng kiểm tra lại.");
            return;
        }

        setStatus("loading");

        try {
            // Lấy URL từ biến môi trường Vite (.env)
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;

            // 2. Gọi API POST /register
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Map key Frontend sang Backend req.body
                body: JSON.stringify({
                    Full_Name: formData.name,
                    Phone_Number: formData.phone,
                    Password: formData.password,
                    Confirm_Password: formData.confirmPassword
                }),
            });

            const data = await response.json();

            // 3. Xử lý lỗi từ Backend (Lỗi 400, 409...)
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Đăng ký thất bại. Vui lòng thử lại.");
            }

            // 4. ĐĂNG KÝ THÀNH CÔNG
            console.log("Tạo tài khoản thành công:", data.data);

            setStatus("success");

            // Chờ 2.5s để Khách hàng xem màn hình Thành Công rồi mới back về Login
            setTimeout(() => navigate("/login"), 2500);

        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            setError(err.message || "Không thể kết nối đến máy chủ.");
            setStatus("idle"); // Tắt loading để cho user bấm lại
        }
    };

    // Màn hình hiển thị khi Đăng ký Thành công
    if (status === "success") {
        return (
            <div className="min-h-screen bg-[#f4f7f5] flex items-center justify-center p-4 font-sans">
                <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center max-w-md w-full border border-gray-100 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        Chào mừng bạn đến với CleanAI. Hãy chuẩn bị trải nghiệm không gian sống sạch sẽ và thảnh thơi.
                    </p>
                    <div className="text-green-700 font-bold text-sm animate-pulse">
                        Đang chuyển hướng về trang Đăng nhập...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex font-sans bg-[#f4f7f5]">

            {/* CỘT TRÁI: Branding (Màu xanh thẫm) */}
            <div className="hidden lg:flex w-1/2 bg-[#114A2E] relative overflow-hidden flex-col justify-center p-16">

                {/* Abstract Tech Patterns / Background Blur */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a7a4c] rounded-full mix-blend-overlay filter blur-[100px] opacity-30"></div>

                {/* Hình ảnh mô phỏng khách hàng dùng app */}
                <div
                    className="absolute inset-0 opacity-40 mix-blend-luminosity"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>
                <div className="absolute inset-0 bg-[#114A2E]/80"></div>

                {/* Nội dung Cột Trái */}
                <div className="relative z-10 max-w-lg mx-auto w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-green-400 border border-white/20 shadow-xl">
                            <ShieldCheck size={36} strokeWidth={2} />
                        </div>
                        <span className="text-5xl font-black text-white tracking-tight">Clean<span className="text-green-400">AI</span></span>
                    </div>

                    {/* Các điểm nhấn (Bullet points) */}
                    <div className="space-y-8 pl-4 border-l-2 border-green-500/30">
                        <div className="flex items-center gap-5">
                            <div className="bg-white/10 p-3 rounded-xl text-green-300 backdrop-blur-sm">
                                <Smile size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Trải nghiệm Khách hàng</h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="bg-white/10 p-3 rounded-xl text-green-300 backdrop-blur-sm">
                                <Cpu size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Công nghệ AI Minh bạch</h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="bg-white/10 p-3 rounded-xl text-green-300 backdrop-blur-sm">
                                <Fingerprint size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Xác minh Danh tính 100%</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: Form Đăng ký */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">

                <div className="bg-white p-10 sm:p-12 rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.03)] w-full max-w-[500px] border border-gray-100">

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản</h2>
                        <p className="text-gray-500 text-sm">Chào mừng bạn đến với CleanAI</p>
                    </div>

                    {/* Hiển thị lỗi */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm animate-shake">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-green-700/60">
                                <User size={18} />
                            </div>
                            <input
                                name="name" type="text" placeholder="Tên định danh (Họ và Tên)"
                                disabled={status === "loading"}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-green-700/20 rounded-xl focus:border-green-600 focus:ring-0 outline-none text-sm transition-colors text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
                                value={formData.name} onChange={handleChange}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-green-700/60">
                                <Phone size={18} />
                            </div>
                            <input
                                name="phone" type="tel" placeholder="Số điện thoại"
                                disabled={status === "loading"}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-green-700/20 rounded-xl focus:border-green-600 focus:ring-0 outline-none text-sm transition-colors text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
                                value={formData.phone} onChange={handleChange}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-green-700/60">
                                <Lock size={18} />
                            </div>
                            <input
                                name="password" type="password" placeholder="Mật khẩu"
                                disabled={status === "loading"}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-green-700/20 rounded-xl focus:border-green-600 focus:ring-0 outline-none text-sm transition-colors text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
                                value={formData.password} onChange={handleChange}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-green-700/60">
                                <Lock size={18} />
                            </div>
                            <input
                                name="confirmPassword" type="password" placeholder="Xác nhận mật khẩu"
                                disabled={status === "loading"}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-green-700/20 rounded-xl focus:border-green-600 focus:ring-0 outline-none text-sm transition-colors text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
                                value={formData.confirmPassword} onChange={handleChange}
                            />
                        </div>

                        {/* Submit Action */}
                        <div className="pt-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex-shrink-0 flex items-center justify-center">
                                <Check size={24} className="text-green-600" strokeWidth={2.5} />
                            </div>
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="flex-grow py-3.5 bg-[#114A2E] text-white rounded-xl text-sm font-medium hover:bg-[#0c3822] active:scale-[0.98] transition-all flex justify-center items-center shadow-lg shadow-green-900/10 disabled:bg-[#114a2e]/70 disabled:cursor-not-allowed"
                            >
                                {status === "loading" ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Gửi hồ sơ"
                                )}
                            </button>
                        </div>

                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="text-[#114A2E] font-bold hover:underline transition-all">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Text */}
                <div className="absolute bottom-6 text-xs font-medium text-gray-400">
                    Điều khoản & Bảo mật | CleanAI © 2026
                </div>

            </div>
        </div>
    );
};