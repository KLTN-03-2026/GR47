import { useState, useRef } from "react";
import {
    Upload,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    LayoutGrid,
    Sparkles
} from "lucide-react";

// Dữ liệu danh mục mẫu
const CATEGORIES = [
    { id: 1, name: "Phòng khách", icon: "🏠" },
    { id: 2, name: "Phòng ngủ", icon: "🛏️" },
    { id: 3, name: "Nhà bếp", icon: "🍳" },
    { id: 4, name: "Văn phòng", icon: "💼" },
    { id: 5, name: "Sân vườn", icon: "🌿" },
];

export const HomePage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    // 1. XỬ LÝ KHI NGƯỜI DÙNG CHỌN ẢNH
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setError(""); // Xóa lỗi cũ nếu có

        if (file) {
            console.log("📸 Đã chọn file:", file.name, "| Size:", (file.size / 1024 / 1024).toFixed(2), "MB");

            // Validate định dạng
            const validTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (!validTypes.includes(file.type)) {
                setError("Chỉ hỗ trợ định dạng ảnh JPG hoặc PNG.");
                setSelectedFile(null);
                setPreviewUrl(null);
                return;
            }

            // Validate dung lượng (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("Dung lượng ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
                setSelectedFile(null);
                setPreviewUrl(null);
                return;
            }

            // Lưu file vào State để chuẩn bị gửi đi
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 2. GỬI ẢNH LÊN BACKEND (GỌI API THẬT)
    const handleAnalyze = async () => {
        // Kiểm tra an toàn: Nếu chưa có file thì chặn lại
        if (!selectedFile) {
            setError("Vui lòng tải lên một bức ảnh trước khi phân tích.");
            return;
        }

        setIsAnalyzing(true);
        setError("");

        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;

            // Lấy token xác thực từ LocalStorage hoặc SessionStorage
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

            if (!token) {
                throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập để sử dụng tính năng này.");
            }

            // Đóng gói file vào FormData
            const formData = new FormData();

            // SỬA LỖI 1: Tên field đổi thành "room_image" khớp với Backend (upload.single('room_image'))
            formData.append("room_image", selectedFile);

            console.log("🚀 Bắt đầu gửi file lên Backend...");

            // Gọi API bằng fetch
            const response = await fetch(`${API_URL}/analyze-room-image`, {
                method: "POST",
                headers: {
                    // SỬA LỖI 2: Đính kèm Token xác thực
                    "Authorization": `Bearer ${token}`
                    // LƯU Ý: Tuyệt đối không set Content-Type ở đây khi dùng FormData
                },
                body: formData,
            });

            // Lấy kết quả từ Server
            const result = await response.json();
            console.log("📥 Phản hồi từ Server:", result);

            if (!response.ok || !result.success) {
                // Nếu lỗi 401, có thể token hết hạn
                if (response.status === 401) {
                    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                }
                throw new Error(result.message || "Lỗi từ máy chủ khi phân tích ảnh.");
            }

            // THÀNH CÔNG
            alert("🎉 AI Đã Phân Tích Thành Công!\n\n" + JSON.stringify(result.data, null, 4));

        } catch (err) {
            console.error("❌ Lỗi Call API:", err);
            setError(err.message || "Không thể kết nối đến AI. Vui lòng thử lại sau.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* SECTION 1: HERO & UPLOADER */}
            <section className="relative py-16 lg:py-24 overflow-hidden">
                <div className="absolute inset-0 -z-10 opacity-10">
                    <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-green-300 blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left: Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-6">
                                <Sparkles size={16} /> AI Nâng tầm không gian
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                                Tải ảnh không gian <br />
                                <span className="text-green-600">Nhận báo giá AI</span> ngay
                            </h1>
                            <p className="mt-6 text-lg text-gray-600">
                                Chỉ cần tải lên hình ảnh căn phòng của bạn, hệ thống Trí tuệ nhân tạo sẽ phân tích và đưa ra báo giá thiết kế chính xác trong giây lát.
                            </p>

                            {/* DANH MỤC */}
                            <div className="mt-8">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Danh mục hỗ trợ</p>
                                <div className="flex flex-wrap gap-3">
                                    {CATEGORIES.map(cat => (
                                        <span key={cat.id} className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 hover:border-green-500 hover:text-green-600 transition-all cursor-pointer flex items-center gap-2 font-medium">
                                            {cat.icon} {cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Image Uploader */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                            <div
                                onClick={() => !isAnalyzing && fileInputRef.current.click()}
                                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all
                                ${isAnalyzing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                                ${previewUrl ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 bg-gray-50'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/jpeg, image/png, image/jpg"
                                    onChange={handleFileChange}
                                    disabled={isAnalyzing}
                                />

                                {previewUrl ? (
                                    <div className="text-center w-full relative">
                                        <img src={previewUrl} alt="Preview" className="max-h-64 rounded-xl shadow-md mb-4 mx-auto object-contain" />
                                        <p className="text-sm text-green-600 font-bold flex items-center justify-center gap-1">
                                            <CheckCircle size={16} /> Đã nhận diện hình ảnh
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2 hover:text-green-600 underline" onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isAnalyzing) fileInputRef.current.click();
                                        }}>
                                            Bấm vào đây để đổi ảnh khác
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-gray-700 font-bold text-lg">Tải hình ảnh không gian</p>
                                        <p className="text-gray-400 text-sm mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                                    </>
                                )}
                            </div>

                            {/* Báo lỗi */}
                            {error && (
                                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-2 animate-shake">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Nút gửi */}
                            <button
                                onClick={handleAnalyze}
                                disabled={!selectedFile || isAnalyzing}
                                className={`mt-6 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${!selectedFile || isAnalyzing
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-green-600 hover:bg-green-700 active:scale-[0.98]'}`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Hệ thống AI đang quét hình ảnh...
                                    </>
                                ) : (
                                    <>Nhận báo giá AI ngay lập tức <ArrowRight size={20} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: BƯỚC THỰC HIỆN */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-12 flex items-center justify-center gap-2">
                        <LayoutGrid className="text-green-600" /> Quy trình hoạt động
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StepCard number="01" title="Tải ảnh lên" desc="Chụp hoặc chọn ảnh căn phòng bạn cần dọn dẹp" />
                        <StepCard number="02" title="AI Phân tích" desc="Gemini nhận diện diện tích và mức độ bừa bộn" />
                        <StepCard number="03" title="Báo giá chuẩn" desc="Nhận ngay kết quả và tiến hành đặt lịch" />
                    </div>
                </div>
            </section>
        </div>
    );
};

// Component con cho các bước
const StepCard = ({ number, title, desc }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative pt-10 hover:shadow-md transition-shadow">
        <span className="absolute top-4 left-6 text-4xl font-black text-green-50 tracking-tighter">{number}</span>
        <h3 className="text-lg font-bold text-gray-900 relative z-10">{title}</h3>
        <p className="text-gray-500 mt-2 relative z-10 font-medium">{desc}</p>
    </div>
);