import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    ChevronLeft, MapPin, Navigation, Play,
    CheckCircle2, PhoneCall, MessageSquare, Clock,
    X, Send, AlertCircle
} from "lucide-react";

export const CleanerOrderProgress = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. HỨNG DATA TỪ TRANG TRƯỚC TRUYỀN SANG (Linh hoạt cho cả Waiting và Task List)
    const rawPassedData = location.state?.passedOrderData;

    const mappedPassedData = rawPassedData ? {
        id: rawPassedData.id,
        customer: rawPassedData.details?.customer || rawPassedData.customer || "Khách hàng",
        phone: rawPassedData.details?.phone || rawPassedData.phone || "Chưa cập nhật",
        address: rawPassedData.details?.address || rawPassedData.address || "",
        time: rawPassedData.details?.startTime || rawPassedData.time || "",
        income: rawPassedData.details?.income || rawPassedData.income || 0,
    } : null;

    // ==========================================
    // 2. STATES QUẢN LÝ DỮ LIỆU & TRẠNG THÁI
    // ==========================================
    const [orderData, setOrderData] = useState(mappedPassedData);
    const [isLoading, setIsLoading] = useState(!mappedPassedData);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const [workStatus, setWorkStatus] = useState("MOVING");

    // === TRẠNG THÁI KHUNG CHAT ===
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const bottomRef = useRef(null);

    const [messages, setMessages] = useState([
        { id: 1, sender: "other", text: `Chào bạn, mình là khách đặt đơn ${id.slice(-6).toUpperCase()}.`, time: "10:15" },
        { id: 2, sender: "other", text: "Đến nơi thì gọi số này hoặc nhắn tin nhé.", time: "10:15" },
    ]);

    useEffect(() => {
        if (isChatOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage = {
            id: Date.now(), sender: "me", text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
        setInputText("");

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1, sender: "other", text: "Ok bạn nhé!",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    // ==========================================
    // 3. LOGIC LẤY DỮ LIỆU (CHỈ CHẠY NẾU F5 TRANG)
    // ==========================================
    useEffect(() => {
        if (mappedPassedData) return;

        const fetchOrderFallback = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
                const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");

                const response = await fetch(`${API_URL}/get-booking-detail/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const data = result.data;
                    setOrderData({
                        id: data._id,
                        customer: data.Client_Name || data.Client_Info?.Full_Name || "Khách hàng",
                        phone: data.Client_Phone || data.Client_Info?.Phone_Number || "Chưa cập nhật",
                        address: data.Service_Address,
                        time: new Date(data.Service_Date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
                        income: data.Total_Amount,
                    });

                    const dbStatus = String(data.Booking_Status);
                    if (dbStatus === "2") setWorkStatus("MOVING");
                    else if (dbStatus === "3") setWorkStatus("IN_PROGRESS");
                    else if (dbStatus === "4") setWorkStatus("COMPLETED");
                } else {
                    throw new Error("Lỗi tải đơn hàng cứu hộ. Có thể đơn không tồn tại.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchOrderFallback();
    }, [id, mappedPassedData]);

    // ==========================================
    // 4. API CẬP NHẬT TRẠNG THÁI 
    // ==========================================
    const updateOrderStatus = async (newStatusValue, targetUIStatus) => {
        setIsUpdating(true);
        try {
            // Khi BE đã có route cập nhật trạng thái, sếp mở comment đoạn này ra
            /*
            const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
            const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");
            const response = await fetch(`${API_URL}/update-booking-status/${id}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ Booking_Status: newStatusValue })
            });
            if (!response.ok) throw new Error("Cập nhật thất bại");
            */

            setWorkStatus(targetUIStatus);
            if (targetUIStatus === "COMPLETED") {
                setTimeout(() => {
                    alert("Tuyệt vời! Đơn hàng đã hoàn thành.");
                    navigate("/cleaner");
                }, 1000);
            }
        } catch (err) {
            alert("Lỗi: " + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDirection = () => {
        navigate(`/cleaner/navigate/${id}`, {
            state: { passedOrderData: orderData }
        });
    };

    const handleStartWork = () => {
        if (window.confirm("Xác nhận bạn đã đến nơi và bắt đầu dọn dẹp?")) {
            updateOrderStatus(3, "IN_PROGRESS");
        }
    };

    const handleCompleteWork = () => {
        if (window.confirm("Xác nhận bạn đã hoàn thành công việc?")) {
            updateOrderStatus(4, "COMPLETED");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="min-h-screen bg-[#f4f7f6] flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle size={40} className="text-red-400 mb-4" />
                <p className="font-bold text-gray-700">{error || "Lỗi không xác định"}</p>
                <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] flex flex-col font-sans relative overflow-hidden animate-fade-in">
            <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                        <ChevronLeft size={20} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-base font-black text-gray-900">Tiến độ đơn hàng</h1>
                        <p className="text-xs text-gray-500 font-medium">#{orderData.id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${workStatus === "MOVING" ? "bg-yellow-100 text-yellow-700" :
                        workStatus === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                    {workStatus === "MOVING" ? "Đang di chuyển" : workStatus === "IN_PROGRESS" ? "Đang làm việc" : "Hoàn thành"}
                </div>
            </header>

            <main className="flex-grow p-4 space-y-4 pb-32">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Khách hàng</p>
                            <h2 className="text-lg font-bold text-gray-900">{orderData.customer}</h2>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsChatOpen(true)} className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
                                <MessageSquare size={18} />
                            </button>
                            <a href={`tel:${orderData.phone}`} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                                <PhoneCall size={18} />
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="mt-1 p-2.5 bg-gray-50 rounded-2xl text-gray-400">
                            <MapPin size={20} />
                        </div>
                        <div className="flex-grow">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Địa chỉ dọn dẹp</p>
                            <p className="text-sm font-bold text-gray-800 leading-relaxed mb-4">{orderData.address}</p>

                            <button onClick={handleDirection} className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
                                <Navigation size={16} /> Bật bản đồ chỉ đường
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-50 rounded-2xl text-orange-500">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian hẹn</p>
                            <p className="text-sm font-bold text-gray-800">{orderData.time}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thu nhập</p>
                        <p className="text-lg font-black text-green-600">{orderData.income?.toLocaleString()}đ</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-sm font-black text-gray-900 uppercase mb-6">Tiến trình công việc</h3>
                    <div className="relative pl-6 space-y-8 before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-gray-100">
                        <div className="relative z-10">
                            <div className={`absolute -left-[31px] w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${workStatus !== "MOVING" ? "bg-green-500" : "bg-yellow-400 animate-pulse"}`}>
                                {workStatus !== "MOVING" && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <p className={`text-sm font-bold ${workStatus !== "MOVING" ? "text-gray-900" : "text-yellow-600"}`}>Đang di chuyển đến điểm dọn dẹp</p>
                        </div>
                        <div className="relative z-10">
                            <div className={`absolute -left-[31px] w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${workStatus === "COMPLETED" ? "bg-green-500" : workStatus === "IN_PROGRESS" ? "bg-blue-500 animate-pulse" : "bg-gray-200"}`}>
                                {workStatus === "COMPLETED" && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <p className={`text-sm font-bold ${workStatus === "IN_PROGRESS" ? "text-blue-600" : workStatus === "COMPLETED" ? "text-gray-900" : "text-gray-400"}`}>Đang tiến hành dọn dẹp</p>
                        </div>
                        <div className="relative z-10">
                            <div className={`absolute -left-[31px] w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${workStatus === "COMPLETED" ? "bg-green-500" : "bg-gray-200"}`}>
                                {workStatus === "COMPLETED" && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <p className={`text-sm font-bold ${workStatus === "COMPLETED" ? "text-green-600" : "text-gray-400"}`}>Đã hoàn thành</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30">
                <div className="max-w-md mx-auto">
                    {workStatus === "MOVING" && (
                        <button onClick={handleStartWork} disabled={isUpdating} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                            {isUpdating ? "Đang xử lý..." : <><Play size={22} fill="currentColor" /> Bắt đầu dọn dẹp</>}
                        </button>
                    )}
                    {workStatus === "IN_PROGRESS" && (
                        <button onClick={handleCompleteWork} disabled={isUpdating} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-200 disabled:opacity-50">
                            {isUpdating ? "Đang xử lý..." : <><CheckCircle2 size={24} /> Hoàn thành công việc</>}
                        </button>
                    )}
                    {workStatus === "COMPLETED" && (
                        <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-lg flex items-center justify-center gap-2">
                            Đơn hàng đã kết thúc
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Chat */}
            {isChatOpen && (
                <div className="fixed inset-0 z-50 bg-[#f4f7f6] flex flex-col animate-fade-in-up">
                    <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-20 shrink-0 pb-safe-top">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsChatOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                                <X size={20} className="text-gray-700" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                    {orderData.customer?.charAt(0).toUpperCase() || "C"}
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div>
                                    <h1 className="text-sm font-black text-gray-900 leading-tight">{orderData.customer}</h1>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khách hàng</p>
                                </div>
                            </div>
                        </div>
                        <a href={`tel:${orderData.phone}`} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition">
                            <PhoneCall size={18} />
                        </a>
                    </header>
                    <main className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="text-center pb-4"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-200/50 px-3 py-1 rounded-full">Hôm nay</span></div>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                                <div className="flex flex-col max-w-[75%]">
                                    <div className={`p-3.5 text-sm shadow-sm ${msg.sender === "me" ? "bg-green-600 text-white rounded-2xl rounded-tr-sm" : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm"}`}>
                                        {msg.text}
                                    </div>
                                    <span className={`text-[10px] text-gray-400 mt-1 font-medium ${msg.sender === "me" ? "text-right" : "text-left"}`}>
                                        {msg.time} {msg.sender === "me" && "✓✓"}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </main>
                    <div className="bg-white px-4 py-3 border-t border-gray-100 pb-safe shrink-0">
                        {workStatus === "COMPLETED" ? (
                            <div className="text-center py-3 text-sm font-bold text-gray-400 bg-gray-50 rounded-2xl">Chat đã bị khóa do đơn hàng hoàn thành</div>
                        ) : (
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl relative">
                                    <textarea rows="1" placeholder="Nhập tin nhắn..." className="w-full bg-transparent px-4 py-3.5 outline-none text-sm font-medium resize-none max-h-24" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} />
                                </div>
                                <button type="submit" disabled={!inputText.trim()} className={`p-3.5 rounded-full flex-shrink-0 transition-all ${inputText.trim() ? "bg-green-600 text-white shadow-lg shadow-green-900/20 hover:bg-green-700 active:scale-95" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                                    <Send size={20} className="ml-1" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};