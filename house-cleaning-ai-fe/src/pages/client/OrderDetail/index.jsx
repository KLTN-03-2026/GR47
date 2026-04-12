import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, MessageCircle, UserX, Star, Phone,
    MapPin, Clock, CreditCard, ShieldCheck, AlertTriangle,
    Navigation, CheckCircle2, Circle, X, Send, PhoneCall,
    Maximize2
} from "lucide-react";

// ==========================================
// 1. TỪ ĐIỂN MAPPING (Khớp 100% với Backend & DB)
// ==========================================
const BOOKING_STATUS_MAP = {
    "1": 'Waiting',
    "2": 'Accepted',
    "3": 'InProgress',
    "4": 'Completed',
    "5": 'Cancelled'
};

const PAYMENT_STATUS_MAP = {
    "1": 'Thanh toán Tiền mặt',
    "2": 'CleanAI iPay'
};

const MESS_LEVEL_MAP = {
    1: 'Thấp',
    2: 'Trung Bình',
    3: 'Cao'
};

export const ClientOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ==========================================
    // 2. GỌI API & CHUẨN HÓA DỮ LIỆU
    // ==========================================
    useEffect(() => {
        const fetchOrderDetail = async () => {
            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
                const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

                if (!token) throw new Error("Vui lòng đăng nhập để xem đơn hàng.");

                // Gọi đúng route đã fix ở Backend
                const response = await fetch(`${API_URL}/order-detail/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const data = result.data;

                    setOrder({
                        id: data._id,
                        // Mapping trạng thái từ số sang chữ
                        status: BOOKING_STATUS_MAP[data.Booking_Status] || 'Waiting',
                        paymentMethod: PAYMENT_STATUS_MAP[data.Payment_Status] || 'Không xác định',
                        bookingDate: new Date(data.Service_Date).toLocaleDateString('vi-VN'),
                        bookingTime: new Date(data.Service_Date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                        address: data.Service_Address,
                        totalPrice: data.Total_Amount,
                        notes: data.Notes,

                        cleaner: data.Cleaner_Id ? {
                            name: data.Cleaner_Id.Name || data.Cleaner_Id.Full_Name,
                            phone: data.Cleaner_Id.Phone || data.Cleaner_Id.Phone_Number,
                            avatar: data.Cleaner_Id.Avatar || "https://placehold.co/150",
                            rating: 4.9,
                            jobs: 125
                        } : null,

                        aiDetails: data.AI_Details ? {
                            area: data.AI_Details.Area_m2,
                            messLevel: data.AI_Details.Mess_Level,
                            // 🔥 FIX QUAN TRỌNG: Chấp nhận cả link HTTP và DATA:BASE64
                            image: (data.AI_Details.Image_Url?.startsWith('http') || data.AI_Details.Image_Url?.startsWith('data:'))
                                ? data.AI_Details.Image_Url
                                : "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image"
                        } : null
                    });
                } else {
                    throw new Error(result.message || "Không thể tải chi tiết đơn hàng.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetail();
    }, [id]);

    // ==========================================
    // 3. UI HELPERS (Màu sắc & Icon)
    // ==========================================
    const steps = [
        { id: 'Waiting', label: 'Tìm người', icon: <Circle size={20} /> },
        { id: 'Accepted', label: 'Đã nhận', icon: <Navigation size={20} /> },
        { id: 'InProgress', label: 'Đang dọn', icon: <ShieldCheck size={20} /> },
        { id: 'Completed', label: 'Hoàn thành', icon: <CheckCircle2 size={20} /> },
    ];

    const getStatusUI = (status) => {
        switch (status) {
            case 'Waiting': return { text: 'Đang chờ thợ nhận', color: 'bg-yellow-100 text-yellow-700' };
            case 'Accepted': return { text: 'Thợ đang di chuyển', color: 'bg-blue-100 text-blue-700' };
            case 'InProgress': return { text: 'Đang tiến hành', color: 'bg-green-100 text-green-700' };
            case 'Completed': return { text: 'Đã hoàn thành', color: 'bg-gray-100 text-gray-700' };
            case 'Cancelled': return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
            default: return { text: 'Không xác định', color: 'bg-gray-100 text-gray-500' };
        }
    };

    // ==========================================
    // 4. LOGIC CHAT (Simulated)
    // ==========================================
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const bottomRef = useRef(null);
    const [messages, setMessages] = useState([
        { id: 1, sender: "me", text: `Chào bạn, mình cần hỗ trợ về đơn này.`, time: "10:15" }
    ]);

    useEffect(() => {
        if (isChatOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        const newMessage = { id: Date.now(), sender: "me", text: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages([...messages, newMessage]);
        setInputText("");
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-green-600">Đang tải dữ liệu...</div>;
    if (error) return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="text-red-500" size={48} />
        <p className="font-bold">{error}</p>
        <button onClick={() => navigate("/order-list")} className="px-4 py-2 bg-black text-white rounded-lg">Quay lại</button>
    </div>;
    if (!order) return null;

    const currentStatus = getStatusUI(order.status);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/order-list")} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:text-green-600 transition-all">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 uppercase">ĐƠN HÀNG #{order.id.slice(-8)}</h1>
                            <p className="text-sm text-gray-500 font-medium">Lịch: {order.bookingTime} - {order.bookingDate}</p>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${currentStatus.color}`}>
                        {currentStatus.text}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* Cột Trái: Tiến trình & Chi tiết */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Stepper */}
                        {order.status !== 'Cancelled' && (
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-x-auto">
                                <h3 className="text-sm font-black text-gray-400 uppercase mb-8 tracking-widest">Tiến độ</h3>
                                <div className="flex items-center justify-between relative min-w-[400px]">
                                    <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0" />
                                    {steps.map((step, index) => {
                                        const stepOrder = ['Waiting', 'Accepted', 'InProgress', 'Completed'];
                                        const isActive = stepOrder.indexOf(order.status) >= index;
                                        return (
                                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-green-600 text-white shadow-lg' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                                                    {step.icon}
                                                </div>
                                                <span className={`text-xs font-bold ${isActive ? 'text-green-700' : 'text-gray-300'}`}>{step.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Info */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase mb-6 flex items-center gap-2">
                                    <MapPin className="text-green-600" size={18} /> Địa chỉ dọn dẹp
                                </h3>
                                <p className="text-gray-700 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">{order.address}</p>
                            </div>

                            {order.aiDetails && (
                                <div className="pt-6 border-t border-gray-50">
                                    <h3 className="text-sm font-black text-gray-900 uppercase mb-4 flex items-center gap-2">
                                        <Maximize2 className="text-blue-500" size={18} /> Kết quả AI quét phòng
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <img
                                            src={order.aiDetails.image}
                                            alt="Room"
                                            className="w-full sm:w-48 h-32 object-cover rounded-2xl shadow-md border border-gray-200"
                                            onError={(e) => e.target.src = "https://placehold.co/400x300?text=Error+Loading+Image"}
                                        />
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-500">Diện tích: <strong className="text-gray-900 text-lg">{order.aiDetails.area} m²</strong></p>
                                            <p className="text-sm text-gray-500">Độ bừa bộn: <strong className="text-gray-900">{MESS_LEVEL_MAP[order.aiDetails.messLevel] || 'Bình thường'}</strong></p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="text-green-600" size={24} />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Thanh toán</p>
                                        <p className="text-gray-700 font-bold">{order.paymentMethod}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Tổng tiền</p>
                                    <p className="text-3xl font-black text-green-600">{order.totalPrice.toLocaleString()}đ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột Phải: Nhân viên & Chat */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-green-900/5">
                            <h3 className="text-xs font-black text-gray-400 uppercase mb-6 tracking-widest text-center">Người phụ trách</h3>
                            {order.cleaner ? (
                                <div className="flex flex-col items-center text-center">
                                    <img src={order.cleaner.avatar} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover ring-4 ring-green-50 mb-4" />
                                    <h4 className="text-xl font-black text-gray-900">{order.cleaner.name}</h4>
                                    <p className="text-sm font-bold text-gray-400 mt-1"><Phone size={14} className="inline mr-1" /> {order.cleaner.phone}</p>
                                    <button onClick={() => setIsChatOpen(true)} className="w-full mt-8 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                        <MessageCircle size={20} /> Nhắn tin
                                    </button>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-gray-400 italic font-bold">
                                    <UserX size={48} className="mx-auto mb-4 opacity-20" />
                                    Hệ thống đang điều phối nhân viên...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Chat */}
            {isChatOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end p-4">
                    <div className="bg-white w-full sm:w-[400px] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                        <header className="px-6 py-4 border-b flex justify-between items-center bg-green-600 text-white">
                            <div className="flex items-center gap-3">
                                <img src={order.cleaner?.avatar} className="w-10 h-10 rounded-full" alt="Avatar" />
                                <span className="font-bold">{order.cleaner?.name}</span>
                            </div>
                            <button onClick={() => setIsChatOpen(false)}><X /></button>
                        </header>
                        <main className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-2xl max-w-[80%] ${msg.sender === 'me' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </main>
                        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                            <input value={inputText} onChange={e => setInputText(e.target.value)} className="flex-1 bg-gray-100 rounded-xl px-4 outline-none" placeholder="Nhập tin nhắn..." />
                            <button className="p-3 bg-green-600 text-white rounded-xl"><Send size={20} /></button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};