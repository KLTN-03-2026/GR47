import React, { useEffect, useState } from "react";
import { Search, Bell, Menu, LogOut, LogIn } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export const AdminHeader = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem("admin_token");

            // Nếu không có token -> Chắc chắn chưa đăng nhập, cắt cầu luôn không gọi API
            if (!token) {
                setAdmin(null);
                setLoading(false);
                return;
            }

            const baseUrl = import.meta.env.VITE_API_BASE_ADMIN_URL;
            const response = await fetch(`${baseUrl}/check-auth`, {
                method: "POST", // API của sếp đang dùng POST
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Đăng nhập thành công -> Set data
                setAdmin(result.data);
            } else {
                // Token sai hoặc hết hạn -> Xóa token cũ, set null
                localStorage.removeItem("admin_token");
                setAdmin(null);
            }
        } catch (error) {
            console.error("Lỗi kết nối Admin API:", error);
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    // Hàm xử lý Đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        setAdmin(null);
        navigate("/admin/login"); // Đổi đường dẫn này theo route login thật của sếp
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "A";

    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0 shrink-0">
            {/* LEFT: Menu & Search */}
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <Menu size={24} />
                </button>
                <div className="hidden md:flex items-center relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="pl-10 pr-4 py-2.5 w-80 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                </div>
            </div>

            {/* RIGHT: Notifications & Profile / Auth */}
            <div className="flex items-center gap-5">
                {loading ? (
                    // 1. GIAO DIỆN LÚC ĐANG TẢI (LOADING SKELETON)
                    <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-slate-200 rounded-full" />
                        <div className="hidden sm:block space-y-2">
                            <div className="h-3 w-24 bg-slate-200 rounded" />
                            <div className="h-2 w-16 bg-slate-200 rounded" />
                        </div>
                        <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    </div>
                ) : admin ? (
                    // 2. GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP THÀNH CÔNG
                    <>
                        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                        </button>

                        <div className="h-8 w-px bg-slate-200 mx-1" />

                        <div className="flex items-center gap-3 group">
                            <div className="text-right hidden sm:block cursor-pointer">
                                <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                                    {admin.Full_Name || "Admin"}
                                </p>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">
                                    {admin.Role || "Quản trị viên"}
                                </p>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-lg overflow-hidden transition-transform group-hover:scale-105 cursor-pointer">
                                {admin.Avatar ? (
                                    <img src={admin.Avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{getInitial(admin.Full_Name)}</span>
                                )}
                            </div>

                            {/* Nút Đăng Xuất */}
                            <button
                                onClick={handleLogout}
                                title="Đăng xuất"
                                className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    // 3. GIAO DIỆN KHI CHƯA ĐĂNG NHẬP
                    <Link
                        to="/admin/login"
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        <LogIn size={18} />
                        Đăng nhập
                    </Link>
                )}
            </div>
        </header>
    );
};