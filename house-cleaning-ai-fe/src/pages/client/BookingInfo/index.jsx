import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronDown,
  CircleDot,
  Circle
} from "lucide-react";

export const ClientBookingInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const aiResultData = location.state?.aiData;

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    notes: "",
    voucher: "",
  });

  // STATE QUẢN LÝ ĐỊA CHỈ MỚI
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressMode, setAddressMode] = useState("new"); // 'saved' hoặc 'new'
  const [selectedSavedAddress, setSelectedSavedAddress] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
    if (!aiResultData) navigate("/", { replace: true });
  }, [aiResultData, navigate]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
        const response = await fetch(`${API_URL}/get-my-addresses`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok && result.success && result.data.length > 0) {
          const addresses = result.data;
          setSavedAddresses(addresses);
          setAddressMode("saved"); // Tự động bật chế độ chọn từ Sổ

          // Ưu tiên chọn địa chỉ mặc định, nếu không có thì lấy cái đầu tiên
          const defaultAddress = addresses.find(addr => addr.Is_Default) || addresses[0];
          setSelectedSavedAddress(defaultAddress.Detail);
        }
      } catch (error) {
        console.error("Lỗi khi tải sổ địa chỉ:", error);
      }
    };

    fetchAddresses();
  }, []);

  const initialPrice = aiResultData?.totalPrice || 0;

  const handleApplyVoucher = () => {
    if (formData.voucher.toUpperCase() === "MYAPP2026") {
      setAppliedVoucher({ code: "MYAPP2026", discount: 50000 });
      setErrors((prev) => ({ ...prev, voucher: "" }));
    } else {
      setErrors((prev) => ({ ...prev, voucher: "Mã không hợp lệ" }));
      setAppliedVoucher(null);
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setErrors({});

    // Chốt địa chỉ dựa theo chế độ khách đang chọn
    const finalAddress = addressMode === "saved" ? selectedSavedAddress : customAddress;

    if (!finalAddress.trim()) {
      setErrors({ address: "Vui lòng cung cấp địa chỉ để Cleaner tìm đến bạn" });
      return;
    }
    if (!formData.date || !formData.time) {
      setErrors({ time: "Vui lòng chọn đầy đủ ngày và giờ bắt đầu làm việc" });
      return;
    }

    const finalPrice = initialPrice - (appliedVoucher?.discount || 0);

    const bookingPayload = {
      ...formData,
      address: finalAddress, // Nhét địa chỉ đã chốt vào payload
      finalPrice,
      initialPrice,
      aiResultData,
    };

    navigate("/payment", { state: { bookingPayload } });
  };

  const finalPrice = initialPrice - (appliedVoucher?.discount || 0);

  if (!aiResultData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div data-aos="fade-down">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
          >
            <ChevronLeft size={18} /> Quay lại kết quả AI
          </button>

          <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">
            Thông tin đặt lịch
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM INPUT */}
          <div className="lg:col-span-8 space-y-6" data-aos="fade-right">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-10">
              
              <section data-aos="fade-up" data-aos-delay="100">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <Calendar className="text-green-600" size={20} /> 1. Thời gian làm việc
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-700"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                  <input
                    type="time"
                    className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${errors.time ? "border-red-500" : "border-gray-100"} focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-700`}
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                {errors.time && (
                  <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.time}
                  </p>
                )}
              </section>

              <section data-aos="fade-up" data-aos-delay="200">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <MapPin className="text-green-600" size={20} /> 2. Địa chỉ dọn dẹp
                </h3>

                {savedAddresses.length > 0 && (
                    <div className="flex gap-6 mb-5">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            {addressMode === "saved" ? <CircleDot size={20} className="text-green-600" /> : <Circle size={20} className="text-gray-300 group-hover:text-green-400 transition-colors" />}
                            <input 
                                type="radio" className="hidden" name="addressMode" 
                                checked={addressMode === "saved"} onChange={() => setAddressMode("saved")} 
                            />
                            <span className={`text-sm font-bold ${addressMode === "saved" ? "text-green-700" : "text-gray-600"}`}>Chọn từ Sổ địa chỉ</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            {addressMode === "new" ? <CircleDot size={20} className="text-green-600" /> : <Circle size={20} className="text-gray-300 group-hover:text-green-400 transition-colors" />}
                            <input 
                                type="radio" className="hidden" name="addressMode" 
                                checked={addressMode === "new"} onChange={() => setAddressMode("new")} 
                            />
                            <span className={`text-sm font-bold ${addressMode === "new" ? "text-green-700" : "text-gray-600"}`}>Nhập địa chỉ khác</span>
                        </label>
                    </div>
                )}

                {addressMode === "saved" && savedAddresses.length > 0 ? (
                    <div className="relative animate-fade-in">
                        <select 
                            className="w-full pl-5 pr-12 py-4 rounded-2xl bg-green-50/50 border border-green-200 text-green-800 font-bold outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none cursor-pointer"
                            value={selectedSavedAddress}
                            onChange={(e) => {
                                setSelectedSavedAddress(e.target.value);
                                setErrors({ ...errors, address: "" });
                            }}
                        >
                            {savedAddresses.map(addr => (
                                <option key={addr._id} value={addr.Detail}>
                                    {addr.Is_Default ? "★ [Mặc định] " : ""}{addr.Detail}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none" size={20} />
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <textarea
                            placeholder="Gõ địa chỉ cụ thể: Số nhà, tên đường, phường/xã, quận/huyện..."
                            value={customAddress}
                            className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border ${errors.address ? "border-red-500" : "border-gray-100"} focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[120px] font-medium text-gray-800`}
                            onChange={(e) => {
                                setCustomAddress(e.target.value);
                                if (errors.address) setErrors({ ...errors, address: "" });
                            }}
                        />
                    </div>
                )}
                
                {errors.address && (
                  <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.address}
                  </p>
                )}
              </section>

              <section data-aos="fade-up" data-aos-delay="300">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <FileText className="text-green-600" size={20} /> 3. Ghi chú cho Cleaner
                </h3>
                <textarea
                  placeholder="Lưu ý: Nhà có thú cưng, mang thêm máy hút bụi, v.v..."
                  value={formData.notes}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[100px] font-medium text-gray-800"
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </section>
            </div>
          </div>

          {/* TÓM TẮT & SUBMIT */}
          <div className="lg:col-span-4 space-y-6" data-aos="fade-left">
            <div className="bg-white rounded-3xl p-8 border border-green-100 shadow-xl shadow-green-900/5 sticky top-24">
              <h2 className="text-xl font-black text-gray-900 mb-6">
                Tóm tắt thanh toán
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Giá dịch vụ (AI):</span>
                  <span className="text-gray-900 font-bold">
                    {initialPrice.toLocaleString()}đ
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Diện tích bóc tách:</span>
                  <span className="text-gray-900 font-bold">
                    {aiResultData.area} m²
                  </span>
                </div>

                {/* Mã Voucher */}
                <div className="pt-6 border-t border-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="MÃ GIẢM GIÁ"
                      value={formData.voucher}
                      className="flex-grow px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-green-500 outline-none text-sm font-bold uppercase"
                      onChange={(e) => setFormData({ ...formData, voucher: e.target.value })}
                    />
                    <button
                      onClick={handleApplyVoucher}
                      className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                    >
                      ÁP DỤNG
                    </button>
                  </div>
                  {errors.voucher && (
                    <p className="mt-2 text-[10px] font-bold text-red-500">
                      {errors.voucher}
                    </p>
                  )}
                  {appliedVoucher && (
                    <p className="mt-2 text-[10px] font-bold text-green-600 flex items-center gap-1">
                      <Check size={12} /> Đã giảm{" "}
                      {appliedVoucher.discount.toLocaleString()}đ
                    </p>
                  )}
                </div>

                {/* Tổng thanh toán */}
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-900">Thành tiền</span>
                    <div className="text-right">
                      {appliedVoucher && (
                        <p className="text-xs text-red-500 line-through mb-1">
                          {initialPrice.toLocaleString()}đ
                        </p>
                      )}
                      <p className="text-3xl font-black text-green-600 leading-none">
                        {finalPrice.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full mt-6 bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Tiếp tục thanh toán <ChevronLeft className="rotate-180" size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};