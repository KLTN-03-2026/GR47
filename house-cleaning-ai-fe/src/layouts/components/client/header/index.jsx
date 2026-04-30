import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import logo from "../../../../assets/img/logo.png";

export const ClientHeader = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Auth States
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const navigate = useNavigate();

    const navClass = ({ isActive }) =>
        `font-medium transition-colors duration-200 ${isActive ? "text-green-600" : "text-gray-600 hover:text-green-600"}`;

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

            if (!token) {
                setIsCheckingAuth(false);
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;

                const response = await fetch(`${API_URL}/check-auth`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setIsAuthenticated(true);
                    setUserData(data.data);
                } else {
                    handleClearAuth();
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra xác thực:", error);
                handleClearAuth();
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuthStatus();
    }, []);

    const handleClearAuth = () => {
        localStorage.removeItem("client_token");
        sessionStorage.removeItem("client_token");
        localStorage.removeItem("client_user");
        sessionStorage.removeItem("client_user");
        setIsAuthenticated(false);
        setUserData(null);
    };

    const handleLogout = () => {
        handleClearAuth();
        navigate("/login");
    };

    return (
        <div className="sticky top-0 z-50 w-full">
            <div className="w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src={logo}
                            alt="Clean AI"
                            className="h-14 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex gap-8">
                        <NavLink to="/" className={navClass}>Trang Chủ</NavLink>
                        <NavLink to="/about" className={navClass}>Giới Thiệu</NavLink>
                        <NavLink to="/services" className={navClass}>Dịch Vụ</NavLink>
                        <NavLink to="/contact" className={navClass}>Liên Hệ</NavLink>
                        {isAuthenticated && (
                            <NavLink to="/order-list" className={navClass}>Đơn Hàng Của Tôi</NavLink>
                        )}
                    </nav>

                    {/* Auth Section (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {isCheckingAuth ? (
                            <div className="flex gap-4">
                                <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
                                <div className="h-9 w-20 bg-green-200 animate-pulse rounded-lg"></div>
                            </div>
                        ) : isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <div className="w-9 h-9 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold border border-green-200 shadow-sm">
                                        {/* Đã sửa thành Full_Name */}
                                        {userData?.Full_Name ? userData.Full_Name.charAt(0).toUpperCase() : <User size={18} />}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 hidden lg:block">
                                        {/* Đã sửa thành Full_Name */}
                                        {userData?.Full_Name || "Khách hàng"}
                                    </span>
                                </Link>
                                <div className="h-5 w-px bg-gray-200"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <LogOut size={16} /> Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-green-600">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700 shadow-sm shadow-green-200">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Nút bật/tắt Mobile Menu */}
                    <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu (Responsive) */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white">
                        <div className="px-4 py-4 space-y-2 flex flex-col">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover-link-green transition-colors">Trang Chủ</Link>
                            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover-link-green transition-colors">Giới Thiệu</Link>
                            <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="hover-link-green transition-colors">Dịch Vụ</Link>
                            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover-link-green transition-colors">Liên Hệ</Link>

                            {isAuthenticated && (
                                <Link to="/order-list" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-green-600 font-bold bg-green-50 rounded-lg">Đơn Hàng Của Tôi</Link>
                            )}

                            <div className="border-t border-gray-100 my-2 pt-4">
                                {isCheckingAuth ? null : isAuthenticated ? (
                                    <div className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                                                {/* Đã sửa thành Full_Name */}
                                                {userData?.Full_Name ? userData.Full_Name.charAt(0).toUpperCase() : <User size={20} />}
                                            </div>
                                            {/* Đã sửa thành Full_Name */}
                                            <span className="font-bold text-gray-800">{userData?.Full_Name || "Khách hàng"}</span>
                                        </div>
                                        <button onClick={handleLogout} className="p-2 text-red-500 bg-red-50 rounded-lg">
                                            <LogOut size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 px-2">
                                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded-lg bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200">
                                            Đăng nhập
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center rounded-lg bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 shadow-sm shadow-green-200">
                                            Đăng ký ngay
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};