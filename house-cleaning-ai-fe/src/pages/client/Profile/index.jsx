import { useState, useRef } from "react";
import {
    User, MapPin, Wallet, Lock, Camera,
    Plus, Trash2, Edit2, CreditCard,
    CheckCircle2, AlertCircle, ChevronRight,
    ArrowUpRight, ArrowDownLeft
} from "lucide-react";

export const ClientProfile = () => {
    const [activeTab, setActiveTab] = useState("PROFILE"); // PROFILE, ADDRESS, WALLET, SECURITY
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

    // Tabs định nghĩa
    const tabs = [
        { id: "PROFILE", label: "Hồ sơ cá nhân", icon: <User size={20} /> },
        { id: "ADDRESS", label: "Số địa chỉ", icon: <MapPin size={20} /> },
        { id: "WALLET", label: "Ví CleanAI iPay", icon: <Wallet size={20} /> },
        { id: "SECURITY", label: "Bảo mật", icon: <Lock size={20} /> },
    ];

    // Hàm hiện Toast thông báo
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] py-10 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

                {/* SIDEBAR TABS - Tận dụng chiều ngang */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-50">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cài đặt tài khoản</p>
                        </div>
                        <nav className="p-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all
                    ${activeTab === tab.id
                                            ? "bg-green-600 text-white shadow-md shadow-green-100"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-green-600"}`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-grow bg-white border border-gray-200 rounded-xl shadow-sm min-h-[600px] flex flex-col">
                    {activeTab === "PROFILE" && <ProfileTab showToast={showToast} />}
                    {activeTab === "ADDRESS" && <AddressTab showToast={showToast} />}
                    {activeTab === "WALLET" && <WalletTab showToast={showToast} />}
                    {activeTab === "SECURITY" && <SecurityTab showToast={showToast} />}
                </main>

            </div>

            {/* TOAST NOTIFICATION */}
            {toast && (
                <div className={`fixed bottom-10 right-10 flex items-center gap-2 px-6 py-4 rounded-xl shadow-2xl border animate-fade-in-up z-[100]
          ${toast.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-red-600 text-white border-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

/* ==========================================================================
   I. TAB HỒ SƠ CÁ NHÂN
   ========================================================================== */
const ProfileTab = ({ showToast }) => {
    const fileInputRef = useRef(null);
    const [avatar, setAvatar] = useState("https://i.pravatar.cc/150?u=me");
    const [formData, setFormData] = useState({
        name: "Nguyễn Văn A",
        email: "vana@gmail.com",
        phone: "0987654321",
        gender: "Nam",
        dob: "1995-05-20"
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 1024 * 1024) {
            alert("Ảnh quá lớn (Max 1MB)");
            return;
        }
        if (file) setAvatar(URL.createObjectURL(file));
    };

    const handleSave = () => {
        // Validate email (Mục Hoạt động)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.name || !formData.email) {
            showToast("error", "Lỗi: Bỏ trống trường bắt buộc");
            return;
        }
        if (!emailRegex.test(formData.email)) {
            showToast("error", "Email sai định dạng");
            return;
        }
        showToast("success", "Cập nhật thành công");
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-8">Hồ sơ của tôi</h2>

            {/* 1. Avatar Upload */}
            <div className="flex flex-col items-center mb-10 group">
                <div className="relative">
                    <img src={avatar} className="w-28 h-28 rounded-full object-cover border-4 border-gray-50 shadow-sm" alt="Avatar" />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full border-2 border-white hover:bg-green-700 transition-all shadow-md"
                    >
                        <Camera size={16} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest">JPG/PNG (Max 1MB)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. Họ tên */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Họ và Tên</label>
                    <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-green-500 outline-none text-sm font-medium"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                {/* 2. Email */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Email</label>
                    <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-green-500 outline-none text-sm font-medium"
                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                {/* 3. Số điện thoại (Disable) */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Số điện thoại</label>
                    <div className="flex gap-2">
                        <input
                            disabled
                            className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 text-sm font-medium"
                            value={formData.phone}
                        />
                        <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg text-xs font-bold hover:bg-green-50">Thay đổi</button>
                    </div>
                </div>
                {/* 5. Ngày sinh */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Ngày sinh</label>
                    <input
                        type="date"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-green-500 outline-none text-sm font-medium"
                        value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                </div>
                {/* 4. Giới tính */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Giới tính</label>
                    <div className="flex gap-6 mt-3">
                        {["Nam", "Nữ", "Khác"].map(g => (
                            <label key={g} className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-600">
                                <input
                                    type="radio" name="gender" checked={formData.gender === g}
                                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                    onChange={() => setFormData({ ...formData, gender: g })}
                                /> {g}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <button onClick={handleSave} className="mt-10 px-10 py-3 bg-green-600 text-white rounded-lg font-bold shadow-sm hover:bg-green-700 transition-all">
                Lưu thay đổi
            </button>
        </div>
    );
};

/* ==========================================================================
   II. TAB SỔ ĐỊA CHỈ
   ========================================================================== */
const AddressTab = ({ showToast }) => {
    const [addresses, setAddresses] = useState([
        { id: 1, title: "Nhà riêng", detail: "123 Đường ABC, Quận 1, TP.HCM", isDefault: true },
        { id: 2, title: "Công ty", detail: "456 Tòa nhà XYZ, Quận 7, TP.HCM", isDefault: false },
    ]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800">Sổ địa chỉ</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all">
                    <Plus size={16} /> Thêm địa chỉ mới
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {addresses.map(addr => (
                    <div key={addr.id} className={`p-5 rounded-xl border flex justify-between items-start transition-all
            ${addr.isDefault ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                        <div className="flex gap-4">
                            <div className={`p-3 rounded-lg ${addr.isDefault ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900">{addr.title}</h4>
                                    {addr.isDefault && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded">Mặc định</span>}
                                </div>
                                <p className="text-sm text-gray-500">{addr.detail}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ==========================================================================
   III. TAB VÍ CLEANAI IPAY
   ========================================================================== */
const WalletTab = () => {
    const history = [
        { id: 1, type: "IN", desc: "Nạp tiền qua VNPAY", amount: 500000, date: "20/03/2026 14:30" },
        { id: 2, type: "OUT", desc: "Thanh toán đơn dọn dẹp #BK001", amount: -450000, date: "18/03/2026 09:00" },
    ];

    return (
        <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-8 font-sans">Ví điện tử CleanAI iPay</h2>

            {/* 10. Số dư khả dụng */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-xl shadow-green-900/10 mb-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-green-100 uppercase tracking-[0.2em] mb-2">Số dư hiện tại</p>
                        <h3 className="text-4xl font-black">50.000 <span className="text-lg font-medium">VNĐ</span></h3>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                        <CreditCard size={32} />
                    </div>
                </div>
                {/* 11. Nút nạp tiền */}
                <button className="mt-8 px-8 py-3 bg-white text-green-700 rounded-xl font-bold text-sm shadow-lg hover:bg-green-50 transition-all flex items-center gap-2">
                    <Plus size={18} /> Nạp thêm tiền
                </button>
            </div>

            {/* 12. Lịch sử giao dịch */}
            <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Lịch sử giao dịch</h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Mô tả</th>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4 text-right">Biến động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.map(item => (
                                <tr key={item.id} className="text-sm">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${item.type === 'IN' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                                {item.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <span className="font-bold text-gray-700">{item.desc}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-medium">{item.date}</td>
                                    <td className={`px-6 py-4 text-right font-black ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}đ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

/* ==========================================================================
   IV. TAB BẢO MẬT
   ========================================================================== */
const SecurityTab = ({ showToast }) => {
    const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });

    const handleUpdate = () => {
        if (passData.new !== passData.confirm) {
            showToast("error", "Mật khẩu mới không khớp nhau");
            return;
        }
        if (passData.new.length < 6) {
            showToast("error", "Mật khẩu phải có tối thiểu 6 ký tự");
            return;
        }
        showToast("success", "Cập nhật mật khẩu thành công. Vui lòng đăng nhập lại.");
    };

    return (
        <div className="p-8 max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-8">Thay đổi mật khẩu</h2>
            <div className="space-y-6">
                {/* 13. Mật khẩu hiện tại */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Mật khẩu hiện tại</label>
                    <input
                        type="password" placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-green-500 outline-none text-sm"
                        value={passData.old} onChange={(e) => setPassData({ ...passData, old: e.target.value })}
                    />
                </div>
                {/* 14. Mật khẩu mới */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Mật khẩu mới</label>
                    <input
                        type="password" placeholder="Tối thiểu 6 ký tự, có chữ và số"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-green-500 outline-none text-sm"
                        value={passData.new} onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                    />
                </div>
                {/* 15. Xác nhận mật khẩu mới */}
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 ml-1">Xác nhận mật khẩu mới</label>
                    <input
                        type="password" placeholder="Nhập lại mật khẩu mới"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-green-500 outline-none text-sm"
                        value={passData.confirm} onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                    />
                </div>
                {/* 16. Button cập nhật */}
                <button onClick={handleUpdate} className="w-full px-10 py-3 bg-gray-900 text-white rounded-lg font-bold shadow-sm hover:bg-black transition-all">
                    Cập nhật mật khẩu
                </button>
            </div>
        </div>
    );
};