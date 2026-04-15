import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { MapPin, Phone, Mail, Send, CheckCircle } from "lucide-react";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // State để hiển thị thông báo gửi thành công
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập xử lý gửi form
    console.log("Dữ liệu gửi đi:", formData);
    
    // Hiển thị thông báo thành công và reset form
    setIsSubmitted(true);
    setFormData({ name: "", email: "", message: "" });

    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 lg:py-32 font-sans overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Liên Hệ Với <span className="text-green-600">Chúng Tôi</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bạn cần hỗ trợ hay có thắc mắc về dịch vụ? Đừng ngần ngại để lại lời nhắn, chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
          
          {/* Cột Thông tin liên hệ (Trái) */}
          <div 
            className="lg:w-2/5 bg-green-600 p-10 md:p-12 text-white relative overflow-hidden"
            data-aos="fade-right"
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8">Thông Tin Liên Hệ</h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500/30 p-3 rounded-full flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Địa chỉ</h3>
                    <p className="text-green-50 leading-relaxed">
                      123 Đường Sạch Sẽ, Quận Gọn Gàng,<br />
                      Thành phố Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-500/30 p-3 rounded-full flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Điện thoại</h3>
                    <p className="text-green-50">0123 456 789</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-500/30 p-3 rounded-full flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Email</h3>
                    <p className="text-green-50">hotro@dichvudondep.vn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột Form liên hệ (Phải) */}
          <div className="lg:w-3/5 p-10 md:p-12 relative" data-aos="fade-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi Tin Nhắn</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nhập họ và tên của bạn"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tin nhắn
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Bạn cần chúng tôi giúp gì?"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-green-700 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Send className="w-5 h-5" />
                Gửi Tin Nhắn
              </button>
            </form>

            {/* Thông báo gửi thành công (Toast popup nhỏ) */}
            <div 
              className={`absolute top-4 right-4 bg-white border-l-4 border-green-500 p-4 rounded shadow-lg transition-all duration-500 flex items-center gap-3 ${
                isSubmitted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"
              }`}
            >
              <CheckCircle className="text-green-500 w-6 h-6" />
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Thành công!</h4>
                <p className="text-xs text-gray-600">Tin nhắn của bạn đã được gửi.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};