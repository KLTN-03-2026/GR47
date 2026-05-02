import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye, EyeOff, AlertCircle,
    ChevronLeft, ShieldCheck, Briefcase, CheckCircle2
} from "lucide-react";

export const CleanerLoginPage = () => {
    const [formData, setFormData] = useState({ phone: "", password: "", rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
            const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
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
                throw new Error(data.message || "Đăng nhập thất bại. Vui lòng thử lại.");
            }
            const storage = formData.rememberMe ? localStorage : sessionStorage;
            storage.setItem("cleaner_token", data.token);
            storage.setItem("cleaner_user", JSON.stringify(data.data));
            navigate("/cleaner");
        } catch (err) {
            setError(err.message || "Không thể kết nối đến máy chủ.");
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
                <div className="hidden lg:flex lg:w-1/2 bg-[#0D3B25] flex-col justify-between p-14 relative overflow-hidden">

                    <div
                        className="absolute inset-0 opacity-20 mix-blend-luminosity"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                    <div className="absolute inset-0 bg-[#0D3B25]/80" />
                    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-900/40 blur-3xl pointer-events-none" />

                    {/* Logo */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400">
                            <ShieldCheck size={22} />
                        </div>
                        <span className="text-white font-extrabold text-xl tracking-tight">
                            Partner<span className="text-emerald-400">App</span>
                        </span>
                    </div>

                    {/* Hero */}
                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-emerald-300 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-7">
                            <Briefcase size={11} /> Dành cho Cleaner
                        </span>
                        <h1 className="text-white font-extrabold text-5xl leading-tight tracking-tight mb-5">
                            Làm việc tự do.<br />
                            <span className="font-light italic text-white/45 text-4xl">Thu nhập hấp dẫn.</span>
                        </h1>
                        <p className="text-white/60 text-[15px] leading-relaxed max-w-sm">
                            Đăng nhập để bật chế độ nhận việc, quản lý lịch trình và theo dõi thu nhập mỗi ngày.
                        </p>
                    </div>

                    {/* Perks */}
                    <div className="relative z-10 space-y-3">
                        {[
                            "Chủ động nhận & từ chối đơn",
                            "Theo dõi thu nhập theo thời gian thực",
                            "Hỗ trợ 24/7 từ đội ngũ CleanAI",
                        ].map((perk) => (
                            <div key={perk} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={11} className="text-emerald-400" />
                                </div>
                                <span className="text-white/60 text-sm">{perk}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white px-6 py-12 relative">

                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D3B25] via-emerald-500 to-[#0D3B25]" />

                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-[#0D3B25] flex items-center justify-center text-emerald-400">
                                <ShieldCheck size={18} />
                            </div>
                            <span className="text-[#0D3B25] font-extrabold text-2xl tracking-tight">
                                Partner<span className="text-emerald-600">App</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm">Hệ thống dành riêng cho Cleaner</p>
                    </div>

                    <div className="w-full max-w-[420px]">

                        <Link
                            to="/"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-[#0D3B25] transition-colors mb-10"
                        >
                            <ChevronLeft size={16} /> Quay lại trang chủ
                        </Link>

                        <h2 className="text-[32px] font-extrabold text-slate-900 tracking-tight leading-tight mb-1">
                            Đăng nhập Đối tác
                        </h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Dành riêng cho Cleaner truy cập hệ thống nhận việc.
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-500 text-sm font-medium px-4 py-3 rounded-xl mb-5 flex items-start gap-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">

                            <div>
                                <label className="block text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    name="phone"
                                    type="text"
                                    placeholder="0123 456 789"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-[15px] outline-none placeholder:text-slate-300 focus:border-[#0D3B25] focus:bg-white focus:ring-2 focus:ring-[#0D3B25]/10 transition disabled:opacity-60"
                                />
                            </div>

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
                                        className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-[15px] outline-none placeholder:text-slate-300 focus:border-[#0D3B25] focus:bg-white focus:ring-2 focus:ring-[#0D3B25]/10 transition disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#0D3B25] transition-colors disabled:opacity-50"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="w-4 h-4 accent-[#0D3B25] cursor-pointer"
                                    />
                                    Ghi nhớ đăng nhập
                                </label>
                                <Link
                                    to="/cleaner/forgot-password"
                                    className="text-sm font-semibold text-[#0D3B25] hover:opacity-70 transition-opacity"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-[#0D3B25] hover:bg-[#0a2e1c] active:scale-[0.99] text-white font-bold text-[15px] rounded-xl tracking-wide transition-all hover:shadow-[0_8px_24px_rgba(13,59,37,0.35)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading && (
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                )}
                                {isLoading ? "Đang đăng nhập..." : "Đăng nhập hệ thống"}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-400 mt-6">
                            Bạn chưa là đối tác?{" "}
                            <Link to="/cleaner/register" className="font-bold text-slate-800 hover:text-[#0D3B25] transition-colors">
                                Đăng ký ngay
                            </Link>
                        </p>

                    </div>
                </div>
            </div>
        </>
    );
};