import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft, Navigation2, MapPin,
    AlertTriangle, Crosshair, Map as MapIcon, CheckCircle2
} from "lucide-react";

export const CleanerNavigation = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [gpsError, setGpsError] = useState(false);
    const [arrived, setArrived] = useState(false);

    // Giả lập dữ liệu điểm đến
    const destination = {
        address: "215 Lê Hồng Phong, Phường 4, Quận 5",
        distance: "2.5 km",
        time: "12 phút",
        eta: "10:15 AM"
    };

    // Hoạt động: Mở Google Maps App thực tế (Deep link)
    const openRealGoogleMaps = () => {
        // Đây là cách thực tế app thường làm: mở app Google Maps trên điện thoại
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.address)}`, '_blank');
    };

    // Nút giả lập Lỗi GPS để bạn test trường hợp "Thất bại"
    const toggleGpsError = () => {
        setGpsError(!gpsError);
    };

    return (
        <div className="relative h-screen w-full bg-[#e5e3df] overflow-hidden font-sans flex flex-col">

            {/* LỚP 1: BẢN ĐỒ GIẢ LẬP (MOCK MAP) */}
            <div
                className={`absolute inset-0 transition-opacity duration-500 ${gpsError ? 'opacity-30 grayscale' : 'opacity-100'}`}
                style={{
                    backgroundImage: `url('https://snazzy-maps-cdn.azureedge.net/assets/74-ultra-light-with-labels.png?v=20170626083326')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {!gpsError && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                        {/* Vẽ đường đi giả lập (Route) */}
                        <path
                            d="M 150 600 L 150 450 L 250 400 L 250 250 L 350 150"
                            fill="none"
                            stroke="#3b82f6" // Màu xanh dương chuẩn điều hướng
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-md animate-dash"
                            strokeDasharray="20, 10"
                        />
                        {/* Điểm xuất phát (Cleaner) */}
                        <circle cx="150" cy="600" r="10" fill="white" stroke="#3b82f6" strokeWidth="6" className="shadow-xl" />
                    </svg>
                )}

                {/* Marker Điểm đến (Customer) */}
                {!gpsError && (
                    <div className="absolute top-[120px] left-[325px] transform -translate-x-1/2 -translate-y-full drop-shadow-xl animate-bounce">
                        <div className="bg-red-500 text-white p-2 rounded-full border-2 border-white">
                            <MapPin size={24} fill="currentColor" className="text-white" />
                        </div>
                        <div className="w-2 h-2 bg-red-600 rounded-full mx-auto mt-1 opacity-50 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                    </div>
                )}
            </div>

            {/* LỚP 2: GIAO DIỆN NỔI (OVERLAYS) */}

            {/* 2.1. Header & Nút Quay lại */}
            <div className="relative z-10 pt-safe p-4 flex justify-between items-start">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                >
                    <ChevronLeft size={28} />
                </button>

                {/* Nút giả lập Lỗi GPS (Dành cho Dev Test) */}
                <button
                    onClick={toggleGpsError}
                    className={`px-4 py-2 rounded-full font-bold text-xs shadow-lg transition-all border-2
            ${gpsError ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-400 border-gray-200'}`}
                >
                    {gpsError ? 'Tắt Lỗi GPS' : 'Test Lỗi GPS'}
                </button>
            </div>

            {/* 2.2. Bảng chỉ đường phía trên (Turn-by-turn) */}
            {!gpsError && !arrived && (
                <div className="relative z-10 px-4 mt-2 animate-fade-in-down">
                    <div className="bg-[#1a1c23] text-white rounded-3xl p-5 shadow-2xl flex items-center gap-5 border border-gray-800">
                        <div className="text-blue-400">
                            <Navigation2 size={40} strokeWidth={2.5} className="transform -rotate-45" />
                        </div>
                        <div>
                            <div className="text-3xl font-black mb-1">500 <span className="text-lg">m</span></div>
                            <p className="text-gray-300 font-medium text-sm leading-snug">
                                Rẽ trái vào <span className="text-white font-bold">Lê Hồng Phong</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer đẩy phần dưới xuống đáy */}
            <div className="flex-grow"></div>

            {/* 2.3. Modal Lỗi GPS (Hoạt động: Thất bại) */}
            {gpsError && (
                <div className="relative z-20 m-4 p-6 bg-red-50 border-2 border-red-500 rounded-3xl shadow-2xl animate-shake">
                    <div className="flex items-center gap-3 text-red-600 mb-2">
                        <AlertTriangle size={28} />
                        <h3 className="text-xl font-black">Mất tín hiệu GPS</h3>
                    </div>
                    <p className="text-red-700 font-medium text-sm mb-6 leading-relaxed">
                        Hệ thống không thể xác định vị trí hiện tại của bạn. Vui lòng di chuyển ra khu vực thoáng hoặc kiểm tra lại kết nối mạng.
                    </p>
                    <button
                        onClick={() => setGpsError(false)}
                        className="w-full py-4 bg-red-600 text-white rounded-xl font-black flex justify-center items-center gap-2 active:scale-95 transition-transform"
                    >
                        <Crosshair size={20} /> Thử kết nối lại
                    </button>
                </div>
            )}

            {/* 2.4. Bottom Sheet (Thông tin chuyến đi) */}
            <div className={`relative z-10 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-500 pb-safe
        ${gpsError ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>

                {/* Thanh trượt trang trí */}
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2"></div>

                <div className="p-6">
                    {arrived ? (
                        // Trạng thái đã đến nơi
                        <div className="text-center py-4 animate-fade-in-up">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Bạn đã đến nơi!</h2>
                            <p className="text-gray-500 font-medium mb-6">Hãy liên hệ khách hàng để bắt đầu dọn dẹp nhé.</p>
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all"
                            >
                                Quay lại chi tiết đơn
                            </button>
                        </div>
                    ) : (
                        // Trạng thái đang di chuyển
                        <>
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <div className="text-3xl font-black text-green-600 flex items-baseline gap-1">
                                        {destination.time} <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">({destination.distance})</span>
                                    </div>
                                    <p className="text-gray-500 font-medium mt-1">Dự kiến đến lúc <span className="font-bold text-gray-800">{destination.eta}</span></p>
                                </div>

                                <button onClick={openRealGoogleMaps} className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors">
                                    <MapIcon size={20} />
                                </button>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl mb-6">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Điểm đến</p>
                                <p className="font-bold text-gray-900 truncate">{destination.address}</p>
                            </div>

                            <button
                                onClick={() => setArrived(true)}
                                className="w-full py-4 bg-[#1a1c23] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-gray-900/20"
                            >
                                Đã đến nơi <CheckCircle2 size={20} />
                            </button>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};