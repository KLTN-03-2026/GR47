import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";
import logo from "../../../../assets/img/logo.png";

export const ClientFooter = () => {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-4">

                    <div className="flex flex-col gap-4">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-12 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Giải pháp công nghệ xanh, bền vững cho doanh nghiệp hiện đại.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-green-600 transition"><FaFacebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-green-600 transition"><FaTwitter size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-green-600 transition"><FaInstagram size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-green-600 transition"><FaGithub size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 mb-4">Dịch vụ</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="#" className="hover:text-green-600 transition">Tư vấn giải pháp</Link></li>
                            <li><Link to="#" className="hover:text-green-600 transition">Thiết kế UI/UX</Link></li>
                            <li><Link to="#" className="hover:text-green-600 transition">Phát triển Web</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 mb-4">Hỗ trợ</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="#" className="hover:text-green-600 transition">Trung tâm trợ giúp</Link></li>
                            <li><Link to="#" className="hover:text-green-600 transition">Điều khoản sử dụng</Link></li>
                            <li><Link to="#" className="hover:text-green-600 transition">Chính sách bảo mật</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 mb-4">Đăng ký</h3>
                        <div className="mt-2 flex">
                            <input
                                type="email"
                                placeholder="Email của bạn"
                                className="w-full rounded-l-lg border border-gray-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none"
                            />
                            <button className="rounded-r-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-50 pt-8 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} MyApp. Tất cả quyền được bảo lưu.
                </div>
            </div>
        </footer>
    );
};