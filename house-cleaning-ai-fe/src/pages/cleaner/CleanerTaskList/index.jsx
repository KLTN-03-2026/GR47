import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList, MapPin, Clock, Calendar,
    AlertCircle, PhoneCall, User, Play
} from "lucide-react";

export const CleanerTaskList = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const renderStatus = (status) => {
        if (status === "2") return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Đang di chuyển</span>;
        if (status === "3") return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">Đang dọn dẹp</span>;
        return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Chưa rõ</span>;
    };

    // Hàm xử lý chuyển trang và nhét sẵn Data vào hành lý
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
        return <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] py-8 px-4 font-sans animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <ClipboardList size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Việc đang làm</h1>
                        <p className="text-sm text-gray-500 font-medium">Bạn có <strong className="text-green-600">{tasks.length}</strong> công việc đang tiến hành</p>
                    </div>
                </div>

                <div className="space-y-5">
                    {error ? (
                        <div className="bg-red-50 p-6 rounded-3xl text-center border border-red-100">
                            <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
                            <p className="text-red-600 font-bold">{error}</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="bg-white p-10 rounded-3xl text-center border-2 border-dashed border-gray-200 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <ClipboardList size={32} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-2">Hiện chưa có việc nào</h3>
                            <p className="text-gray-500 text-sm">Ra bảng tin radar để chộp ngay một đơn mới nhé!</p>
                            <button
                                onClick={() => navigate('/cleaner/home')}
                                className="mt-6 px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all"
                            >
                                Quét Radar Tìm Việc
                            </button>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <div
                                key={task._id}
                                onClick={() => handleGoToProgress(task)}
                                className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-300 hover:-translate-y-1 transition-all group relative overflow-hidden cursor-pointer"
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${task.Booking_Status === "3" ? "bg-blue-500" : "bg-yellow-400"}`}></div>

                                <div className="flex justify-between items-start mb-4 pl-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {renderStatus(task.Booking_Status)}
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{task._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <h3 className="font-black text-lg text-gray-900 flex items-center gap-1.5">
                                            <User size={16} className="text-gray-400" /> {task.Client_Name}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-green-600">{task.Total_Amount?.toLocaleString()}đ</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-4 ml-2">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                                        <p className="text-sm font-bold text-gray-700 leading-snug">{task.Service_Address}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(task.Service_Date).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                            <Clock size={14} className="text-gray-400" />
                                            {new Date(task.Service_Date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 ml-2">
                                    <a
                                        href={`tel:${task.Client_Phone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors shrink-0 z-10 relative"
                                    >
                                        <PhoneCall size={20} />
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleGoToProgress(task);
                                        }}
                                        className="flex-1 bg-gray-900 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-md z-10 relative"
                                    >
                                        TIẾP TỤC CÔNG VIỆC <Play size={16} fill="currentColor" />
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