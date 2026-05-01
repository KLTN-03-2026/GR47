import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, MessageSquare, ChevronLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";

export const ClientFeedback = () => {
    const { id } = useParams(); // Lấy mã đơn từ URL
    const navigate = useNavigate();

    const [rating, setRating] = useState(0); // Mục 1: 1-5 sao
    const [comment, setComment] = useState(""); // Mục 2: Nhận xét
    const [hover, setHover] = useState(0); // Hiệu ứng di chuột cho sao
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError("Vui lòng chọn số sao để đánh giá");
            return;
        }

        console.log("Lưu đánh giá:", { orderId: id, rating, comment });
        setSubmitted(true);
        setError("");

        setTimeout(() => {
            navigate("/my-orders");
        }, 2000);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4 text-center">
                <div className="max-w-xs">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Cảm ơn bạn!</h2>
                    <p className="text-gray-500 mt-2">Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn mỗi ngày.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8faf9] py-8 px-4">
            <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

                {/* Header đơn giản */}
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800">Đánh giá đơn hàng #{id}</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* Mục 1: Rating Bar (Chấm điểm) */}
                    <div className="text-center space-y-4">
                        <p className="text-sm font-semibold text-gray-600 italic">Dịch vụ dọn dẹp hôm nay thế nào?</p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="transition-transform active:scale-90"
                                    onClick={() => { setRating(star); setError(""); }}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <Star
                                        size={42}
                                        className={`transition-colors ${star <= (hover || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-200"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {error && (
                            <p className="text-red-500 text-xs font-bold flex items-center justify-center gap-1 animate-pulse">
                                <AlertCircle size={14} /> {error}
                            </p>
                        )}
                    </div>

                    <hr className="border-gray-50" />

                    {/* Mục 2: Textbox (Nhận xét/Góp ý) */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-700 text-sm font-bold">
                            <MessageSquare size={18} className="text-green-600" />
                            <span>Góp ý thêm (không bắt buộc)</span>
                        </div>
                        <textarea
                            rows="4"
                            placeholder="Chia sẻ thêm cảm nhận của bạn về Cleaner hoặc chất lượng dọn dẹp..."
                            className="w-full p-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {/* Mục 3: Button (Gửi đánh giá) */}
                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            Gửi đánh giá <Send size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/my-orders")}
                            className="w-full py-3 text-sm font-medium text-gray-400 hover:text-gray-600"
                        >
                            Để sau
                        </button>
                    </div>

                </form>

                <div className="p-4 bg-gray-50 text-center text-[11px] text-gray-400 uppercase tracking-widest font-bold border-t border-gray-100">
                    Ý kiến của bạn giúp cộng đồng chọn Cleaner tốt hơn
                </div>
            </div>
        </div>
    );
};