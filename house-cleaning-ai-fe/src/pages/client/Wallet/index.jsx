import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  History,
  Loader2,
  RefreshCcw,
  Wallet,
} from "lucide-react";

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const categoryMeta = {
  DEPOSIT: { label: "Nạp tiền", sign: "+", icon: ArrowDownLeft, tone: "emerald" },
  WITHDRAW: { label: "Rút tiền", sign: "-", icon: ArrowUpRight, tone: "rose" },
  SPEND: { label: "Thanh toán", sign: "-", icon: Banknote, tone: "slate" },
  REFUND: { label: "Hoàn tiền khiếu nại", sign: "+", icon: RefreshCcw, tone: "blue" },
};

const toneClasses = {
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-700",
};

export const ClientWallet = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [wallet, setWallet] = useState({ balance: 0, accountHolder: "", phone: "" });
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState("all");
  const [modalType, setModalType] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
  const token = () => localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

  const fetchWallet = async () => {
    setStatus("loading");
    setError("");
    try {
      const tk = token();
      if (!tk) {
        navigate("/login", { replace: true });
        return;
      }
      const query = new URLSearchParams({ category, limit: "50" }).toString();
      const [walletResponse, txResponse] = await Promise.all([
        fetch(`${API_URL}/ipay-wallet`, { headers: { Authorization: `Bearer ${tk}` } }),
        fetch(`${API_URL}/ipay-transactions?${query}`, { headers: { Authorization: `Bearer ${tk}` } }),
      ]);
      const walletResult = await walletResponse.json();
      const txResult = await txResponse.json();
      if (!walletResponse.ok || !walletResult.success) throw new Error(walletResult.message || "Không thể tải ví.");
      if (!txResponse.ok || !txResult.success) throw new Error(txResult.message || "Không thể tải lịch sử giao dịch.");
      setWallet(walletResult.data || { balance: 0 });
      setTransactions(txResult.data?.transactions || []);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Lỗi kết nối máy chủ.");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [category]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        const amount = Number(item.Amount || 0);
        if (["DEPOSIT", "REFUND"].includes(item.Category)) acc.income += amount;
        if (["WITHDRAW", "SPEND"].includes(item.Category)) acc.outcome += amount;
        return acc;
      },
      { income: 0, outcome: 0 }
    );
  }, [transactions]);

  const handleWalletAction = async () => {
    const amount = Number(String(amountInput).replace(/\D/g, ""));
    if (!amount || amount < 10000) {
      setError("Số tiền tối thiểu là 10.000đ.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const tk = token();
      const path = modalType === "deposit" ? "ipay-deposit" : "ipay-withdraw";
      const response = await fetch(`${API_URL}/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tk}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Giao dịch thất bại.");
      setModalType("");
      setAmountInput("");
      await fetchWallet();
    } catch (err) {
      setError(err.message || "Lỗi kết nối máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-700"
        >
          <ArrowLeft size={17} /> Quay lại
        </button>

        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-emerald-900 p-6 text-white shadow-xl shadow-green-900/15">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-green-100">
                <Wallet size={20} />
                <span className="text-xs font-black uppercase tracking-widest">CleanAI iPay</span>
              </div>
              <p className="text-sm font-bold text-green-100">Số dư khả dụng</p>
              {status === "loading" ? (
                <div className="mt-2 h-10 w-52 animate-pulse rounded-xl bg-white/20" />
              ) : (
                <p className="mt-2 text-4xl font-black tracking-tight">{formatMoney(wallet.balance)}</p>
              )}
              <p className="mt-4 text-sm font-semibold text-green-100">
                {wallet.accountHolder || "Khách hàng"} {wallet.phone ? `- ${wallet.phone}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-64">
              <button
                type="button"
                onClick={() => setModalType("deposit")}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-green-700 hover:bg-green-50"
              >
                Nạp tiền
              </button>
              <button
                type="button"
                onClick={() => setModalType("withdraw")}
                className="rounded-2xl bg-black/20 px-4 py-3 text-sm font-black text-white hover:bg-black/30"
              >
                Rút tiền
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Tiền vào</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">{formatMoney(summary.income)}</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-rose-500">Tiền ra</p>
            <p className="mt-1 text-2xl font-black text-rose-700">{formatMoney(summary.outcome)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black text-gray-900">
              <History size={20} /> Lịch sử giao dịch
            </h2>
            <div className="flex rounded-xl border border-gray-100 bg-gray-50 p-1">
              {[
                ["all", "Tất cả"],
                ["REFUND", "Hoàn tiền"],
                ["SPEND", "Thanh toán"],
                ["DEPOSIT", "Nạp"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`rounded-lg px-3 py-2 text-xs font-black ${category === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {status === "loading" && (
            <div className="flex items-center justify-center gap-3 py-12 text-gray-400">
              <Loader2 className="h-7 w-7 animate-spin" />
              <span className="text-sm font-bold">Đang tải...</span>
            </div>
          )}

          {status === "error" && (
            <div className="py-10 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
              <button type="button" onClick={fetchWallet} className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-black text-white">
                Thử lại
              </button>
            </div>
          )}

          {status === "success" && transactions.length === 0 && (
            <div className="py-12 text-center text-sm font-bold text-gray-400">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-400" />
              Chưa có giao dịch nào.
            </div>
          )}

          {status === "success" && transactions.length > 0 && (
            <ul className="space-y-3">
              {transactions.map((tx) => {
                const meta = categoryMeta[tx.Category] || { label: tx.Category, sign: "", icon: Banknote, tone: "slate" };
                const Icon = meta.icon;
                const positive = ["DEPOSIT", "REFUND"].includes(tx.Category);
                return (
                  <li key={tx._id} className="flex items-start gap-4 rounded-2xl border border-gray-100 p-4 hover:bg-gray-50">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[meta.tone]}`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-gray-900">{meta.label}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-500">{tx.Description || "Không có mô tả"}</p>
                      <p className="mt-2 text-xs font-bold text-gray-400">{new Date(tx.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                    <p className={`shrink-0 text-sm font-black ${positive ? "text-emerald-600" : "text-rose-600"}`}>
                      {meta.sign}
                      {formatMoney(tx.Amount)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <h3 className="text-lg font-black text-gray-900">{modalType === "deposit" ? "Nạp tiền iPay" : "Rút tiền iPay"}</h3>
            <p className="mt-1 text-sm font-medium text-gray-500">Số tiền tối thiểu 10.000đ</p>
            <input
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value.replace(/[^\d]/g, ""))}
              placeholder="Nhập số tiền"
              className="mt-5 w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-lg font-black outline-none focus:ring-2 focus:ring-green-500/30"
            />
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setModalType("");
                  setAmountInput("");
                }}
                className="flex-1 rounded-2xl bg-gray-100 py-3.5 text-sm font-bold text-gray-700"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={submitting || !amountInput}
                onClick={handleWalletAction}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-black text-white disabled:bg-gray-300"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />} Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
