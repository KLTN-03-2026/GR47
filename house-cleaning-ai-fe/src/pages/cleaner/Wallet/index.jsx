import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft, Wallet, ArrowDownRight, ArrowUpRight,
    RefreshCw, AlertCircle, Banknote, CalendarClock
} from "lucide-react";

export const CleanerWallet = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading"); // loading | success | error
    const [walletData, setWalletData] = useState(null);

    const fetchWalletData = (simulateError = false) => {
        setStatus("loading");

        setTimeout(() => {
            if (simulateError) {
                setStatus("error");
            } else {
                setWalletData({
                    balance: 1250000,
                    transactions: [
                        { id: "TX-001", type: "income", amount: 350000, title: "Thu nhập đơn BK-8899", date: "03/04/2026 14:30" },
                        { id: "TX-002", type: "expense", amount: 35000, title: "Phí nền tảng (10%)", date: "03/04/2026 14:30" },
                        { id: "TX-003", type: "income", amount: 450000, title: "Thu nhập đơn BK-7722", date: "02/04/2026 10:15" },
                        { id: "TX-004", type: "expense", amount: 45000, title: "Phí nền tảng (10%)", date: "02/04/2026 10:15" },
                        { id: "TX-005", type: "withdraw", amount: 500000, title: "Rút tiền về Vietcombank", date: "01/04/2026 09:00" },
                        { id: "TX-006", type: "income", amount: 280000, title: "Thu nhập đơn BK-9911", date: "31/03/2026 16:45" },
                    ]
                });
                setStatus("success");
            }
        }, 1200);
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    return (
        <div className="min-h-screen bg-[#f4f7f6] font-sans pb-safe">

            {/* Header */}
            <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                        <ChevronLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-lg font-black text-gray-900">Ví của tôi</h1>
                </div>
                {/* Nút giả lập Lỗi API dành cho Dev */}
                <button
                    onClick={() => fetchWalletData(true)}
                    className="text-[10px] font-bold bg-red-100 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-200"
                >
                    Test Lỗi API
                </button>
            </header>

            <main className="p-4">

                {/* Mục 1: Label - Số tiền (Thẻ Ví) */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl p-6 text-white shadow-lg shadow-green-900/20 mb-6 relative overflow-hidden">
                    {/* Họa tiết trang trí thẻ */}
                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-black/10 rounded-full blur-xl"></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 text-green-100 mb-2">
                            <Wallet size={18} />
                            <span className="text-sm font-bold uppercase tracking-widest">Tổng số dư khả dụng</span>
                        </div>

                        {status === "loading" ? (
                            <div className="h-10 w-48 bg-white/20 rounded-lg animate-pulse my-2"></div>
                        ) : status === "error" ? (
                            <div className="text-2xl font-black text-white/50 my-2">--- VNĐ</div>
                        ) : (
                            <div className="text-4xl font-black tracking-tight my-2">
                                {walletData?.balance.toLocaleString()} <span className="text-xl text-green-200">đ</span>
                            </div>
                        )}
                    </div>

                    <div className="relative z-10 mt-6 grid grid-cols-2 gap-4">
                        <button className="py-3 bg-white text-green-700 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-green-50 transition active:scale-95">
                            <ArrowUpRight size={18} /> Rút tiền
                        </button>
                        <button className="py-3 bg-black/20 text-white rounded-xl font-bold text-sm flex items-center justify-center hover:bg-black/30 transition">
                            Liên kết ngân hàng
                        </button>
                    </div>
                </div>

                {/* Mục 2: List - Lịch sử giao dịch */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-base font-black text-gray-900">Lịch sử dòng tiền</h2>
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <CalendarClock size={14} /> Tháng 04/2026
                        </div>
                    </div>

                    {/* Xử lý các trạng thái API */}
                    {status === "loading" && (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-20 bg-white rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    )}

                    {status === "error" && (
                        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center animate-shake">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-2">Không thể tải dữ liệu</h3>
                            <p className="text-sm text-gray-500 font-medium mb-6">Kết nối đến máy chủ bị gián đoạn. Vui lòng kiểm tra mạng và thử lại.</p>
                            <button
                                onClick={() => fetchWalletData(false)}
                                className="w-full py-3.5 bg-[#1a1c23] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-black transition-colors"
                            >
                                <RefreshCw size={18} /> Tải lại dữ liệu
                            </button>
                        </div>
                    )}

                    {status === "success" && walletData && (
                        <div className="space-y-3">
                            {walletData.transactions.map((tx) => (
                                <div key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-default">

                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full flex-shrink-0 
                      ${tx.type === 'income' ? 'bg-green-50 text-green-600' :
                                                tx.type === 'withdraw' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {tx.type === 'income' ? <Banknote size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-0.5">{tx.title}</p>
                                            <p className="text-[11px] font-medium text-gray-400">{tx.date} • {tx.id}</p>
                                        </div>
                                    </div>

                                    <div className={`text-right font-black ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {tx.type === 'income' ? '+' : '-'}
                                        {tx.amount.toLocaleString()}đ
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};