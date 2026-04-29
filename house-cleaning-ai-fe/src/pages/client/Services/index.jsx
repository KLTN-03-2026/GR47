import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    Sparkles, Home, Clock, Droplets,
    ArrowRight, CheckCircle2, ShieldCheck,
    Star, BadgeCheck, Leaf, Camera, 
    Cpu, ThumbsUp, Users, HeartHandshake
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

    // Các bước quy trình hoạt động
    const workSteps = [
        {
            icon: <Camera size={28} />,
            title: "Chụp ảnh không gian",
            desc: "Sử dụng camera điện thoại chụp lại căn phòng cần dọn dẹp."
        },
        {
            icon: <Cpu size={28} />,
            title: "AI Phân tích tức thì",
            desc: "Hệ thống AI đánh giá mức độ bụi bẩn và tính toán chi phí trong 5s."
        },
        {
            icon: <HeartHandshake size={28} />,
            title: "Kết nối thợ chuyên nghiệp",
            desc: "Thợ dọn dẹp nhận việc và đến tận nơi theo đúng lịch hẹn."
        },
        {
            icon: <ThumbsUp size={28} />,
            title: "Nghiệm thu & Tận hưởng",
            desc: "Kiểm tra chất lượng và tận hưởng không gian sống sạch sẽ."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-28 overflow-hidden">
            {/* 1. HERO SECTION */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#008236 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-green-50 to-transparent rounded-bl-[150px] -z-0"></div>
                <div className="absolute -left-20 top-20 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50 z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div data-aos="fade-down" className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-bold mb-8 shadow-sm">
                            <Star size={16} fill="#008236" className="text-green-600" /> Nền tảng Dọn dẹp tích hợp AI tiên phong
                        </div>
                        <h1 data-aos="fade-up" data-aos-delay="100" className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8">
                            Nâng tầm không gian sống <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">bằng Công nghệ AI</span>
                        </h1>
                        <p data-aos="fade-up" data-aos-delay="200" className="text-lg md:text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                            Không còn nỗi lo mặc cả hay chờ đợi khảo sát. CleanAI mang đến trải nghiệm làm sạch không gian sống minh bạch, nhanh chóng và đạt chuẩn 5 sao.
                        </p>
                        <div data-aos="fade-up" data-aos-delay="300" className="flex flex-wrap items-center justify-center gap-4">
                            <button onClick={() => navigate("/")} className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 flex items-center gap-2">
                                Khám phá dịch vụ <ArrowRight size={20} />
                            </button>
                            {/* Nút đăng ký đã được gắn route sang trang Liên hệ */}
                            <button onClick={() => navigate("/contact")} className="bg-white text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all border border-gray-200 shadow-sm flex items-center gap-2">
                                <Users size={20} className="text-green-600" /> Đăng ký làm thợ
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. BRAND INTRO */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100 text-center">
                        <div data-aos="fade-up" data-aos-delay="0">
                            <p className="text-4xl font-black text-green-600 mb-2">10K+</p>
                            <p className="text-gray-500 font-medium">Khách hàng tin dùng</p>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="100">
                            <p className="text-4xl font-black text-green-600 mb-2">5s</p>
                            <p className="text-gray-500 font-medium">Báo giá qua ảnh AI</p>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="200">
                            <p className="text-4xl font-black text-green-600 mb-2">99%</p>
                            <p className="text-gray-500 font-medium">Tỷ lệ hài lòng</p>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="300">
                            <p className="text-4xl font-black text-green-600 mb-2">24/7</p>
                            <p className="text-gray-500 font-medium">Hỗ trợ tận tâm</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. HOW IT WORKS */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 data-aos="fade-up" className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Quy trình <span className="text-green-600">siêu tốc</span></h2>
                        <p data-aos="fade-up" data-aos-delay="100" className="text-gray-500 text-lg font-medium">Dọn dẹp nhà cửa chưa bao giờ dễ dàng và trực quan đến thế</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-green-100 via-green-300 to-green-100 z-0"></div>

                        {workSteps.map((step, index) => (
                            <div key={index} data-aos="fade-up" data-aos-delay={index * 100} className="relative z-10 text-center group">
                                <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 text-green-600 mb-6 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                                    {step.icon}
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group-hover:border-green-200 transition-colors">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm flex items-center justify-center">{index + 1}</span>
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. SERVICES GRID */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 data-aos="fade-up" className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Các gói dịch vụ <span className="text-green-600">nổi bật</span></h2>
                        <p data-aos="fade-up" data-aos-delay="100" className="text-gray-500 text-lg font-medium">Lựa chọn giải pháp phù hợp nhất cho tổ ấm của bạn</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                data-aos="fade-up"
                                data-aos-delay={index * 100}
                                className={`rounded-[2rem] p-8 sm:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden group border ${service.isPopular ? 'border-transparent shadow-xl shadow-green-900/20' : 'border-gray-200 shadow-sm'} ${service.color}`}
                            >
                                {service.isPopular && (
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                                )}

                                {service.isPopular && (
                                    <div className="absolute top-6 right-6 px-4 py-1.5 bg-white text-green-600 rounded-full text-xs font-black uppercase tracking-widest shadow-sm flex items-center gap-1 animate-pulse">
                                        <Sparkles size={14} /> Khuyên dùng
                                    </div>
                                )}

                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 ${service.iconBg}`}>
                                    {service.icon}
                                </div>

                                <h2 className={`text-2xl font-black mb-4 ${service.textColor}`}>{service.title}</h2>
                                <p className={`mb-8 font-medium leading-relaxed ${service.isPopular ? 'text-green-50' : 'text-gray-500'}`}>
                                    {service.desc}
                                </p>

                                <div className="space-y-4 mb-10">
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
                                            : 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800'}`}
                                >
                                    {service.isPopular ? "Trải nghiệm AI ngay" : "Đặt lịch ngay"} <ArrowRight size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. WHY CHOOSE US */}
            {/* Banner cuối đã được xóa và giữ lại một lớp không gian đệm ở dưới cùng */}
            <section className="pt-20 pb-10 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div data-aos="fade-right">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">Cam kết chất lượng từ <span className="text-green-600">CleanAI</span></h2>
                            <p className="text-gray-500 text-lg font-medium mb-10 leading-relaxed">
                                Chúng tôi không chỉ làm sạch không gian, chúng tôi thiết lập một tiêu chuẩn mới về sự an tâm và minh bạch trong ngành dịch vụ gia đình.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-5 items-start group">
                                    <div className="w-14 h-14 bg-white shadow-sm text-green-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <BadgeCheck size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">100% Nhân sự tinh hoa</h3>
                                        <p className="text-gray-500 leading-relaxed">Hồ sơ lý lịch tư pháp rõ ràng. Thợ phải vượt qua khóa đào tạo nghiệp vụ và bài kiểm tra kỹ năng khắt khe từ chuyên gia.</p>
                                    </div>
                                </div>
                                <div className="flex gap-5 items-start group">
                                    <div className="w-14 h-14 bg-white shadow-sm text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Bảo hiểm rủi ro toàn diện</h3>
                                        <p className="text-gray-500 leading-relaxed">Gói bảo hiểm dịch vụ sẵn sàng bồi thường thỏa đáng trong mọi trường hợp rủi ro về hư hỏng hay mất mát tài sản.</p>
                                    </div>
                                </div>
                                <div className="flex gap-5 items-start group">
                                    <div className="w-14 h-14 bg-white shadow-sm text-orange-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <Leaf size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Hóa chất sinh học an toàn</h3>
                                        <p className="text-gray-500 leading-relaxed">Sử dụng độc quyền các dòng dung dịch vệ sinh hữu cơ thân thiện với môi trường, an toàn tuyệt đối cho trẻ nhỏ và thú cưng.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div data-aos="fade-left" className="relative lg:pl-10">
                            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                                {/* Đã khôi phục lại ảnh cũ theo đúng yêu cầu */}
                                <img
                                    src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1000&auto=format&fit=crop"
                                    alt="Cleaning professional"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
                                
                                <div className="absolute bottom-10 left-10 right-10">
                                    <h3 className="text-white text-2xl font-bold mb-2">Sạch sẽ từng góc nhỏ</h3>
                                    <p className="text-gray-200">Tận tâm phục vụ vì nụ cười của gia đình bạn.</p>
                                </div>
                            </div>

                            <div className="absolute top-20 -left-6 bg-white p-5 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                    <Star size={28} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-gray-900">4.9/5</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đánh giá trung bình</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};