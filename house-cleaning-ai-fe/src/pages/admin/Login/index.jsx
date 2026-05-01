import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Lock, Eye, EyeOff, ShieldAlert,
    LayoutDashboard, Server, ShieldCheck, Activity
} from "lucide-react";

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_BASE_ADMIN_URL;

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Gửi đúng key Backend yêu cầu
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Tài khoản không tồn tại hoặc không có quyền truy cập.");
            }
            localStorage.setItem("admin_token", data.data.token);
            localStorage.setItem("admin_user", JSON.stringify(data.data.admin));

            console.log("Admin đăng nhập thành công:", data.message);

            navigate("/admin/dashboard");

        } catch (err) {
            console.error("Lỗi đăng nhập CMS:", err);
            setError(err.message || "Không thể kết nối đến máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex font-sans bg-white overflow-hidden">

            {/* CỘT TRÁI: Branding Admin (Màu Navy/Slate - Ẩn trên Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-[#0f172a] relative overflow-hidden flex-col justify-between p-16">

                {/* Lưới công nghệ (Tech Grid Background) */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                </div>

                {/* Hiệu ứng Glow */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>

                {/* Logo CMS */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-slate-800 p-2.5 rounded-xl text-blue-400 border border-slate-700 shadow-xl">
                        <Server size={28} strokeWidth={2} />
                    </div>
                    <span className="text-3xl font-black text-white tracking-tight">CleanAI <span className="text-blue-500">CMS</span></span>
                </div>

                {/* Thông điệp Quản trị */}
                <div className="relative z-10 max-w-lg mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-widest mb-6">
                        <Activity size={16} /> Quản trị hệ thống
                    </div>
                    <h1 className="text-5xl font-black text-white leading-[1.15] mb-6">
                        Kiểm soát toàn diện.<br />Vận hành tối ưu.
                    </h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
                        Cổng truy cập bảo mật dành riêng cho Ban quản trị. Giám sát hoạt động, quản lý đối tác và phân tích dữ liệu thời gian thực.
                    </p>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                        <ShieldCheck size={20} className="text-emerald-500" /> Được bảo vệ bởi mã hóa cấp doanh nghiệp
                    </div>
                </div>

                <div className="relative z-10 text-xs font-medium text-slate-500">
                    © 2026 Hệ thống CleanAI. Bảo lưu mọi quyền.
                </div>
            </div>

            {/* CỘT PHẢI: Form Đăng nhập Admin */}
            <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-16 xl:px-32 relative bg-white overflow-y-auto">
                <div className="max-w-md w-full mx-auto my-auto py-12">

                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Đăng nhập CMS</h2>
                        <p className="text-slate-500 font-medium text-lg">Xác thực danh tính để truy cập hệ thống.</p>
                    </div>

                    {/* Báo lỗi đăng nhập */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm font-bold animate-shake">
                            <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Input 1: Tên đăng nhập (Username) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                Tên đăng nhập
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <User size={20} />
                                </div>
                                <input
                                    required name="username" type="text" placeholder="Nhập tên đăng nhập hoặc email"
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none text-base font-medium transition-all text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                                    value={formData.username} onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Input 2: Mật khẩu quản trị */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                Mật khẩu quản trị
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    required name="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none text-base font-medium transition-all text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                                    value={formData.password} onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Mục 3: Nút Vào Bảng điều khiển */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-8 py-4 bg-[#0f172a] text-white rounded-2xl font-black text-lg hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 disabled:bg-slate-700 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Vào Bảng điều khiển <LayoutDashboard size={20} />
                                </>
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};