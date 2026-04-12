import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import AOS from "aos";
import "aos/dist/aos.css";

import {
    Upload, CheckCircle, AlertCircle, ArrowRight,
    LayoutGrid, Sparkles, HandPlatter, ClockCheck, SquareMenu, ShieldCheck,
    SquareCheckBig, UserCheck, Clock, ChevronDown,
    Scan,
} from "lucide-react";

// Import tất cả ảnh
import img1 from '../../../assets/img/quyTrinhDichVu-b1.png';
import img2 from '../../../assets/img/quyTrinhDichVu-b2.png';
import img3 from '../../../assets/img/quyTrinhDichVu-b3.png';
import img4 from '../../../assets/img/quyTrinhDichVu-b4.png';
import img5 from '../../../assets/img/quyTrinhDichVu-b5.png';
import img6 from '../../../assets/img/quyTrinhDichVu-b6.png';
import img7 from '../../../assets/img/AnTamVoiLuaChonCuaBan.png';
import imgHeroBanner from '../../../assets/img/HeroBannerImg.png';

const data = [
    {
        id: 1,
        title: "Ứng dụng hoạt động ở đâu?",
        content: "Hiện tại dịch vụ đã có mặt tại nhiều thành phố lớn trên toàn quốc."
    },
    {
        id: 2,
        title: "Chất lượng dịch vụ có đảm bảo không?",
        content: "Tất cả nhân viên đều được kiểm tra và đào tạo trước khi làm việc."
    },
    {
        id: 3,
        title: "Bao lâu thì có người nhận việc?",
        content: "Thông thường chỉ mất khoảng 30–60 phút."
    }
];

