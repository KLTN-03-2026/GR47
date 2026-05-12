import { useState, useEffect } from "react";
import { Edit2, Trash2, AlertCircle, Send } from "lucide-react";
import { RatingEditModal } from "./RatingEditModal";

const getApiBase = (variant) =>
    variant === "cleaner"
        ? import.meta.env.VITE_API_BASE_CLEANER_URL
        : import.meta.env.VITE_API_BASE_CLIENT_URL;

const getToken = (variant) => {
    const key = variant === "cleaner" ? "cleaner_token" : "client_token";
    return localStorage.getItem(key) || sessionStorage.getItem(key);
};

export const RatingDisplay = ({
    rating,
    onRatingUpdated,
    onRatingDeleted,
    variant = "client",
    bookingId,
    onReplyPosted,
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [replyText, setReplyText] = useState("");
    const [isReplySubmitting, setIsReplySubmitting] = useState(false);
    const [replyError, setReplyError] = useState("");

    useEffect(() => {
        if (variant === "cleaner" && rating) {
            setReplyText(rating.Cleaner_Reply || "");
        }
    }, [variant, rating?._id, rating?.Cleaner_Reply]);

    if (!rating) return null;

    const createdDate = new Date(rating.Created_Date);
    const now = new Date();
    const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    const canEdit = variant === "client" && daysDiff < 7;
    const daysLeft = 7 - daysDiff;

    const clientName =
        rating.Client_Id?.Full_Name || rating.Client_Id?.name || "Khách hàng";

    const handleDeleteRating = async () => {
        setIsDeleting(true);
        try {
            const API_URL = getApiBase("client");
            const token = getToken("client");

            const response = await fetch(`${API_URL}/delete-rating/${rating._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                onRatingDeleted?.();
            } else {
                alert(result.message || "Lỗi khi xóa đánh giá");
            }
        } catch (err) {
            alert("Lỗi kết nối: " + err.message);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleSubmitReply = async () => {
        if (!bookingId) {
            setReplyError("Thiếu mã đơn hàng");
            return;
        }
        const trimmed = replyText.trim();
        if (!trimmed) {
            setReplyError("Vui lòng nhập nội dung phản hồi");
            return;
        }
        if (trimmed.length > 500) {
            setReplyError("Tối đa 500 ký tự");
            return;
        }

        setIsReplySubmitting(true);
        setReplyError("");
        try {
            const API_URL = getApiBase("cleaner");
            const token = getToken("cleaner");
            const response = await fetch(`${API_URL}/reply-rating/${bookingId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reply: trimmed }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                onReplyPosted?.(result.data);
            } else {
                setReplyError(result.message || "Không gửi được phản hồi");
            }
        } catch (err) {
            setReplyError("Lỗi kết nối: " + err.message);
        } finally {
            setIsReplySubmitting(false);
        }
    };

    const isCleanerView = variant === "cleaner";

    return (
        <>
            <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-on-surface">
                            {isCleanerView ? "Đánh giá từ khách hàng" : "Đánh giá của bạn"}
                        </h3>
                        {isCleanerView && (
                            <p className="text-sm font-medium text-on-surface-variant mt-1">
                                {clientName}
                            </p>
                        )}
                        <p className="text-xs text-on-surface-variant mt-1">
                            {new Date(rating.Created_Date).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>

                    {canEdit && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(true)}
                                className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                                title="Chỉnh sửa đánh giá"
                            >
                                <Edit2 size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2 hover:bg-error/10 rounded-lg transition-colors text-error"
                                title="Xóa đánh giá"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`text-2xl ${
                                        star <= rating.Stars ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="text-sm font-medium text-on-surface">
                            {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][rating.Stars]}
                        </span>
                    </div>
                </div>

                {rating.Comment && (
                    <div className="mb-4">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                            {isCleanerView ? "Nhận xét của khách" : "Bình luận"}
                        </p>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{rating.Comment}</p>
                    </div>
                )}

                {!isCleanerView && rating.Cleaner_Reply && (
                    <div className="mb-4 p-4 rounded-lg bg-emerald-50/80 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">
                            Phản hồi từ thợ dọn
                        </p>
                        <p className="text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">
                            {rating.Cleaner_Reply}
                        </p>
                        {rating.Cleaner_Reply_Date && (
                            <p className="text-[10px] text-emerald-700 mt-2 font-medium">
                                {new Date(rating.Cleaner_Reply_Date).toLocaleString("vi-VN")}
                            </p>
                        )}
                    </div>
                )}

                {isCleanerView && (
                    <div className="mt-4 pt-4 border-t border-outline-variant space-y-3">
                        {rating.Cleaner_Reply && (
                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    Phản hồi của bạn (đã gửi)
                                </p>
                                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                    {rating.Cleaner_Reply}
                                </p>
                                {rating.Cleaner_Reply_Date && (
                                    <p className="text-[10px] text-slate-400 mt-2">
                                        {new Date(rating.Cleaner_Reply_Date).toLocaleString("vi-VN")}
                                    </p>
                                )}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-on-surface mb-2">
                                {rating.Cleaner_Reply ? "Cập nhật phản hồi" : "Trả lời khách hàng"}
                            </label>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value.slice(0, 500))}
                                placeholder="Viết lời cảm ơn hoặc giải thích ngắn gọn..."
                                rows={4}
                                className="w-full border border-outline rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                            <p className="text-xs text-on-surface-variant mt-1">{replyText.length}/500</p>
                        </div>
                        {replyError && (
                            <div className="p-3 bg-error/10 border border-error rounded-lg text-sm text-error">
                                {replyError}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handleSubmitReply}
                            disabled={isReplySubmitting || !replyText.trim()}
                            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isReplySubmitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                            {rating.Cleaner_Reply ? "Cập nhật phản hồi" : "Gửi phản hồi"}
                        </button>
                    </div>
                )}

                {!isCleanerView && canEdit && (
                    <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                        <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
                        <p className="text-xs text-warning font-medium">
                            Bạn có thể chỉnh sửa đánh giá trong {daysLeft} ngày nữa
                        </p>
                    </div>
                )}

                {!isCleanerView && !canEdit && (
                    <div className="flex items-start gap-2 p-3 bg-on-surface-variant/10 rounded-lg">
                        <AlertCircle size={16} className="text-on-surface-variant mt-0.5 shrink-0" />
                        <p className="text-xs text-on-surface-variant font-medium">
                            Đánh giá này đã được khóa và không thể chỉnh sửa
                        </p>
                    </div>
                )}
            </div>

            <RatingEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                rating={rating}
                onRatingUpdated={onRatingUpdated}
            />

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-300">
                        <h3 className="text-lg font-bold text-on-surface mb-2">Xác nhận xóa đánh giá?</h3>
                        <p className="text-sm text-on-surface-variant mb-6">
                            Hành động này không thể hoàn tác. Đánh giá của bạn sẽ bị xóa vĩnh viễn.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 py-2 px-4 border border-outline rounded-lg text-on-surface font-medium hover:bg-surface-variant transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteRating}
                                disabled={isDeleting}
                                className="flex-1 py-2 px-4 bg-error text-white rounded-lg font-medium hover:bg-error-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Xóa...
                                    </>
                                ) : (
                                    "Xóa đánh giá"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
