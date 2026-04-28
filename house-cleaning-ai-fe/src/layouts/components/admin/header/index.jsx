import React, { useEffect, useState } from "react";
import { Search, Bell, Menu } from "lucide-react";

export const AdminHeader = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem("admin_token");
            const baseUrl = import.meta.env.VITE_API_BASE_ADMIN_URL;
            const response = await fetch(`${baseUrl}/check-auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) setAdmin(result.data);
        } catch (error) {
            console.error("Lỗi kết nối Admin API:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdminData(); }, []);

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "A";

    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0 shrink-0">
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

            <div className="flex items-center gap-5">
                <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                    <Bell size={22} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1" />
                <div className="flex items-center gap-3 cursor-pointer group">
                    {loading ? (
                        <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-lg" />
                    ) : (
                        <>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                                    {admin?.Full_Name || "Admin"}
                                </p>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">
                                    {admin?.Role || "Quản trị viên"}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-lg overflow-hidden transition-transform group-hover:scale-105">
                                {admin?.Avatar ? (
                                    <img src={admin.Avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{getInitial(admin?.Full_Name)}</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};