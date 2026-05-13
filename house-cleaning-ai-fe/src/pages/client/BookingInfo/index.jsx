import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  Circle,
  CircleDot,
  Clock,
  FileText,
  Gift,
  MapPin,
  Ticket,
} from "lucide-react";

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const calculatePromoDiscount = (promo, amount) => {
  if (!promo) return 0;
  if (promo.discountAmount != null) return Number(promo.discountAmount || 0);
  const percent = Number(promo.discountPercentage || promo.Discount_Percentage || 0);
  const max = Number(promo.maxDiscountAmount || promo.Max_Discount_Amount || 0);
  const raw = Math.floor((Number(amount || 0) * percent) / 100);
  return max > 0 ? Math.min(raw, max) : raw;
};

export const ClientBookingInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const aiResultData = location.state?.aiData;

  const [formData, setFormData] = useState({ date: "", time: "", notes: "", voucher: "" });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressMode, setAddressMode] = useState("new");
  const [selectedSavedAddress, setSelectedSavedAddress] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [availablePromos, setAvailablePromos] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
  const token = () => localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
  const initialPrice = Number(aiResultData?.totalPrice || 0);
  const discount = calculatePromoDiscount(appliedVoucher, initialPrice);
  const finalPrice = Math.max(0, initialPrice - discount);

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    if (!aiResultData) navigate("/", { replace: true });
  }, [aiResultData, navigate]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const tk = token();
        if (!tk) return;
        const response = await fetch(`${API_URL}/get-my-addresses`, {
          headers: { Authorization: `Bearer ${tk}` },
        });
        const result = await response.json();
        if (response.ok && result.success && result.data?.length > 0) {
          const addresses = result.data;
          const defaultAddress = addresses.find((addr) => addr.Is_Default) || addresses[0];
          setSavedAddresses(addresses);
          setAddressMode("saved");
          setSelectedSavedAddress(defaultAddress.Detail);
        }
      } catch (error) {
        console.error("Không thể tải sổ địa chỉ:", error);
      }
    };

    const fetchPromos = async () => {
      try {
        const tk = token();
        if (!tk) return;
        const response = await fetch(`${API_URL}/promo-codes`, {
          headers: { Authorization: `Bearer ${tk}` },
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setAvailablePromos(result.data || []);
        }
      } catch (error) {
        console.error("Không thể tải mã khuyến mãi:", error);
      }
    };

    fetchAddresses();
    fetchPromos();
  }, [API_URL]);

  const applyLocalPromo = (promo) => {
    const normalized = {
      id: promo._id,
      code: promo.code || promo.Code,
      discountPercentage: promo.discountPercentage ?? promo.Discount_Percentage,
      maxDiscountAmount: promo.maxDiscountAmount ?? promo.Max_Discount_Amount,
      expiryDate: promo.expiryDate ?? promo.Expiry_Date,
    };
    setFormData((prev) => ({ ...prev, voucher: normalized.code }));
    setAppliedVoucher(normalized);
    setErrors((prev) => ({ ...prev, voucher: "" }));
  };

  const handleApplyVoucher = async () => {
    const code = formData.voucher.trim().toUpperCase();
    if (!code) {
      setErrors((prev) => ({ ...prev, voucher: "Vui lòng nhập mã khuyến mãi" }));
      return;
    }

    const localPromo = availablePromos.find((promo) => (promo.code || promo.Code || "").toUpperCase() === code);
    if (localPromo) {
      applyLocalPromo(localPromo);
      return;
    }

    setPromoLoading(true);
    setErrors((prev) => ({ ...prev, voucher: "" }));
    try {
      const tk = token();
      const response = await fetch(`${API_URL}/promo-codes/validate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tk}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, totalAmount: initialPrice }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Mã không hợp lệ hoặc đã hết hạn");
      }
      setAppliedVoucher(result.data);
    } catch (error) {
      setAppliedVoucher(null);
      setErrors((prev) => ({ ...prev, voucher: error.message || "Không thể áp dụng mã" }));
    } finally {
      setPromoLoading(false);
    }
  };

  const handleProceedToPayment = (event) => {
    event.preventDefault();
    setErrors({});

    const finalAddress = addressMode === "saved" ? selectedSavedAddress : customAddress;
    if (!finalAddress.trim()) {
      setErrors({ address: "Vui lòng cung cấp địa chỉ để cleaner tìm đến bạn" });
      return;
    }
    if (!formData.date || !formData.time) {
      setErrors({ time: "Vui lòng chọn đầy đủ ngày và giờ bắt đầu làm việc" });
      return;
    }

    navigate("/payment", {
      state: {
        bookingPayload: {
          ...formData,
          address: finalAddress,
          initialPrice,
          finalPrice,
          promoCode: appliedVoucher?.code || null,
          promoDiscount: discount,
          aiResultData,
        },
      },
    });
  };

  const promoSummary = useMemo(() => {
    if (!appliedVoucher) return null;
    const percent = appliedVoucher.discountPercentage || 0;
    const max = appliedVoucher.maxDiscountAmount;
    return max ? `Giảm ${percent}%, tối đa ${formatMoney(max)}` : `Giảm ${percent}%`;
  }, [appliedVoucher]);

  if (!aiResultData) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div data-aos="fade-down">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-green-600"
          >
            <ChevronLeft size={18} /> Quay lại kết quả AI
          </button>
          <h1 className="mb-8 text-3xl font-black tracking-tight text-gray-900">Thông tin đặt lịch</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8" data-aos="fade-right">
            <div className="space-y-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <section data-aos="fade-up" data-aos-delay="100">
                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800">
                  <Calendar className="text-green-600" size={20} /> 1. Thời gian làm việc
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-5 font-bold text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-green-500"
                      value={formData.date}
                      onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="time"
                      className={`w-full rounded-2xl border bg-gray-50 py-4 pl-12 pr-5 font-bold text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-green-500 ${errors.time ? "border-red-500" : "border-gray-100"}`}
                      value={formData.time}
                      onChange={(event) => setFormData({ ...formData, time: event.target.value })}
                    />
                  </div>
                </div>
                {errors.time && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold text-red-500">
                    <AlertCircle size={14} /> {errors.time}
                  </p>
                )}
              </section>

              <section data-aos="fade-up" data-aos-delay="200">
                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800">
                  <MapPin className="text-green-600" size={20} /> 2. Địa chỉ dọn dẹp
                </h3>

                {savedAddresses.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-6">
                    <label className="group flex cursor-pointer items-center gap-2">
                      {addressMode === "saved" ? <CircleDot size={20} className="text-green-600" /> : <Circle size={20} className="text-gray-300 transition-colors group-hover:text-green-400" />}
                      <input type="radio" className="hidden" name="addressMode" checked={addressMode === "saved"} onChange={() => setAddressMode("saved")} />
                      <span className={`text-sm font-bold ${addressMode === "saved" ? "text-green-700" : "text-gray-600"}`}>Chọn từ sổ địa chỉ</span>
                    </label>
                    <label className="group flex cursor-pointer items-center gap-2">
                      {addressMode === "new" ? <CircleDot size={20} className="text-green-600" /> : <Circle size={20} className="text-gray-300 transition-colors group-hover:text-green-400" />}
                      <input type="radio" className="hidden" name="addressMode" checked={addressMode === "new"} onChange={() => setAddressMode("new")} />
                      <span className={`text-sm font-bold ${addressMode === "new" ? "text-green-700" : "text-gray-600"}`}>Nhập địa chỉ khác</span>
                    </label>
                  </div>
                )}

                {addressMode === "saved" && savedAddresses.length > 0 ? (
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-2xl border border-green-200 bg-green-50/50 py-4 pl-5 pr-12 font-bold text-green-800 outline-none transition-all focus:ring-2 focus:ring-green-500"
                      value={selectedSavedAddress}
                      onChange={(event) => {
                        setSelectedSavedAddress(event.target.value);
                        setErrors({ ...errors, address: "" });
                      }}
                    >
                      {savedAddresses.map((addr) => (
                        <option key={addr._id} value={addr.Detail}>
                          {addr.Is_Default ? "[Mặc định] " : ""}
                          {addr.Detail}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                  </div>
                ) : (
                  <textarea
                    placeholder="Gõ địa chỉ cụ thể: số nhà, tên đường, phường/xã, quận/huyện..."
                    value={customAddress}
                    className={`min-h-[120px] w-full rounded-2xl border bg-gray-50 px-5 py-4 font-medium text-gray-800 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-green-500 ${errors.address ? "border-red-500" : "border-gray-100"}`}
                    onChange={(event) => {
                      setCustomAddress(event.target.value);
                      if (errors.address) setErrors({ ...errors, address: "" });
                    }}
                  />
                )}

                {errors.address && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold text-red-500">
                    <AlertCircle size={14} /> {errors.address}
                  </p>
                )}
              </section>

              <section data-aos="fade-up" data-aos-delay="300">
                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800">
                  <FileText className="text-green-600" size={20} /> 3. Ghi chú cho cleaner
                </h3>
                <textarea
                  placeholder="Lưu ý: nhà có thú cưng, cần mang thêm máy hút bụi..."
                  value={formData.notes}
                  className="min-h-[100px] w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 font-medium text-gray-800 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-green-500"
                  onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                />
              </section>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4" data-aos="fade-left">
            <div className="sticky top-24 rounded-3xl border border-green-100 bg-white p-8 shadow-xl shadow-green-900/5">
              <h2 className="mb-6 text-xl font-black text-gray-900">Tóm tắt thanh toán</h2>
              <div className="mb-8 space-y-4">
                <div className="flex justify-between font-medium text-gray-500">
                  <span>Giá dịch vụ AI</span>
                  <span className="font-bold text-gray-900">{formatMoney(initialPrice)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-500">
                  <span>Diện tích bóc tách</span>
                  <span className="font-bold text-gray-900">{aiResultData.area} m²</span>
                </div>

                <div className="border-t border-gray-50 pt-6">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
                    <Ticket size={17} className="text-green-600" /> Mã khuyến mãi
                  </div>

                  {availablePromos.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {availablePromos.slice(0, 3).map((promo) => {
                        const code = promo.code || promo.Code;
                        return (
                          <button
                            key={promo._id || code}
                            type="button"
                            onClick={() => applyLocalPromo(promo)}
                            className="flex w-full items-center justify-between rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-left text-xs font-bold text-green-800 hover:bg-green-100"
                          >
                            <span className="flex items-center gap-2">
                              <Gift size={14} /> {code}
                            </span>
                            <span>Giảm {promo.discountPercentage || promo.Discount_Percentage}%</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="NHẬP MÃ"
                      value={formData.voucher}
                      className="min-w-0 flex-grow rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-bold uppercase outline-none focus:ring-1 focus:ring-green-500"
                      onChange={(event) => setFormData({ ...formData, voucher: event.target.value.toUpperCase() })}
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={promoLoading}
                      className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black disabled:bg-gray-300"
                    >
                      {promoLoading ? "..." : "Áp dụng"}
                    </button>
                  </div>
                  {errors.voucher && <p className="mt-2 text-[11px] font-bold text-red-500">{errors.voucher}</p>}
                  {appliedVoucher && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-green-600">
                      <Check size={12} /> {appliedVoucher.code} - {promoSummary}. Đã giảm {formatMoney(discount)}
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-gray-100 pt-6">
                  <div className="flex items-end justify-between">
                    <span className="font-bold text-gray-900">Thành tiền</span>
                    <div className="text-right">
                      {discount > 0 && <p className="mb-1 text-xs text-red-500 line-through">{formatMoney(initialPrice)}</p>}
                      <p className="text-3xl font-black leading-none text-green-600">{formatMoney(finalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-lg font-black text-white shadow-lg shadow-green-200 transition-all hover:bg-green-700 active:scale-[0.98]"
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
