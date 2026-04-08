import { Outlet } from "react-router-dom";
// Chú ý: Vì dùng export const nên phải thêm cặp ngoặc nhọn {} khi import
import { ClientHeader } from "../components/client/header";
import { ClientFooter } from "../components/client/footer";

export const ClientWrapper = () => {
    return (
        // min-h-screen: Độ cao tối thiểu bằng 100% màn hình
        // flex & flex-col: Dàn Layout theo chiều dọc
        <div className="flex min-h-screen flex-col bg-gray-50">

            {/* 1. Header luôn ở trên cùng */}
            <ClientHeader />

            {/* 2. Main content: flex-grow sẽ tự động đẩy Footer xuống tít dưới đáy */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* 3. Footer luôn ở dưới cùng */}
            <ClientFooter />

        </div>
    );
};