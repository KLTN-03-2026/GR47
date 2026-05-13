import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, ShieldCheck, AlertCircle, ChevronRight, Crosshair } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- TẠO ICON TÙY CHỈNH BẰNG HTML/SVG (Né lỗi mất icon mặc định của Leaflet) ---
const cleanerIcon = new L.divIcon({
    className: 'custom-icon',
    html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="#22c55e" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="#ffffff"></circle></svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const orderIcon = new L.divIcon({
    className: 'custom-icon',
    html: `<svg width="36" height="36" viewBox="0 0 24 24" fill="#f97316" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

// Component con để map tự động focus về vị trí của Cleaner
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { animate: true });
        }
    }, [center, map]);
    return null;
};

export const CleanerHomePage = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(true);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState({ lat: 10.7769, lng: 106.7009 }); // Mặc định TP.HCM

    // Công thức Toán học tính khoảng cách (Tự làm, không tốn tiền API)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
        return (R * 2 * Math.asin(Math.sqrt(a))).toFixed(1);
    };

    // Dịch địa chỉ bằng API MIỄN PHÍ của OpenStreetMap
    const geocodeAddressOSM = async (address) => {
        try {
            const query = encodeURIComponent(`${address}, Hồ Chí Minh, Việt Nam`);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
        } catch (error) {
            console.error("Lỗi dịch địa chỉ:", error);
        }
        // Rớt mạng hoặc không tìm ra thì quăng random mồi quanh vị trí Cleaner
        return {
            lat: currentLocation.lat + (Math.random() - 0.5) * 0.05,
            lng: currentLocation.lng + (Math.random() - 0.5) * 0.05
        };
    };

    // Lấy vị trí thật của máy tính/điện thoại
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
                () => console.log("Lỗi hoặc bị từ chối lấy vị trí GPS")
            );
        }
    }, []);

    // Fetch đơn hàng và gắn tọa độ
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

                if (!token) throw new Error("Chưa có token");

                const response = await fetch(`${API_URL}/get-booking-waiting`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const rawOrders = result.data || [];

                    const ordersWithCoords = await Promise.all(
                        rawOrders.map(async (order) => {
                            const coords = await geocodeAddressOSM(order.Service_Address);
                            const distance = coords ? calculateDistance(currentLocation.lat, currentLocation.lng, coords.lat, coords.lng) : "0.0";
                            return { ...order, location: coords, distance: `${distance} km` };
                        })
                    );

                    ordersWithCoords.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
                    setPendingOrders(ordersWithCoords);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWaitingBookings();
        // Cứ 30s quét lại một lần để tránh spam API free
        const intervalId = setInterval(fetchWaitingBookings, 30000);
        return () => clearInterval(intervalId);
    }, [isOnline, currentLocation]);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] bg-gray-50 overflow-hidden animate-fade-in">
            {/* CỘT TRÁI: BẢN ĐỒ MIỄN PHÍ */}
            <div className="relative flex-grow h-[45vh] lg:h-full overflow-hidden bg-slate-200 z-10">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[400]">
                    <div className="bg-white/95 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] px-5 py-3 flex items-center gap-8 sm:gap-16 border border-green-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-400'}`}></div>
                            <span className="font-bold text-gray-800 text-sm tracking-wide">
                                {isOnline ? (isLoading ? 'Đang cập nhật Radar...' : 'Đang tìm đơn quanh đây') : 'Đang nghỉ ngơi'}
                            </span>
                        </div>
                        <button onClick={() => setIsOnline(!isOnline)} className={`w-14 h-8 rounded-full relative transition-all duration-300 p-1 flex items-center ${isOnline ? 'bg-green-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' : 'bg-gray-300'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => {
                        // Kích hoạt lại center bằng cách nhích nhẹ GPS một xíu (trick force render)
                        setCurrentLocation(prev => ({ ...prev, lat: prev.lat + 0.0000001 }));
                    }}
                    className="absolute bottom-6 right-6 z-[400] bg-white p-3 rounded-full shadow-lg text-slate-700 hover:text-green-600 hover:bg-green-50 transition-colors"
                >
                    <Crosshair size={24} />
                </button>

                {isOnline ? (
                    <MapContainer center={currentLocation} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                        {/* MAP TILE CỦA OPEN STREET MAP - 100% FREE */}
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        <MapController center={currentLocation} />

                        {/* Vị trí của Cleaner */}
                        <Marker position={currentLocation} icon={cleanerIcon}>
                            <Popup>Vị trí của bạn</Popup>
                        </Marker>

                        {/* Vị trí các Đơn hàng */}
                        {pendingOrders.map((order) => (
                            order.location && (
                                <Marker key={order._id} position={order.location} icon={orderIcon}>
                                    <Popup className="custom-popup">
                                        <div className="p-1 cursor-pointer w-40" onClick={() => navigate(`/cleaner/order-detail/${order._id}`)}>
                                            <p className="font-black text-sm text-slate-900 mb-1">{order.Estimated_Income?.toLocaleString()}đ</p>
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{order.Service_Address}</p>
                                            <p className="text-xs font-bold text-green-600 mt-2">Nhấn xem chi tiết →</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100"></div>
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
                            <p className="text-gray-600 font-bold text-lg">Chưa có đơn hàng mới.</p>
                        </div>
                    ) : (
                        pendingOrders.map(order => (
                            <div key={order._id} onClick={() => navigate(`/cleaner/order-detail/${order._id}`)} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col gap-4 group animate-fade-in-up">
                                <div className="flex items-start gap-4">
                                    <div className="p-3.5 bg-orange-50 text-orange-500 rounded-[1rem] group-hover:bg-orange-500 group-hover:text-white transition-colors flex-shrink-0"><MapPin size={22} /></div>
                                    <div className="flex flex-col mt-0.5">
                                        <span className="text-[15px] font-black text-gray-900 line-clamp-2 leading-snug">{order.Service_Address}</span>
                                        <span className="text-xs text-gray-500 mt-1.5 font-medium flex items-center gap-1">
                                            <Navigation size={12} className="text-green-500" />
                                            Cách bạn khoảng: <strong className="text-gray-800">{order.distance}</strong>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between pt-4 border-t border-gray-50 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Thu nhập</span>
                                        <span className="text-2xl font-black text-green-600 leading-none">{order.Estimated_Income?.toLocaleString()}đ</span>
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