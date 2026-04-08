import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft, Camera, Star, Award,
    User, Phone, MapPin, Lock,
    CheckCircle2, AlertCircle, Save
} from "lucide-react";

export const CleanerProfile = () => {
    const navigate = useNavigate();

    // Dữ liệu giả lập ban đầu
    const [profileData, setProfileData] = useState({
        name: "Lê Minh Tuấn",
        phone: "0901234567",
        address: "215 Lê Hồng Phong, Phường 4, Quận 5, TP.HCM",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
        rating: 4.9,
        jobsCompleted: 128
    });

    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [phoneError, setPhoneError] = useState(false);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    // Xử lý khi người dùng cố tình click vào ô Số điện thoại
    const handlePhoneClick = () => {
        setPhoneError(true);
        setTimeout(() => setPhoneError(false), 3000);
    };

    // Hoạt động: Lưu cập nhật (Mục 3)
    const handleSave = (e) => {
        e.preventDefault();
        setStatus("loading");

        // Giả lập API lưu dữ liệu (Thành công: Cập nhật DB)
        setTimeout(() => {
            setStatus("success");
            setTimeout(() => setStatus("idle"), 3000); // Ẩn thông báo sau 3s
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] font-sans pb-safe">

            {/* Header */}
            <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                        <ChevronLeft size={20} className="text-gray-700" />
                    </button>
                    <h1 className="text-lg font-black text-gray-900">Hồ sơ cá nhân</h1>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto">

                {/* Mục 1: View - Avatar & Điểm đánh giá */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden text-center">
                    {/* Background pattern */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-green-600/10 rounded-t-3xl"></div>

                    <div className="relative">
                        <div className="relative inline-block mt-4 mb-4">
                            <img
                                src={profileData.avatar}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <button className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full border-2 border-white shadow-sm hover:bg-green-700 transition-colors">
                                <Camera size={14} />
                            </button>
                        </div>

                        <h2 className="text-xl font-black text-gray-900 mb-1">{profileData.name}</h2>
                        <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-6">Đối tác Tiêu chuẩn</p>

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 text-orange-500 mb-1">
                                    <Star size={20} fill="currentColor" />
                                    <span className="text-xl font-black">{profileData.rating}</span>
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Điểm uy tín</p>
                            </div>
                            <div className="flex flex-col items-center border-l border-gray-50">
                                <div className="flex items-center gap-1 text-blue-600 mb-1">
                                    <Award size={20} />
                                    <span className="text-xl font-black">{profileData.jobsCompleted}</span>
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đã hoàn thành</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mục 2: Text box - Form chỉnh sửa thông tin */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Thông tin liên hệ</h3>

                    <form onSubmit={handleSave} className="space-y-5">

                        {/* Họ và Tên */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 pl-1">Họ và Tên</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <User size={18} />
                                </div>
                                <input
                                    required name="name" type="text"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-sm font-bold text-gray-900 transition-all"
                                    value={profileData.name} onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Số điện thoại (Thất bại: Không cho sửa SĐT) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 pl-1">Số điện thoại</label>
                            <div className="relative" onClick={handlePhoneClick}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    readOnly name="phone" type="text"
                                    className="w-full pl-11 pr-10 py-3.5 bg-gray-100 border border-gray-200 rounded-2xl outline-none text-sm font-bold text-gray-500 cursor-not-allowed select-none"
                                    value={profileData.phone}
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={16} />
                                </div>
                            </div>
                            {/* Cảnh báo khi cố tình bấm vào */}
                            {phoneError && (
                                <p className="text-xs font-bold text-red-500 mt-2 ml-1 flex items-center gap-1 animate-fade-in">
                                    <AlertCircle size={14} /> Hệ thống không cho phép tự thay đổi SĐT.
                                </p>
                            )}
                        </div>

                        {/* Địa chỉ */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 pl-1">Địa chỉ thường trú</label>
                            <div className="relative">
                                <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none text-gray-400">
                                    <MapPin size={18} />
                                </div>
                                <textarea
                                    required name="address" rows="3"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-sm font-bold text-gray-900 transition-all resize-none"
                                    value={profileData.address} onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Thông báo cập nhật thành công */}
                        {status === "success" && (
                            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center gap-2 text-green-700 text-sm font-bold animate-fade-in-up">
                                <CheckCircle2 size={20} /> Cập nhật hồ sơ thành công!
                            </div>
                        )}

                        {/* Mục 3: Nút Lưu cập nhật */}
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full mt-4 py-4 bg-green-600 text-white rounded-2xl font-black text-lg hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
                        >
                            {status === "loading" ? (
                                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Lưu thông tin <Save size={20} /></>
                            )}
                        </button>

                    </form>
                </div>
            </main>
        </div>
    );
};