import { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useNavigate } from "react-router-dom";
import {
    User, MapPin, Wallet, Lock, Camera,
    Plus, Trash2, Edit2, CheckCircle2, AlertCircle,
    Calendar, Mail, Phone, Settings, Check, X, ZoomIn, ZoomOut, KeyRound, ChevronLeft,
    ArrowDownToLine, ArrowUpFromLine, History, Loader2, CreditCard, Bell, Inbox, CheckCheck
} from "lucide-react";

// ==========================================
// UTILS: XỬ LÝ CẮT ẢNH AVATAR
// ==========================================
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

// ==========================================
// MODAL: CẮT ẢNH AVATAR
// ==========================================
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

// ==========================================
// COMPONENT CHÍNH: LAYOUT HỒ SƠ
// ==========================================
export const ClientProfile = () => {
    const [activeTab, setActiveTab] = useState("PROFILE");
    const [toast, setToast] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const navigate = useNavigate();

    const tabs = [
        { id: "PROFILE", label: "Hồ sơ cá nhân", icon: <User size={18} /> },
        { id: "ADDRESS", label: "Sổ địa chỉ", icon: <MapPin size={18} /> },
        { id: "WALLET", label: "Ví CleanAI iPay", icon: <Wallet size={18} /> },
        { id: "NOTIFICATIONS", label: "Thông Báo", icon: <Bell size={18} /> },
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
                            {activeTab === "NOTIFICATIONS" && (
                                <NotificationTab
                                    showToast={showToast}
                                    onOpenWallet={() => handleTabChange("WALLET")}
                                    navigate={navigate}
                                />
                            )}
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

// ==========================================
// TAB 1: HỒ SƠ CÁ NHÂN
// ==========================================
const ProfileTab = ({ showToast }) => {
    const fileInputRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [avatar, setAvatar] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", gender: "unknown", dob: "" });

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
                const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
                if (!token) throw new Error("Vui lòng đăng nhập lại!");
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
        if (file.size > 2 * 1024 * 1024) return showToast("error", "Ảnh phải nhỏ hơn 2MB!");
        setTempImageSrc(URL.createObjectURL(file));
        setCropModalOpen(true);
        e.target.value = null;
    };

    const handleAvatarUploadSuccess = (newAvatarUrl) => {
        setAvatar(newAvatarUrl);
        window.dispatchEvent(new Event("userProfileUpdated"));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) return showToast("error", "Tên và Email không được để trống!");
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

// ==========================================
// TAB 2: SỔ ĐỊA CHỈ (CÓ API THÊM ĐỊA CHỈ)
// ==========================================
const AddressTab = ({ showToast }) => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newAddressDetail, setNewAddressDetail] = useState("");
    const [isDefaultNew, setIsDefaultNew] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAddresses = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

            if (!token) throw new Error("Phiên đăng nhập đã hết hạn!");

            const response = await fetch(`${API_URL}/get-my-addresses`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Không thể tải danh sách địa chỉ.");
            }

            setAddresses(result.data || []);
        } catch (error) {
            showToast("error", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!newAddressDetail.trim()) return;

        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

            const response = await fetch(`${API_URL}/add-address`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Detail: newAddressDetail, Is_Default: isDefaultNew })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showToast("success", result.message);
                setAddresses(result.data);
                setIsAddModalOpen(false);
                setNewAddressDetail("");
                setIsDefaultNew(false);
            } else {
                throw new Error(result.message || "Không thể thêm địa chỉ.");
            }
        } catch (error) {
            showToast("error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-bold text-sm">Đang tải sổ địa chỉ...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Sổ địa chỉ</h2>
                    <p className="text-gray-500 text-sm">Quản lý các địa chỉ dọn dẹp thường dùng của bạn.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-3.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white font-bold rounded-2xl transition-all flex items-center gap-2 text-sm active:scale-95 shadow-sm"
                >
                    <Plus size={18} /> Thêm địa chỉ mới
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-[2rem] text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-5">
                        <MapPin size={32} className="text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-black text-lg mb-1">Chưa có địa chỉ nào được lưu</p>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">Thêm địa chỉ nhà hoặc nơi làm việc để đặt lịch dọn dẹp nhanh chóng hơn.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {addresses.map((address) => (
                        <div key={address._id} className="p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 rounded-[2rem] transition-all group relative overflow-hidden flex flex-col h-full">
                            {address.Is_Default && (
                                <span className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-sm z-10">
                                    Mặc định
                                </span>
                            )}
                            
                            <div className="flex items-start gap-4 mb-6 flex-grow">
                                <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <MapPin size={22} />
                                </div>
                                <div className="flex-1 pr-6">
                                    <h3 className="font-black text-gray-900 text-base mb-1">Địa chỉ lưu sẵn</h3>
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed line-clamp-3">
                                        {address.Detail}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-50 mt-auto">
                                <button className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2">
                                    <Edit2 size={14} /> Chỉnh sửa
                                </button>
                                <button className="flex-1 py-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2">
                                    <Trash2 size={14} /> Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-[200] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-black text-gray-900 text-lg">Thêm địa chỉ mới</h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)} 
                                disabled={isSubmitting} 
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-all disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddAddress} className="p-6">
                            <div className="mb-5">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2">
                                    Chi tiết địa chỉ <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required rows="4"
                                    placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, thành phố..."
                                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:bg-gray-50 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none text-sm font-bold transition-all resize-none"
                                    value={newAddressDetail}
                                    onChange={(e) => setNewAddressDetail(e.target.value)}
                                    disabled={isSubmitting}
                                ></textarea>
                            </div>
                            
                            <label className="flex items-center gap-3 mb-8 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                                    <input 
                                        type="checkbox" 
                                        className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-lg checked:bg-green-600 checked:border-green-600 transition-all outline-none cursor-pointer"
                                        checked={isDefaultNew}
                                        onChange={(e) => setIsDefaultNew(e.target.checked)}
                                        disabled={isSubmitting}
                                    />
                                    <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                                </div>
                                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                                    Đặt làm địa chỉ mặc định
                                </span>
                            </label>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={isSubmitting || !newAddressDetail.trim()} className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Lưu địa chỉ"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// TAB 3: VÍ CLEANAI IPAY
// ==========================================
const TX_LABELS = {
    DEPOSIT: { title: "Nạp tiền", sign: "+", tone: "text-emerald-600 bg-emerald-50" },
    WITHDRAW: { title: "Rút tiền", sign: "-", tone: "text-rose-600 bg-rose-50" },
    SPEND: { title: "Tiêu / Thanh toán", sign: "-", tone: "text-amber-700 bg-amber-50" },
    REFUND: { title: "Hoàn tiền", sign: "+", tone: "text-sky-700 bg-sky-50" },
};

const WalletTab = ({ showToast }) => {
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [accountHolder, setAccountHolder] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("all");

    const [modal, setModal] = useState(null); // 'deposit' | 'withdraw' | null
    const [amountInput, setAmountInput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchWalletData = async () => {
        const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
        const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
        if (!token) {
            showToast("error", "Vui lòng đăng nhập lại.");
            return;
        }
        const q = filter === "all" ? "" : `?category=${filter}`;
        const [wRes, tRes] = await Promise.all([
            fetch(`${API_URL}/ipay-wallet`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_URL}/ipay-transactions${q}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const wJson = await wRes.json();
        const tJson = await tRes.json();
        if (wRes.ok && wJson.success) {
            setBalance(wJson.data.balance ?? 0);
            setAccountHolder(wJson.data.accountHolder || "");
        } else if (!wRes.ok) {
            showToast("error", wJson.message || "Không tải được số dư ví.");
        }
        if (tRes.ok && tJson.success) {
            setTransactions(tJson.data.transactions || []);
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                await fetchWalletData();
            } catch (e) {
                if (!cancelled) showToast("error", e.message || "Không tải được ví.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleOpenModal = (type) => {
        setAmountInput("");
        setModal(type);
    };

    const handleSubmitModal = async () => {
        const raw = String(amountInput).replace(/\D/g, "");
        const amount = parseInt(raw, 10);
        if (!amount || amount < 10000) {
            showToast("error", "Số tiền tối thiểu 10.000đ.");
            return;
        }
        const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
        const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
        setSubmitting(true);
        try {
            const path = modal === "deposit" ? "ipay-deposit" : "ipay-withdraw";
            const res = await fetch(`${API_URL}/${path}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Thao tác thất bại.");
            setBalance(json.data.balance ?? 0);
            setAccountHolder(json.data.accountHolder || accountHolder);
            showToast("success", json.message);
            setModal(null);
            await fetchWalletData();
        } catch (e) {
            showToast("error", e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filterChips = [
        { id: "all", label: "Tất cả" },
        { id: "DEPOSIT", label: "Nạp" },
        { id: "WITHDRAW", label: "Rút" },
        { id: "SPEND", label: "Tiêu" },
        { id: "REFUND", label: "Hoàn" },
    ];

    return (
        <div className="animate-fade-in max-w-3xl">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Ví CleanAI iPay</h2>
            <p className="text-gray-500 text-sm mb-8">
                Nạp, rút và theo dõi giao dịch ví điện tử nội bộ (demo kết nối backend).
            </p>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                    <p className="text-sm font-bold text-gray-400">Đang tải ví...</p>
                </div>
            ) : (
                <>
                    <div className="w-full max-w-[420px] h-56 bg-gradient-to-br from-green-600 to-teal-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-green-900/20 mb-8">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 relative z-10">Số dư khả dụng</p>
                        <h3 className="text-3xl sm:text-4xl font-black relative z-10 tracking-tight">
                            {balance.toLocaleString("vi-VN")}<span className="text-lg font-bold text-green-100 ml-1">đ</span>
                        </h3>
                        <div className="absolute bottom-8 left-8 right-8 z-10">
                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Account holder</p>
                            <p className="font-black tracking-wide text-sm sm:text-base truncate">
                                {(accountHolder || "KHÁCH HÀNG").toUpperCase()}
                            </p>
                        </div>
                        <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-[420px]">
                        <button
                            type="button"
                            onClick={() => handleOpenModal("deposit")}
                            className="flex-1 py-4 rounded-2xl font-black text-sm bg-gray-900 text-white hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <ArrowDownToLine size={20} /> Nạp tiền
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOpenModal("withdraw")}
                            className="flex-1 py-4 rounded-2xl font-black text-sm bg-white border-2 border-gray-200 text-gray-900 hover:border-green-500 hover:text-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowUpFromLine size={20} /> Rút tiền
                        </button>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <History size={20} className="text-green-600" />
                                <h3 className="font-black text-gray-900">Lịch sử giao dịch</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filterChips.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setFilter(c.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
                                            filter === c.id
                                                ? "bg-green-600 text-white shadow-md"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ul className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
                            {transactions.length === 0 ? (
                                <li className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                                    Chưa có giao dịch trong mục này. Thanh toán đơn bằng iPay sẽ hiển thị ở mục &quot;Tiêu&quot;.
                                </li>
                            ) : (
                                transactions.map((tx) => {
                                    const meta = TX_LABELS[tx.Category] || { title: tx.Category, sign: "", tone: "text-gray-600 bg-gray-50" };
                                    const isIn = ["DEPOSIT", "REFUND"].includes(tx.Category);
                                    const amt = Number(tx.Amount) || 0;
                                    return (
                                        <li key={tx._id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 transition-colors">
                                            <div className={`p-3 rounded-2xl shrink-0 ${meta.tone}`}>
                                                <CreditCard size={20} />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate">{meta.title}</p>
                                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                                    {tx.Description || "—"}{" "}
                                                    <span className="text-gray-300">·</span>{" "}
                                                    {new Date(tx.createdAt).toLocaleString("vi-VN")}
                                                </p>
                                            </div>
                                            <span className={`font-black text-sm shrink-0 ${isIn ? "text-emerald-600" : "text-rose-600"}`}>
                                                {isIn ? "+" : "-"}{amt.toLocaleString("vi-VN")}đ
                                            </span>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                </>
            )}

            {modal && (
                <div className="fixed inset-0 z-[200] bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-black text-gray-900 text-lg">
                                {modal === "deposit" ? "Nạp tiền vào ví" : "Rút tiền về tài khoản"}
                            </h3>
                            <button type="button" onClick={() => !submitting && setModal(null)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <p className="text-sm text-gray-500 font-medium">
                                Số tiền tối thiểu 10.000đ / tối đa 100.000.000đ mỗi lần (số nguyên).
                            </p>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Số tiền (VNĐ)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="VD: 500000"
                                    value={amountInput}
                                    onChange={(e) => setAmountInput(e.target.value.replace(/[^\d]/g, ""))}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                                    disabled={submitting}
                                />
                            </div>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleSubmitModal}
                                className="w-full py-4 rounded-2xl font-black text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/25 disabled:opacity-60 flex justify-center items-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : modal === "deposit" ? "Xác nhận nạp" : "Xác nhận rút"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// TAB 4: THÔNG BÁO
// ==========================================
const NOTIFICATION_TONE = {
    BOOKING: "bg-blue-50 text-blue-600 border-blue-100",
    WALLET: "bg-emerald-50 text-emerald-600 border-emerald-100",
    COMPLAINT: "bg-orange-50 text-orange-600 border-orange-100",
    SYSTEM: "bg-slate-50 text-slate-600 border-slate-100"
};

const NotificationTab = ({ showToast, onOpenWallet, navigate }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
            const response = await fetch(`${API_URL}/notifications?limit=80`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Không thể tải thông báo");
            setNotifications(result.data.notifications || []);
            setUnreadCount(result.data.unreadCount || 0);
        } catch (error) {
            showToast("error", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllAsRead = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
            const response = await fetch(`${API_URL}/notifications/read-all`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Không thể cập nhật thông báo");
            setNotifications((prev) => prev.map((item) => ({ ...item, Is_Read: true })));
            setUnreadCount(0);
            showToast("success", "Đã đánh dấu tất cả thông báo là đã đọc");
        } catch (error) {
            showToast("error", error.message);
        }
    };

    const getNotificationBookingId = (notification) => {
        const bookingId = notification?.Related_Booking_Id;
        if (!bookingId) return null;
        return typeof bookingId === "object" ? bookingId._id : bookingId;
    };

    const getNotificationTarget = (notification) => {
        if (notification?.Type === "WALLET") return { type: "wallet" };

        const bookingId = getNotificationBookingId(notification);
        if (bookingId && ["BOOKING", "COMPLAINT"].includes(notification?.Type)) {
            return { type: "booking", path: `/order-detail/${bookingId}` };
        }

        return null;
    };

    const markNotificationAsRead = async (notification) => {
        if (notification.Is_Read) return;

        setNotifications((prev) =>
            prev.map((item) =>
                item._id === notification._id ? { ...item, Is_Read: true } : item
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
            const response = await fetch(`${API_URL}/notifications/${notification._id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "KhÃ´ng thá»ƒ cáº­p nháº­t thÃ´ng bÃ¡o");
        } catch (error) {
            showToast("error", error.message);
            fetchNotifications();
        }
    };

    const handleNotificationClick = async (notification) => {
        const target = getNotificationTarget(notification);

        await markNotificationAsRead(notification);

        if (target?.type === "wallet") {
            onOpenWallet?.();
            return;
        }

        if (target?.path) navigate(target.path);
    };

    return (
        <div className="animate-fade-in max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Thông Báo</h2>
                    <p className="text-gray-500 text-sm">Theo dõi đơn hàng, ví iPay, hoàn tiền và khiếu nại của bạn.</p>
                </div>
                <button
                    type="button"
                    onClick={markAllAsRead}
                    disabled={!unreadCount}
                    className="px-4 py-3 rounded-2xl bg-gray-900 text-white text-sm font-black hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <CheckCheck size={18} /> Đánh dấu đã đọc
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell size={20} className="text-green-600" />
                        <h3 className="font-black text-gray-900">Tất cả thông báo</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-black">
                        {unreadCount} chưa đọc
                    </span>
                </div>

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-3" />
                        <p className="text-sm font-bold">Đang tải thông báo...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-20 flex flex-col items-center text-gray-400">
                        <Inbox className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="text-sm font-bold">Chưa có thông báo nào.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50 max-h-[620px] overflow-y-auto">
                        {notifications.map((item) => {
                            const target = getNotificationTarget(item);

                            return (
                                <li key={item._id}>
                                    <button
                                        type="button"
                                        onClick={() => handleNotificationClick(item)}
                                        className={`w-full text-left px-6 py-5 flex gap-4 transition-all duration-200 ${item.Is_Read ? "bg-white" : "bg-green-50/35"} ${target ? "cursor-pointer hover:bg-green-50 hover:shadow-sm hover:-translate-y-0.5" : "cursor-default hover:bg-gray-50"}`}
                                    >
                                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${NOTIFICATION_TONE[item.Type] || NOTIFICATION_TONE.SYSTEM}`}>
                                        <Bell size={20} />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="font-black text-gray-900 text-sm">{item.Title}</p>
                                            {!item.Is_Read && <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>}
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium mt-1 leading-relaxed">{item.Message}</p>
                                        <p className="text-xs text-gray-400 font-bold mt-2">
                                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

// ==========================================
// TAB 5: BẢO MẬT (ĐỔI MẬT KHẨU)
// ==========================================
const SecurityTab = ({ showToast }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        otp: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRequestOTP = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            return showToast("error", "Vui lòng nhập đầy đủ thông tin mật khẩu!");
        }
        
        if (formData.newPassword.length < 6) {
            return showToast("error", "Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        if (formData.newPassword !== formData.confirmPassword) {
            return showToast("error", "Mật khẩu xác nhận không khớp!");
        }
        
        if (formData.oldPassword === formData.newPassword) {
            return showToast("error", "Mật khẩu mới không được trùng mật khẩu cũ!");
        }

        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

            const response = await fetch(`${API_URL}/request-change-password-otp`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showToast("success", result.message);
                setStep(2);
                setCountdown(300); 
            } else {
                throw new Error(result.message || "Không thể gửi mã OTP.");
            }
        } catch (error) {
            showToast("error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!formData.otp) return showToast("error", "Vui lòng nhập mã OTP!");

        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

            const response = await fetch(`${API_URL}/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Old_Password: formData.oldPassword,
                    New_Password: formData.newPassword,
                    OTP: formData.otp
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showToast("success", result.message);
                setStep(1);
                setFormData({ oldPassword: "", newPassword: "", confirmPassword: "", otp: "" });
                setCountdown(0);
            } else {
                throw new Error(result.message || "Đổi mật khẩu thất bại.");
            }
        } catch (error) {
            showToast("error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-xl">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Bảo mật</h2>
            <p className="text-gray-500 text-sm mb-10">Quản lý mật khẩu và bảo vệ tài khoản.</p>
            
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Lock size={24} /></div>
                    <div>
                        <h3 className="font-black text-gray-900 text-lg">Đổi mật khẩu</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">Nên đổi mật khẩu định kỳ 3-6 tháng/lần</p>
                    </div>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP} className="space-y-6 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2">Mật khẩu hiện tại</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                                <input
                                    required type="password" name="oldPassword" placeholder="Nhập mật khẩu hiện tại"
                                    value={formData.oldPassword} onChange={handleChange} disabled={isSubmitting}
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none text-sm font-bold transition-all"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2">Mật khẩu mới</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                                <input
                                    required type="password" name="newPassword" placeholder="Ít nhất 6 ký tự" minLength={6}
                                    value={formData.newPassword} onChange={handleChange} disabled={isSubmitting}
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none text-sm font-bold transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2">Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                                <input
                                    required type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu mới" minLength={6}
                                    value={formData.confirmPassword} onChange={handleChange} disabled={isSubmitting}
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none text-sm font-bold transition-all"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" disabled={isSubmitting} 
                            className="w-full py-4 mt-2 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black active:scale-95 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "NHẬN MÃ OTP XÁC NHẬN"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-6 animate-slide-in-right">
                        <button type="button" onClick={() => setStep(1)} className="inline-flex items-center text-xs font-bold text-gray-400 hover:text-green-600 mb-2 transition-colors">
                            <ChevronLeft size={14} /> Quay lại
                        </button>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2 flex justify-between items-center">
                                Mã xác thực OTP
                                <span className={countdown > 0 ? "text-orange-500" : "text-green-600 cursor-pointer hover:underline"} onClick={() => countdown === 0 && handleRequestOTP()}>
                                    {countdown > 0 ? `Gửi lại sau ${Math.floor(countdown/60)}:${(countdown%60).toString().padStart(2, '0')}` : "Gửi lại mã"}
                                </span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><KeyRound size={18} /></div>
                                <input
                                    required type="text" name="otp" maxLength="6" placeholder="Nhập 6 số"
                                    value={formData.otp} onChange={handleChange} disabled={isSubmitting}
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none text-xl font-black tracking-[0.5em] transition-all text-center"
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium mt-3 text-center">Mã OTP đã được gửi về số điện thoại đăng ký của bạn.</p>
                        </div>

                        <button 
                            type="submit" disabled={isSubmitting || formData.otp.length < 6} 
                            className="w-full py-4 mt-2 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 active:scale-95 transition-all shadow-lg shadow-green-600/20 flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "XÁC NHẬN ĐỔI MẬT KHẨU"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
