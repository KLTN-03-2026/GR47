import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    ChevronRight
} from "lucide-react";

export const ClientCancelOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [loading, setLoading] = useState(false);

    const reasons = [
        "Tôi bận việc đột xuất",
        "Muốn đổi thời gian dọn dẹp",
        "Muốn thay đổi địa chỉ",
        "Lý do khác"
    ];

    const handleConfirm = () => {
        setLoading(true);
        // Giả lập xử lý
        setTimeout(() => {
            setLoading(false);
            alert("Yêu cầu hủy đã được gửi!");
            navigate("/my-orders");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] py-6 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Header đơn giản, thực tế */}
                <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800">Hủy đơn hàng #{id}</h1>
                </div>

                {/* Cảnh báo phí (Thực tế luôn có phần này) */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex gap-3">
                    <AlertCircle className="text-orange-500 shrink-0" size={20} />
                    <p className="text-sm text-orange-800">
                        Lưu ý: Hủy đơn hàng trong vòng 2 giờ trước khi bắt đầu có thể bị tính phí 30% giá trị đơn hàng.
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-700">Vui lòng chọn lý do hủy</h2>
                    </div>

                    <div className="p-2">
                        {reasons.map((reason) => (
                            <label
                                key={reason}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${selectedReason === reason ? "border-green-600 bg-green-600" : "border-gray-300"}`}>
                                        {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <span className={`text-sm font-medium ${selectedReason === reason ? "text-green-700" : "text-gray-600"}`}>
                                        {reason}
                                    </span>
                                </div>
                                <input
                                    type="radio"
                                    name="reason"
                                    className="hidden"
                                    onChange={() => setSelectedReason(reason)}
                                />
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400" />
                            </label>
                        ))}
                    </div>

                    {/* Textbox hiện ra khi chọn Lý do khác */}
                    {selectedReason === "Lý do khác" && (
                        <div className="p-4 pt-0">
                            <textarea
                                placeholder="Nhập lý do cụ thể của bạn..."
                                className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none min-h-[100px] bg-gray-50"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Footer Action */}
                    <div className="p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Hành động này sẽ không thể hoàn tác.
                        </p>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Không, quay lại
                            </button>
                            <button
                                disabled={!selectedReason || loading}
                                onClick={handleConfirm}
                                className={`flex-1 sm:flex-none px-8 py-2.5 text-sm font-bold text-white rounded-lg transition-all
                  ${!selectedReason || loading ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 shadow-sm"}`}
                            >
                                {loading ? "Đang xử lý..." : "Xác nhận hủy"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trợ giúp nhanh */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Bạn gặp sự cố? <a href="#" className="text-green-600 font-bold hover:underline">Chat với hỗ trợ viên</a>
                    </p>
                </div>
            </div>
        </div>
    );
};