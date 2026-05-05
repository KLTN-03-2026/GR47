import { useState, useEffect } from "react";
import {
    Users, Shield, Search, Lock, Unlock,
    AlertCircle, CheckCircle2, ShieldAlert,
    ChevronLeft, ChevronRight, Briefcase, RefreshCw, User
} from "lucide-react";

export const CLIENTSTATUS = {
    BANNED: 0,
    ACTIVE: 1,
    PENDING: 2,
};

export const CLEANERSTATUS = {
    INACTIVE: 0,
    ACTIVE: 1,
    BANNED: 2,
};

export const CLEANER_APPROVAL_STATUS = {
    PENDING: 0,
    ACTIVE: 1,
    REJECTED: 2
};

export const ManageUsers = () => {
    const [activeTab, setActiveTab] = useState("CLIENT");
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(null);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
            const endpoint = activeTab === "CLIENT" ? "/get-all-clients-full" : "/get-all-cleaners-full";
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 9,
                search: debouncedSearch
            }).toString();

            const response = await fetch(`${API_BASE}${endpoint}?${queryParams}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setUsers(result.data);
                setTotalPages(result.pagination.totalPages || 1);
            } else {
                showNotification("error", result.message || "Lỗi tải dữ liệu.");
            }
        } catch (error) {
            showNotification("error", "Lỗi kết nối máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, currentPage, debouncedSearch]);

    const handleToggleLock = async (userId, currentStatus) => {
        setIsActionLoading(userId);
        try {
            const token = localStorage.getItem("admin_token");
            const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;
            const endpoint = activeTab === "CLIENT" 
                ? `/lock-and-unlock-client/${userId}` 
                : `/lock-and-unlock-cleaner/${userId}`;

            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, Status: result.data.Status } : u));
                showNotification("success", result.message);
            } else {
                showNotification("error", result.message || "Thao tác thất bại.");
            }
        } catch (error) {
            showNotification("error", "Không thể kết nối đến máy chủ.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 3500);
    };

    const renderStatusBadge = (status, type) => {
        if (type === "CLIENT") {
            if (status === CLIENTSTATUS.ACTIVE) return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase">Đang hoạt động</span>;
            if (status === CLIENTSTATUS.BANNED) return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 uppercase">Đã khóa</span>;
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 uppercase">Chờ duyệt</span>;
        } else {
            if (status === CLEANERSTATUS.ACTIVE) return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase">Đang hoạt động</span>;
            if (status === CLEANERSTATUS.BANNED) return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 uppercase">Đã khóa</span>;
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 uppercase border border-slate-200">Ngừng HĐ</span>;
        }
    };

    const renderApprovalBadge = (approvalStatus) => {
        switch (approvalStatus) {
            case CLEANER_APPROVAL_STATUS.PENDING:
                return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-100 text-orange-700 uppercase tracking-tighter border border-orange-200">Chờ duyệt HS</span>;
            case CLEANER_APPROVAL_STATUS.ACTIVE:
                return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-700 uppercase tracking-tighter border border-blue-200">HS Đã duyệt</span>;
            case CLEANER_APPROVAL_STATUS.REJECTED:
                return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-600 uppercase tracking-tighter border border-slate-200">Từ chối HS</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Users size={28} className="text-blue-600" /> Quản lý Người dùng
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Giám sát tài khoản Khách hàng và Đối tác Cleaner.</p>
                </div>

                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc SĐT..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold transition-all shadow-inner"
                    />
                </div>
            </div>

            {notification.message && (
                <div className={`fixed top-24 right-6 z-[60] p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xl border animate-shake ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    {notification.type === "error" ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
                    {notification.message}
                </div>
            )}

            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => { setActiveTab("CLIENT"); setCurrentPage(1); }}
                    className={`px-8 py-4 font-black text-sm transition-all relative flex items-center gap-2 ${activeTab === "CLIENT" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                    <Users size={18} /> KHÁCH HÀNG
                    {activeTab === "CLIENT" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]"></div>}
                </button>
                <button
                    onClick={() => { setActiveTab("CLEANER"); setCurrentPage(1); }}
                    className={`px-8 py-4 font-black text-sm transition-all relative flex items-center gap-2 ${activeTab === "CLEANER" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                    <Briefcase size={18} /> ĐỐI TÁC (CLEANER)
                    {activeTab === "CLEANER" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]"></div>}
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100">
                    <RefreshCw size={40} className="text-blue-200 animate-spin mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <AlertCircle size={56} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-slate-500 font-black">Không tìm thấy người dùng nào.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {users.map(user => {
                            const isLocked = activeTab === "CLIENT" 
                                ? user.Status === CLIENTSTATUS.BANNED 
                                : user.Status === CLEANERSTATUS.BANNED;
                                
                            const roleColor = activeTab === "CLIENT" ? "blue" : "amber";
                            const avatarUrl = user.Avatar || user.Selfie_Image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Full_Name)}&background=${roleColor === "blue" ? "e0f2fe" : "fef3c7"}&color=${roleColor === "blue" ? "0284c7" : "b45309"}&bold=true`;

                            return (
                                <div key={user._id} className={`bg-white rounded-[2rem] border transition-all group overflow-hidden shadow-sm hover:shadow-md ${isLocked ? 'border-red-100 opacity-80' : 'border-slate-200'}`}>
                                    <div className="p-6 flex items-start gap-5 relative">
                                        <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                                            {renderStatusBadge(user.Status, activeTab)}
                                            {activeTab === "CLEANER" && user.Approval_Status !== undefined && renderApprovalBadge(user.Approval_Status)}
                                        </div>

                                        <div className="relative shrink-0">
                                            <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-slate-50 flex items-center justify-center text-slate-300">
                                                {user.Avatar || user.Selfie_Image ? (
                                                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <User size={32} strokeWidth={1.5} />
                                                )}
                                            </div>
                                            {!isLocked && user.Status === 1 && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>}
                                        </div>

                                        <div className="flex-1 min-w-0 pt-1 pr-32">
                                            <h3 className="font-black text-slate-900 text-lg leading-tight truncate" title={user.Full_Name}>
                                                {user.Full_Name}
                                            </h3>
                                            <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                                                <AlertCircle size={14} className="shrink-0" /> {user.Phone_Number}
                                            </p>
                                            <p className="text-[10px] text-slate-300 mt-3 font-black uppercase tracking-widest italic truncate">
                                                Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`p-4 border-t flex items-center justify-between transition-colors ${isLocked ? 'bg-red-50/30 border-red-50' : 'bg-slate-50/50 border-slate-50'}`}>
                                        <span className="text-[10px] font-black text-slate-400 tracking-tighter pl-2 uppercase">
                                            ID: {user._id.slice(-8)}
                                        </span>
                                        <button
                                            onClick={() => handleToggleLock(user._id, user.Status)}
                                            disabled={isActionLoading === user._id}
                                            className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-sm ${isLocked ? "bg-slate-900 text-white hover:bg-black" : "bg-white border border-slate-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"}`}
                                        >
                                            {isActionLoading === user._id ? (
                                                <RefreshCw size={14} className="animate-spin" />
                                            ) : isLocked ? (
                                                <><Unlock size={14} /> MỞ KHÓA</>
                                            ) : (
                                                <><Lock size={14} /> KHÓA TÀI KHOẢN</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12 bg-white w-fit mx-auto p-2 rounded-2xl border border-slate-100 shadow-sm">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center px-4 font-black text-sm text-slate-700">
                                Trang <span className="text-blue-600 mx-1.5">{currentPage}</span> / <span className="text-slate-300 ml-1.5">{totalPages}</span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};