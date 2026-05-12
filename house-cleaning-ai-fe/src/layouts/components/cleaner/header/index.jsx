import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, User, Star, ShieldCheck, LogOut, Loader2 } from "lucide-react";

export const CleanerHeader = () => {
    const navigate = useNavigate();

    const [cleanerInfo, setCleanerInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyCleaner = async () => {
            const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");

            if (!token) {
                handleAuthFailure();
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;

                const response = await fetch(`${API_URL}/check-auth`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setCleanerInfo(result.data);
                } else {
                    handleAuthFailure();
                }
            } catch (error) {
                console.error("Lỗi xác thực Cleaner:", error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };

        verifyCleaner();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("cleaner_token");
        localStorage.removeItem("cleaner_user");
        sessionStorage.removeItem("cleaner_token");
        sessionStorage.removeItem("cleaner_user");
        navigate("/cleaner/login", { replace: true });
    };

    const handleAuthFailure = () => {
        handleLogout();
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2">
                <Link to="/cleaner" className="flex items-center gap-2">
                    <div className="bg-green-600 p-1.5 rounded-lg text-white shadow-lg shadow-green-200">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="font-black text-gray-900 tracking-tight">Partner<span className="text-green-600">App</span></span>
                </Link>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                {/* Chỉ số nhanh cho Cleaner */}
                <div className="hidden sm:flex items-center gap-4 border-r border-gray-100 pr-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Ví của tôi</p>
                        <p className="text-sm font-bold text-gray-900">
                            {(cleanerInfo?.Wallet_Balance != null
                                ? Number(cleanerInfo.Wallet_Balance)
                                : 0
                            ).toLocaleString("vi-VN")}
                            đ
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            Đánh giá
                        </p>

                        <p className="text-sm font-bold text-gray-900 flex items-center justify-end gap-1">
                            {cleanerInfo?.Rating?.toFixed(1) || "0.0"}

                            <Star
                                size={12}
                                className="fill-yellow-400 text-yellow-400"
                            />
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Thông báo */}
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* Profile Section */}
                    <div className="flex items-center gap-3 pl-2 border-l border-gray-100 sm:border-none">
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin text-gray-300" />
                        ) : (
                            <>
                                <div className="hidden md:block text-right">
                                    <p className="text-xs font-bold text-gray-900 leading-none">
                                        {cleanerInfo?.Full_Name || "Đối tác"}
                                    </p>
                                    <p className="text-[10px] text-green-600 font-medium mt-1">Đang làm việc</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600 font-bold shadow-inner">
                                    {cleanerInfo?.Full_Name ? cleanerInfo.Full_Name.charAt(0).toUpperCase() : <User size={18} />}
                                </div>

                                {/* NÚT ĐĂNG XUẤT */}
                                <button
                                    onClick={handleLogout}
                                    title="Đăng xuất"
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};