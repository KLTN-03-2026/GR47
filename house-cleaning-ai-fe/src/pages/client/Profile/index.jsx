import { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
    User, MapPin, Wallet, Lock, Camera,
    Plus, Trash2, Edit2, CreditCard,
    CheckCircle2, AlertCircle,
    ArrowUpRight, ArrowDownLeft, Calendar, Mail, Phone, Settings, Check, X, ZoomIn, ZoomOut
} from "lucide-react";

// ==========================================================================
// HELPER CẮT ẢNH
// ==========================================================================
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

// ==========================================================================
// COMPONENT: POPUP CẮT & TẢI ẢNH (AVATAR CROPPER)
// ==========================================================================
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

            if (!token || !clientId) throw new Error("Không tìm thấy thông tin xác thực!");

            const uploadData = new FormData();
            uploadData.append("avatar", fileToUpload);

            const avatarRes = await fetch(`${API_URL}/update-avatar/${clientId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: uploadData
            });

            const avatarResult = await avatarRes.json();

            if (!avatarRes.ok || !avatarResult.success) {
                throw new Error(avatarResult.message || "Lỗi khi tải ảnh lên máy chủ");
            }

            onUploadSuccess(avatarResult.data.avatar);
            showToast("success", "Cập nhật ảnh đại diện thành công!");
            onClose();
        } catch (error) {
            console.error("❌ Lỗi Cập Nhật Avatar:", error);
            showToast("error", error.message || "Có lỗi xảy ra khi đổi ảnh");
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
                            type="range"
                            value={zoom}
                            min={1} max={3} step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <ZoomIn size={20} className="text-gray-400" />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} disabled={isUploading} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50">
                            Hủy bỏ
                        </button>
                        <button onClick={handleCropAndUpload} disabled={isUploading} className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isUploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang xử lý...</> : "Lưu & Tải lên"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================================================
// MAIN COMPONENT: CLIENT PROFILE
// ==========================================================================
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
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8 relative z-10">
                <aside className="w-full lg:w-[280px] shrink-0">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="p-7 border-b border-gray-100/50 bg-gradient-to-br from-white to-gray-50/50">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                                    <Settings size={20} />
                                </div>
                                <h2 className="text-lg font-black text-gray-900 tracking-tight">Cài đặt</h2>
                            </div>
                            <p className="text-xs font-bold text-gray-400 ml-[44px]">Quản lý tài khoản của bạn</p>
                        </div>
                        <nav className="p-3 space-y-1">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden group
                                            ${isActive
                                                ? "text-green-700 bg-green-50/80 shadow-sm"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
                                        <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                            {tab.icon}
                                        </span>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <main className="flex-grow">
                    <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] min-h-[600px] flex flex-col relative overflow-hidden">
                        <div className={`absolute inset-0 bg-white z-20 transition-opacity duration-200 pointer-events-none flex items-center justify-center
                            ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                        </div>

                        <div className={`flex-grow p-8 sm:p-10 transition-all duration-300 ${isAnimating ? 'scale-[0.98] blur-sm' : 'scale-100 blur-0'}`}>
                            {activeTab === "PROFILE" && <ProfileTab showToast={showToast} />}
                            {activeTab === "ADDRESS" && <AddressTab showToast={showToast} />}
                            {activeTab === "WALLET" && <WalletTab showToast={showToast} />}
                            {activeTab === "SECURITY" && <SecurityTab showToast={showToast} />}
                        </div>
                    </div>
                </main>
            </div>

            {toast && (
                <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-fade-in-up z-[100] backdrop-blur-md border
                    ${toast.type === 'success' 
                        ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-emerald-500/20' 
                        : 'bg-rose-500/90 text-white border-rose-400/50 shadow-rose-500/20'}`}>
                    <div className="p-1.5 bg-white/20 rounded-full shrink-0">
                        {toast.type === 'success' ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                    </div>
                    <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// TAB: HỒ SƠ CÁ NHÂN (Đã ghép Logic Call API)
// ==========================================================================
const ProfileTab = ({ showToast }) => {
    const fileInputRef = useRef(null);
    
    const [userData, setUserData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    const [avatar, setAvatar] = useState("https://i.pravatar.cc/150?u=me");
    const [isSaving, setIsSaving] = useState(false);

    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "Nam",
        dob: ""
    });

    // 1. GỌI API LẤY PROFILE NGAY KHI MỞ TAB
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

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Không thể tải hồ sơ");
                }

                const data = result.data;
                setUserData(data);
                
                setFormData({
                    name: data.Full_Name || data.Name || "",
                    email: data.Email || "",
                    phone: data.Phone_Number || data.Phone || "Chưa cập nhật",
                    gender: data.Gender || "Nam",
                    dob: data.Date_Of_Birth ? data.Date_Of_Birth.split('T')[0] : ""
                });

                if (data.Avatar) setAvatar(data.Avatar);

                const storage = localStorage.getItem("client_token") ? localStorage : sessionStorage;
                storage.setItem("client_user", JSON.stringify(data));

            } catch (error) {
                console.error("❌ Lỗi lấy Profile:", error);
                showToast("error", error.message || "Lỗi kết nối máy chủ");
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchMyProfile();
    }, []);

    // 2. XỬ LÝ CHỌN VÀ CẮT ẢNH
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast("error", "Ảnh quá lớn. Vui lòng chọn ảnh dưới 2MB");
            return;
        }

        setTempImageSrc(URL.createObjectURL(file));
        setCropModalOpen(true);
        e.target.value = null; 
    };

    const handleAvatarUploadSuccess = (newAvatarUrl) => {
        setAvatar(newAvatarUrl);
        const updatedUser = { ...userData, Avatar: newAvatarUrl };
        const storage = localStorage.getItem("client_token") ? localStorage : sessionStorage;
        storage.setItem("client_user", JSON.stringify(updatedUser));
        setUserData(updatedUser);

        // KÍCH HOẠT SỰ KIỆN CHO THẰNG HEADER CẬP NHẬT NGAY LẬP TỨC
        window.dispatchEvent(new Event("userProfileUpdated"));
    };

    // 3. GỌI API LƯU THÔNG TIN (TÊN, EMAIL, NGÀY SINH...)
    const handleSave = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.name || !formData.email) {
            showToast("error", "Vui lòng không bỏ trống Họ tên và Email");
            return;
        }
        if (!emailRegex.test(formData.email)) {
            showToast("error", "Email không đúng định dạng hợp lệ");
            return;
        }

        setIsSaving(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

            // Giả định sếp có viết một cái API tên là update-profile bên Backend
            const response = await fetch(`${API_URL}/update-profile`, {
                method: "PUT", // hoặc POST tùy Backend sếp code
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    Full_Name: formData.name,
                    Email: formData.email,
                    Gender: formData.gender,
                    Date_Of_Birth: formData.dob
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Cập nhật hồ sơ thất bại");
            }

            // Update localStorage
            const updatedUser = { ...userData, ...result.data };
            const storage = localStorage.getItem("client_token") ? localStorage : sessionStorage;
            storage.setItem("client_user", JSON.stringify(updatedUser));
            setUserData(updatedUser);

            // KÍCH HOẠT SỰ KIỆN CHO THẰNG HEADER CẬP NHẬT TÊN NGAY LẬP TỨC
            window.dispatchEvent(new Event("userProfileUpdated"));

            showToast("success", "Đã lưu thông tin hồ sơ thành công!");
        } catch (error) {
            console.error("❌ Lỗi Cập nhật Profile:", error);
            showToast("error", error.message || "Có lỗi xảy ra khi lưu thay đổi");
        } finally {
            setIsSaving(false);
        }
    };

    // UI LÚC ĐANG GỌI API GET PROFILE
    if (isLoadingProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold mt-4 animate-pulse uppercase tracking-widest text-xs">Đang lấy dữ liệu hồ sơ...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Hồ sơ cá nhân</h2>
            <p className="text-gray-500 font-medium text-sm mb-10">Quản lý thông tin cá nhân và cách thức liên lạc của bạn.</p>

            <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">
                <div className="flex flex-col items-center shrink-0">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-blue-400 rounded-full blur-[6px] opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-green-400 to-blue-400 relative z-10">
                            <img src={avatar} className="w-full h-full rounded-full object-cover border-4 border-white bg-white" alt="Avatar" />
                            <div className="absolute inset-1 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <div className="absolute bottom-1 right-1 p-2.5 bg-gray-900 text-white rounded-full border-[3px] border-white shadow-lg z-20 group-hover:scale-110 transition-transform">
                            <Camera size={14} />
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png" onChange={handleFileSelect} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 mt-5 uppercase tracking-[0.2em] bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        Đổi ảnh đại diện
                    </p>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            <User size={14} className="text-green-500" /> Họ và Tên
                        </label>
                        <input
                            disabled={isSaving}
                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:opacity-50"
                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            <Mail size={14} className="text-green-500" /> Email
                        </label>
                        <input
                            disabled={isSaving}
                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:opacity-50"
                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            <Phone size={14} className="text-green-500" /> Số điện thoại
                        </label>
                        <div className="relative">
                            <input
                                disabled
                                className="w-full px-5 py-3.5 bg-gray-100/80 border border-gray-200/80 rounded-2xl text-gray-500 font-bold cursor-not-allowed"
                                value={formData.phone}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            <Calendar size={14} className="text-green-500" /> Ngày sinh
                        </label>
                        <input
                            type="date"
                            disabled={isSaving}
                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all disabled:opacity-50"
                            value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-3 ml-1">Giới tính</label>
                        <div className="flex gap-3 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-200">
                            {["Nam", "Nữ", "Khác"].map(g => (
                                <button
                                    key={g}
                                    disabled={isSaving}
                                    onClick={() => setFormData({ ...formData, gender: g })}
                                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50
                                        ${formData.gender === g 
                                            ? 'bg-white text-green-700 shadow-sm border border-gray-100' 
                                            : 'text-gray-500 hover:bg-gray-100/50'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>ĐANG LƯU... <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></>
                    ) : (
                        <>LƯU THAY ĐỔI <CheckCircle2 size={18} /></>
                    )}
                </button>
            </div>

            <AvatarCropperModal
                isOpen={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                imageSrc={tempImageSrc}
                onUploadSuccess={handleAvatarUploadSuccess}
                showToast={showToast}
                userData={userData}
            />
        </div>
    );
};

// ==========================================================================
// CÁC TAB CÒN LẠI (Sổ địa chỉ, Ví, Bảo mật)
// ==========================================================================
const AddressTab = ({ showToast }) => {
    const [addresses, setAddresses] = useState([
        { id: 1, title: "Nhà riêng", detail: "123 Đường ABC, Phường 1, Quận 1, TP.HCM", isDefault: true },
        { id: 2, title: "Công ty", detail: "Tầng 4, Tòa nhà XYZ, 456 Đường DEF, Quận 7, TP.HCM", isDefault: false },
    ]);

    return (
        <div className="max-w-4xl animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Sổ địa chỉ</h2>
                    <p className="text-gray-500 font-medium text-sm">Quản lý các địa chỉ dọn dẹp thường xuyên của bạn.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-sm font-black hover:bg-green-100 transition-all active:scale-95 shadow-sm">
                    <Plus size={18} /> THÊM ĐỊA CHỈ MỚI
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {addresses.map(addr => (
                    <div key={addr.id} className={`relative p-6 rounded-[2rem] border transition-all duration-300 group
                        ${addr.isDefault 
                            ? 'border-green-300 bg-gradient-to-br from-green-50/50 to-white shadow-[0_8px_30px_rgb(34,197,94,0.06)]' 
                            : 'border-gray-200 bg-white hover:border-green-200 hover:shadow-md'}`}>
                        
                        {addr.isDefault && (
                            <div className="absolute top-0 right-8 transform -translate-y-1/2">
                                <span className="bg-green-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Mặc định
                                </span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl mt-1
                                ${addr.isDefault ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 group-hover:bg-green-50 group-hover:text-green-500 transition-colors'}`}>
                                <MapPin size={24} />
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-lg font-black text-gray-900 mb-2">{addr.title}</h4>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed min-h-[40px]">{addr.detail}</p>
                                
                                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100/80">
                                    <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors">
                                        <Edit2 size={14} /> Sửa
                                    </button>
                                    {!addr.isDefault && (
                                        <button className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors">
                                            <Trash2 size={14} /> Xóa
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WalletTab = () => {
    const history = [
        { id: 1, type: "IN", desc: "Nạp tiền qua thẻ tín dụng VNPAY", amount: 1500000, date: "20/03/2026", time: "14:30" },
        { id: 2, type: "OUT", desc: "Thanh toán đơn dọn nhà #BK8821", amount: -450000, date: "18/03/2026", time: "09:00" },
        { id: 3, type: "IN", desc: "Hoàn tiền đơn hủy #BK8810", amount: 200000, date: "15/03/2026", time: "16:45" },
    ];

    return (
        <div className="max-w-4xl animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Ví CleanAI iPay</h2>
            <p className="text-gray-500 font-medium text-sm mb-10">Thanh toán dịch vụ nhanh chóng, không cần tiền mặt.</p>

            <div className="relative w-full max-w-[420px] h-[240px] rounded-[2.5rem] p-8 text-white overflow-hidden shadow-[0_20px_50px_rgba(21,128,61,0.25)] mb-12 transform hover:-translate-y-2 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-800"></div>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 border-[40px] border-white/10 rounded-full"></div>
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-green-100 uppercase tracking-[0.3em] mb-1 opacity-80">Số dư khả dụng</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-[2.5rem] font-black tracking-tight">1.250.000</h3>
                                <span className="text-lg font-bold opacity-80">VNĐ</span>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                            <Wallet size={24} className="text-white" />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-bold text-green-100 uppercase tracking-widest opacity-70 mb-1">Chủ tài khoản</p>
                            <p className="font-bold tracking-widest text-lg">NGUYỄN VĂN A</p>
                        </div>
                        <button className="px-6 py-2.5 bg-white text-green-800 rounded-xl font-black text-xs hover:bg-green-50 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                            <Plus size={16} /> NẠP TIỀN
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.15em]">Lịch sử giao dịch</h4>
                    <button className="text-xs font-bold text-green-600 hover:text-green-700">Xem tất cả</button>
                </div>
                
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                    <div className="divide-y divide-gray-50">
                        {history.map((item) => (
                            <div key={item.id} className="p-5 sm:p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-4 sm:gap-5">
                                    <div className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl
                                        ${item.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {item.type === 'IN' ? <ArrowDownLeft size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-sm sm:text-base mb-1">{item.desc}</h5>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                            <span>{item.date}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`font-black text-base sm:text-lg shrink-0
                                    ${item.type === 'IN' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                    {item.type === 'IN' ? '+' : ''}{item.amount.toLocaleString()}đ
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SecurityTab = ({ showToast }) => {
    const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });

    const handleUpdate = () => {
        if (!passData.old || !passData.new || !passData.confirm) {
            showToast("error", "Vui lòng điền đầy đủ các trường mật khẩu");
            return;
        }
        if (passData.new !== passData.confirm) {
            showToast("error", "Mật khẩu mới và xác nhận không khớp");
            return;
        }
        if (passData.new.length < 6) {
            showToast("error", "Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }
        showToast("success", "Đã đổi mật khẩu an toàn. Vui lòng đăng nhập lại!");
        setPassData({ old: "", new: "", confirm: "" });
    };

    return (
        <div className="max-w-xl animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Bảo mật tài khoản</h2>
            <p className="text-gray-500 font-medium text-sm mb-10">Quản lý mật khẩu và bảo vệ tài khoản của bạn khỏi truy cập trái phép.</p>

            <div className="bg-gray-50/50 border border-gray-200 rounded-[2rem] p-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200/60">
                    <div className="p-3 bg-white text-gray-700 rounded-xl shadow-sm border border-gray-100">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 text-lg">Đổi mật khẩu</h3>
                        <p className="text-xs font-bold text-gray-500">Bạn nên đổi mật khẩu 3 tháng/lần</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">Mật khẩu hiện tại</label>
                        <input
                            type="password" placeholder="Nhập mật khẩu đang dùng"
                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                            value={passData.old} onChange={(e) => setPassData({ ...passData, old: e.target.value })}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">Mật khẩu mới</label>
                            <input
                                type="password" placeholder="Tối thiểu 6 ký tự"
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                                value={passData.new} onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">Xác nhận mật khẩu</label>
                            <input
                                type="password" placeholder="Nhập lại mật khẩu mới"
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                                value={passData.confirm} onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                        <button onClick={handleUpdate} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 active:scale-95 transition-all">
                            CẬP NHẬT MẬT KHẨU
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};