import { useState } from "react";
import {
    FileText, Search, Eye, CheckCircle2,
    XCircle, AlertCircle, ShieldAlert, Image as ImageIcon
} from "lucide-react";

export const ApproveCleaners = () => {
    // Dữ liệu giả lập danh sách chờ duyệt (Mục 1)
    const [pendingList, setPendingList] = useState([
        {
            id: "C-9901",
            name: "Nguyễn Văn A",
            phone: "0901112223",
            submitDate: "04/04/2026 08:30",
            status: "PENDING",
            images: {
                cccd: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=800&auto=format&fit=crop", // Ảnh giả lập ID Card
                selfie: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400&auto=format&fit=crop"
            }
        },
        {
            id: "C-9902",
            name: "Trần Thị Lan",
            phone: "0988777666",
            submitDate: "04/04/2026 09:15",
            status: "PENDING",
            images: {
                cccd: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=800&auto=format&fit=crop",
                selfie: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
            }
        }
    ]);

    const [selectedCleaner, setSelectedCleaner] = useState(null);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [isProcessing, setIsProcessing] = useState(false);

    // Hiển thị thông báo
    const showToast = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 3000);
    };

    // Hoạt động: Phê duyệt -> Thành công (ACTIVE)
    const handleApprove = (id) => {
        setIsProcessing(true);
        setTimeout(() => {
            setPendingList(pendingList.filter(item => item.id !== id));
            setSelectedCleaner(null);
            setIsProcessing(false);
            showToast("success", `Đã phê duyệt hồ sơ ${id}. Tài khoản hiện ở trạng thái ACTIVE.`);
        }, 1000);
    };

    // Hoạt động: Từ chối -> Thất bại (Upload lại)
    const handleReject = (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn từ chối hồ sơ này và yêu cầu Cleaner upload lại?")) return;

        setIsProcessing(true);
        setTimeout(() => {
            setPendingList(pendingList.filter(item => item.id !== id));
            setSelectedCleaner(null);
            setIsProcessing(false);
            showToast("error", `Đã từ chối hồ sơ ${id}. Hệ thống đã gửi yêu cầu Upload lại ảnh.`);
        }, 1000);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText size={24} className="text-blue-600" /> Duyệt hồ sơ Đối tác
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Kiểm tra tính hợp lệ của CCCD và hình ảnh chân dung do Cleaner mới gửi lên.</p>
                </div>

                <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text" placeholder="Tìm kiếm ID, Tên..."
                        className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                    />
                </div>
            </div>

            {/* Thông báo (Toast) */}
            {notification.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm border animate-shake
          ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    {notification.type === "error" ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
                    {notification.message}
                </div>
            )}

            {/* Mục 1: Table - Danh sách chờ duyệt */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest font-black">
                                <th className="p-4">Mã Đối tác</th>
                                <th className="p-4">Họ và Tên</th>
                                <th className="p-4">Số điện thoại</th>
                                <th className="p-4">Ngày nộp</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-700">
                            {pendingList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">
                                        <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
                                        Không có hồ sơ nào đang chờ duyệt.
                                    </td>
                                </tr>
                            ) : (
                                pendingList.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">#{item.id}</td>
                                        <td className="p-4">{item.name}</td>
                                        <td className="p-4">{item.phone}</td>
                                        <td className="p-4 text-slate-500 text-xs">{item.submitDate}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedCleaner(item)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors"
                                            >
                                                <Eye size={16} /> Kiểm tra
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mục 2: Modal Image View (Kiểm tra hình ảnh) */}
            {selectedCleaner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Kiểm tra hồ sơ: #{selectedCleaner.id}</h2>
                                <p className="text-sm text-slate-500 font-medium">{selectedCleaner.name} - {selectedCleaner.phone}</p>
                            </div>
                            <button
                                onClick={() => !isProcessing && setSelectedCleaner(null)}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
                                disabled={isProcessing}
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Modal Body: Image Views */}
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Ảnh CCCD */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <ImageIcon size={18} className="text-blue-500" /> Ảnh CCCD (Mặt trước)
                                    </h3>
                                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                                        <img
                                            src={selectedCleaner.images.cccd}
                                            alt="CCCD"
                                            className="w-full aspect-video object-cover rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Ảnh Selfie */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <ImageIcon size={18} className="text-blue-500" /> Ảnh Chân dung (Selfie)
                                    </h3>
                                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex justify-center">
                                        <img
                                            src={selectedCleaner.images.selfie}
                                            alt="Selfie"
                                            className="h-full max-h-[250px] aspect-square object-cover rounded-lg"
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 text-blue-700 text-sm font-medium">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <p>Vui lòng đối chiếu khuôn mặt trên <strong className="font-bold">Ảnh Selfie</strong> với <strong className="font-bold">Ảnh CCCD</strong>. Nếu thông tin không rõ ràng hoặc có dấu hiệu giả mạo, hãy chọn "Từ chối".</p>
                            </div>
                        </div>

                        {/* Modal Footer: Action Buttons */}
                        <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3">
                            <button
                                onClick={() => handleReject(selectedCleaner.id)}
                                disabled={isProcessing}
                                className="px-6 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors border border-red-100 disabled:opacity-50"
                            >
                                Từ chối (Yêu cầu Upload lại)
                            </button>

                            <button
                                onClick={() => handleApprove(selectedCleaner.id)}
                                disabled={isProcessing}
                                className="px-6 py-2.5 rounded-xl font-black text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><CheckCircle2 size={18} /> Phê duyệt hồ sơ</>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};