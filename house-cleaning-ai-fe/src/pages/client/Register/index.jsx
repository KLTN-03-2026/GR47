import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const ClientRegister = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
            setError("Vui lòng điền đầy đủ.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu không khớp.");
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
                    Confirm_Password: formData.confirmPassword
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Đăng ký thất bại.");
            }

            setStatus("success");
            setTimeout(() => navigate("/login"), 2000);

        } catch (err) {
            setError(err.message || "Lỗi server.");
            setStatus("idle");
        }
    };

    if (status === "success") {
        return <div className="text-center mt-20">Đăng ký thành công! Đang chuyển hướng...</div>;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 font-inter text-[#191c1d]">

            <Link to="/" className="text-3xl font-bold mb-10">
                CleanAI
            </Link>

            <div className="w-full max-w-md">

                <h2 className="text-2xl font-bold mb-6">Đăng ký</h2>

                {error && (
                    <div className="mb-4 text-red-500 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <input
                        name="name"
                        placeholder="Họ và tên"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border-b py-3 outline-none"
                    />

                    <input
                        name="phone"
                        placeholder="Số điện thoại"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border-b py-3 outline-none"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border-b py-3 outline-none"
                    />

                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full border-b py-3 outline-none"
                    />

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full bg-black text-white py-3 rounded-lg"
                    >
                        {status === "loading" ? "Đang đăng ký..." : "Đăng ký"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-center">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="font-bold">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};