import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, Banknote, ShieldCheck, AlertCircle, ChevronRight } from "lucide-react";

export const CleanerHomePage = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(true);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setPendingOrders([]);
            return;
        }

        const fetchWaitingBookings = async () => {
            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
                const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");

                if (!token) throw new Error("Chưa đăng nhập");

                const response = await fetch(`${API_URL}/get-booking-waiting`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const ordersWithFakeLocation = (result.data || []).map(order => ({
                        ...order,
                        fakeTop: `${Math.floor(Math.random() * 70) + 15}%`,
                        fakeLeft: `${Math.floor(Math.random() * 70) + 15}%`,
                        fakeDistance: `${(Math.random() * 4 + 0.3).toFixed(1)} km`,
                        animationDelay: `${Math.random() * 2}s`
                    }));

                    ordersWithFakeLocation.sort((a, b) => parseFloat(a.fakeDistance) - parseFloat(b.fakeDistance));
                    setPendingOrders(ordersWithFakeLocation);
                }
            } catch (err) {
                console.error("Lỗi lấy đơn:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWaitingBookings();
        const intervalId = setInterval(fetchWaitingBookings, 10000);
        return () => clearInterval(intervalId);
    }, [isOnline]);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] bg-gray-50 overflow-hidden animate-fade-in">
            {/* CỘT TRÁI: RADAR */}
            <div className="relative flex-grow h-[45vh] lg:h-full overflow-hidden bg-slate-800">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-white/95 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] px-5 py-3 flex items-center gap-8 sm:gap-16 border border-green-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-400'}`}></div>
                            <span className="font-bold text-gray-800 text-sm tracking-wide">
                                {isOnline ? (isLoading ? 'Đang cập nhật radar...' : 'Radar đang hoạt động') : 'Đang nghỉ ngơi'}
                            </span>
                        </div>
                        <button onClick={() => setIsOnline(!isOnline)} className={`w-14 h-8 rounded-full relative transition-all duration-300 p-1 flex items-center ${isOnline ? 'bg-green-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' : 'bg-gray-300'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                {isOnline && (
                    <div className="absolute inset-0 z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                            <div className="absolute w-[800px] h-[800px] rounded-full border border-green-500/10" />
                            <div className="absolute w-[600px] h-[600px] rounded-full border border-green-500/20" />
                            <div className="absolute w-[400px] h-[400px] rounded-full border border-green-500/30" />
                            <div className="absolute w-[200px] h-[200px] rounded-full border border-green-500/40" />
                            <div className="absolute w-[800px] h-[800px] rounded-full overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-green-500 origin-left animate-spin" style={{ animationDuration: '4s', animationTimingFunction: 'linear' }} />
                                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(34,197,94,0.2)_90deg,transparent_90deg)] origin-top-left animate-spin" style={{ animationDuration: '4s', animationTimingFunction: 'linear' }} />
                            </div>
                            <div className="relative bg-green-500 p-3.5 rounded-full border-4 border-slate-800 shadow-[0_0_15px_rgba(34,197,94,0.6)] text-white z-10">
                                <Navigation size={20} fill="currentColor" className="transform rotate-45" />
                            </div>
                        </div>

                        {pendingOrders.map((order) => (
                            <div key={order._id} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 hover:z-50 group" style={{ top: order.fakeTop, left: order.fakeLeft }} onClick={() => navigate(`/cleaner/order-detail/${order._id}`)}>
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-green-400 rounded-full opacity-40 animate-ping" style={{ animationDelay: order.animationDelay, animationDuration: '2s' }} />
                                    <div className="relative bg-green-500 text-white p-2 rounded-lg border-[3px] border-slate-800 shadow-[0_0_10px_rgba(34,197,94,0.5)]"><Banknote size={16} /></div>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white text-gray-900 text-xs font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-gray-100">
                                    {order.Total_Amount?.toLocaleString()}đ
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white transform rotate-45 border-t border-l border-gray-100"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CỘT PHẢI: LIST */}
            <aside className="w-full lg:w-[450px] bg-[#f8f9fa] flex flex-col border-l border-gray-200 z-30 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)] relative">
                <div className="px-6 py-6 bg-white sticky top-0 border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2"><MapPin className="text-green-600" size={24} /> Quanh đây</h2>
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${isOnline ? 'text-green-700 bg-green-100' : 'text-gray-500 bg-gray-100'}`}>
                        {pendingOrders.length} Đơn mới
                    </span>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {!isOnline ? (
                        <div className="text-center mt-10 opacity-50 animate-fade-in">
                            <ShieldCheck size={56} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 font-bold text-lg">Hệ thống đang tạm nghỉ</p>
                        </div>
                    ) : pendingOrders.length === 0 ? (
                        <div className="text-center mt-10 animate-fade-in">
                            <AlertCircle size={56} className="mx-auto text-yellow-400 mb-4 opacity-50" />
                            <p className="text-gray-600 font-bold text-lg">Chưa quét được đơn hàng mới.</p>
                        </div>
                    ) : (
                        pendingOrders.map(order => (
                            <div key={order._id} onClick={() => navigate(`/cleaner/order-detail/${order._id}`)} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col gap-4 group animate-fade-in-up">
                                <div className="flex items-start gap-4">
                                    <div className="p-3.5 bg-green-50 text-green-600 rounded-[1rem] group-hover:bg-green-600 group-hover:text-white transition-colors flex-shrink-0"><MapPin size={22} /></div>
                                    <div className="flex flex-col mt-0.5">
                                        <span className="text-[15px] font-black text-gray-900 line-clamp-2 leading-snug">{order.Service_Address}</span>
                                        <span className="text-xs text-gray-500 mt-1.5 font-medium flex items-center gap-1">
                                            <Navigation size={12} className="text-green-500" />
                                            Cách bạn khoảng: <strong className="text-gray-800">{order.fakeDistance}</strong>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between pt-4 border-t border-gray-50 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Thu nhập</span>
                                        <span className="text-2xl font-black text-green-600 leading-none">{order.Total_Amount?.toLocaleString()}đ</span>
                                    </div>
                                    <button className="bg-slate-900 text-white px-5 py-3.5 rounded-[1rem] group-hover:bg-green-600 transition-all shadow-md flex items-center gap-2 text-sm font-black active:scale-95">
                                        Nhận ngay <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </div>
    );
};