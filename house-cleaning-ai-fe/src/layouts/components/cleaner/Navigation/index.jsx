import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, Navigation2, MapPin, CheckCircle2, PhoneCall } from "lucide-react";
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api';

export const CleanerNavigation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const orderData = location.state?.passedOrderData;
    const [arrived, setArrived] = useState(false);

    // THÊM STATE NÀY ĐỂ FIX LỖI
    const [mapRef, setMapRef] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
    });

    const customerPos = {
        lat: orderData?.location?.coordinates[1] || 10.7599,
        lng: orderData?.location?.coordinates[0] || 106.6698
    };
    const cleanerPos = { lat: 10.7725, lng: 106.6992 };

    // SỬA LẠI HÀM ONLOAD ĐỂ LƯU REF
    const handleOnLoad = (map) => {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(customerPos);
        bounds.extend(cleanerPos);
        map.fitBounds(bounds);
        setMapRef(map); // Đánh dấu là map đã load xong
    };

    if (!isLoaded) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

    return (
        <div className="relative h-screen w-full bg-gray-100 overflow-hidden font-sans">

            <div className="absolute inset-0 z-0">
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={cleanerPos}
                    zoom={15}
                    onLoad={handleOnLoad} // Gọi hàm handleOnLoad mới
                    options={{
                        disableDefaultUI: true,
                    }}
                >
                    {/* CHỈ VẼ KHI MAP ĐÃ THỰC SỰ LOAD XONG (mapRef !== null) */}
                    {mapRef && (
                        <>
                            <MarkerF position={customerPos} />
                            <MarkerF
                                position={cleanerPos}
                                icon={{
                                    url: "https://cdn-icons-png.flaticon.com/512/854/854866.png",
                                    scaledSize: { width: 35, height: 35 }
                                }}
                            />
                            <PolylineF
                                path={[cleanerPos, customerPos]}
                                options={{ strokeColor: "#2563eb", strokeOpacity: 0.8, strokeWeight: 5 }}
                            />
                        </>
                    )}
                </GoogleMap>
            </div>

            {/* CÁC PHẦN UI KHÁC GIỮ NGUYÊN... */}
            <div className="absolute top-0 left-0 w-full p-4 z-10">
                <div className="max-w-md mx-auto flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {!arrived && mapRef && (
                        <div className="flex-grow bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-xl flex items-center gap-4 animate-fade-in">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <Navigation2 size={20} className="transform -rotate-45" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Tiếp theo</p>
                                <p className="text-sm font-black text-gray-800">800m • Rẽ trái Lê Hồng Phong</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-4 z-10">
                <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 border border-gray-50 transition-all">
                    {arrived ? (
                        <div className="text-center animate-fade-in">
                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1 rounded-full text-[10px] font-black uppercase mb-3">
                                <CheckCircle2 size={12} /> Bạn đã đến điểm hẹn
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mb-6">Bắt đầu công việc?</h2>
                            <button
                                onClick={() => navigate(`/cleaner/order-progress/${id}`, { state: { passedOrderData: orderData } })}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all"
                            >
                                XÁC NHẬN BẮT ĐẦU
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-3xl font-black text-gray-900">12</span>
                                    <span className="text-sm font-bold text-gray-400 ml-1">phút nữa</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-300 uppercase">Khoảng cách</p>
                                    <p className="text-sm font-black text-blue-600">2.5 km</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 py-3 border-t border-gray-50">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 flex-shrink-0">
                                    <MapPin size={16} />
                                </div>
                                <p className="text-xs font-bold text-gray-600 line-clamp-1">{orderData?.address || orderData?.Service_Address || "215 Lê Hồng Phong, Quận 5"}</p>
                            </div>
                            <button
                                onClick={() => setArrived(true)}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                ĐÃ ĐẾN NƠI
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};