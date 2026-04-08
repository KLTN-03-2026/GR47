import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/admin/sidebar/index.jsx";
import { AdminHeader } from "../components/admin/header/index.jsx";
import { AdminFooter } from "../components/admin/footer/index.jsx";

export const AdminWrapper = () => {
    return (
        // Toàn bộ màn hình không scroll
        <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar cố định bên trái */}
            <AdminSidebar />
            {/* Cột phải chứa Header, Main Content và Footer */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header cố định trên cùng */}
                <AdminHeader />
                {/* Phần nội dung có thể cuộn (Scrollable Area) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <div className="max-w-7xl mx-auto min-h-full flex flex-col">
                        {/* Nội dung trang con sẽ được render vào đây */}
                        <Outlet />
                        {/* Footer đẩy xuống đáy */}
                        <AdminFooter />
                    </div>
                </main>
            </div>
        </div>
    );
};