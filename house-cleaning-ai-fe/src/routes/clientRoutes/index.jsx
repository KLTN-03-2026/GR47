// src/routes/clientRoutes.jsx

import { Navigate, Outlet } from "react-router-dom";
import { ClientWrapper } from "../../layouts/wrappers/index_client";

// Import các trang con của client
import { HomePage } from "../../pages/client/Homepage";
import { ClientLoginPage } from "../../pages/client/Login/index.jsx";
import { ClientRegister } from "../../pages/client/Register/index.jsx";
import { ClientAIQuoteResult } from "../../pages/client/AIQuoteResult/index.jsx";
import { ClientBookingInfo } from "../../pages/client/BookingInfo/index.jsx";
import { ClientPayment } from "../../pages/client/Payment/index.jsx";
import { ClientOrderList } from "../../pages/client/OrderList/index.jsx";
import { ClientOrderDetail } from "../../pages/client/OrderDetail/index.jsx";
import { ClientCancelOrder } from "../../pages/client/CancelOrder/index.jsx";
import { ClientFeedback } from "../../pages/client/Feedback/index.jsx";
import { ClientProfile } from "../../pages/client/Profile/index.jsx";
import { ForgotPassword } from "../../pages/client/ForgotPassword/index.jsx";
import { About } from "../../pages/client/About/index.jsx";

// ==========================================
// 1. VIẾT THẲNG LOGIC BẢO VỆ ROUTE TẠI ĐÂY
// ==========================================

// Chặn người ĐÃ đăng nhập (không cho vào lại Login/Register)
const PublicRoute = () => {
    const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
    return token ? <Navigate to="/" replace /> : <Outlet />;
};

// Chặn người CHƯA đăng nhập (không cho vào Profile, Đơn hàng...)
const ProtectedRoute = () => {
    const token = localStorage.getItem("client_token") || sessionStorage.getItem("client_token");
    return !token ? <Navigate to="/login" replace /> : <Outlet />;
};

// ==========================================
// 2. KHAI BÁO CÁC ROUTE
// ==========================================

export const clientRoutes = [
    // --- NHÓM CÓ LAYOUT (Header/Footer) ---
    {
        path: "/",
        element: <ClientWrapper />,
        children: [
            // Ai cũng vào được trang chủ
            { index: true, element: <HomePage /> },

            // Nhóm BẮT BUỘC ĐĂNG NHẬP mới được xem
            {
                element: <ProtectedRoute />,
                children: [
                    { path: "order-list", element: <ClientOrderList /> },
                    { path: "profile", element: <ClientProfile /> },
                    { path: "payment", element: <ClientPayment /> },
                    { path: "order-detail/:id", element: <ClientOrderDetail /> },
                    { path: "cancel-order/:id", element: <ClientCancelOrder /> },
                    { path: "feedback/:id", element: <ClientFeedback /> },
                    // --- NHÓM CÔNG KHAI KHÔNG CÓ LAYOUT (Khách lạ mua hàng nhanh) ---
                    { path: "ai-result", element: <ClientAIQuoteResult /> },
                    { path: "booking-info", element: <ClientBookingInfo /> },
                    { path: "about", element: <About /> },
                ]
            }
        ],
    },
    // --- NHÓM CHỈ DÀNH CHO NGƯỜI CHƯA ĐĂNG NHẬP ---
    {
        element: <PublicRoute />,
        children: [
            { path: "login", element: <ClientLoginPage /> },
            { path: "register", element: <ClientRegister /> },
            { path: "forgot-password", element: <ForgotPassword /> },
        ]
    }
];

export default clientRoutes;