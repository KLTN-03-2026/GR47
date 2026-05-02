import { useState, useEffect } from "react";
import {
    Settings2, Save, Banknote, Percent,
    AlertCircle, CheckCircle2, ShieldAlert,
    Calculator, Info, X
} from "lucide-react";

export const AIPriceConfig = () => {
    const [config, setConfig] = useState({
        basePrice: 0,
        mediumFactor: 0,
        highFactor: 0
    });

    const [status, setStatus] = useState("idle");
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchCurrentConfig = async () => {
            try {
                const token = localStorage.getItem("admin_token");
                const API_URL = import.meta.env.VITE_API_BASE_ADMIN_URL;

                const response = await fetch(`${API_URL}/get-current-ai-config`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const result = await response.json();

                if (response.ok && result.success && result.data) {
                    setConfig({
                        basePrice: result.data.Base_Price,
                        mediumFactor: result.data.Medium_Factor,
                        highFactor: result.data.High_Factor
                    });
                } else if (response.status === 404) {
                    setConfig({ basePrice: 15000, mediumFactor: 1.2, highFactor: 1.5 });
                } else {
                    showToast("error", result.message || "Không thể tải cấu hình AI.");
                }
            } catch (error) {
                console.error("Lỗi tải cấu hình:", error);
                showToast("error", "Lỗi kết nối đến máy chủ.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchCurrentConfig();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig({ ...config, [name]: value });
    };

    const showToast = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 4000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setStatus("loading");

        const base = Number(config.basePrice);
        const med = Number(config.mediumFactor);
        const high = Number(config.highFactor);

        if (!base || !med || !high) {
            showToast("error", "Vui lòng nhập đầy đủ các tham số cấu hình.");
            setStatus("error");
            return;
        }

        if (base <= 0 || med <= 0 || high <= 0) {
            showToast("error", "Các tham số phải là số lớn hơn 0.");
            setStatus("error");
            return;
        }

        if (med >= high || med < 1) {
            showToast("error", "Lỗi logic: Hệ số Trung bình phải ≥ 1.0 và nhỏ hơn Hệ số Cao.");
            setStatus("error");
            return;
        }

        try {
            const token = localStorage.getItem("admin_token");
            const API_URL = import.meta.env.VITE_API_BASE_ADMIN_URL;

            const response = await fetch(`${API_URL}/update-ai-config`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Base_Price: base,
                    Medium_Factor: med,
                    High_Factor: high
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showToast("success", "Cập nhật cấu hình giá AI thành công! Hệ thống đã áp dụng giá mới.");
                setStatus("success");
            } else {
                throw new Error(result.message || "Lỗi cập nhật cấu hình.");
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            showToast("error", error.message || "Lỗi kết nối máy chủ khi lưu cấu hình.");
            setStatus("error");
        }
    };

    const previewArea = 1;
    const safeBase = Number(config.basePrice) || 0;
    const safeMed = Number(config.mediumFactor) || 0;
    const safeHigh = Number(config.highFactor) || 0;

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-blue-600">
                <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="font-bold text-slate-500">Đang tải cấu hình AI...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* Header (Đã fix Tailwind) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Settings2 size={24} className="text-blue-600" /> Cấu hình Giá AI
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Điều chỉnh các tham số thuật toán để AI báo giá cho Khách hàng.</p>
                </div>
            </div>

            {/* Thông báo (Toast) */}
            {notification.message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-bold shadow-sm border animate-shake
          ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                    {notification.type === "error" ? <ShieldAlert size={20} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={20} className="shrink-0 mt-0.5" />}
                    <p>{notification.message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Cột trái: Form cấu hình (Đã fix Tailwind) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-7 p-6">
                    <h2 className="text-base font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">Tham số Báo giá</h2>

                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Mục 1: Giá cơ bản / m2 */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                Giá cơ bản (VNĐ / m²)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Banknote size={18} />
                                </div>
                                {/* Input fix Tailwind */}
                                <input
                                    type="number" name="basePrice"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-900 transition-all"
                                    value={config.basePrice} onChange={handleChange}
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium pl-1">Áp dụng cho phòng có mức độ bừa bộn Thấp (Bình thường).</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Mục 2: Hệ số trung bình */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                    Hệ số Bừa bộn Trung bình
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <X size={18} />
                                    </div>
                                    {/* Input fix Tailwind */}
                                    <input
                                        type="number" step="0.1" name="mediumFactor"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-900 transition-all"
                                        value={config.mediumFactor} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Mục 3: Hệ số cao */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                    Hệ số Bừa bộn Cao
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <X size={18} />
                                    </div>
                                    {/* Input fix Tailwind */}
                                    <input
                                        type="number" step="0.1" name="highFactor"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-900 transition-all"
                                        value={config.highFactor} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mục 4: Button Lưu cấu hình (Đã fix Tailwind) */}
                        <div className="pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === "loading" ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><Save size={18} /> Lưu cấu hình AI</>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Cột phải: Bảng Live Preview */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden text-white">
                        <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex items-center gap-2">
                            <Calculator size={20} className="text-blue-400" />
                            <h3 className="font-bold">Mô phỏng Báo giá AI</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                                <span className="text-sm font-medium text-slate-300">Diện tích giả định:</span>
                                <span className="font-black text-lg text-blue-400">{previewArea} m²</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                    <div>
                                        <p className="text-sm font-bold">Mức độ Thấp</p>
                                        <p className="text-xs text-slate-400">Giá cơ bản x 1.0</p>
                                    </div>
                                    <span className="font-black text-emerald-400">
                                        {(previewArea * safeBase).toLocaleString()}đ
                                    </span>
                                </div>

                                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                    <div>
                                        <p className="text-sm font-bold">Mức độ Trung bình</p>
                                        <p className="text-xs text-slate-400">Giá cơ bản x {safeMed}</p>
                                    </div>
                                    <span className="font-black text-orange-400">
                                        {(previewArea * safeBase * safeMed).toLocaleString()}đ
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold">Mức độ Cao</p>
                                        <p className="text-xs text-slate-400">Giá cơ bản x {safeHigh}</p>
                                    </div>
                                    <span className="font-black text-red-400">
                                        {(previewArea * safeBase * safeHigh).toLocaleString()}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-blue-800 leading-relaxed">
                            <strong>Lưu ý:</strong> Thay đổi cấu hình sẽ lập tức áp dụng cho các đơn đặt hàng mới. Đơn hàng đang Pending hoặc In Progress sẽ giữ nguyên mức giá cũ.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};