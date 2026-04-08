import { useState, useRef } from "react";
import {
    Upload,
    Image as ImageIcon,
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

    // 1. Xử lý Upload và Validate (JPG/PNG, < 5MB)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setError("");

        if (file) {
            // Validate định dạng
            const validTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (!validTypes.includes(file.type)) {
                setError("Báo lỗi định dạng (chỉ hỗ trợ JPG/PNG)");
                return;
            }

            // Validate dung lượng (5MB = 5 * 1024 * 1024 bytes)
            if (file.size > 5 * 1024 * 1024) {
                setError("Báo lỗi dung lượng > 5MB");
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 2. Gọi AI phân tích
    const handleAnalyze = () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        // Giả lập gọi API AI
        setTimeout(() => {
            const success = Math.random() > 0.2; // Giả lập tỉ lệ thành công 80%
            if (success) {
                console.log("Chuyển sang giao diện Kết quả Báo giá AI");
                // Ở đây bạn sẽ dùng navigate('/result') của react-router-dom
                alert("Thành công: Đang chuyển sang trang kết quả!");
            } else {
                setError("Lỗi kết nối AI, vui lòng thử lại");
            }
            setIsAnalyzing(false);
        }, 2000);
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

                            {/* DANH MỤC (Categories) */}
                            <div className="mt-8">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Danh mục hỗ trợ</p>
                                <div className="flex flex-wrap gap-3">
                                    {CATEGORIES.map(cat => (
                                        <span key={cat.id} className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 hover:border-green-500 hover:text-green-600 transition-all cursor-pointer flex items-center gap-2">
                                            {cat.icon} {cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Image Uploader (Mục 1, 2, 3 trong bản vẽ) */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all
                  ${previewUrl ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 bg-gray-50'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />

                                {previewUrl ? (
                                    <div className="text-center">
                                        <img src={previewUrl} alt="Preview" className="max-h-64 rounded-xl shadow-md mb-4 mx-auto" />
                                        <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                                            <CheckCircle size={14} /> Hiển thị ảnh thu nhỏ rõ nét
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-gray-700 font-bold text-lg">Tải hình ảnh không gian</p>
                                        <p className="text-gray-400 text-sm mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                                    </>
                                )}
                            </div>

                            {/* Thông báo lỗi (Thất bại) */}
                            {error && (
                                <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-shake">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {/* Nút bấm (Mục 3) */}
                            <button
                                onClick={handleAnalyze}
                                disabled={!selectedFile || isAnalyzing}
                                className={`mt-6 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                  ${!selectedFile || isAnalyzing
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                            >
                                {isAnalyzing ? (
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Nhận báo giá AI <ArrowRight size={20} /></>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4">
                                Dữ liệu của bạn được phân tích bảo mật bởi hệ thống AI
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECTION 2: BƯỚC THỰC HIỆN */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-12 flex items-center justify-center gap-2">
                        <LayoutGrid className="text-green-600" /> Quy trình hoạt động
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StepCard number="01" title="Tải ảnh" desc="Chọn ảnh không gian cần báo giá" />
                        <StepCard number="02" title="AI Phân tích" desc="Hệ thống tự động bóc tách khối lượng" />
                        <StepCard number="03" title="Nhận kết quả" desc="Xem chi tiết báo giá trong vài giây" />
                    </div>
                </div>
            </section>
        </div>
    );
};

// Component con cho các bước
const StepCard = ({ number, title, desc }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative pt-10">
        <span className="absolute top-4 left-6 text-4xl font-black text-green-100 tracking-tighter">{number}</span>
        <h3 className="text-lg font-bold text-gray-900 relative z-10">{title}</h3>
        <p className="text-gray-500 mt-2 relative z-10">{desc}</p>
    </div>
);