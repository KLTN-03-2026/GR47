import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, Sparkles } from "lucide-react";

export const ClientLoginPage = () => {
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
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
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Phone_Number: formData.phone,
                    Password: formData.password,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Đăng nhập thất bại.");
            }
            const storage = formData.rememberMe ? localStorage : sessionStorage;
            storage.setItem("client_token", data.token);
            storage.setItem("client_user", JSON.stringify(data.data));
            navigate("/");
        } catch (err) {
            setError(err.message || "Không thể kết nối server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&display=swap"
                rel="stylesheet"
            />

            <div
                className="min-h-screen w-full flex"
                style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
            >
                {/* ── LEFT PANEL ── */}
                <div className="hidden lg:flex lg:w-1/2 bg-[#00A63E] flex-col justify-between p-14 relative overflow-hidden">
                    <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-black/5 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/[0.04] pointer-events-none" />

                    {/* Logo */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                            <Sparkles size={20} />
                        </div>
                        <span className="text-white font-extrabold text-xl tracking-tight">CleanAI</span>
                    </div>

                    {/* Hero */}
                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-7">
                            <Sparkles size={11} /> AI-Powered Cleaning
                        </span>
                        <h1 className="text-white font-extrabold text-5xl leading-tight tracking-tight mb-5">
                            Sạch hơn.<br />
                            <span className="font-light italic text-white/50 text-4xl">thông minh hơn.</span>
                        </h1>
                        <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">
                            Nền tảng đặt dịch vụ vệ sinh thông minh, kết nối bạn với đội ngũ cleaner chuyên nghiệp chỉ trong vài giây.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="relative z-10 flex items-center gap-10">
                        <div>
                            <div className="text-white font-extrabold text-3xl tracking-tight">10K+</div>
                            <div className="text-white/55 text-xs mt-0.5">Khách hàng</div>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div>
                            <div className="text-white font-extrabold text-3xl tracking-tight">500+</div>
                            <div className="text-white/55 text-xs mt-0.5">Cleaner</div>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div>
                            <div className="text-white font-extrabold text-3xl tracking-tight">4.9★</div>
                            <div className="text-white/55 text-xs mt-0.5">Đánh giá</div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white px-6 py-12 relative">

                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-[#00A63E] flex items-center justify-center text-white">
                                <Sparkles size={18} />
                            </div>
                            <span className="text-[#00A63E] font-extrabold text-2xl tracking-tight">CleanAI</span>
                        </div>
                        <p className="text-slate-400 text-sm">Giải pháp AI cho môi trường sạch đẹp hơn</p>
                    </div>

                    <div className="w-full max-w-[420px]">

                        {/* Back */}
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-[#00A63E] transition-colors mb-10"
                        >
                            <ChevronLeft size={16} /> Quay lại trang chủ
                        </button>

                        <h2 className="text-[32px] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                            Đăng nhập
                        </h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Chào mừng trở lại — hãy tiếp tục hành trình sạch sẽ.
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-500 text-sm font-medium px-4 py-3 rounded-xl mb-5">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">

                            {/* Phone */}
                            <div>
                                <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    name="phone"
                                    placeholder="0123 456 789"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-[15px] outline-none placeholder:text-slate-300 focus:border-[#00A63E] focus:bg-white focus:ring-2 focus:ring-[#00A63E]/10 transition disabled:opacity-60"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        required
                                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-[15px] outline-none placeholder:text-slate-300 focus:border-[#00A63E] focus:bg-white focus:ring-2 focus:ring-[#00A63E]/10 transition disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#00A63E] transition-colors disabled:opacity-50"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember + Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-[#00A63E] cursor-pointer"
                                    />
                                    Ghi nhớ đăng nhập
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-semibold text-[#00A63E] hover:opacity-70 transition-opacity"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-[#00A63E] hover:bg-[#008731] active:scale-[0.99] text-white font-bold text-[15px] rounded-xl tracking-wide transition-all hover:shadow-[0_8px_24px_rgba(0,166,62,0.35)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading && (
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                )}
                                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </form>

                        {/* Register */}
                        <p className="text-center text-sm text-slate-400 mt-6">
                            Chưa có tài khoản?{" "}
                            <Link to="/register" className="font-bold text-slate-800 hover:text-[#00A63E] transition-colors">
                                Đăng ký ngay
                            </Link>
                        </p>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-7">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Hoặc tiếp tục với</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        {/* Social */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all"
                            >
                                <svg width="18" height="18" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};