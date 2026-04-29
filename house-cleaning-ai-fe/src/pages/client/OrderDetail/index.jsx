import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    ChevronLeft, MessageCircle, UserX, Star, Phone,
    MapPin, Clock, CreditCard, ShieldCheck, AlertTriangle,
    Navigation, CheckCircle2, Circle, X, Send,
    Maximize2, Cpu, Zap, Calendar, Banknote
} from "lucide-react";

// ==========================================
// 1. TỪ ĐIỂN MAPPING 
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

    // Khởi tạo hiệu ứng AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: "ease-out-cubic",
        });
    }, []);

    // ==========================================
    // 2. GỌI API & CHUẨN HÓA DỮ LIỆU
    // ==========================================
    useEffect(() => {
        const fetchOrderDetail = async () => {
            setIsLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
                const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

                if (!token) throw new Error("Yêu cầu đăng nhập để xem chi tiết đơn hàng.");

                const response = await fetch(`${API_URL}/order-detail/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const data = result.data;

                    setOrder({
                        id: data._id,
                        shortId: data._id.slice(-6).toUpperCase(),
                        status: BOOKING_STATUS_MAP[data.Booking_Status] || 'Waiting',
                        paymentMethod: PAYMENT_STATUS_MAP[data.Payment_Status] || 'Không xác định',
                        bookingDate: new Date(data.Service_Date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
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
                            image: (data.AI_Details.Image_Url?.startsWith('http') || data.AI_Details.Image_Url?.startsWith('data:'))
                                ? data.AI_Details.Image_Url
                                : "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image"
                        } : null
                    });

                    // Refresh AOS sau khi load data xong
                    setTimeout(() => AOS.refresh(), 100);
                } else {
                    throw new Error(result.message || "Không thể tải dữ liệu đơn hàng.");
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
    // 3. UI HELPERS 
    // ==========================================
    const steps = [
        { id: 'Waiting', label: 'Tìm thợ', icon: <Circle size={20} /> },
        { id: 'Accepted', label: 'Đã nhận', icon: <Navigation size={20} /> },
        { id: 'InProgress', label: 'Đang dọn', icon: <ShieldCheck size={20} /> },
        { id: 'Completed', label: 'Hoàn thành', icon: <CheckCircle2 size={20} /> },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Waiting': return { text: 'Chờ nhận đơn', color: 'bg-orange-50 border-orange-200 text-orange-700' };
            case 'Accepted': return { text: 'Thợ đang đến', color: 'bg-blue-50 border-blue-200 text-blue-700' };
            case 'InProgress': return { text: 'Đang dọn dẹp', color: 'bg-green-50 border-green-200 text-green-700' };
            case 'Completed': return { text: 'Hoàn thành', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
            case 'Cancelled': return { text: 'Đã hủy', color: 'bg-red-50 border-red-200 text-red-700' };
            default: return { text: 'Không xác định', color: 'bg-gray-50 border-gray-200 text-gray-700' };
        }
    };

    // ==========================================
    // 4. LOGIC CHAT
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

    // ==========================================
    // RENDER UI
    // ==========================================
    if (isLoading) return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center animate-fade-in">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Đang tải dữ liệu...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 text-center animate-fade-in-up">
            <div data-aos="zoom-in" className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-red-100">
                <AlertTriangle size={40} />
            </div>
            <h2 data-aos="fade-up" className="text-2xl font-black text-slate-900 mb-2">Không thể tải đơn hàng</h2>
            <p data-aos="fade-up" data-aos-delay="100" className="font-medium text-slate-500 mb-8 max-w-md">{error}</p>
            <button data-aos="fade-up" data-aos-delay="200" onClick={() => navigate("/order-list")} className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg">
                Quay lại danh sách
            </button>
        </div>
    );

    if (!order) return null;

    const currentStatus = getStatusStyle(order.status);

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
            <div className="mx-auto max-w-6xl">

                {/* HEADER */}
                <div data-aos="fade-down" className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/order-list")} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 hover:text-green-600 hover:bg-green-50 transition-all active:scale-95">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                ĐƠN HÀNG #{order.shortId}
                            </h1>
                            <p className="text-sm text-slate-500 font-medium mt-1">Chi tiết đơn dọn dẹp của bạn</p>
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${currentStatus.color} shadow-sm`}>
                        {currentStatus.text}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* CỘT TRÁI: Tiến trình & Chi tiết */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* DATA PIPELINE (Stepper) */}
                        {order.status !== 'Cancelled' && (
                            <div data-aos="fade-right" className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm overflow-x-auto relative">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase mb-8 tracking-widest flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-500 animate-pulse" /> Trạng thái đơn hàng
                                </h3>
                                <div className="flex items-center justify-between relative min-w-[400px] px-4">
                                    {/* Mạch điện ngầm */}
                                    <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-slate-100 -translate-y-1/2 rounded-full" />

                                    {steps.map((step, index) => {
                                        const stepOrder = ['Waiting', 'Accepted', 'InProgress', 'Completed'];
                                        const isActive = stepOrder.indexOf(order.status) >= index;
                                        const isCurrent = stepOrder.indexOf(order.status) === index;

                                        return (
                                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 
                                                    ${isActive ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-110' : 'bg-white border-2 border-slate-200 text-slate-300'}
                                                    ${isCurrent && 'ring-4 ring-green-100 animate-pulse'}
                                                `}>
                                                    {step.icon}
                                                </div>
                                                <span className={`text-[11px] font-black uppercase tracking-wider transition-colors duration-500 ${isActive ? 'text-green-700' : 'text-slate-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* INFO MODULE */}
                        <div data-aos="fade-up" data-aos-delay="100" className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden group">
                            {/* Decor Line */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-green-400 transition-colors duration-500"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-green-100 transition-colors duration-300">
                                    <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                        <Calendar size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ngày dọn</span>
                                    </div>
                                    <p className="font-bold text-slate-800 text-base">{order.bookingDate}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-green-100 transition-colors duration-300">
                                    <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                        <Clock size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Giờ dọn</span>
                                    </div>
                                    <p className="font-bold text-slate-800 text-base">{order.bookingTime}</p>
                                </div>
                            </div>

                            <div className="pl-4">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                                    <MapPin size={14} /> Địa chỉ dọn dẹp
                                </h3>
                                <p className="text-slate-800 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-snug">
                                    {order.address}
                                </p>
                            </div>

                            {order.aiDetails && (
                                <div className="pt-6 border-t border-slate-100 pl-4">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                        <Maximize2 className="text-blue-500" size={14} /> Ảnh AI quét phòng
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="relative">
                                            <img
                                                src={order.aiDetails.image}
                                                alt="Room Scan"
                                                className="w-full sm:w-40 h-28 object-cover rounded-xl shadow-sm border border-slate-200"
                                                onError={(e) => e.target.src = "https://placehold.co/400x300?text=Error+Loading+Image"}
                                            />
                                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-md tracking-widest uppercase animate-pulse">
                                                Scanned
                                            </div>
                                        </div>
                                        <div className="space-y-3 flex flex-col justify-center">
                                            <div className="flex justify-between gap-8 border-b border-slate-200/50 pb-2">
                                                <span className="text-xs font-bold text-slate-400">Diện tích đo đạc:</span>
                                                <strong className="text-slate-900">{order.aiDetails.area} m²</strong>
                                            </div>
                                            <div className="flex justify-between gap-8">
                                                <span className="text-xs font-bold text-slate-400">Độ bừa bộn:</span>
                                                <strong className="text-orange-600">{MESS_LEVEL_MAP[order.aiDetails.messLevel] || 'Bình thường'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100 pl-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><CreditCard size={14} /> Phương thức thanh toán</p>
                                    <p className="text-slate-800 font-bold">{order.paymentMethod}</p>
                                </div>
                                <div className="sm:text-right bg-green-50 px-5 py-3 rounded-2xl border border-green-100">
                                    <p className="text-[10px] font-black text-green-600/60 uppercase tracking-widest mb-1">Tổng tiền</p>
                                    <p className="text-2xl font-black text-green-600">{order.totalPrice.toLocaleString()}đ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: Nhân viên & Chat */}
                    <div className="lg:col-span-4 space-y-6">
                        <div data-aos="fade-left" data-aos-delay="200" className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            {/* Decor Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-0"></div>

                            <h3 className="text-[11px] font-black text-slate-400 uppercase mb-8 tracking-widest relative z-10 flex items-center gap-2">
                                <ShieldCheck size={14} /> Thông tin người dọn
                            </h3>

                            {order.cleaner ? (
                                <div className="flex flex-col items-center text-center relative z-10">
                                    <div className="relative">
                                        <img src={order.cleaner.avatar} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-50 mb-4 shadow-md animate-float" />
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900">{order.cleaner.name}</h4>
                                    <p className="text-sm font-bold text-slate-500 mt-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 flex items-center gap-2">
                                        <Phone size={14} className="text-slate-400" /> {order.cleaner.phone}
                                    </p>

                                    <button
                                        onClick={() => setIsChatOpen(true)}
                                        className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle size={20} /> Nhắn tin cho thợ
                                    </button>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-slate-400 font-bold relative z-10">
                                    <UserX size={48} className="mx-auto mb-4 opacity-30 text-slate-300 animate-pulse" />
                                    Hệ thống đang tìm thợ dọn dẹp...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CHAT */}
            {isChatOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end p-4 sm:p-6 animate-fade-in">
                    <div className="bg-white w-full sm:w-[400px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-right border border-slate-200">
                        <header className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={order.cleaner?.avatar} className="w-10 h-10 rounded-xl object-cover" alt="Avatar" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-900 text-sm">{order.cleaner?.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang trực tuyến</span>
                                </div>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </header>

                        <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                            <div className="text-center pb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Tin nhắn được bảo mật</span>
                            </div>
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                    <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm 
                                        ${msg.sender === 'me' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </main>

                        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                            <input
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-sm font-medium transition-all"
                                placeholder="Nhập tin nhắn..."
                            />
                            <button disabled={!inputText.trim()} className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm">
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};