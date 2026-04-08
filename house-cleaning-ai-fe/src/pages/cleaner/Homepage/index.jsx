import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, Banknote, ShieldCheck } from "lucide-react";

export const CleanerHomePage = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(true); // Mặc định bật để giống trong hình

    // Dữ liệu mock y hệt trong ảnh
    const pendingOrders = [
        { id: "BK-8899", address: "215 Lê Hồng Phong, Q.5", distance: "2.5 km", income: "350,000đ", top: "35%", left: "55%" },
        { id: "BK-9911", address: "12 Võ Văn Kiệt, Q.1", distance: "0.8 km", income: "280,000đ", top: "55%", left: "75%" },
        { id: "BK-7722", address: "Số 1 Công Xã Paris, Q.1", distance: "1.2 km", income: "450,000đ", top: "70%", left: "30%" },
    ];

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] bg-gray-50 overflow-hidden">

            {/* CỘT TRÁI: BẢN ĐỒ (MOCK) */}
            <div className="relative flex-grow h-[40vh] lg:h-full bg-[#eaeaea]">

                {/* Nút Toggle "Đang quét việc..." */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-white rounded-full shadow-lg px-5 py-3 flex items-center gap-16 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-bold text-gray-800 text-sm">Đang quét việc...</span>
                        </div>
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`w-14 h-8 rounded-full relative transition-colors p-1 flex items-center ${isOnline ? 'bg-green-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Radar & Markers (Chỉ hiện khi Online) */}
                {isOnline && (
                    <div className="absolute inset-0 z-10">
                        {/* Center Radar */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                            <div className="absolute w-64 h-64 bg-green-500/10 rounded-full animate-ping opacity-50" />
                            <div className="absolute w-40 h-40 bg-green-500/20 rounded-full" />
                            <div className="relative bg-green-500 p-3 rounded-full border-[3px] border-white shadow-md text-white">
                                <Navigation size={20} fill="currentColor" className="transform rotate-45" />
                            </div>
                        </div>

                        {/* Job Markers */}
                        {pendingOrders.map((order) => (
                            <div
                                key={order.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                style={{ top: order.top, left: order.left }}
                            >
                                <div className="bg-green-500 text-white p-1.5 rounded-md border-2 border-white shadow-sm">
                                    <Banknote size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CỘT PHẢI: DANH SÁCH ĐƠN HÀNG */}
            <aside className="w-full lg:w-[450px] bg-[#f8f9fa] flex flex-col border-l border-gray-200 z-20 shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.05)]">

                {/* Header của Sidebar */}
                <div className="px-6 py-5 flex justify-between items-center bg-white sticky top-0 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900 uppercase">Việc làm quanh đây</h2>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                        {pendingOrders.length} Đơn mới
                    </span>
                </div>

                {/* Danh sách thẻ (Cards) */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {pendingOrders.map(order => (
                        <div
                            key={order.id}
                            onClick={() => navigate(`/cleaner/order-detail/${order.id}`)}
                            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer flex flex-col gap-4 group"
                        >
                            {/* Nửa trên: Địa chỉ & Khoảng cách */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-50 rounded-full text-gray-400">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex flex-col mt-0.5">
                                    <span className="text-sm font-bold text-gray-900">{order.address}</span>
                                    <span className="text-xs text-gray-400 mt-1">Cách bạn: {order.distance}</span>
                                </div>
                            </div>

                            {/* Nửa dưới: Thu nhập & Nút nhận đơn */}
                            <div className="flex items-end justify-between pt-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Thu nhập</span>
                                    <span className="text-2xl font-black text-green-600">{order.income}</span>
                                </div>
                                {/* Nút vuông bo góc màu đen như trong hình */}
                                <button className="bg-[#1a1c23] text-white p-3.5 rounded-xl group-hover:bg-green-600 transition-colors shadow-sm">
                                    <ShieldCheck size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </aside>
        </div>
    );
};