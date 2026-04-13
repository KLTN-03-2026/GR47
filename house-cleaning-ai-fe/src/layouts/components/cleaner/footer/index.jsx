import { NavLink } from "react-router-dom";
import { Radar, Briefcase, BarChart3, UserCircle } from "lucide-react";

export const CleanerFooter = () => {
    const navLinkClass = ({ isActive }) =>
        `flex flex-col items-center gap-1 transition-all ${isActive ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`;

    return (
        <footer className="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-100 px-6 py-3">
            <div className="max-w-md mx-auto flex justify-between items-center">
                <NavLink to="/cleaner" end className={navLinkClass}>
                    <Radar size={22} />
                    <span className="text-[10px] font-bold uppercase">Tìm việc</span>
                </NavLink>
                <NavLink to="/cleaner/task-list" className={navLinkClass}>
                    <Briefcase size={22} />
                    <span className="text-[10px] font-bold uppercase">Đơn hàng</span>
                </NavLink>
                <NavLink to="/cleaner/earnings" className={navLinkClass}>
                    <BarChart3 size={22} />
                    <span className="text-[10px] font-bold uppercase">Thu nhập</span>
                </NavLink>
                <NavLink to="/cleaner/profile" className={navLinkClass}>
                    <UserCircle size={22} />
                    <span className="text-[10px] font-bold uppercase">Tôi</span>
                </NavLink>
            </div>
        </footer>
    );
};