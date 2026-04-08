import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, MessageCircle, UserX, Star, Phone,
    MapPin, Clock, CreditCard, ShieldCheck, AlertTriangle,
    Navigation, CheckCircle2, Circle, X, Send, PhoneCall
} from "lucide-react";

export const ClientOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // === DỮ LIỆU ĐƠN HÀNG GIẢ LẬP ===
    const [order] = useState({
        id: id || "BK001",
        status: "MOVING", // 'SEARCHING', 'MOVING', 'CLEANING', 'COMPLETED'
        bookingDate: "30/03/2026",
        bookingTime: "09:00",
        address: "123 Đường ABC, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        totalPrice: 450000,
        cleaner: {
            name: "Nguyễn Thị Hoa",
            phone: "0901234567",
            avatar: "https://i.pravatar.cc/150?u=hoa",
            rating: 4.9,
            jobs: 125
        }
    });

    const steps = [
        { id: 'SEARCHING', label: 'Tìm người', icon: <Circle size={20} /> },
        { id: 'MOVING', label: 'Di chuyển', icon: <Navigation size={20} /> },
        { id: 'CLEANING', label: 'Đang dọn', icon: <ShieldCheck size={20} /> },
        { id: 'COMPLETED', label: 'Hoàn thành', icon: <CheckCircle2 size={20} /> },
    ];

    // === TRẠNG THÁI VÀ LOGIC KHUNG CHAT ===
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const bottomRef = useRef(null);

    const [messages, setMessages] = useState([
        { id: 1, sender: "me", text: "Chào bạn, mình là Tuấn, khách hàng đặt dọn dẹp đơn BK-8899.", time: "10:15" },
        { id: 2, sender: "me", text: "Bạn đến nơi thì gọi số này hoặc nhắn mình xuống mở cửa sảnh nhé.", time: "10:15" },
        { id: 3, sender: "other", text: "Dạ vâng ạ. Tầm 15 phút nữa em sẽ có mặt ở sảnh ạ.", time: "10:20" },
    ]);

    // Tự động cuộn xuống khi mở chat hoặc có tin nhắn mới
    useEffect(() => {
        if (isChatOpen) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isChatOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Thêm tin nhắn của "Mình" (Client)
        const newMessage = {
            id: Date.now(),
            sender: "me",
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setInputText("");

        // Giả lập Cleaner (Đối tác) trả lời sau 1.5 giây
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: "other",
                text: "Dạ em nhận được thông tin rồi ạ.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="mx-auto max-w-7xl">

                {/* Header điều hướng */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/order-list")}
                            className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-green-600 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Đơn hàng #{order.id}</h1>
                            <p className="text-sm text-gray-500 font-medium">Đặt lúc: 08:30 - {order.bookingDate}</p>
                        </div>
                    </div>
                    <span className="hidden sm:block px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
                        {order.status === 'MOVING' ? 'Đang di chuyển' : 'Đang xử lý'}
                    </span>
                </div>

                {/* Layout 2 cột trải rộng */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* CỘT TRÁI (8/12): Tiến trình & Chi tiết dịch vụ */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Mục 1: Trạng thái đơn hàng (Dạng Stepper ngang) */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-400 uppercase mb-8 tracking-widest">Tiến độ công việc</h3>
                            <div className="flex items-center justify-between relative">
                                {/* Đường kẻ mờ phía sau */}
                                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0" />

                                {steps.map((step, index) => {
                                    const isActive = steps.findIndex(s => s.id === order.status) >= index;
                                    return (
                                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 
                                                ${isActive ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                                                {step.icon}
                                            </div>
                                            <span className={`text-xs font-bold ${isActive ? 'text-green-700' : 'text-gray-300'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Chi tiết thông tin dịch vụ */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase mb-6 flex items-center gap-2">
                                <Clock className="text-green-600" size={18} /> Chi tiết lịch hẹn
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><MapPin size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Địa điểm làm việc</p>
                                            <p className="text-gray-700 font-bold leading-relaxed">{order.address}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><Clock size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Thời gian bắt đầu</p>
                                            <p className="text-gray-700 font-bold">{order.bookingTime} ngày {order.bookingDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-50 rounded-2xl text-green-600"><CreditCard size={24} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Hình thức thanh toán</p>
                                        <p className="text-gray-700 font-bold">Thanh toán tiền mặt</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Tổng cộng</p>
                                    <p className="text-3xl font-black text-green-600">{order.totalPrice.toLocaleString()}đ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI (4/12): Thông tin Cleaner & Actions (Sticky) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-8 space-y-6">

                            {/* Mục 2: Thông tin Cleaner (View) */}
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-green-900/5">
                                <h3 className="text-xs font-black text-gray-400 uppercase mb-6 tracking-widest text-center">Người phụ trách</h3>

                                {order.cleaner ? (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-4">
                                            <img
                                                src={order.cleaner.avatar}
                                                alt={order.cleaner.name}
                                                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-green-50 shadow-md"
                                            />
                                            <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100 flex items-center gap-1 text-xs font-black text-green-600">
                                                <Star size={12} className="fill-green-600" /> {order.cleaner.rating}
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-black text-gray-900">{order.cleaner.name}</h4>
                                        <p className="text-sm font-bold text-gray-400 mt-1 flex items-center gap-2">
                                            <Phone size={14} /> {order.cleaner.phone}
                                        </p>

                                        <div className="w-full mt-6 grid grid-cols-2 gap-4 border-t border-gray-50 pt-6 text-sm font-bold">
                                            <div className="text-center">
                                                <p className="text-gray-400 text-[10px] uppercase">Số đơn</p>
                                                <p className="text-gray-900">{order.cleaner.jobs}+</p>
                                            </div>
                                            <div className="text-center border-l border-gray-50">
                                                <p className="text-gray-400 text-[10px] uppercase">Phản hồi</p>
                                                <p className="text-gray-900">Rất tốt</p>
                                            </div>
                                        </div>

                                        {/* NÚT MỞ KHUNG CHAT */}
                                        <button
                                            onClick={() => setIsChatOpen(true)}
                                            className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl font-black text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                                        >
                                            <MessageCircle size={22} /> Nhắn tin ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                            <UserX size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 italic">Hệ thống đang điều phối...</p>
                                    </div>
                                )}
                            </div>

                            {/* Mục 4: Nút Hủy đơn (Ẩn nếu đang làm) */}
                            {order.status !== "CLEANING" && order.status !== "COMPLETED" && (
                                <button
                                    className="w-full py-4 text-red-500 font-bold text-sm border-2 border-red-50 rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle size={18} /> Hủy yêu cầu dịch vụ
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* ========================================= */}
            {/* KHUNG CHAT MODAL (DÀNH CHO KHÁCH HÀNG) */}
            {/* ========================================= */}
            {isChatOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end p-0 sm:p-4 animate-fade-in">
                    <div className="bg-[#f4f7f6] w-full sm:w-[450px] h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

                        {/* Header Chat */}
                        <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-20 shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsChatOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                                    <X size={20} className="text-gray-700" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={order.cleaner.avatar}
                                            alt={order.cleaner.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div>
                                        <h1 className="text-sm font-black text-gray-900 leading-tight">{order.cleaner.name}</h1>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đối tác dọn dẹp</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition">
                                <PhoneCall size={18} />
                            </button>
                        </header>

                        {/* Vùng tin nhắn */}
                        <main className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="text-center pb-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-200/50 px-3 py-1 rounded-full">
                                    Hôm nay
                                </span>
                            </div>

                            {messages.map((msg) => {
                                const isMe = msg.sender === "me";
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                        <div className="flex flex-col max-w-[75%]">
                                            <div className={`p-3.5 text-sm shadow-sm ${isMe ? "bg-green-600 text-white rounded-2xl rounded-tr-sm" : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm"}`}>
                                                {msg.text}
                                            </div>
                                            <span className={`text-[10px] text-gray-400 mt-1 font-medium ${isMe ? "text-right" : "text-left"}`}>
                                                {msg.time} {isMe && "✓✓"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </main>

                        {/* Vùng nhập liệu */}
                        <div className="bg-white px-4 py-3 border-t border-gray-100 pb-safe shrink-0">
                            {order.status === "COMPLETED" ? (
                                <div className="text-center py-3 text-sm font-bold text-gray-400 bg-gray-50 rounded-2xl">
                                    Chat đã bị khóa do đơn hàng hoàn thành
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl relative">
                                        <textarea
                                            rows="1"
                                            placeholder="Nhập tin nhắn cho Đối tác..."
                                            className="w-full bg-transparent px-4 py-3.5 outline-none text-sm font-medium resize-none max-h-24"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim()}
                                        className={`p-3.5 rounded-full flex-shrink-0 transition-all ${inputText.trim()
                                                ? "bg-green-600 text-white shadow-lg shadow-green-900/20 hover:bg-green-700 active:scale-95"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <Send size={20} className="ml-1" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};