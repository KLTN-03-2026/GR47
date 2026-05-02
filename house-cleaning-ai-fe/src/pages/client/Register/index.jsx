import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";

export const ClientRegister = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setStatus("loading");
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Full_Name: formData.name,
                    Phone_Number: formData.phone,
                    Password: formData.password,
                    Confirm_Password: formData.confirmPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Đăng ký thất bại.");
            }
            setStatus("success");
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setError(err.message || "Lỗi server.");
            setStatus("idle");
        }
    };

    // ── Success Screen ──
    if (status === "success") {
        return (
            <>
                <link
                    href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <div
                    className="min-h-screen w-full flex items-center justify-center bg-white"
                    style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                >
                    <div className="text-center px-6">
                        <div className="w-20 h-20 rounded-full bg-[#00A63E]/10 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} className="text-[#00A63E]" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Đăng ký thành công!</h2>
                        <p className="text-slate-400 text-sm">Đang chuyển hướng đến trang đăng nhập...</p>
                        <div className="mt-6 w-48 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-[#00A63E] rounded-full animate-[progress_2.5s_linear_forwards]" />
                        </div>
                    </div>
                </div>
            </>
        );
    }

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
                            <Sparkles size={11} /> Tham gia cùng chúng tôi
                        </span>
                        <h1 className="text-white font-extrabold text-5xl leading-tight tracking-tight mb-5">
                            Bắt đầu<br />
                            <span className="font-light italic text-white/50 text-4xl">hành trình sạch sẽ.</span>
                        </h1>
                        <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">
                            Đăng ký miễn phí và trải nghiệm dịch vụ vệ sinh thông minh ngay hôm nay.
                        </p>
                    </div>

                    {/* Perks */}
                    <div className="relative z-10 space-y-3">
                        {[
                            "Đặt lịch nhanh chóng trong 60 giây",
                            "Cleaner được xác minh & đánh giá",
                            "Thanh toán an toàn, hoàn tiền dễ dàng",
                        ].map((perk) => (
                            <div key={perk} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={12} className="text-white" />
                                </div>
                                <span className="text-white/75 text-sm">{perk}</span>
                            </div>
                        ))}
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
                            <ChevronLeft size={16} /> Quay lại
                        </button>

                        <h2 className="text-[32px] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                            Tạo tài khoản
                        </h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Chỉ mất 30 giây để bắt đầu.
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-500 text-sm font-medium px-4 py-3 rounded-xl mb-5">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Name */}
                            <div>
                                <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                                    Họ và tên
                                </label>
                                <input
                                    name="name"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={status === "loading"}
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-[15px] outline-none placeholder:text-slate-300 focus:border-[#00A63E] focus:bg-white focus:ring-2 focus:ring-[#00A63E]/10 transition disabled:opacity-60"
                                />
                            </div>

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
                                    disabled={status === "loading"}
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
                                        disabled={status === "loading"}
                                        required
                                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-[15px] outline-none placeholder:text-slate-300 focus:border-[#00A63E] focus:bg-white focus:ring-2 focus:ring-[#00A63E]/10 transition disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={status === "loading"}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#00A63E] transition-colors disabled:opacity-50"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                                    Nhập lại mật khẩu
                                </label>
                                <div className="relative">
                                    <input
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={status === "loading"}
                                        required
                                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-[15px] outline-none placeholder:text-slate-300 focus:border-[#00A63E] focus:bg-white focus:ring-2 focus:ring-[#00A63E]/10 transition disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={status === "loading"}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#00A63E] transition-colors disabled:opacity-50"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full py-4 bg-[#00A63E] hover:bg-[#008731] active:scale-[0.99] text-white font-bold text-[15px] rounded-xl tracking-wide transition-all hover:shadow-[0_8px_24px_rgba(0,166,62,0.35)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                            >
                                {status === "loading" && (
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                )}
                                {status === "loading" ? "Đang tạo tài khoản..." : "Đăng ký"}
                            </button>
                        </form>

                        {/* Login */}
                        <p className="text-center text-sm text-slate-400 mt-6">
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="font-bold text-slate-800 hover:text-[#00A63E] transition-colors">
                                Đăng nhập
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