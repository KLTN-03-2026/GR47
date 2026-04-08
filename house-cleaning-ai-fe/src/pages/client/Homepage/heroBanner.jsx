import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const HeroBanner = () => {
    return (
        <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative overflow-hidden">

                {/* Yếu tố nền trừu tượng mờ màu xanh lá - để trông 'kiểu vậy' như ví dụ */}
                <div className="absolute inset-0 -z-10 opacity-10">
                    <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-green-200 blur-3xl" />
                    <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-green-100 blur-3xl" />
                </div>

                {/* Tiêu đề chính */}
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                    Chào mừng đến với <span className="text-green-600">MyApp</span>
                </h1>

                {/* Văn bản mô tả */}
                <p className="mt-6 max-w-3xl text-xl text-gray-600 leading-relaxed">
                    Khám phá các dịch vụ tối ưu giúp nâng tầm doanh nghiệp của bạn ngay hôm nay. Chúng tôi cam kết mang lại giải pháp thông minh và hiệu quả nhất.
                </p>

                {/* Nút CTA lớn, màu xanh lá cây chủ đạo */}
                <Link
                    to="/services/booking"
                    className="mt-12 inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-green-700 hover:shadow-xl"
                >
                    Đặt dịch vụ ngay
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

            </div>
        </section>
    );
};