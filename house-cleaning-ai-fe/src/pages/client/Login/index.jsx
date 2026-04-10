import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const ClientLoginPage = () => {
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
        rememberMe: false
    });

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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-inter text-[#191c1d]">

            <Link to="/" className="text-3xl font-bold mb-10">
                CleanAI
            </Link>

            <div className="w-full max-w-md">

                <h2 className="text-2xl font-bold mb-6">Đăng nhập</h2>

                {error && (
                    <div className="mb-4 text-red-500 text-sm">{error}</div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">

                    <input
                        name="phone"
                        placeholder="Số điện thoại"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full border-b py-3 outline-none"
                        required
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full border-b py-3 outline-none"
                        required
                    />

                    <div className="flex justify-between text-sm">
                        <label>
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            /> Ghi nhớ
                        </label>

                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-3 rounded-lg"
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
            </div>
        </div>
    );
};