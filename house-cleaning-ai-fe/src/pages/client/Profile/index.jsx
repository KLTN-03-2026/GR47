import { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
    User, MapPin, Wallet, Lock, Camera,
    Plus, Trash2, Edit2, CreditCard,
    CheckCircle2, AlertCircle,
    ArrowUpRight, ArrowDownLeft, Calendar, Mail, Phone, Settings, Check, X, ZoomIn, ZoomOut
} from "lucide-react";

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        pixelCrop.width, pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, "image/jpeg");
    });
};

const AvatarCropperModal = ({ isOpen, onClose, imageSrc, onUploadSuccess, showToast, userData }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropAndUpload = async () => {
        try {
            setIsUploading(true);
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const fileToUpload = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });

            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
            const clientId = userData?._id;

            if (!token || !clientId) throw new Error("Auth info not found!");

            const uploadData = new FormData();
            uploadData.append("avatar", fileToUpload);

            const avatarRes = await fetch(`${API_URL}/update-avatar/${clientId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: uploadData
            });

            const avatarResult = await avatarRes.json();

            if (!avatarRes.ok || !avatarResult.success) {
                throw new Error(avatarResult.message || "Upload failed");
            }

            onUploadSuccess(avatarResult.data.avatar);
            showToast("success", avatarResult.message);
            onClose();
        } catch (error) {
            showToast("error", error.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in-up">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-black text-gray-900 text-lg">Căn chỉnh ảnh đại diện</h3>
                    <button onClick={onClose} disabled={isUploading} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all disabled:opacity-50">
                        <X size={20} />
                    </button>
                </div>
                <div className="relative w-full h-[300px] bg-gray-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <ZoomOut size={20} className="text-gray-400" />
                        <input
                            type="range" value={zoom} min={1} max={3} step={0.1}
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <ZoomIn size={20} className="text-gray-400" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} disabled={isUploading} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50">
                            Hủy bỏ
                        </button>
                        <button onClick={handleCropAndUpload} disabled={isUploading} className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70">
                            {isUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Lưu & Tải lên"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ClientProfile = () => {
    const [activeTab, setActiveTab] = useState("PROFILE");
    const [toast, setToast] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const tabs = [
        { id: "PROFILE", label: "Hồ sơ cá nhân", icon: <User size={18} /> },
        { id: "ADDRESS", label: "Sổ địa chỉ", icon: <MapPin size={18} /> },
        { id: "WALLET", label: "Ví CleanAI iPay", icon: <Wallet size={18} /> },
        { id: "SECURITY", label: "Bảo mật", icon: <Lock size={18} /> },
    ];

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleTabChange = (tabId) => {
        if (tabId === activeTab) return;
        setIsAnimating(true);
        setTimeout(() => {
            setActiveTab(tabId);
            setIsAnimating(false);
        }, 200);
    };

    return (
        <div className="min-h-screen bg-[#f8faf9] py-12 px-4 font-sans animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8 relative z-10">
                <aside className="w-full lg:w-[280px] shrink-0">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="p-7 border-b border-gray-100/50">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-green-50 text-green-600 rounded-xl"><Settings size={20} /></div>
                                <h2 className="text-lg font-black text-gray-900 tracking-tight">Cài đặt</h2>
                            </div>
                            <p className="text-xs font-bold text-gray-400 ml-[44px]">Quản lý tài khoản</p>
                        </div>
                        <nav className="p-3 space-y-1">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id} onClick={() => handleTabChange(tab.id)}
                                        className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all relative overflow-hidden group ${isActive ? "text-green-700 bg-green-50/80 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-full"></div>}
                                        <span className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <main className="flex-grow">
                    <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] min-h-[600px] flex flex-col relative overflow-hidden">
                        <div className={`absolute inset-0 bg-white z-20 transition-opacity pointer-events-none flex items-center justify-center ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                        </div>
                        <div className={`flex-grow p-8 sm:p-10 transition-all ${isAnimating ? 'scale-[0.98] blur-sm' : 'scale-100'}`}>
                            {activeTab === "PROFILE" && <ProfileTab showToast={showToast} />}
                            {activeTab === "ADDRESS" && <AddressTab showToast={showToast} />}
                            {activeTab === "WALLET" && <WalletTab showToast={showToast} />}
                            {activeTab === "SECURITY" && <SecurityTab showToast={showToast} />}
                        </div>
                    </div>
                </main>
            </div>

            {toast && (
                <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-fade-in-up z-[100] backdrop-blur-md border ${toast.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400/50' : 'bg-rose-500/90 text-white border-rose-400/50'}`}>
                    <div className="p-1.5 bg-white/20 rounded-full">{toast.type === 'success' ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}</div>
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

const ProfileTab = ({ showToast }) => {
    const fileInputRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [avatar, setAvatar] = useState(null); // 🔥 Khởi tạo null để hiện silhouette
    const [isSaving, setIsSaving] = useState(false);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", gender: "unknown", dob: "" });

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
                const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
                if (!token) throw new Error("Please login again!");
                const response = await fetch(`${API_URL}/get-my-profile`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message);
                const data = result.data;
                setUserData(data);
                setFormData({
                    name: data.Full_Name || "",
                    email: data.Email || "",
                    phone: data.Phone_Number || "Chưa cập nhật",
                    gender: data.Gender || "unknown",
                    dob: data.Birth_Date ? data.Birth_Date.split('T')[0] : ""
                });
                if (data.Avatar) setAvatar(data.Avatar);
            } catch (error) {
                showToast("error", error.message);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        fetchMyProfile();
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return showToast("error", "Ảnh dưới 2MB sếp ơi!");
        setTempImageSrc(URL.createObjectURL(file));
        setCropModalOpen(true);
        e.target.value = null;
    };

    const handleAvatarUploadSuccess = (newAvatarUrl) => {
        setAvatar(newAvatarUrl);
        window.dispatchEvent(new Event("userProfileUpdated"));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) return showToast("error", "Đừng bỏ trống tên và email sếp nhé!");
        setIsSaving(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
            const response = await fetch(`${API_URL}/update-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ Full_Name: formData.name, Email: formData.email, Gender: formData.gender, Birth_Date: formData.dob })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);
            showToast("success", result.message);
            window.dispatchEvent(new Event("userProfileUpdated"));
        } catch (error) {
            showToast("error", error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingProfile) return <div className="flex flex-col items-center justify-center min-h-[400px]"><div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div></div>;

    return (
        <div className="max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Hồ sơ cá nhân</h2>
            <p className="text-gray-500 text-sm mb-10">Quản lý thông tin cá nhân của bạn.</p>
            <div className="flex flex-col sm:flex-row gap-10">
                <div className="flex flex-col items-center shrink-0">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-blue-400 rounded-full blur-[6px] opacity-40 group-hover:opacity-70 transition-opacity"></div>
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-green-400 to-blue-400 relative z-10">
                            {/* 🔥 HIỂN THỊ ICON NẾU CHƯA CÓ ẢNH */}
                            <div className="w-full h-full rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center">
                                {avatar ? (
                                    <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                        <User size={64} strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-1 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <div className="absolute bottom-1 right-1 p-2 bg-gray-900 text-white rounded-full border-[3px] border-white shadow-lg z-20"><Camera size={14} /></div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase mb-2 ml-1"><User size={14} className="text-green-500" /> Họ và Tên</label>
                        <input disabled={isSaving} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase mb-2 ml-1"><Mail size={14} className="text-green-500" /> Email</label>
                        <input disabled={isSaving} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase mb-2 ml-1"><Phone size={14} className="text-green-500" /> Số điện thoại</label>
                        <input disabled className="w-full px-5 py-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 font-bold cursor-not-allowed" value={formData.phone} />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase mb-2 ml-1"><Calendar size={14} className="text-green-500" /> Ngày sinh</label>
                        <input type="date" disabled={isSaving} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none transition-all" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase mb-3 ml-1">Giới tính</label>
                        <div className="flex gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                            {[{ v: "male", l: "Nam" }, { v: "female", l: "Nữ" }, { v: "other", l: "Khác" }].map(g => (
                                <button key={g.v} onClick={() => setFormData({ ...formData, gender: g.v })} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${formData.gender === g.v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{g.l}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-12 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70">
                    {isSaving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"} <CheckCircle2 size={18} />
                </button>
            </div>
            <AvatarCropperModal isOpen={cropModalOpen} onClose={() => setCropModalOpen(false)} imageSrc={tempImageSrc} onUploadSuccess={handleAvatarUploadSuccess} showToast={showToast} userData={userData} />
        </div>
    );
};

const AddressTab = () => (
    <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Sổ địa chỉ</h2>
        <p className="text-gray-500 text-sm mb-10">Địa chỉ dọn dẹp thường dùng.</p>
        <div className="p-8 border-2 border-dashed border-gray-200 rounded-[2rem] text-center">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 font-bold">Chưa có địa chỉ nào được lưu</p>
        </div>
    </div>
);

const WalletTab = () => (
    <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Ví CleanAI iPay</h2>
        <p className="text-gray-500 text-sm mb-10">Thanh toán nhanh chóng.</p>
        <div className="w-full max-w-[400px] h-56 bg-gradient-to-br from-green-600 to-teal-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Số dư khả dụng</p>
            <h3 className="text-4xl font-black">1.250.000đ</h3>
            <div className="absolute bottom-8 left-8"><p className="text-[10px] font-bold opacity-70 uppercase">Account Holder</p><p className="font-bold tracking-widest">NGUYEN VAN A</p></div>
            <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
        </div>
    </div>
);

const SecurityTab = () => (
    <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Bảo mật</h2>
        <p className="text-gray-500 text-sm mb-10">Quản lý mật khẩu.</p>
        <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-200">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="p-3 bg-white rounded-xl shadow-sm"><Lock size={20} /></div>
                <div><h3 className="font-black text-gray-900">Đổi mật khẩu</h3><p className="text-xs text-gray-500">Bảo vệ tài khoản tốt hơn</p></div>
            </div>
            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm">THỰC HIỆN ĐỔI MẬT KHẨU</button>
        </div>
    </div>
);