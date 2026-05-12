import { Navigate, Outlet } from "react-router-dom";
import { CleanerWrapper } from "../../layouts/wrappers/index_cleaner";

// Import các trang con của cleaner
import { CleanerHomePage } from "../../pages/cleaner/Homepage/index.jsx";
import { CleanerPendingOrderDetail } from "../../pages/cleaner/PendingOrder/index.jsx";
import { CleanerOrderProgress } from "../../pages/cleaner/OrderProgress/index.jsx";
import { CleanerNavigation } from "../../layouts/components/cleaner/Navigation/index.jsx";
import { CleanerCancelOrder } from "../../pages/cleaner/CancelOrder/index.jsx";
import { CleanerRegister } from "../../pages/cleaner/Register/index.jsx";
import { CleanerLoginPage } from "../../pages/cleaner/Login/index.jsx";
import { CleanerWallet } from "../../pages/cleaner/Wallet/index.jsx";
import { CleanerProfile } from "../../pages/cleaner/Profile/index.jsx";
import { CleanerTaskList } from "../../pages/cleaner/CleanerTaskList/index.jsx";
import { CleanerEarning } from "../../pages/cleaner/Earning/index.jsx";

// ==========================================
// CHỐT BẢO VỆ TÍCH HỢP (CLEANER GUARDS)
// ==========================================

// 1. Chốt chặn cho vùng CƠ MẬT (Phải có token mới vào được)
const CleanerProtectedRoute = () => {
    const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");
    if (!token) {
        return <Navigate to="/cleaner/login" replace />;
    }
    return <Outlet />;
};

// 2. Chốt chặn cho vùng NGOÀI (Đã đăng nhập thì CẤM vào Login/Register)
const CleanerPublicRoute = () => {
    const token = localStorage.getItem("cleaner_token") || sessionStorage.getItem("cleaner_token");
    if (token) {
        return <Navigate to="/cleaner" replace />;
    }
    return <Outlet />;
};

// ==========================================
// CẤU HÌNH ROUTES CHO CLEANER
// ==========================================
export const cleanerRoutes = [
    {
        // NHÓM 1: CÁC TRANG CẦN BẢO VỆ (BẮT BUỘC ĐĂNG NHẬP)
        element: <CleanerProtectedRoute />,
        children: [
            {
                path: "/cleaner",
                element: <CleanerWrapper />, // Chứa Header & Footer của Cleaner
                children: [
                    {
                        index: true,
                        element: <CleanerHomePage />,
                    },
                    { path: "cancel-order/:id", element: <CleanerCancelOrder /> },
                    { path: "wallet", element: <CleanerWallet /> },
                    { path: "earning", element: <CleanerEarning /> },
                    { path: "earnings", element: <Navigate to="/cleaner/earning" replace /> },
                    { path: "profile", element: <CleanerProfile /> },
                ],
            },
            // Các trang đặc thù (Chi tiết đơn, tiến độ, dẫn đường) 
            // Vẫn cần bảo vệ nhưng nằm ngoài Layout Wrapper chung nếu bạn muốn hiển thị toàn màn hình
            { path: "/cleaner/order-detail/:id", element: <CleanerPendingOrderDetail /> },
            { path: "/cleaner/order-progress/:id", element: <CleanerOrderProgress /> },
            { path: "/cleaner/navigate/:id", element: <CleanerNavigation /> },
            { path: "/cleaner/task-list", element: <CleanerTaskList /> },
        ]
    },
    {
        // NHÓM 2: CÁC TRANG CÔNG KHAI (CHỈ DÀNH CHO NGƯỜI CHƯA ĐĂNG NHẬP)
        element: <CleanerPublicRoute />,
        children: [
            { path: "/cleaner/register", element: <CleanerRegister /> },
            { path: "/cleaner/login", element: <CleanerLoginPage /> },
        ]
    }
];

export default cleanerRoutes;