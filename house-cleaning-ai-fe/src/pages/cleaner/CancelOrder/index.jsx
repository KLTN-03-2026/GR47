import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft, AlertOctagon, AlertTriangle,
    CheckCircle2, XCircle, Send
} from "lucide-react";

export const CleanerCancelOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [selectedReason, setSelectedReason] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [errorMessage, setErrorMessage] = useState("");

    const reasons = [
        "Hỏng xe / Tai nạn trên đường",
        "Ốm đau đột xuất",
        "Khách hàng đưa sai địa chỉ",
        "Lý do bất khả kháng khác"
    ];

    const handleCancelOrder = () => {
        if (!selectedReason) return;
        setStatus("loading");

        setTimeout(() => {
            const isAlreadyInProgress = Math.random() > 0.85; // 15% khả năng lỗi

            if (isAlreadyInProgress) {
                setStatus("error");
                setErrorMessage("Không thể hủy: Đơn hàng này đã được ghi nhận là Đang dọn dẹp.");
            } else {
                setStatus("success");
                setTimeout(() => navigate("/cleaner/my-jobs"), 2500);
            }
        }, 1500);
    };

    if (status === "success") {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Đã trả đơn thành công</h2>
                <p className="text-gray-500 font-medium">
                    Đơn hàng đã được đưa lại vào hệ thống. Điểm tín nhiệm của bạn đã bị trừ theo quy định.
                </p>
                <p className="text-sm text-gray-400 mt-8 animate-pulse">Đang quay lại danh sách công việc...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] py-6 px-4 font-sans">
            <div className="max-w-xl mx-auto">

                {/* Header điều hướng */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-lg font-black text-gray-900">Từ chối đơn hàng #{id || "BK-8899"}</h1>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Mục 2: View - Cảnh báo trừ điểm */}
                    <div className="bg-red-50 border-b border-red-100 p-6 flex items-start gap-4">
                        <div className="bg-red-100 text-red-600 p-2.5 rounded-2xl shrink-0 mt-1">
                            <AlertOctagon size={24} />
                        </div>
                        <div>
                            <h3 className="text-red-800 font-black text-base mb-1">Cảnh báo nghiêm trọng</h3>
                            <p className="text-red-600 text-sm font-medium leading-relaxed">
                                Việc hủy đơn sau khi đã nhận sẽ làm <strong className="font-black">giảm điểm tín nhiệm</strong> của bạn. Nếu tỷ lệ hủy đơn vượt quá mức cho phép, tài khoản có thể bị khóa tạm thời.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                Vui lòng chọn lý do (Mục 1)
                            </p>

                            {/* Mục 1: Radio Buttons */}
                            <div className="space-y-3">
                                {reasons.map((reason) => (
                                    <label
                                        key={reason}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                      ${selectedReason === reason
                                                ? "border-red-500 bg-red-50/50"
                                                : "border-gray-100 bg-gray-50 hover:bg-gray-100"}`}
                                    >
                                        <input
                                            type="radio"
                                            name="cancel_reason"
                                            className="hidden"
                                            value={reason}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-all
                      ${selectedReason === reason ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}>
                                            {selectedReason === reason && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <span className={`text-sm font-bold ${selectedReason === reason ? "text-red-900" : "text-gray-700"}`}>
                                            {reason}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Hoạt động: Xử lý Thất bại */}
                        {status === "error" && (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 text-orange-800 text-sm font-bold animate-shake">
                                <AlertTriangle size={20} className="shrink-0 mt-0.5 text-orange-600" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Mục 3: Button Xác nhận hủy */}
                        <div className="pt-4 border-t border-gray-50">
                            <button
                                onClick={handleCancelOrder}
                                disabled={!selectedReason || status === "loading"}
                                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all
                  ${!selectedReason || status === "loading"
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-lg shadow-red-900/20"}`}
                            >
                                {status === "loading" ? (
                                    <div className="h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Xác nhận trả đơn <Send size={20} /></>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};