export const HomePage = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    const toggle = (id) => {
        setOpenId(openId === id ? null : id);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setError("");

        if (file) {
            const validTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (!validTypes.includes(file.type)) {
                setError("Chỉ hỗ trợ định dạng ảnh JPG hoặc PNG.");
                setSelectedFile(null);
                setPreviewUrl(null);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError("Dung lượng ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
                setSelectedFile(null);
                setPreviewUrl(null);
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            setError("Vui lòng tải lên một bức ảnh trước khi phân tích.");
            return;
        }

        setIsAnalyzing(true);
        setError("");

        try {
            const API_URL = import.meta.env.VITE_API_BASE_CLIENT_URL;
            const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");

            if (!token) {
                throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập để sử dụng tính năng này.");
            }

            const formData = new FormData();
            formData.append("room_image", selectedFile);

            const response = await fetch(`${API_URL}/analyze-room-image`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                if (response.status === 401) {
                    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                }
                throw new Error(result.message || "Lỗi từ máy chủ khi phân tích ảnh.");
            }

            navigate("/ai-result", { state: { aiData: result.data } });

        } catch (err) {
            console.error("❌ Lỗi Call API:", err);
            setError(err.message || "Không thể kết nối đến AI. Vui lòng thử lại sau.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    return (
        <div className="min-h-screen bg-white pb-20 animate-fade-in-up">
            <div
                className="w-full h-[600px] bg-cover bg-center relative"
                style={{ backgroundImage: `url(${imgHeroBanner})` }}
            >
                <div className="absolute inset-0 bg-black/60"></div>

                <section className="relative py-16 lg:py-24 overflow-hidden">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-6">
                                    <Sparkles size={16} /> AI Nâng tầm không gian
                                </div>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                                    Tải ảnh không gian <br />
                                    <span className="text-green-600">Nhận báo giá AI</span> ngay
                                </h1>
                                <p className="mt-6 text-lg text-white/90">
                                    Chỉ cần tải lên hình ảnh căn phòng của bạn, hệ thống Trí tuệ nhân tạo sẽ phân tích và đưa ra báo giá thiết kế chính xác trong giây lát.
                                </p>
                            </div>

                            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
                                <div
                                    onClick={() => !isAnalyzing && fileInputRef.current.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all min-h-[280px]
                                ${isAnalyzing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                                ${previewUrl ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 bg-gray-50'}`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/jpeg, image/png, image/jpg"
                                        onChange={handleFileChange}
                                        disabled={isAnalyzing}
                                    />

                                    {previewUrl ? (
                                        <div className="text-center w-full flex flex-col items-center">
                                            {/* ĐÂY LÀ CHỖ FIX LỖI TRÀN: ÉP CHIỀU CAO KHUNG ẢNH VÀ DÙNG OBJECT-COVER */}
                                            <div className="w-full h-48 sm:h-56 bg-gray-200 rounded-xl overflow-hidden shadow-sm mb-4">
                                                <img 
                                                    src={previewUrl} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                                                />
                                            </div>
                                            <p className="text-sm text-green-600 font-bold flex items-center justify-center gap-1">
                                                <CheckCircle size={16} /> Đã nhận diện hình ảnh
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2 hover:text-green-600 underline cursor-pointer" onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isAnalyzing) fileInputRef.current.click();
                                            }}>
                                                Bấm vào đây để đổi ảnh khác
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                                <Upload size={32} />
                                            </div>
                                            <p className="text-gray-700 font-bold text-lg">Tải hình ảnh không gian</p>
                                            <p className="text-gray-400 text-sm mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                                        </>
                                    )}
                                </div>

                                {error && (
                                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-2 animate-shake">
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleAnalyze}
                                    disabled={!selectedFile || isAnalyzing}
                                    className={`mt-6 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${!selectedFile || isAnalyzing
                                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                            : 'bg-green-600 hover:bg-green-700 active:scale-[0.98]'}`}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang quét hình ảnh...
                                        </>
                                    ) : (
                                        <>Nhận báo giá AI ngay lập tức <ArrowRight size={20} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* CÁC SECTION BÊN DƯỚI GIỮ NGUYÊN NHƯ CŨ */}
            <section className="py-16" data-aos="fade-right">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-12 flex items-center justify-center gap-2">
                        <HandPlatter className="text-green-600" /> Tiện ích dịch vụ của chúng tôi
                    </h2>
                    <div className="carousel relative container mx-auto" style={{ maxWidth: '1600px' }}>
                        <div className="carousel-inner relative overflow-hidden w-full">
                            <input className="carousel-open" type="radio" id="carousel-1" name="carousel" aria-hidden="true" hidden defaultChecked="checked" />
                            <div className="carousel-item absolute opacity-0" style={{ height: '50vh' }}>
                                <div className="block h-full w-full mx-auto flex pt-6 md:pt-0 md:items-center bg-cover bg-right" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1422190441165-ec2956dc9ecc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1600&q=80")' }}>
                                    <div className="container mx-auto">
                                        <div className="flex flex-col w-full lg:w-1/2 md:ml-16 items-center md:items-start px-6 tracking-wide">
                                            <p className="text-black text-2xl my-4">Vệ sinh sofa, rèm, nệm</p>
                                            <a className="text-xl inline-block no-underline border-b border-gray-600 leading-relaxed hover:text-black hover:border-black" href="#">view product</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <label htmlFor="carousel-3" className="prev control-1 w-10 h-10 ml-2 md:ml-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full  hover:bg-[#008236] leading-tight text-center z-10 inset-y-0 left-0 my-auto">‹</label>
                            <label htmlFor="carousel-2" className="next control-1 w-10 h-10 mr-2 md:mr-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full  hover:bg-[#008236] leading-tight text-center z-10 inset-y-0 right-0 my-auto">›</label>
                            
                            <input className="carousel-open" type="radio" id="carousel-2" name="carousel" aria-hidden="true" hidden />
                            <div className="carousel-item absolute opacity-0 bg-cover bg-right" style={{ height: '50vh' }}>
                                <div className="block h-full w-full mx-auto flex pt-6 md:pt-0 md:items-center bg-cover bg-right" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1533090161767-e6ffed986c88?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjM0MTM2fQ&auto=format&fit=crop&w=1600&q=80")' }}>
                                    <div className="container mx-auto">
                                        <div className="flex flex-col w-full lg:w-1/2 md:ml-16 items-center md:items-start px-6 tracking-wide">
                                            <p className="text-black text-2xl my-4">Tổng vệ sinh</p>
                                            <a className="text-xl inline-block no-underline border-b border-gray-600 leading-relaxed hover:text-black hover:border-black" href="#">Tìm hiểu thêm</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <label htmlFor="carousel-1" className="prev control-2 w-10 h-10 ml-2 md:ml-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full  hover:bg-[#008236]  leading-tight text-center z-10 inset-y-0 left-0 my-auto">‹</label>
                            <label htmlFor="carousel-3" className="next control-2 w-10 h-10 mr-2 md:mr-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full  hover:bg-[#008236]  leading-tight text-center z-10 inset-y-0 right-0 my-auto">›</label>
                            
                            <input className="carousel-open" type="radio" id="carousel-3" name="carousel" aria-hidden="true" hidden />
                            <div className="carousel-item absolute opacity-0" style={{ height: '50vh' }}>
                                <div className="block h-full w-full mx-auto flex pt-6 md:pt-0 md:items-center bg-cover bg-bottom" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519327232521-1ea2c736d34d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1600&q=80")' }}>
                                    <div className="container mx-auto">
                                        <div className="flex flex-col w-full lg:w-1/2 md:ml-16 items-center md:items-start px-6 tracking-wide">
                                            <p className="text-black text-2xl my-4">Dọn dẹp buồng phòng</p>
                                            <a className="text-xl inline-block no-underline border-b border-gray-600 leading-relaxed hover:text-black hover:border-black" href="#">Tìm hiểu thêm</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <label htmlFor="carousel-2" className="prev control-3 w-10 h-10 ml-2 md:ml-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full  hover:bg-[#008236]  leading-tight text-center z-10 inset-y-0 left-0 my-auto">‹</label>
                            <label htmlFor="carousel-1" className="next control-3 w-10 h-10 mr-2 md:mr-10 absolute cursor-pointer hidden text-3xl font-bold text-black hover:text-white rounded-full  hover:bg-[#008236]  leading-tight text-center z-10 inset-y-0 right-0 my-auto">›</label>
                            
                            <ol className="carousel-indicators">
                                <li className="inline-block mr-3"><label htmlFor="carousel-1" className="carousel-bullet cursor-pointer block text-4xl text-gray-400 hover:text-gray-900">•</label></li>
                                <li className="inline-block mr-3"><label htmlFor="carousel-2" className="carousel-bullet cursor-pointer block text-4xl text-gray-400 hover:text-gray-900">•</label></li>
                                <li className="inline-block mr-3"><label htmlFor="carousel-3" className="carousel-bullet cursor-pointer block text-4xl text-gray-400 hover:text-gray-900">•</label></li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-16" data-aos="fade-right">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-12 flex items-center justify-center gap-2">
                        <LayoutGrid className="text-green-600" /> Quy trình hoạt động
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StepCard number="01" title="Tải ảnh lên" desc="Chụp hoặc chọn ảnh căn phòng bạn cần dọn dẹp" />
                        <StepCard number="02" title="AI Phân tích" desc="Gemini nhận diện diện tích và mức độ bừa bộn" />
                        <StepCard number="03" title="Báo giá chuẩn" desc="Nhận ngay kết quả và tiến hành đặt lịch" />
                        <StepCard number="04" title="Đặt lịch dễ dàng" desc="Chọn thời gian phù hợp và xác nhận dịch vụ" />
                        <StepCard number="05" title="Dọn dẹp chuyên nghiệp" desc="Đội ngũ dọn dẹp đến đúng giờ và làm việc hiệu quả" />
                        <StepCard number="06" title="Hài lòng tuyệt đối" desc="Kiểm tra kết quả và đánh giá dịch vụ của chúng tôi" />
                    </div>
                </div>
            </section>

            <section className=" py-16" data-aos="fade-right">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <img src={img7} alt="An tâm với sự lựa chọn của bạn" className="w-full h-auto rounded-3xl shadow-md" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center mt-10">
                            <div className="mb-4 flex justify-center"><ClockCheck className="text-[#008236] w-10 h-10" /></div>
                            <h3 className="font-bold text-lg">Đặt lịch nhanh chóng</h3>
                        </div>
                        <div className="text-center mt-10">
                            <div className="mb-4 flex justify-center"><Scan className="text-[#008236] w-10 h-10" /></div>
                            <h3 className="font-bold text-lg">Giá cả rõ ràng</h3>
                        </div>
                        <div className="text-center mt-10">
                            <div className="mb-4 flex justify-center"><SquareMenu className="text-[#008236] w-10 h-10" /></div>
                            <h3 className="font-bold text-lg">Đa dạng dịch vụ</h3>
                        </div>
                        <div className="text-center mt-10">
                            <div className="mb-4 flex justify-center"><ShieldCheck className="text-[#008236] w-10 h-10" /></div>
                            <h3 className="font-bold text-lg">An toàn tối đa</h3>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#008236] py-16" data-aos="fade-right">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white">Đăng ký ngay hôm nay</h2>
                        <p className="mt-4 text-lg text-white">Trở thành khách hàng của chúng tôi và nhận ưu đãi đặc biệt!</p>
                        <button className="mt-6 bg-white text-[#008236] font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors shadow-lg active:scale-95">
                            Đăng ký ngay
                        </button>
                    </div>
                </div>
            </section>

            <section className="py-16" data-aos="fade-up">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Số khách hàng đã đăng ký</h2>
                        <p className="mt-4 text-lg text-gray-500">Hơn 10,000 khách hàng đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                    <div className="text-center mt-10 hover:scale-105 transition-transform cursor-pointer">
                        <div className="mb-4 flex justify-center"><UserCheck className="text-[#008236] w-10 h-10" /></div>
                        <h3 className="font-extrabold text-5xl text-[#008236]">98%</h3>
                        <h3 className="font-bold text-lg mt-2">Khách hàng hài lòng</h3>
                    </div>
                    <div className="text-center mt-10 hover:scale-105 transition-transform cursor-pointer">
                        <div className="mb-4 flex justify-center"><SquareCheckBig className="text-[#008236] w-10 h-10" /></div>
                        <h3 className="font-extrabold text-5xl text-[#008236]">10,000+</h3>
                        <h3 className="font-bold text-lg mt-2">Công việc hoàn thành</h3>
                    </div>
                    <div className="text-center mt-10 hover:scale-105 transition-transform cursor-pointer">
                        <div className="mb-4 flex justify-center"><Clock className="text-[#008236] w-10 h-10" /></div>
                        <h3 className="font-extrabold text-5xl text-[#008236]">15,000+</h3>
                        <h3 className="font-bold text-lg mt-2">Giờ làm việc</h3>
                    </div>
                </div>
            </section>

            <section className=" py-16 " data-aos="fade-right">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-12 flex items-center justify-center gap-2">
                        <SquareCheckBig className="text-green-600" /> Câu hỏi thường gặp
                    </h2>
                </div>
                <div className="max-w-2xl mx-auto space-y-3">
                    {data.map((item) => {
                        const isOpen = openId === item.id;
                        return (
                            <div key={item.id} className={`border rounded-xl transition-all duration-300  ${isOpen ? "border-[#008236] bg-[#008236]/5" : "border-gray-200 bg-white"}`}>
                                <button onClick={() => toggle(item.id)} className="w-full flex items-center justify-between p-4 text-left hover:cursor-pointer">
                                    <span className={`font-bold transition-colors ${isOpen ? "text-[#008236]" : "text-black"}`}>{item.title}</span>
                                    <ChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-[#008236]" : "text-black"}`} />
                                </button>
                                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                                    <div className="overflow-hidden">
                                        <p className="p-4 pt-0 text-gray-600 text-sm">{item.content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

const StepCard = ({ number, title, desc }) => {
    const numValue = parseInt(String(number), 10);
    const images = [img1, img2, img3, img4, img5, img6];
    const imagePath = images[numValue - 1] || img1; 

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-md hover:-translate-y-1 hover:cursor-pointer transition-all duration-300">
            <div className="w-full h-48 bg-gray-100 overflow-hidden flex items-center justify-center relative">
                <img src={imagePath} alt={`Quy trình ${number}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 relative">
                <span className="absolute -top-5 left-6 text-4xl font-black text-[#008236] tracking-tighter">{String(number).padStart(2, '0')}</span>
                <div className="mt-4">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-gray-500 mt-2 font-medium leading-relaxed">{desc}</p>
                </div>
            </div>
        </div>
    );
};