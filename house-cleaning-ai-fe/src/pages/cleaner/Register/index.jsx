import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    User, Phone, Lock, UploadCloud,
    Check, AlertCircle, ShieldCheck,
    Briefcase, Clock, Banknote, X, CheckCircle2
} from "lucide-react";

export const CleanerRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", phone: "", password: "" });

    const [images, setImages] = useState({ cccd: null, selfie: null });
    const [previews, setPreviews] = useState({ cccd: "", selfie: "" });

    const [status, setStatus] = useState("idle"); // idle | loading | success
    const [error, setError] = useState("");

    const cccdRef = useRef(null);
    const selfieRef = useRef(null);

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024 || !file.type.startsWith("image/")) {
            setError("Dung lượng ảnh quá lớn (>5MB) hoặc sai định dạng.");
            return;
        }

        setError("");
        setImages(prev => ({ ...prev, [type]: file }));
        setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    };

    const removeImage = (type, e) => {
        e.stopPropagation();
        setImages(prev => ({ ...prev, [type]: null }));
        setPreviews(prev => ({ ...prev, [type]: "" }));
        if (type === 'cccd' && cccdRef.current) cccdRef.current.value = "";
        if (type === 'selfie' && selfieRef.current) selfieRef.current.value = "";
    };

    // Xử lý Submit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!images.cccd || !images.selfie) {
            setError("Vui lòng tải lên đầy đủ hình ảnh định danh (CCCD và Ảnh chân dung).");
            return;
        }

        if (!formData.name || !formData.phone || !formData.password) {
            setError("Vui lòng điền đầy đủ thông tin cá nhân.");
            return;
        }

        setError("");
        setStatus("loading");

        // Giả lập API
        setTimeout(() => {
            setStatus("success");
        }, 1500);
    };

    if (status === "success") {
        return (
            <div className="min-h-screen bg-[#f4f7f5] flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-[2rem] p-10 text-center shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-gray-100 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Gửi hồ sơ thành công!</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        Hồ sơ của bạn đang ở trạng thái <strong className="text-orange-500 uppercase tracking-widest">Pending</strong>. Vui lòng chờ Admin duyệt tài khoản trong vòng 24h làm việc.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-4 bg-[#114A2E] text-white font-bold rounded-xl hover:bg-[#0c3822] transition-colors shadow-lg shadow-green-900/10"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex font-sans bg-[#f4f7f5]">

            {/* CỘT TRÁI: Branding & Lợi ích (Màu xanh thẫm) */}
            <div className="hidden lg:flex w-1/2 bg-[#114A2E] relative overflow-hidden flex-col justify-center p-16">

                {/* Abstract Tech Patterns / Background Blur */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a7a4c] rounded-full mix-blend-overlay filter blur-[100px] opacity-30"></div>

                {/* Background Image mô phỏng */}
                <div
                    className="absolute inset-0 opacity-20 mix-blend-luminosity"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>
                <div className="absolute inset-0 bg-[#114A2E]/80"></div>

                {/* Nội dung Cột Trái */}
                <div className="relative z-10 max-w-lg mx-auto w-full">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-green-400 border border-white/20 shadow-xl">
                            <ShieldCheck size={36} strokeWidth={2} />
                        </div>
                        <span className="text-4xl font-black text-white tracking-tight">Partner<span className="text-green-400">App</span></span>
                    </div>

                    <h1 className="text-5xl font-black text-white leading-[1.15] mb-6">Trở thành đối tác<br />chuyên nghiệp.</h1>
                    <p className="text-green-100 text-lg font-medium mb-12 leading-relaxed">Tham gia cộng đồng CleanAI để nhận hàng ngàn công việc mỗi ngày với mức thu nhập hấp dẫn.</p>

                    <div className="space-y-8 pl-4 border-l-2 border-green-500/30">
                        <div className="flex items-center gap-5">
                            <div className="bg-white/10 p-3 rounded-xl text-green-300 backdrop-blur-sm"><Banknote size={24} /></div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Thu nhập hấp dẫn</h3>
                                <p className="text-green-100 text-sm">Nhận 80% giá trị đơn hàng ngay lập tức.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="bg-white/10 p-3 rounded-xl text-green-300 backdrop-blur-sm"><Clock size={24} /></div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Thời gian linh hoạt</h3>
                                <p className="text-green-100 text-sm">Tự do bật/tắt nhận việc theo lịch rảnh.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="bg-white/10 p-3 rounded-xl text-green-300 backdrop-blur-sm"><Briefcase size={24} /></div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Công việc ổn định</h3>
                                <p className="text-green-100 text-sm">Hệ thống AI tự động điều phối đơn hàng.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-16 z-10 text-xs font-medium text-green-300/60">
                    © 2026 CleanAI Partner Platform
                </div>
            </div>

            {/* CỘT PHẢI: Form Đăng ký */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 relative overflow-y-auto">
                <div className="bg-white p-10 sm:p-12 rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.03)] w-full max-w-[500px] mx-auto my-12 border border-gray-100">

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký Đối tác</h2>
                        <p className="text-gray-500 text-sm">Hoàn thiện hồ sơ để bắt đầu nhận việc.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm animate-shake">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Input fields */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-green-700/60">
                                <User size={18} />
                            </div>
                            <input
                                required type="text" placeholder="Họ và Tên"
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-green-700/20 rounded-xl focus:border-green-600 focus:ring-0 outline-none text-sm transition-colors text-gray-800 placeholder:text-gray-400"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-green-700/60">
                                <Phone size={18} />
                            </div>
                            <input
                                required type="tel" placeholder="Số điện thoại"
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-green-700/20 rounded-xl focus:border-green-600 focus:ring-0 outline-none text-sm transition-colors text-gray-800 placeholder:text-gray-400"
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-green-700/60">
                                <Lock size={18} />
                            </div>
                            <input
                                required type="password" placeholder="Mật khẩu"
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-green-700/20 rounded-xl focus:border-green-600 focus:ring-0 outline-none text-sm transition-colors text-gray-800 placeholder:text-gray-400"
                                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        {/* Upload Areas */}
                        <div className="pt-2">
                            <p className="text-xs font-bold text-gray-900 mb-3">Hồ sơ định danh (Bắt buộc)</p>
                            <div className="grid grid-cols-2 gap-4">
                                {/* CCCD */}
                                <div className="text-center">
                                    <input type="file" ref={cccdRef} className="hidden" accept="image/jpeg, image/png" onChange={(e) => handleImageChange(e, 'cccd')} />
                                    <div
                                        onClick={() => cccdRef.current.click()}
                                        className="w-full h-32 bg-[#f4f7f5] rounded-xl border-2 border-dashed border-green-700/20 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 hover:border-green-600 transition-all relative overflow-hidden group"
                                    >
                                        {previews.cccd ? (
                                            <>
                                                <img src={previews.cccd} alt="CCCD" className="w-full h-full object-cover" />
                                                <button type="button" onClick={(e) => removeImage('cccd', e)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud size={24} className="text-green-700/60 group-hover:text-green-600 mb-2 transition-colors" />
                                                <span className="text-[10px] font-bold text-gray-500 group-hover:text-green-700">Ảnh CCCD</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Selfie */}
                                <div className="text-center">
                                    <input type="file" ref={selfieRef} className="hidden" accept="image/jpeg, image/png" onChange={(e) => handleImageChange(e, 'selfie')} />
                                    <div
                                        onClick={() => selfieRef.current.click()}
                                        className="w-full h-32 bg-[#f4f7f5] rounded-xl border-2 border-dashed border-green-700/20 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 hover:border-green-600 transition-all relative overflow-hidden group"
                                    >
                                        {previews.selfie ? (
                                            <>
                                                <img src={previews.selfie} alt="Selfie" className="w-full h-full object-cover" />
                                                <button type="button" onClick={(e) => removeImage('selfie', e)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud size={24} className="text-green-700/60 group-hover:text-green-600 mb-2 transition-colors" />
                                                <span className="text-[10px] font-bold text-gray-500 group-hover:text-green-700">Ảnh chân dung</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 text-center">* Định dạng JPG/PNG, tối đa 5MB.</p>
                        </div>

                        {/* Submit Action */}
                        <div className="pt-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex-shrink-0 flex items-center justify-center">
                                <Check size={24} className="text-green-600" strokeWidth={2.5} />
                            </div>
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="flex-grow py-3.5 bg-[#114A2E] text-white rounded-xl text-sm font-medium hover:bg-[#0c3822] active:scale-[0.98] transition-all flex justify-center items-center shadow-lg shadow-green-900/10"
                            >
                                {status === "loading" ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Gửi hồ sơ đăng ký"
                                )}
                            </button>
                        </div>

                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Đã có tài khoản?{" "}
                            <Link to="/cleaner/login" className="text-[#114A2E] font-bold hover:underline transition-all">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};