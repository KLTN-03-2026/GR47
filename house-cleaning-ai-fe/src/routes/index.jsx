// src/routes/index.jsx
import { createBrowserRouter } from "react-router-dom";
import clientRoutes from "./clientRoutes"; // Tự động trỏ vào clientRoutes/index.jsx
import cleanerRoutes from "./cleanerRoutes"; // Tự động trỏ vào cleanerRoutes/index.jsx
import adminRoutes from "./adminRoutes"; // Tự động trỏ vào adminRoutes/index.jsx
// Khởi tạo router bằng cách gộp các mảng routes lại
const router = createBrowserRouter([
  ...clientRoutes,
  ...adminRoutes,
  ...cleanerRoutes,
  // Sau này bạn thêm ...adminRoutes vào đây
]);

export default router;