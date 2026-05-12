import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, User, Star, ShieldCheck, LogOut, Loader2, CheckCheck, Inbox } from "lucide-react";
import { useCleanerRefresh } from "../../../../context/CleanerContext.jsx";

export const CleanerHeader = () => {
    const navigate = useNavigate();
    const { cleanerRefreshTrigger } = useCleanerRefresh();

    const [cleanerInfo, setCleanerInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

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
    }, [cleanerRefreshTrigger]);

    const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
            const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");
            const response = await fetch(`${API_URL}/notifications?limit=30`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setNotifications(result.data.notifications || []);
                setUnreadCount(result.data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Lỗi tải thông báo cleaner:", error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");
        if (token) fetchNotifications();
    }, []);

    const handleToggleNotifications = () => {
        const nextOpen = !isNotificationOpen;
        setIsNotificationOpen(nextOpen);
        if (nextOpen) fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
            const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");
            const response = await fetch(`${API_URL}/notifications/read-all`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setNotifications((prev) => prev.map((item) => ({ ...item, Is_Read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Lỗi cập nhật thông báo cleaner:", error);
        }
    };

    const getNotificationBookingId = (notification) => {
        const bookingId = notification?.Related_Booking_Id;
        if (!bookingId) return null;
        return typeof bookingId === "object" ? bookingId._id : bookingId;
    };

    const getNotificationPath = (notification) => {
        if (notification?.Type === "WALLET") return "/cleaner/earning";

        const bookingId = getNotificationBookingId(notification);
        if (bookingId && ["BOOKING", "COMPLAINT"].includes(notification?.Type)) {
            return `/cleaner/order-progress/${bookingId}`;
        }

        return null;
    };

    const handleNotificationClick = async (notification) => {
        const targetPath = getNotificationPath(notification);

        if (!notification.Is_Read) {
            setNotifications((prev) =>
                prev.map((item) =>
                    item._id === notification._id ? { ...item, Is_Read: true } : item
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
                const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");
                await fetch(`${API_URL}/notifications/${notification._id}/read`, {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Lá»—i Ä‘Ã¡nh dáº¥u Ä‘á»c thÃ´ng bÃ¡o cleaner:", error);
                fetchNotifications();
            }
        }

        setIsNotificationOpen(false);
        if (targetPath) navigate(targetPath);
    };

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
                    <div className="relative">
                        <button
                            type="button"
                            onClick={handleToggleNotifications}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors relative"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 top-12 w-[340px] max-w-[calc(100vw-24px)] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-[80] animate-fade-in-up">
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                                    <div>
                                        <p className="font-black text-gray-900 text-sm">Thông báo</p>
                                        <p className="text-[11px] font-bold text-gray-400">{unreadCount} chưa đọc</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleMarkAllRead}
                                        disabled={!unreadCount}
                                        className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                        title="Đánh dấu tất cả đã đọc"
                                    >
                                        <CheckCheck size={18} />
                                    </button>
                                </div>

                                <div className="max-h-[420px] overflow-y-auto">
                                    {isLoadingNotifications ? (
                                        <div className="py-12 flex flex-col items-center text-gray-400">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                            <p className="text-xs font-bold">Đang tải...</p>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="py-12 flex flex-col items-center text-gray-400">
                                            <Inbox className="w-10 h-10 mb-2 text-gray-300" />
                                            <p className="text-xs font-bold">Chưa có thông báo.</p>
                                        </div>
                                    ) : (
                                        notifications.map((item) => {
                                            const targetPath = getNotificationPath(item);

                                            return (
                                                <button
                                                    key={item._id}
                                                    type="button"
                                                    onClick={() => handleNotificationClick(item)}
                                                    className={`w-full text-left px-4 py-3 flex gap-3 border-b border-gray-50 last:border-b-0 transition-all duration-200 ${item.Is_Read ? "bg-white" : "bg-green-50/50"} ${targetPath ? "cursor-pointer hover:bg-green-50 hover:shadow-sm hover:-translate-y-0.5" : "cursor-default hover:bg-gray-50"}`}
                                                >
                                                    <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center shrink-0">
                                                        <Bell size={17} />
                                                    </div>
                                                    <div className="min-w-0 flex-grow">
                                                        <div className="flex gap-2 justify-between">
                                                            <p className="text-sm font-black text-gray-900 truncate">{item.Title}</p>
                                                            {!item.Is_Read && <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></span>}
                                                        </div>
                                                        <p className="text-xs font-medium text-gray-600 mt-1 leading-relaxed">{item.Message}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

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
