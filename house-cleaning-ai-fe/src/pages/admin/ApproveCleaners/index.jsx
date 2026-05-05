import { useState, useEffect } from "react";
import {
    FileText, Search, Eye, CheckCircle2,
    XCircle, AlertCircle, ShieldAlert, Image as ImageIcon,
    RefreshCw
} from "lucide-react";

export const ApproveCleaners = () => {
    const [pendingList, setPendingList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCleaner, setSelectedCleaner] = useState(null);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchFilter] = useState("");

    const CLEANER_APPROVAL_STATUS = (item) => {
        if(item === 0) {
            return "Đang chờ duyệt"
        } else if(item === 1) {
            return "Đã duyệt"
        } else if(item === 2) {
            return "Từ chối"
        }
        
    }

    const fetchPendingCleaners = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const baseUrl = import.meta.env.VITE_API_BASE_ADMIN_URL;

            const response = await fetch(`${baseUrl}/get-all-pending-cleaners`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const mappedData = result.data.map(item => ({
                    id: item._id,
                    cleanerCode: item.Cleaner_Id || item._id.slice(-6).toUpperCase(),
                    name: item.Full_Name,
                    phone: item.Phone_Number,
                    submitDate: new Date(item.createdAt).toLocaleString('vi-VN'),
                    status: item.Approval_Status,
                    images: {
                        cccd: item.Identity_Card,
                        selfie: item.Selfie_Image
                    }
                }));
                setPendingList(mappedData);
            } else {
                showToast("error", result.message || "Không thể tải danh sách.");
            }
        } catch (error) {
            console.error("Lỗi API Get Pending:", error);
            showToast("error", "Lỗi kết nối máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingCleaners();
    }, []);

    const showToast = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 3500);
    };

    // ==========================================
    // 🔥 LOGIC PHÊ DUYỆT THẬT (GỌI API BACKEND)
    // ==========================================
    const handleApprove = async (id) => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem("admin_token");
            const baseUrl = import.meta.env.VITE_API_BASE_ADMIN_URL;

            // Gọi đúng route POST sếp vừa viết ở Backend
            const response = await fetch(`${baseUrl}/approve-cleaner/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // 1. Thông báo thành công bằng message của Backend
                showToast("success", result.message);

                // 2. Xóa cleaner đó khỏi danh sách hiển thị (vì nó không còn PENDING nữa)
                setPendingList(prev => prev.filter(item => item.id !== id));

                // 3. Đóng Modal
                setSelectedCleaner(null);
            } else {
                showToast("error", result.message || "Phê duyệt thất bại.");
            }
        } catch (error) {
            console.error("Lỗi API Approve:", error);
            showToast("error", "Không thể kết nối đến máy chủ để phê duyệt.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = (id) => {
        if (!window.confirm("Từ chối hồ sơ này và yêu cầu Cleaner upload lại?")) return;
        setIsProcessing(true);
        // Sếp có thể làm tương tự handleApprove cho logic Reject nhé
        setTimeout(() => {
            setPendingList(pendingList.filter(item => item.id !== id));
            setSelectedCleaner(null);
            setIsProcessing(false);
            showToast("error", `Hồ sơ đã bị từ chối.`);
        }, 1000);
    };

    const filteredList = pendingList.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cleanerCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText size={24} className="text-blue-600" /> Duyệt hồ sơ Đối tác
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Danh sách nhân viên mới đăng ký đang chờ hệ thống phê duyệt.</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm ID hoặc Tên..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchPendingCleaners}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Tải lại danh sách"
                    >
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {notification.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm border animate-shake
                    ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    {notification.type === "error" ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
                    {notification.message}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest font-black">
                                <th className="p-4">Mã Số</th>
                                <th className="p-4">Họ và Tên</th>
                                <th className="p-4">Số điện thoại</th>
                                <th className="p-4">Ngày đăng ký</th>
                                <th className="p-4 text-center">Trạng thái</th>
                                <th className="p-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                        <p className="mt-4 text-slate-400 font-bold">Đang lấy dữ liệu hồ sơ...</p>
                                    </td>
                                </tr>
                            ) : filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400">
                                        <CheckCircle2 size={40} className="mx-auto mb-3 text-slate-200" />
                                        Không còn hồ sơ nào chờ duyệt.
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">#{item.cleanerCode}</td>
                                        <td className="p-4 font-bold">{item.name}</td>
                                        <td className="p-4">{item.phone}</td>
                                        <td className="p-4 text-slate-500 text-xs">{item.submitDate}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {CLEANER_APPROVAL_STATUS(item.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedCleaner(item)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-all active:scale-95 shadow-md shadow-blue-200"
                                            >
                                                <Eye size={16} /> Xem hồ sơ
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedCleaner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Chi tiết hồ sơ: #{selectedCleaner.cleanerCode}</h2>
                                <p className="text-sm text-slate-500 font-medium">{selectedCleaner.name} - {selectedCleaner.phone}</p>
                            </div>
                            <button onClick={() => !isProcessing && setSelectedCleaner(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><ImageIcon size={18} className="text-blue-500" /> Ảnh CCCD</h3>
                                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                                        <img src={selectedCleaner.images.cccd} alt="CCCD" className="w-full aspect-video object-cover rounded-lg" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><ImageIcon size={18} className="text-blue-500" /> Ảnh Chân dung</h3>
                                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex justify-center">
                                        <img src={selectedCleaner.images.selfie} alt="Selfie" className="h-full max-h-[250px] aspect-square object-cover rounded-lg" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 text-blue-700 text-sm font-medium">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <p>Vui lòng đối chiếu kỹ khuôn mặt. Nếu có nghi ngờ giả mạo, hãy bấm <strong className="font-bold">Từ chối</strong> để Cleaner nộp lại.</p>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3">
                            <button onClick={() => handleReject(selectedCleaner.id)} disabled={isProcessing} className="px-6 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors border border-red-100">
                                Từ chối nộp lại
                            </button>
                            <button
                                onClick={() => handleApprove(selectedCleaner.id)}
                                disabled={isProcessing}
                                className="px-6 py-2.5 rounded-xl font-black text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang xử lý...
                                    </div>
                                ) : "Phê duyệt hồ sơ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};