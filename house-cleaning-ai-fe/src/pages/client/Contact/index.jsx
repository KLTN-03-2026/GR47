import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// ─── FAQ Data ───────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Bao lâu thì thợ tới sau khi đặt lịch?",
    a: "Chúng tôi xác nhận lịch trong vòng 30 phút và thợ sẽ có mặt đúng giờ đã hẹn. Đối với đặt lịch khẩn, thợ có thể tới trong vòng 2–3 giờ tùy khu vực.",
  },
  {
    q: "Tôi có cần chuẩn bị dụng cụ vệ sinh trước không?",
    a: "Không cần. Đội thợ của CleanAI mang theo đầy đủ thiết bị và dung dịch vệ sinh chuyên dụng. Bạn chỉ cần mở cửa và để chúng tôi lo phần còn lại!",
  },
  {
    q: "Có thể thay đổi hoặc hủy lịch không?",
    a: "Hoàn toàn được. Bạn có thể thay đổi hoặc hủy lịch miễn phí trước 24 giờ so với giờ hẹn. Liên hệ hotline hoặc nhắn tin Zalo để thao tác nhanh nhất.",
  },
  {
    q: "Dịch vụ có cam kết lại nếu chưa sạch không?",
    a: "Có. Chúng tôi cam kết 100% hài lòng. Nếu bạn chưa ưng ý với kết quả, thợ sẽ quay lại vệ sinh miễn phí trong vòng 48 giờ.",
  },
];

// ─── Zalo Icon SVG ───────────────────────────────────────────────────────────
const ZaloIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm-4.5 27.5H13l7.5-10H13v-3h6.5L12 28.5v3zm4.5 0v-13h3v13h-3zm11-3c0 1.657-1.343 3-3 3h-4v-13h4c1.657 0 3 1.343 3 3v7zm-3-7h-1v7h1c.552 0 1-.448 1-1v-5c0-.552-.448-1-1-1z" />
  </svg>
);

// ─── FAQ Item ────────────────────────────────────────────────────────────────
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        open ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span
          className={`font-semibold text-sm md:text-base ${
            open ? "text-green-700" : "text-gray-800"
          }`}
        >
          {q}
        </span>
        <span className="ml-4 flex-shrink-0">
          {open ? (
            <ChevronUp className="w-5 h-5 text-green-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </span>
      </button>
      <div
        className={`px-6 transition-all duration-300 overflow-hidden ${
          open ? "max-h-40 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 900, once: true, easing: "ease-out-cubic" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 lg:py-32 font-sans overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Hỗ trợ 7 ngày / tuần
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Liên Hệ Với <span className="text-green-600">Chúng Tôi</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Bạn cần hỗ trợ hay có thắc mắc về dịch vụ? Đừng ngần ngại để lại lời
            nhắn — chúng tôi sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>

        {/* ── Contact Card ────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl overflow-hidden mb-10">
          {/* Left: Info */}
          <div
            className="lg:w-2/5 bg-green-600 p-10 md:p-12 text-white relative overflow-hidden"
            data-aos="fade-right"
          >
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-800 rounded-full mix-blend-multiply filter blur-3xl opacity-40 transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-8">Thông Tin Liên Hệ</h2>

              <div className="space-y-6 flex-1">
                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-0.5">Địa chỉ</h3>
                    <p className="text-green-100 text-sm leading-relaxed">
                      123 Đường Sạch Sẽ, Quận Gọn Gàng,
                      <br />
                      Thành phố Hồ Chí Minh
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-0.5">Điện thoại</h3>
                    <p className="text-green-100 text-sm">0123 456 789</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-0.5">Email</h3>
                    <p className="text-green-100 text-sm">hotro@cleanai.vn</p>
                  </div>
                </div>

                {/* Working hours */}
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Giờ hoạt động</h3>
                    <div className="text-green-100 text-sm space-y-0.5">
                      <p>
                        Thứ 2 – Thứ 6:{" "}
                        <span className="text-white font-medium">
                          07:00 – 21:00
                        </span>
                      </p>
                      <p>
                        Thứ 7 – Chủ nhật:{" "}
                        <span className="text-white font-medium">
                          08:00 – 20:00
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/20 my-6" />

              {/* Social links */}
              <div>
                <p className="text-green-100 text-sm font-medium mb-3">
                  Kết nối với chúng tôi
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="#"
                    className="bg-white/15 hover:bg-white/30 transition-colors p-2.5 rounded-full"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="#"
                    className="bg-white/15 hover:bg-white/30 transition-colors p-2.5 rounded-full"
                    aria-label="Zalo"
                  >
                    <ZaloIcon className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="#"
                    className="bg-white/15 hover:bg-white/30 transition-colors p-2.5 rounded-full"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:w-3/5 p-10 md:p-12 relative" data-aos="fade-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Gửi Tin Nhắn
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row: Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Họ và tên <span className="text-green-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-form"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Số điện thoại <span className="text-green-600">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="0123 456 789"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-form"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-form"
                />
              </div>

              {/* Subject Dropdown */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Chủ đề liên hệ <span className="text-green-600">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="input-form appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    -- Chọn chủ đề --
                  </option>
                  <option value="quote">Xin báo giá dịch vụ</option>
                  <option value="support">Hỗ trợ dịch vụ đang dùng</option>
                  <option value="complaint">Khiếu nại / Phản ánh</option>
                  <option value="partner">Hợp tác thợ / Đại lý</option>
                  <option value="media">Truyền thông / PR</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Tin nhắn <span className="text-green-600">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Mô tả yêu cầu của bạn..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="input-form resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary-green-lg sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi Tin Nhắn
                  </>
                )}
              </button>
            </form>

            {/* ── Success Toast ─────────────────────────────────────────── */}
            <div
              className={`absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-3xl transition-all duration-500 ${
                isSubmitted
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="text-center px-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Đã gửi thành công! 🎉
                </h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Cảm ơn bạn đã liên hệ. Đội ngũ CleanAI sẽ phản hồi trong vòng{" "}
                  <span className="text-green-600 font-semibold">30 phút</span>{" "}
                  trong giờ làm việc.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Google Maps ─────────────────────────────────────────────── */}
        <div
          className="rounded-3xl overflow-hidden shadow-xl mb-10"
          data-aos="fade-up"
        >
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Vị trí của chúng tôi
              </p>
              <p className="text-xs text-gray-400">
                123 Đường Sạch Sẽ, Quận Gọn Gàng, TP. HCM
              </p>
            </div>
          </div>
          <iframe
            title="CleanAI Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4668118377944!2d106.69765731462265!3d10.77617776228685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xa5777fb3a6d2a1a7!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIFRQLkhDTQ!5e0!3m2!1svi!2svn!4v1623928391234!5m2!1svi!2svn"
            width="100%"
            height="380"
            style={{ border: 0, display: "block" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* ── FAQ Section ─────────────────────────────────────────────── */}
        <div data-aos="fade-up">
          <div className="text-center mb-8">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-3 tracking-wide uppercase">
              Giải đáp nhanh
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Câu Hỏi Thường Gặp
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Chưa cần gửi form — hãy xem qua các câu trả lời phổ biến bên dưới.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} data-aos="fade-up" data-aos-delay={i * 80}>
                <FaqItem q={faq.q} a={faq.a} />
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Không tìm thấy câu trả lời?{" "}
            <a
              href="#form"
              className="text-green-600 font-medium hover:underline"
            >
              Gửi tin nhắn cho chúng tôi ngay →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
