import { useState } from "react";
import { X, Send } from "lucide-react";

export const RatingEditModal = ({ isOpen, onClose, rating, onRatingUpdated }) => {
    const [stars, setStars] = useState(rating?.Stars || 0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [comment, setComment] = useState(rating?.Comment || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (stars === 0) {
            setError("Vui lòng chọn số sao để đánh giá");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

            const response = await fetch(`${API_URL}/update-rating/${rating._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    stars,
                    comment
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                onRatingUpdated?.(result.data);
                onClose();
            } else {
                setError(result.message || "Lỗi khi cập nhật đánh giá");
            }
        } catch (err) {
            setError("Lỗi kết nối: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-on-surface">Chỉnh sửa đánh giá</h2>
                        <p className="text-sm text-on-surface-variant mt-1">Cập nhật đánh giá của bạn</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-surface-variant rounded-full transition-colors"
                    >
                        <X size={24} className="text-on-surface" />
                    </button>
                </div>

                {/* Star Rating */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-on-surface mb-3">
                        Chất lượng dịch vụ (1-5 sao)
                    </label>
                    <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setStars(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <span
                                    className={`text-4xl transition-colors duration-100 ${
                                        star <= (hoveredStar || stars)
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                >
                                    ★
                                </span>
                            </button>
                        ))}
                    </div>
                    {stars > 0 && (
                        <p className="text-center text-sm text-primary mt-2 font-medium">
                            {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][stars]}
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-on-surface mb-2">
                        Bình luận (tùy chọn)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value.slice(0, 300))}
                        placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                        className="w-full border border-outline rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        rows="4"
                    />
                    <p className="text-xs text-on-surface-variant mt-1">
                        {comment.length}/300 ký tự
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg">
                        <p className="text-sm text-error">{error}</p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-lg text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || stars === 0}
                        className="flex-1 py-3 px-4 bg-linear-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-cyan-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 active:scale-95"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Cập nhật
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
