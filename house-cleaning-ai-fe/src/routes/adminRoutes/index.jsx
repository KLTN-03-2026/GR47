import { Navigate, Outlet } from "react-router-dom";

// 1. Nhập Layout Wrapper
import { AdminWrapper } from "../../layouts/wrappers/index_admin.jsx";

// 2. Import các trang con của admin
import { AdminLogin } from "../../pages/admin/Login/index.jsx";
import { AdminDashboard } from "../../pages/admin/Dashboard/index.jsx";
import { ManageUsers } from "../../pages/admin/ManageUsers/index.jsx";
import { ApproveCleaners } from "../../pages/admin/ApproveCleaners/index.jsx";
import { AIPriceConfig } from "../../pages/admin/AIPriceConfig/index.jsx";
import { ManageOrders } from "../../pages/admin/ManageOrders/index.jsx";
import { ManageDisputes } from "../../pages/admin/ManageDisputes/index.jsx";
import { FinancePromotions } from "../../pages/admin/FinancePromotions/index.jsx";


// ==========================================
// CHỐT BẢO VỆ TÍCH HỢP (ROUTE GUARDS)
// ==========================================

/**
 * 1. CHỐT BẢO VỆ BÊN TRONG (Dành cho Dashboard, Quản lý...)
 * Nếu CHƯA đăng nhập -> Đá ra trang Login
 */
const AdminProtectedRoute = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }
    return <Outlet />;
};

/**
 * 2. CHỐT BẢO VỆ BÊN NGOÀI (Dành cho trang Login)
 * Nếu ĐÃ đăng nhập rồi -> Đá thẳng vào Dashboard (Không cho nhìn thấy Login nữa)
 */
const AdminPublicRoute = () => {
    const token = localStorage.getItem("admin_token");
    if (token) {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <Outlet />;
};


// ==========================================
// CẤU HÌNH ROUTES CHO ADMIN
// ==========================================
export const adminRoutes = [
    {
        // NHÓM 1: CÁC TRANG BẮT BUỘC PHẢI ĐĂNG NHẬP
        element: <AdminProtectedRoute />,
        children: [
            {
                path: "/admin",
                element: <AdminWrapper />, // Bọc giao diện chung của CMS (Sidebar, Header...)
                children: [
                    // Tự động chuyển hướng từ /admin sang /admin/dashboard
                    { index: true, element: <Navigate to="dashboard" replace /> },

                    {
                        path: "dashboard",
                        element: <AdminDashboard />, // Trang thống kê tổng quan
                    },
                    {
                        path: "users",
                        element: <ManageUsers />, // Trang quản lý người dùng
                    },
                    {
                        path: "cleaners",
                        element: <ApproveCleaners />, // Trang phê duyệt đối tác
                    },
                    {
                        path: "settings",
                        element: <AIPriceConfig />, // Trang cấu hình giá AI
                    },
                    {
                        path: "orders",
                        element: <ManageOrders />, // Trang quản lý đơn hàng
                    },
                    {
                        path: "disputes",
                        element: <ManageDisputes />, // Trang quản lý tranh chấp
                    },
                    {
                        path: "promotions",
                        element: <FinancePromotions />, // Trang quản lý tài chính
                    },
                ],
            }
        ]
    },
    {
        // NHÓM 2: TRANG DÀNH CHO NGƯỜI CHƯA ĐĂNG NHẬP
        element: <AdminPublicRoute />,
        children: [
            {
                path: "/admin/login",
                element: <AdminLogin />, // Trang đăng nhập CMS
            }
        ]
    }
];

export default adminRoutes;