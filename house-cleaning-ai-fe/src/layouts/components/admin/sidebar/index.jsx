import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    Server, LayoutDashboard, Users, Briefcase,
    ClipboardList, BarChart3, Settings, LogOut
} from "lucide-react";

export const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);

    const menuItems = [
        { name: "Tổng quan", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Người dùng", path: "/admin/users", icon: Users },
        { name: "Đối tác (Cleaner)", path: "/admin/cleaners", icon: Briefcase },
        { name: "Đơn hàng", path: "/admin/orders", icon: ClipboardList },
        { name: "Báo cáo doanh thu", path: "/admin/reports", icon: BarChart3 },
        { name: "Cài đặt hệ thống", path: "/admin/settings", icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        navigate("/admin/login", { replace: true });
    };

    return (
        <aside className="w-16 bg-transparent flex flex-col h-full z-20 shrink-0 relative">

            {/* Logo icon */}
            <div className="h-20 flex items-center justify-center border-b border-slate-200">
                <Link
                    to="/admin/dashboard"
                    className="p-2 rounded-lg text-[#0f172a] hover:bg-slate-100 transition-colors"
                >
                    <Server size={22} strokeWidth={2} />
                </Link>
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-6 px-2 space-y-1 flex flex-col items-center">
                {menuItems.map((item) => {
                    const isActive = location.pathname.includes(item.path);
                    const Icon = item.icon;
                    const isHovered = hoveredItem === item.name;

                    return (
                        <div
                            key={item.name}
                            className="relative w-full flex justify-center"
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <Link
                                to={item.path}
                                className={`p-3 rounded-xl transition-all flex items-center justify-center
                                    ${isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "text-[#0f172a] hover:bg-slate-100"
                                    }`}
                            >
                                <Icon size={20} />
                            </Link>

                            {/* Flyout label — đè lên Outlet */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -28 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -28 }}
                                        transition={{
                                            duration: 0.18,
                                            ease: "easeOut"
                                        }}
                                        className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
                                    >
                                        <div className="relative bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                                            {item.name}

                                            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-blue-600" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Logout */}
            <div
                className="p-2 border-t border-slate-200 flex justify-center relative"
                onMouseEnter={() => setHoveredItem("logout")}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <button
                    onClick={handleLogout}
                    className="p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut size={20} />
                </button>

                {/* Flyout logout */}
                {hoveredItem === "logout" && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
                        <div className="bg-[#0f172a] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                            Đăng xuất CMS
                            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0f172a]" />
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};