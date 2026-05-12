import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    Server, LayoutDashboard, Users, Briefcase,
    ClipboardList, BarChart3, Settings, LogOut, MessageSquareWarning
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
        { name: "Khiếu nại & Đánh giá", path: "/admin/disputes", icon: MessageSquareWarning },
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
                    className="p-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors"
                >
                    <Server size={28} strokeWidth={2.5} />
                </Link>
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-6 px-2 space-y-3 flex flex-col items-center">
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
                                className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center border-2
                                    ${isActive
                                        ? "border-green-600 text-green-600 bg-green-50/50 shadow-sm"
                                        : "border-transparent text-slate-400 hover:border-green-300 hover:text-green-600 hover:bg-green-50"
                                    }`}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </Link>

                            {/* Flyout label — Thiết kế Outline thay cho Fill */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none"
                                    >
                                        <div className="relative bg-white border-2 border-green-500 text-green-700 text-sm font-black px-4 py-2.5 rounded-xl whitespace-nowrap shadow-xl">
                                            {item.name}

                                            {/* Trick tạo mũi tên rỗng (Outline Arrow) chĩa về bên trái */}
                                            <span className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l-2 border-b-2 border-green-500 rotate-45 rounded-sm" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};