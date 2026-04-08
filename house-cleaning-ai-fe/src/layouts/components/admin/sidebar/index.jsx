import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Server, LayoutDashboard, Users, Briefcase,
    ClipboardList, BarChart3, Settings, LogOut
} from "lucide-react";

export const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Danh sách các menu quản trị
    const menuItems = [
        { name: "Tổng quan", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Người dùng", path: "/admin/users", icon: Users },
        { name: "Đối tác (Cleaner)", path: "/admin/cleaners", icon: Briefcase },
        { name: "Đơn hàng", path: "/admin/orders", icon: ClipboardList },
        { name: "Báo cáo doanh thu", path: "/admin/reports", icon: BarChart3 },
        { name: "Cài đặt hệ thống", path: "/admin/settings", icon: Settings },
    ];

    // ĐÃ SỬA: Đăng xuất thẳng và xóa sạch Token
    const handleLogout = () => {
        // Xóa Token và User Data của Admin khỏi LocalStorage
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");

        // Chuyển hướng thẳng về trang đăng nhập CMS
        navigate("/admin/login", { replace: true });
    };

    return (
        <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-full shadow-2xl z-20 shrink-0 relative">
            {/* Background glow mờ */}
            <div className="absolute top-0 left-0 w-full h-32 bg-blue-600/10 blur-[50px] pointer-events-none"></div>

            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800 relative z-10">
                <Link to="/admin/dashboard" className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded-lg text-blue-400 border border-slate-700">
                        <Server size={22} strokeWidth={2} />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight">CleanAI <span className="text-blue-500">CMS</span></span>
                </Link>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Menu quản trị</p>

                {menuItems.map((item) => {
                    const isActive = location.pathname.includes(item.path);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all
                ${isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "hover:bg-slate-800 hover:text-white"}`}
                        >
                            <Icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* Nút Đăng xuất */}
            <div className="p-4 border-t border-slate-800 z-10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut size={20} />
                    Đăng xuất CMS
                </button>
            </div>
        </aside>
    );
};