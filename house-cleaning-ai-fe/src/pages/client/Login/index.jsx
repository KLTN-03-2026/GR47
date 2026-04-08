import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Phone, Lock, Eye, EyeOff, AlertCircle,
    ChevronLeft, ShieldCheck, Sparkles
} from "lucide-react";

export const ClientLoginPage = () => {
    const [formData, setFormData] = useState({ phone: "", password: "", rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);

    // Thêm state isLoading để xử lý UI khi đang gọi API
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true); // Bắt đầu loading

        try {
            // Lấy URL từ biến môi trường Vite (.env)
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;

            // Gọi API Đăng nhập
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Phone_Number: formData.phone,
                    Password: formData.password,
                }),
            });

            const data = await response.json();

            // Xử lý lỗi trả về từ Backend (HTTP Status không nằm trong khoảng 200-299)
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Đăng nhập thất bại. Vui lòng thử lại.");
            }

            // ĐĂNG NHẬP THÀNH CÔNG
            const storage = formData.rememberMe ? localStorage : sessionStorage;

            // LƯU TOKEN VÀO BIẾN client_token (Và client_user để tránh trùng lặp)
            storage.setItem("client_token", data.token);
            storage.setItem("client_user", JSON.stringify(data.data));

            console.log("Đăng nhập thành công:", data.message);

            // Chuyển hướng về trang chủ
            navigate("/");

        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            setError(err.message || "Không thể kết nối đến máy chủ.");
        } finally {
            setIsLoading(false); // Tắt loading
        }
    };

    return (
        <div className="h-screen w-full flex font-sans bg-white overflow-hidden">

            {/* CỘT TRÁI: Branding (Màu xanh thẫm - Ẩn trên Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-[#114A2E] relative overflow-hidden flex-col justify-between p-16">

                {/* Abstract Tech Patterns / Background Blur */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a7a4c] rounded-full mix-blend-overlay filter blur-[100px] opacity-30"></div>

                {/* Background Image */}
                <div
                    className="absolute inset-0 opacity-40 mix-blend-luminosity"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>
                <div className="absolute inset-0 bg-[#114A2E]/80"></div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl text-green-400 border border-white/20 shadow-xl">
                        <ShieldCheck size={32} strokeWidth={2} />
                    </div>
                    <span className="text-4xl font-black text-white tracking-tight">Clean<span className="text-green-400">AI</span></span>
                </div>

                {/* Thông điệp */}
                <div className="relative z-10 max-w-lg mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-green-300 font-bold text-sm mb-6">
                        <Sparkles size={16} /> Chào mừng trở lại
                    </div>
                    <h1 className="text-5xl font-black text-white leading-[1.15] mb-6">
                        Không gian sạch sẽ.<br />Cuộc sống thảnh thơi.
                    </h1>
                    <p className="text-green-100 text-lg font-medium leading-relaxed">
                        Đăng nhập để tiếp tục quản lý các dịch vụ dọn dẹp của bạn với hệ thống AI thông minh và minh bạch nhất.
                    </p>
                </div>
            </div>

            {/* CỘT PHẢI: Form Đăng nhập */}
            <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-16 xl:px-32 relative bg-white overflow-y-auto">

                {/* Nút quay lại trang chủ */}
                <div className="absolute top-8 left-6 sm:left-16 xl:left-32">
                    <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#114A2E] transition-colors">
                        <ChevronLeft size={18} className="mr-1" /> Quay lại trang chủ
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto my-auto py-12">

                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Đăng nhập</h2>
                        <p className="text-gray-500 font-medium text-lg">Dành riêng cho Khách hàng sử dụng dịch vụ.</p>
                    </div>

                    {/* Báo lỗi đăng nhập từ API */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-bold animate-shake">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Input Số điện thoại */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-green-700/60">
                                <Phone size={20} />
                            </div>
                            <input
                                required name="phone" type="text" placeholder="Số điện thoại"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-green-700/20 rounded-2xl focus:bg-white focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none text-base font-medium transition-all text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
                                value={formData.phone} onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Input Mật khẩu */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-green-700/60">
                                <Lock size={20} />
                            </div>
                            <input
                                required name="password" type={showPassword ? "text" : "password"} placeholder="Mật khẩu"
                                className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-green-700/20 rounded-2xl focus:bg-white focus:border-green-600 focus:ring-4 focus:ring-green-600/10 outline-none text-base font-medium transition-all text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
                                value={formData.password} onChange={handleChange}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#114A2E] transition-colors disabled:opacity-50"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Utilities: Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    name="rememberMe" type="checkbox"
                                    checked={formData.rememberMe} onChange={handleChange}
                                    disabled={isLoading}
                                    className="w-4 h-4 text-[#114A2E] border-gray-300 rounded focus:ring-[#114A2E] cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-[#114A2E] transition-colors">Ghi nhớ đăng nhập</span>
                            </label>

                            <Link to="/forgot-password" className="text-sm font-bold text-[#114A2E] hover:underline transition-all">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Nút Đăng nhập có trạng thái Loading */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 py-4 bg-[#114A2E] text-white rounded-2xl font-black text-lg hover:bg-[#0c3822] active:scale-[0.98] transition-all flex items-center justify-center shadow-xl shadow-green-900/10 disabled:bg-[#114a2e]/70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Đăng nhập"
                            )}
                        </button>

                    </form>

                    {/* Link Đăng ký */}
                    <div className="mt-10 text-center">
                        <p className="text-gray-500 font-medium">
                            Chưa có tài khoản?{" "}
                            <Link to="/register" className="text-[#114A2E] font-bold hover:underline transition-all">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};