import { useState, useEffect } from "react";
import {
    Users, Shield, Search, Lock, Unlock,
    AlertCircle, CheckCircle2, ShieldAlert,
    ChevronLeft, ChevronRight, Briefcase
} from "lucide-react";

export const ManageUsers = () => {
    // === 1. QUẢN LÝ TRẠNG THÁI (STATE) ===
    const [activeTab, setActiveTab] = useState("CLIENT"); // "CLIENT" hoặc "CLEANER"
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ type: "", message: "" });

    // Tìm kiếm & Phân trang
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // === 2. DEBOUNCE SEARCH (Tránh spam API) ===
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // === 3. LOGIC GỌI API THẬT ===
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const API_BASE = import.meta.env.VITE_API_BASE_ADMIN_URL;

            // Chọn đúng endpoint dựa trên Tab hiện tại
            const endpoint = activeTab === "CLIENT"
                ? "/get-all-clients-full"
                : "/get-all-cleaners-full";

            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 9, // 9 items/page cho Grid 3x3 đẹp nhất
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
            console.error("Lỗi Fetch:", error);
            showNotification("error", "Lỗi kết nối máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    // Gọi lại API khi đổi Tab, đổi Trang, hoặc Search xong
    useEffect(() => {
        fetchData();
    }, [activeTab, currentPage, debouncedSearch]);

    // === 4. XỬ LÝ KHÓA/MỞ TÀI KHOẢN (MOCKUP LOGIC) ===
    const handleToggleLock = (userId, currentStatus) => {
        // Sau này bạn chỉ cần gọi thêm 1 API UpdateStatus tại đây
        const newStatus = currentStatus === 1 ? 0 : 1;
        setUsers(users.map(u => u._id === userId ? { ...u, Status: newStatus } : u));
        showNotification("success", `Đã cập nhật trạng thái người dùng thành công.`);
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">

            {/* Header & Thanh công cụ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Users size={24} className="text-blue-600" /> Quản lý Người dùng
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Giám sát Khách hàng và Đối tác Cleaner trên toàn hệ thống.</p>
                </div>

                <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm tên hoặc SĐT..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Toast Notification */}
            {notification.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-md border animate-shake fixed top-24 right-6 z-50
                    ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    {notification.type === "error" ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
                    {notification.message}
                </div>
            )}

            {/* Tab điều hướng */}
            <div className="flex gap-2 border-b border-slate-200 pb-px">
                <button
                    onClick={() => { setActiveTab("CLIENT"); setCurrentPage(1); }}
                    className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all relative flex items-center gap-2 ${activeTab === "CLIENT" ? "bg-white text-blue-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-100"}`}
                >
                    <Users size={16} /> Khách hàng
                    {activeTab === "CLIENT" && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-white"></div>}
                </button>
                <button
                    onClick={() => { setActiveTab("CLEANER"); setCurrentPage(1); }}
                    className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all relative flex items-center gap-2 ${activeTab === "CLEANER" ? "bg-white text-blue-600 border-t border-l border-r border-slate-200" : "text-slate-500 hover:bg-slate-100"}`}
                >
                    <Briefcase size={16} /> Đối tác (Cleaner)
                    {activeTab === "CLEANER" && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-white"></div>}
                </button>
            </div>

            {/* Danh sách người dùng */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-bold animate-pulse text-sm">Đang tải danh sách {activeTab === "CLIENT" ? "khách hàng" : "đối tác"}...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold">Không tìm thấy kết quả nào phù hợp.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {users.map(user => {
                            const isStatusActive = user.Status === 1;
                            const roleColor = activeTab === "CLIENT" ? "blue" : "amber";
                            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Full_Name)}&background=${roleColor === "blue" ? "e0f2fe" : "fef3c7"}&color=${roleColor === "blue" ? "0284c7" : "b45309"}&bold=true`;

                            return (
                                <div key={user._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden">
                                    <div className="p-5 flex items-start gap-4 relative">

                                        {/* Status & Approval Badge */}
                                        <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${isStatusActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {isStatusActive ? 'Đang HĐ' : 'Bị Khóa'}
                                            </span>
                                            {activeTab === "CLEANER" && (
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-slate-200">
                                                    {user.Approval_Status || "ĐÃ DUYỆT"}
                                                </span>
                                            )}
                                        </div>

                                        <img src={avatar} alt={user.Full_Name} className="w-14 h-14 rounded-full border-2 border-slate-50 shadow-sm transition-transform group-hover:scale-110" />

                                        <div className="flex-1 pt-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 leading-tight truncate pr-14" title={user.Full_Name}>
                                                {user.Full_Name}
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium mt-0.5">{user.Phone_Number}</p>
                                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase italic">
                                                Gia nhập: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="bg-slate-50/50 p-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 tracking-widest pl-2">
                                            ID: #{user._id.substring(user._id.length - 8).toUpperCase()}
                                        </span>

                                        <button
                                            onClick={() => handleToggleLock(user._id, user.Status)}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all
                                            ${isStatusActive
                                                    ? "bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                    : "bg-slate-800 text-white hover:bg-slate-900 shadow-md"}`}
                                        >
                                            {isStatusActive ? <><Lock size={12} /> Khóa</> : <><Unlock size={12} /> Mở khóa</>}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Điều khiển phân trang */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-black text-slate-700 bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm min-w-[100px] text-center">
                                {currentPage} <span className="text-slate-300 mx-2">/</span> {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
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