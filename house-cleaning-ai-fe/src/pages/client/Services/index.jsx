import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    Sparkles, Home, Clock, Droplets,
    ArrowRight, CheckCircle2, ShieldCheck,
    Star, BadgeCheck, Leaf
} from "lucide-react";

export const ClientServicePage = () => {
    const navigate = useNavigate();

    // Khởi tạo hiệu ứng cuộn AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: "ease-out-cubic",
        });
        AOS.refresh();
    }, []);

    // Danh sách các dịch vụ
    const services = [
        {
            id: 1,
            icon: <Sparkles size={32} />,
            title: "Dọn dẹp AI Thông Minh",
            desc: "Chỉ cần chụp ảnh căn phòng, AI sẽ tự động phân tích độ bừa bộn, tính toán diện tích và đưa ra báo giá chuẩn xác trong 5 giây.",
            features: ["Báo giá AI tự động", "Không cần khảo sát", "Kết nối thợ tức thì"],
            isPopular: true,
            color: "bg-green-600",
            iconBg: "bg-white/20 text-white",
            textColor: "text-white"
        },
        {
            id: 2,
            icon: <Clock size={32} />,
            title: "Dọn dẹp theo giờ",
            desc: "Linh hoạt đặt lịch dọn dẹp theo khung giờ bạn muốn. Phù hợp cho nhu cầu dọn dẹp hàng ngày, duy trì không gian sạch sẽ.",
            features: ["Linh hoạt thời gian", "Thợ chuyên nghiệp", "Từ 60k/giờ"],
            isPopular: false,
            color: "bg-white",
            iconBg: "bg-blue-50 text-blue-600",
            textColor: "text-gray-900"
        },
        {
            id: 3,
            icon: <Home size={32} />,
            title: "Tổng vệ sinh nhà cửa",
            desc: "Làm sạch sâu mọi ngóc ngách, từ trần nhà, tường, sàn đến nội thất. Phù hợp khi mới chuyển nhà hoặc dọn dẹp đón lễ Tết.",
            features: ["Làm sạch toàn diện", "Đội ngũ 2-3 người", "Máy móc chuyên dụng"],
            isPopular: false,
            color: "bg-white",
            iconBg: "bg-orange-50 text-orange-600",
            textColor: "text-gray-900"
        },
        {
            id: 4,
            icon: <Droplets size={32} />,
            title: "Vệ sinh Sofa & Nệm",
            desc: "Giặt sấy, diệt khuẩn sâu sofa, nệm, rèm cửa bằng công nghệ hơi nước nóng, loại bỏ hoàn toàn vi khuẩn và nấm mốc.",
            features: ["Hơi nước nóng 140°C", "Diệt khuẩn 99%", "Hương thơm tự nhiên"],
            isPopular: false,
            color: "bg-white",
            iconBg: "bg-purple-50 text-purple-600",
            textColor: "text-gray-900"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-white overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#008236 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50/50 rounded-bl-[100px] -z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div data-aos="fade-down" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-6">
                            <Star size={16} fill="currentColor" /> Dịch vụ chuẩn 5 sao
                        </div>
                        <h1 data-aos="fade-up" data-aos-delay="100" className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
                            Giải pháp làm sạch <br />
                            <span className="text-green-600">toàn diện cho tổ ấm</span>
                        </h1>
                        <p data-aos="fade-up" data-aos-delay="200" className="text-lg md:text-xl text-gray-500 font-medium mb-10">
                            Khám phá các gói dịch vụ đa dạng từ CleanAI, được thiết kế để đáp ứng mọi nhu cầu dọn dẹp của bạn với chất lượng vượt trội.
                        </p>
                    </div>
                </div>
            </section>

            {/* SERVICES GRID */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={service.id}
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                            className={`rounded-[2rem] p-8 sm:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden group border ${service.isPopular ? 'border-transparent shadow-xl shadow-green-900/20' : 'border-gray-200 shadow-sm'} ${service.color}`}
                        >
                            {/* Hiệu ứng nền chìm cho thẻ AI */}
                            {service.isPopular && (
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                            )}

                            {service.isPopular && (
                                <div className="absolute top-6 right-6 px-4 py-1.5 bg-white text-green-600 rounded-full text-xs font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                    <Sparkles size={14} /> Khuyên dùng
                                </div>
                            )}

                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${service.iconBg}`}>
                                {service.icon}
                            </div>

                            <h2 className={`text-2xl font-black mb-4 ${service.textColor}`}>{service.title}</h2>
                            <p className={`mb-8 font-medium leading-relaxed ${service.isPopular ? 'text-green-50' : 'text-gray-500'}`}>
                                {service.desc}
                            </p>

                            <div className="space-y-3 mb-10">
                                {service.features.map((feature, fIndex) => (
                                    <div key={fIndex} className={`flex items-center gap-3 font-bold ${service.textColor}`}>
                                        <CheckCircle2 size={20} className={service.isPopular ? 'text-green-200' : 'text-green-500'} />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate("/")}
                                className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95
                                    ${service.isPopular
                                        ? 'bg-white text-green-600 hover:bg-green-50 shadow-lg'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                            >
                                {service.isPopular ? "Thử tính năng AI ngay" : "Đặt lịch ngay"} <ArrowRight size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="py-20 lg:py-28 mt-10 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div data-aos="fade-right">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">Tại sao nên chọn <span className="text-green-600">CleanAI?</span></h2>
                            <p className="text-gray-500 text-lg font-medium mb-10 leading-relaxed">
                                Chúng tôi không chỉ cung cấp dịch vụ dọn dẹp, chúng tôi mang đến sự an tâm tuyệt đối và giải pháp công nghệ giúp tối ưu hóa trải nghiệm của bạn.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                                        <BadgeCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nhân sự đáng tin cậy</h3>
                                        <p className="text-gray-500">100% thợ dọn dẹp đều được xác minh danh tính, có lý lịch rõ ràng và phải vượt qua bài kiểm tra kỹ năng khắt khe.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Bảo vệ tài sản tuyệt đối</h3>
                                        <p className="text-gray-500">Gói bảo hiểm dịch vụ sẵn sàng bồi thường trong trường hợp có rủi ro về hư hỏng hay mất mát tài sản.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                                        <Leaf size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Hóa chất an toàn</h3>
                                        <p className="text-gray-500">Sử dụng các dung dịch vệ sinh thân thiện với môi trường, an toàn cho sức khỏe trẻ nhỏ và thú cưng.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div data-aos="fade-left" className="relative">
                            <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl relative">
                                <img
                                    src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1000&auto=format&fit=crop"
                                    alt="Cleaning professional"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4 animate-fade-in-up">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <Star size={32} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-gray-900">4.9/5</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Từ 10.000+ Khách hàng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div data-aos="zoom-in" className="bg-[#008236] rounded-[3rem] p-10 lg:p-16 text-center relative overflow-hidden shadow-2xl shadow-green-900/20">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight">
                            Bạn đã sẵn sàng để làm mới <br className="hidden md:block" /> không gian sống?
                        </h2>
                        <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
                            Trải nghiệm dịch vụ dọn dẹp bằng công nghệ AI đầu tiên tại Việt Nam. Nhanh chóng, minh bạch và hoàn toàn tự động.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-white text-green-700 px-10 py-5 rounded-full font-black text-lg shadow-xl hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                        >
                            Tải ảnh báo giá ngay <Sparkles size={20} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};