import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Sparkles, ShieldCheck, Clock, Users } from "lucide-react";

export const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  const values = [
    {
      icon: <Sparkles className="w-8 h-8 text-green-600" />,
      title: "Chất Lượng Vượt Trội",
      description:
        "Mọi ngóc ngách đều được làm sạch tỉ mỉ với tiêu chuẩn khắt khe nhất.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
      title: "An Toàn & Tin Cậy",
      description:
        "Sử dụng dung dịch vệ sinh an toàn, đội ngũ nhân viên có lý lịch rõ ràng.",
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "Nhanh Chóng & Đúng Giờ",
      description:
        "Tôn trọng thời gian của khách hàng, luôn có mặt và hoàn thành đúng tiến độ.",
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Tận Tâm Phục Vụ",
      description:
        "Lắng nghe và đáp ứng mọi nhu cầu với thái độ nhiệt tình, thân thiện.",
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans overflow-hidden about">
      {/* 1. Hero Section */}
      <section className="relative bg-green-50 py-20 lg:py-32">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1
            data-aos="fade-up"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            Về <span className="text-green-600">Chúng Tôi</span>
          </h1>
          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Giải pháp làm sạch toàn diện, trả lại không gian sống trong lành và
            thoải mái nhất cho gia đình bạn.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </section>

      {/* 2. Nội dung "About Us" từ file gốc của bạn */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Hình ảnh minh họa */}
            <div className="lg:w-1/2 w-full" data-aos="fade-right">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Dịch vụ dọn dẹp nhà cửa chuyên nghiệp"
                  className="rounded-2xl shadow-2xl w-full object-cover h-[400px] md:h-[500px]"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl hidden md:block border border-green-50">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-10 h-10 text-green-600" />
                    <div>
                      <div className="text-xl font-extrabold text-gray-900">
                        Eco-Friendly
                      </div>
                      <div className="text-sm text-gray-500">
                        An toàn & Khỏe mạnh
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nội dung text đã được dịch từ file gốc */}
            <div className="lg:w-1/2 w-full" data-aos="fade-left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Chào mừng bạn đến với dịch vụ{" "}
                <span className="text-green-600">dọn dẹp nhà cửa!</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Chúng tôi tận tâm mang đến những giải pháp làm sạch hàng đầu cho
                ngôi nhà của bạn. Đội ngũ nhân viên chuyên nghiệp của chúng tôi
                được đào tạo bài bản để mang lại kết quả vượt trội, đảm bảo
                không gian sống của bạn luôn sạch sẽ không tì vết và thoải mái
                nhất.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Chúng tôi cam kết sử dụng các sản phẩm thân thiện với môi trường
                (eco-friendly) để giữ cho ngôi nhà của bạn luôn an toàn và khỏe
                mạnh. Cho dù bạn cần dọn dẹp chuyên sâu một lần hay duy trì
                thường xuyên, chúng tôi luôn ở đây để giúp bạn có một không gian
                sống ngăn nắp. Cảm ơn bạn đã tin tưởng và lựa chọn chúng tôi cho
                nhu cầu dọn dẹp của mình!
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg shadow-green-200 hover:-translate-y-1">
                Liên Hệ Ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values Section */}
      <section className="py-16 md:py-24 bg-green-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className="text-center max-w-3xl mx-auto mb-16"
            data-aos="fade-up"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vì Sao Chọn <span className="text-green-600">Chúng Tôi?</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Mang đến sự an tâm và không gian sống hoàn hảo nhất cho khách
              hàng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 150}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-green-100 group hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <div className="text-green-600 group-hover:text-white transition-colors duration-300">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
