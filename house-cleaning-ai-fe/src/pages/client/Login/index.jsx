import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

export const ClientLoginPage = () => {
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
        rememberMe: false
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
        <div className="min-h-screen flex bg-white text-[#191c1d]">
            
            {/* Left Side - Background Image/Color (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00A63E] to-[#008731] items-center justify-center p-8">
                <div className="text-white text-center">
                    <svg className="w-32 h-32 mx-auto mb-6 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
                    </svg>
                    <h1 className="text-4xl font-extrabold mb-4">CleanAI</h1>
                    <p className="text-lg opacity-90">Giải pháp AI cho môi trường sống sạch đẹp hơn</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-8">

                {/* Mobile Header (Hidden on Desktop) */}
                <div className="lg:hidden text-center mb-10 w-full">
                    <h1 className="text-3xl font-extrabold text-[#00A63E] mb-2">
                        CleanAI
                    </h1>
                    <p className="text-gray-600">Giải pháp AI cho môi trường sạch đẹp hơn</p>
                </div>

                <div className="w-full max-w-md shadow-lg p-6 rounded-lg bg-white">

                {/* Nút quay lại */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#00A63E] mb-8 transition-colors"
                >
                    <ChevronLeft size={18} /> Quay lại trang chủ
                </button>

                <h2 className="text-2xl font-extrabold mb-6 text-center">Đăng nhập</h2>

                {error && (
                    <div className="mb-4 text-red-500 text-sm">{error}</div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <h2 className="m-0 font-bold">SĐT</h2>
                    <input
                        name="phone"
                        placeholder="0123456789"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gray-100 outline-none"
                        required
                    />
                    <h2 className="m-0 font-bold">Mật khẩu</h2>
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="*************"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full py-3 px-4 pr-12 bg-gray-100 outline-none rounded"
                            required
                        />
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#00A63E] transition-colors disabled:opacity-50"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="flex justify-between text-sm">
                        <label>
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            /> Ghi nhớ
                        </label>

                        <Link to="/forgot-password" className="hover:text-[#00A63E] py-1 px-2 rounded">Quên mật khẩu?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#00A63E] text-white py-3 rounded-lg"
                    >
                        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-center">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="font-bold">
                        Đăng ký
                    </Link>
                </p>

                {/* Hoặc tiếp tục với */}
                <div className="mt-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-1 h-px bg-gray-300"></div>

                        <p className="mx-4 text-sm text-gray-500">
                            Hoặc tiếp tục với
                        </p>

                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <div className="flex gap-4">
                        {/* Facebook Button */}
                        <button
                            type="button"
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                            </svg>
                            <span className="text-sm font-semibold">Facebook</span>
                        </button>

                        {/* Google Button */}
                        <button
                            type="button"
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            <span className="text-sm font-semibold">Google</span>
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};