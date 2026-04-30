import { useState } from "react";
import {
    Ticket, History, Download, PlusCircle,
    CheckCircle2, ShieldAlert, ArrowRightLeft,
    Search, FileSpreadsheet
} from "lucide-react";

export const FinancePromotions = () => {
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [isExporting, setIsExporting] = useState(false);

    // Form tạo Voucher (Mục 1)
    const [voucherForm, setVoucherForm] = useState({
        code: "",
        percent: "",
        expiryDate: "",
        quantity: ""
    });

    // Dữ liệu giả lập Lịch sử dòng tiền (Mục 2)
    const [transactions] = useState([
        { id: "TX-9981", sender: "Lê Minh Tuấn (Client)", receiver: "Nguyễn Văn A (Cleaner)", amount: 350000, status: "SUCCESS", date: "04/04/2026 14:30" },
        { id: "TX-9982", sender: "Hệ thống CleanAI", receiver: "Trần Thị B (Cleaner)", amount: 500000, status: "SUCCESS", date: "03/04/2026 09:15" },
        { id: "TX-9983", sender: "Phạm Hữu D (Client)", receiver: "Lê Văn C (Cleaner)", amount: 280000, status: "PENDING", date: "03/04/2026 16:45" },
        { id: "TX-9984", sender: "Ngô Thanh E (Client)", receiver: "Hệ thống CleanAI", amount: 45000, status: "SUCCESS", date: "02/04/2026 10:20" }, // Phí nền tảng
    ]);

    const showToast = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 3500);
    };

    const handleFormChange = (e) => {
        setVoucherForm({ ...voucherForm, [e.target.name]: e.target.value });
    };

    // Hoạt động: Tạo Voucher
    const handleCreateVoucher = (e) => {
        e.preventDefault();

        const today = new Date().setHours(0, 0, 0, 0);
        const selectedDate = new Date(voucherForm.expiryDate).setHours(0, 0, 0, 0);

        // Thất bại: Sai ngày (Ngày hết hạn nằm trong quá khứ)
        if (selectedDate < today) {
            showToast("error", "Lỗi: Ngày hết hạn không hợp lệ. Vui lòng chọn ngày trong tương lai.");
            return;
        }

        // Thất bại: Thiếu thông tin
        if (!voucherForm.code || !voucherForm.percent || !voucherForm.quantity) {
            showToast("error", "Vui lòng nhập đầy đủ thông tin Voucher.");
            return;
        }

        // Thành công
        showToast("success", `Tạo thành công ${voucherForm.quantity} mã Voucher: ${voucherForm.code.toUpperCase()}`);
        setVoucherForm({ code: "", percent: "", expiryDate: "", quantity: "" });
    };

    // Hoạt động: Xuất Excel (Mục 3)
    const handleExportExcel = () => {
        setIsExporting(true);

        // Giả lập delay tải file
        setTimeout(() => {
            setIsExporting(false);
            // Bạn có thể giả lập lỗi export bằng cách thay đổi logic ở đây nếu cần
            showToast("success", "Đã xuất file lịch sử dòng tiền: transaction_history_042026.xlsx");
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* Header */}
            <div className="card-white card-header">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Ticket size={24} className="text-blue-600" /> Tài chính & Khuyến mãi
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Quản lý mã giảm giá và theo dõi đối soát lịch sử dòng tiền hệ thống.
                    </p>
                </div>
            </div>

            {/* Thông báo Toast */}
            {notification.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm border animate-shake
          ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    {notification.type === "error" ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
                    {notification.message}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Cột trái: Form tạo Voucher (Mục 1) */}
                <div className="xl:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                    <h2 className="text-base font-black text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                        <PlusCircle size={18} className="text-blue-500" /> Tạo Voucher mới
                    </h2>

                    <form onSubmit={handleCreateVoucher} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5">Mã Khuyến mãi</label>
                            <input
                                type="text" name="code" placeholder="VD: SUMMER2026"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold uppercase transition-all"
                                value={voucherForm.code} onChange={handleFormChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5">Mức giảm (%)</label>
                                <input
                                    type="number" name="percent" placeholder="VD: 15" min="1" max="100"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold transition-all"
                                    value={voucherForm.percent} onChange={handleFormChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5">Số lượng</label>
                                <input
                                    type="number" name="quantity" placeholder="VD: 100" min="1"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold transition-all"
                                    value={voucherForm.quantity} onChange={handleFormChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5">Hạn sử dụng</label>
                            <input
                                type="date" name="expiryDate"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-700 transition-all"
                                value={voucherForm.expiryDate} onChange={handleFormChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary-blue mt-2"
                        >
                            Tạo và Phát hành Voucher
                        </button>
                    </form>
                </div>

                {/* Cột phải: Table Lịch sử dòng tiền & Button Xuất Excel (Mục 2 & 3) */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

                    <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
                        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                            <History size={18} className="text-slate-500" /> Lịch sử Dòng tiền (Immutable)
                        </h2>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-56">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Search size={16} />
                                </div>
                                <input
                                    type="text" placeholder="Tìm Mã GD..."
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-sm transition-all"
                                />
                            </div>

                            {/* Mục 3: Nút Xuất Excel */}
                            <button
                                onClick={handleExportExcel}
                                disabled={isExporting}
                                className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><FileSpreadsheet size={16} /> Xuất Excel</>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-white border-b border-slate-100 text-slate-400 text-xs uppercase tracking-widest font-black">
                                    <th className="p-4">Mã GD</th>
                                    <th className="p-4">Luồng tiền (Gửi - Nhận)</th>
                                    <th className="p-4">Số tiền</th>
                                    <th className="p-4">Thời gian</th>
                                    <th className="p-4 text-right">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">{tx.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700">{tx.sender}</span>
                                                <ArrowRightLeft size={14} className="text-slate-300" />
                                                <span className="font-medium text-slate-700">{tx.receiver}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-black text-emerald-600">{tx.amount.toLocaleString()}đ</td>
                                        <td className="p-4 text-xs font-medium text-slate-500">{tx.date}</td>
                                        <td className="p-4 text-right">
                                            {tx.status === "SUCCESS" ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                                                    Thành công
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                                                    Đang xử lý
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};