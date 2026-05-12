import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft, Wallet, ArrowUpFromLine, Loader2, AlertCircle,
    TrendingUp, History, Banknote
} from "lucide-react";
import { useCleanerRefresh } from "../../../context/CleanerContext.jsx";

const categoryMeta = (cat) => {
    if (cat === "INCOME") return { label: "Thu nhập", sign: "+", chip: "bg-emerald-50 text-emerald-700" };
    if (cat === "WITHDRAW") return { label: "Rút tiền", sign: "-", chip: "bg-rose-50 text-rose-700" };
    return { label: cat, sign: "", chip: "bg-gray-50 text-gray-600" };
};

export const CleanerEarning = () => {
    const navigate = useNavigate();
    const { triggerCleanerRefresh } = useCleanerRefresh();
    const [status, setStatus] = useState("loading");
    const [balance, setBalance] = useState(0);
    const [accountHolder, setAccountHolder] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [amountInput, setAmountInput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_CLEANER_URL;
    const token = () => localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");

    const fetchAll = async () => {
        setStatus("loading");
        try {
            const tk = token();
            if (!tk) throw new Error("NO_AUTH");
            const [wRes, tRes] = await Promise.all([
                fetch(`${API_URL}/earning-wallet`, { headers: { Authorization: `Bearer ${tk}` } }),
                fetch(`${API_URL}/earning-transactions`, { headers: { Authorization: `Bearer ${tk}` } }),
            ]);
            const wJson = await wRes.json();
            const tJson = await tRes.json();
            if (!wRes.ok || !wJson.success) throw new Error(wJson.message || "Không tải được ví.");
            if (!tRes.ok || !tJson.success) throw new Error(tJson.message || "Không tải được lịch sử.");
            setBalance(wJson.data.balance ?? 0);
            setAccountHolder(wJson.data.accountHolder || "");
            setTransactions(tJson.data.transactions || []);
            setStatus("success");
        } catch (e) {
            if (e.message === "NO_AUTH") navigate("/cleaner/login", { replace: true });
            setStatus("error");
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleWithdraw = async () => {
        const raw = String(amountInput).replace(/\D/g, "");
        const amount = parseInt(raw, 10);
        if (!amount || amount < 10000) {
            return;
        }
        setSubmitting(true);
        try {
            const tk = token();
            const res = await fetch(`${API_URL}/earning-withdraw`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${tk}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Rút tiền thất bại.");
            setBalance(json.data.balance ?? 0);
            setWithdrawOpen(false);
            setAmountInput("");
            await fetchAll();
            // Trigger header refresh khi rút tiền thành công
            triggerCleanerRefresh();
        } catch (e) {
            alert(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] font-sans pb-safe">
            <header className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm border-b border-gray-100">
                <button type="button" onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                    <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <div>
                    <h1 className="text-lg font-black text-gray-900">Thu nhập & ví</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CleanAI Partner</p>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto">
                {status === "loading" && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                        <p className="text-sm font-bold text-gray-400">Đang tải...</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                        <p className="font-bold text-gray-800 mb-4">Không tải được dữ liệu ví.</p>
                        <button type="button" onClick={fetchAll} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm">
                            Thử lại
                        </button>
                    </div>
                )}

                {status === "success" && (
                    <>
                        <div className="bg-gradient-to-br from-green-600 to-emerald-900 rounded-3xl p-6 text-white shadow-lg shadow-green-900/20 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-green-100 mb-2">
                                    <Wallet size={18} />
                                    <span className="text-xs font-black uppercase tracking-widest">Số dư khả dụng</span>
                                </div>
                                <p className="text-3xl font-black tracking-tight mb-6">
                                    {balance.toLocaleString("vi-VN")}
                                    <span className="text-lg text-green-200 font-bold ml-1">đ</span>
                                </p>
                                <div className="border-t border-white/20 pt-4">
                                    <p className="text-[10px] font-bold text-green-100/80 uppercase tracking-widest">Account holder</p>
                                    <p className="font-black tracking-wide text-sm truncate">
                                        {(accountHolder || "ĐỐI TÁC").toUpperCase()}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setWithdrawOpen(true)}
                                    className="w-full mt-5 py-3.5 bg-white text-green-700 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-green-50 active:scale-[0.98] transition-all"
                                >
                                    <ArrowUpFromLine size={18} /> Rút tiền
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4 px-1">
                            <History size={18} className="text-gray-700" />
                            <h2 className="text-base font-black text-gray-900">Lịch sử thu nhập & rút tiền</h2>
                        </div>

                        <ul className="space-y-3">
                            {transactions.length === 0 ? (
                                <li className="bg-white rounded-2xl p-8 text-center text-sm font-medium text-gray-400 border border-gray-100">
                                    Chưa có giao dịch. Thu nhập sẽ được ghi khi bạn hoàn thành đơn hàng.
                                </li>
                            ) : (
                                transactions.map((tx) => {
                                    const m = categoryMeta(tx.Category);
                                    const amt = Number(tx.Amount) || 0;
                                    const isInc = tx.Category === "INCOME";
                                    return (
                                        <li
                                            key={tx._id}
                                            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3"
                                        >
                                            <div className={`p-2.5 rounded-xl shrink-0 ${m.chip}`}>
                                                {isInc ? <TrendingUp size={20} /> : <Banknote size={20} />}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-bold text-gray-900 text-sm">{m.label}</p>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                    {tx.Description || "—"}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                                    {new Date(tx.createdAt).toLocaleString("vi-VN")}
                                                </p>
                                            </div>
                                            <span className={`font-black text-sm shrink-0 ${isInc ? "text-emerald-600" : "text-rose-600"}`}>
                                                {isInc ? "+" : "-"}
                                                {amt.toLocaleString("vi-VN")}đ
                                            </span>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </>
                )}
            </main>

            {withdrawOpen && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-fade-in-up">
                        <h3 className="font-black text-gray-900 text-lg mb-2">Rút tiền</h3>
                        <p className="text-sm text-gray-500 mb-4">Tối thiểu 10.000đ. Số dư hiện tại: {balance.toLocaleString("vi-VN")}đ</p>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Số tiền"
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value.replace(/[^\d]/g, ""))}
                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 font-black text-lg mb-4 outline-none focus:ring-2 focus:ring-green-500/30"
                            disabled={submitting}
                        />
                        <div className="flex gap-3">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setWithdrawOpen(false)}
                                className="flex-1 py-3.5 rounded-2xl font-bold bg-gray-100 text-gray-700"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                disabled={submitting || !amountInput}
                                onClick={handleWithdraw}
                                className="flex-1 py-3.5 rounded-2xl font-black bg-green-600 text-white flex justify-center items-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
