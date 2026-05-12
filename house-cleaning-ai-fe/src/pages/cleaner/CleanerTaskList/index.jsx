import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList, MapPin, Clock, Calendar,
    AlertCircle, PhoneCall, User, Play, Navigation, CheckCircle2, PackageOpen,
    ChevronRight, ArrowLeft
} from "lucide-react";

export const CleanerTaskList = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState("ALL");
    const [isTabAnimating, setIsTabAnimating] = useState(false);

    useEffect(() => {
        const fetchInProgressTasks = async () => {
            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
                const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");

                if (!token) throw new Error("Chưa đăng nhập");

                const response = await fetch(`${API_URL}/get-booking-in-progress`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setTasks(result.data || []);
                } else {
                    throw new Error(result.message || "Lỗi khi tải danh sách công việc.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInProgressTasks();
    }, []);

    const renderStatusBadge = (status) => {
        if (status === "2") {
            return (
                <div className="badge-yellow">
                    <Navigation size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Đang di chuyển</span>
                </div>
            );
        }
        if (status === "3") {
            return (
                <div className="badge-blue">
                    <Play size={14} className="animate-pulse" fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Đang thi công</span>
                </div>
            );
        }
        if (status === "4") {
            return (
                <div className="badge-emerald">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Hoàn thành</span>
                </div>
            );
        }
        return (
            <div className="badge-status-gray">
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">Chưa rõ</span>
            </div>
        );
    };

    const getCardLineColor = (status) => {
        if (status === "2") return "bg-yellow-400";
        if (status === "3") return "bg-blue-500";
        if (status === "4") return "bg-emerald-500";
        return "bg-gray-300";
    };

    const handleTabChange = (tabId) => {
        setIsTabAnimating(true);
        setTimeout(() => {
            setActiveTab(tabId);
            setIsTabAnimating(false);
        }, 200);
    };

    const filteredTasks = activeTab === "ALL"
        ? tasks
        : tasks.filter(task => String(task.Booking_Status) === activeTab);

    const tabs = [
        { id: "ALL", label: "Tất cả" },
        { id: "2", label: "Đang di chuyển" },
        { id: "3", label: "Đang dọn dẹp" },
        { id: "4", label: "Đã hoàn thành" }
    ];

    const handleGoToProgress = (task) => {
        navigate(`/cleaner/order-progress/${task._id}`, {
            state: {
                passedOrderData: {
                    id: task._id,
                    customer: task.Client_Name || "Khách hàng",
                    phone: task.Client_Phone || "Chưa có SĐT",
                    address: task.Service_Address,
                    time: new Date(task.Service_Date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
                    income: task.Total_Amount
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="bg-[#f4f7f6] flex flex-col items-center justify-center py-24 animate-fade-in">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Đang quét Radar...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#f4f7f6] py-10 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
            <div className="max-w-7xl mx-auto">

                {/* Nút quay lại trang chủ */}
                <button
                    onClick={() => navigate('/cleaner')}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
                >
                    <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-gray-300 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    Quay lại trang chủ
                </button>

                {/* Header & Bộ lọc dồn lên cùng 1 hàng trên màn lớn cho đỡ tốn chỗ */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg animate-float">
                            <ClipboardList size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Hồ sơ công việc</h1>
                            <p className="text-gray-500 font-medium mt-1">Bạn đang theo dõi <strong className="text-green-600">{tasks.length}</strong> nhiệm vụ</p>
                        </div>
                    </div>

                    {/* Phễu Lọc (Filter Tabs) */}
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 w-max overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`px-5 py-2.5 rounded-[14px] text-xs font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2
                                    ${activeTab === tab.id
                                        ? "bg-gray-900 text-white shadow-md transform scale-[1.02]"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                            >
                                {tab.label}
                                {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Danh sách nhiệm vụ - Chuyển sang dạng GRID đa cột */}
                <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-300 ${isTabAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    {error ? (
                        <div className="col-span-full bg-red-50 p-6 rounded-3xl text-center border border-red-100 animate-shake">
                            <AlertCircle className="mx-auto text-red-400 mb-3" size={32} />
                            <p className="text-red-600 font-bold">{error}</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="col-span-full bg-white p-16 rounded-[2rem] text-center border border-gray-200 shadow-sm animate-fade-in-up max-w-2xl mx-auto w-full">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 border border-gray-100 shadow-inner">
                                <PackageOpen size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Trống trơn!</h3>
                            <p className="text-gray-500 font-medium mb-8">
                                Bạn không có nhiệm vụ nào trong mục <strong className="text-gray-700">"{tabs.find(t => t.id === activeTab)?.label}"</strong>.
                            </p>
                            {activeTab === "ALL" && (
                                <button
                                    onClick={() => navigate('/cleaner/home')}
                                    className="btn-primary-green"
                                >
                                    Quét Radar Tìm Việc Mới
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredTasks.map((task, index) => (
                            <div
                                key={task._id}
                                onClick={() => handleGoToProgress(task)}
                                className="card-interactive animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${getCardLineColor(String(task.Booking_Status))} transition-all duration-300 group-hover:w-2`}></div>

                                <div className="flex justify-between items-start mb-6 pl-2">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2.5">
                                            {renderStatusBadge(String(task.Booking_Status))}
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">#{task._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
                                            <User size={18} className="text-gray-400" /> {task.Client_Name}
                                        </h3>
                                    </div>
                                    <div className="text-right shrink-0 bg-green-50 px-4 py-2.5 rounded-2xl border border-green-100">
                                        <p className="text-[10px] font-black text-green-600/70 uppercase tracking-widest mb-1">Thu nhập</p>
                                        <p className="text-xl font-black text-green-600 leading-none">{task.Total_Amount?.toLocaleString()}đ</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-5 space-y-4 mb-6 ml-2 border border-gray-100 group-hover:bg-white group-hover:border-green-100 transition-colors flex-grow">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0 group-hover:text-green-500 transition-colors" />
                                        <p className="text-sm font-bold text-gray-700 leading-relaxed">{task.Service_Address}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 border-t border-gray-200/50 pt-4 mt-2">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                            <Calendar size={16} className="text-gray-400" />
                                            {new Date(task.Service_Date).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                            <Clock size={16} className="text-gray-400" />
                                            {new Date(task.Service_Date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 ml-2 mt-auto">
                                    <a
                                        href={`tel:${task.Client_Phone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors shrink-0 z-10 relative border border-blue-100"
                                    >
                                        <PhoneCall size={20} />
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleGoToProgress(task);
                                        }}
                                        className={`flex-1 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md z-10 relative
                                            ${task.Booking_Status === "4" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-gray-900 hover:bg-black shadow-gray-300"}`}
                                    >
                                        {task.Booking_Status === "4" ? "XEM CHI TIẾT" : "TIẾP TỤC CÔNG VIỆC"}
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};