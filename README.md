CLEANAI - HỆ THỐNG ĐẶT LỊCH DỊCH VỤ DỌN DẸP VỚI ĐỊNH GIÁ TỰ ĐỘNG (AI)

Đề tài: Nghiên cứu và Xây dựng Hệ thống Đặt lịch Dịch vụ Dọn dẹp với Định giá Tự động dựa trên Trí tuệ Nhân tạo.
Đơn vị:Khoa Công nghệ thông tin – Đại học Duy Tân.

I. ĐỘI NGŨ THỰC HIỆN
- Giảng viên hướng dẫn: ThS. Lê Thanh Long
- Product Owner / Scrum Master: Nguyễn Duy Khoa
- Thành viên: 
  + Lê Đức Mới
  + Huỳnh Bá Đại Phú
  + Nguyễn Đức Mạnh
  + Nguyễn Hoàng Huy

II. GIỚI THIỆU DỰ ÁN
CleanAI là nền tảng kết nối dịch vụ dọn dẹp nhà cửa thông minh. Điểm khác biệt cốt lõi của dự án là việc ứng dụng Trí tuệ nhân tạo (AI Vision) để tự động phân tích hình ảnh không gian, từ đó bóc tách diện tích và mức độ bừa bộn nhằm đưa ra báo giá tự động, minh bạch và chính xác cho khách hàng trước khi tiến hành đặt lịch.

III. TÍNH NĂNG NỔI BẬT

1. Dành cho Khách hàng (Client)
- Định giá AI: Tải hình ảnh không gian lên hệ thống để AI tự động tính toán diện tích (m2), mức độ bừa bộn và báo giá dịch vụ.
- Đặt lịch thông minh: Chọn thời gian, địa điểm làm việc và áp dụng mã giảm giá.
- Thanh toán đa nền tảng: Hỗ trợ thanh toán qua Tiền mặt, VNPAY, MoMo, Thẻ ngân hàng và ví nội bộ CleanAI iPay.
- Tương tác thời gian thực: Nhắn tin trực tiếp với người dọn dẹp, theo dõi tiến độ đơn hàng.
- Đánh giá và Phản hồi: Chấm điểm và nhận xét chất lượng dịch vụ sau khi hoàn thành.

2. Dành cho Đối tác (Cleaner)
- Radar nhận việc: Bật/tắt trạng thái Online để tìm kiếm các đơn đặt lịch xung quanh qua bản đồ tích hợp.
- Cập nhật tiến độ: Báo cáo các bước thực hiện công việc (Bắt đầu -> Hoàn thành) về hệ thống.
- Bản đồ chỉ đường: Tích hợp Google Maps điều hướng từ vị trí hiện tại đến nhà khách hàng.
- Quản lý thu nhập: Rút tiền, theo dõi số dư và lịch sử giao dịch qua ví điện tử.

3. Dành cho Quản trị viên (Admin)
- Dashboard Thống kê: Theo dõi biểu đồ doanh thu, số lượng đơn hàng và lượng người dùng hoạt động.
- Kiểm duyệt hồ sơ: Phê duyệt hoặc từ chối chứng minh thư (CCCD) và ảnh chân dung của đối tác đăng ký mới.
- Cấu hình Trí tuệ nhân tạo: Tùy chỉnh các hệ số bừa bộn và giá cơ sở để AI đưa ra công thức tính tiền phù hợp.
- Giải quyết khiếu nại: Xử lý các tranh chấp, hoàn tiền và xóa các đánh giá vi phạm quy chuẩn.

IV. CÔNG NGHỆ SỬ DỤNG
- Backend: NodeJS / Express
- Database: MongoDB Atlas (NoSQL)
- AI/Computer Vision: Mô hình phân tích và bóc tách dữ liệu hình ảnh.
- Payment Gateway: VNPAY, MoMo API.

V. BÁO CÁO TIẾN ĐỘ DỰ ÁN

TUẦN 1: Phân tích Yêu cầu và Thiết kế Hệ thống
- Phân tích nghiệp vụ: Hoàn thành đặc tả chi tiết 27 User Stories, bao quát quy trình vận hành cho Khách hàng, Đối tác và Admin.
- Thiết kế UI/UX: Hoàn thiện sơ đồ liên kết và thiết kế 30 màn hình giao diện từ khâu đăng ký đến quản lý đơn hàng.
- Thiết kế Database: Xây dựng lược đồ cơ sở dữ liệu theo mô hình Master-Detail, chuẩn hóa cho hệ quản trị MongoDB Atlas.

TUẦN 2: Thiết lập Hạ tầng và Phân hệ Xác thực
- Hạ tầng kỹ thuật: Khởi tạo dự án NodeJS và kết nối thành công với cơ sở dữ liệu MongoDB Atlas.
- Phân hệ Xác thực: Xây dựng hoàn chỉnh API Đăng ký và Đăng nhập cho Client, Cleaner và Admin.
- Quản lý Hồ sơ: Hoàn thành tính năng cập nhật thông tin cá nhân và xử lý tải lên hình ảnh định danh (CCCD, Ảnh chân dung) cho Đối tác.
- Logic AI: Thiết lập các tham số cấu hình định giá AI ban đầu dựa trên diện tích và mức độ bừa bộn.

TUẦN 3: Hiện thực hóa Nghiệp vụ Cốt lõi
- Chức năng Đặt đơn (Booking): Hoàn thiện luồng tạo đơn hàng, cho phép chọn thời gian, địa chỉ và tính toán tổng tiền từ báo giá AI.
- Quản lý trạng thái: Xây dựng hệ thống kiểm tra và cập nhật trạng thái đơn hàng thời gian thực (Đang chờ, Đã nhận, Đang tiến hành, Hoàn thành).
- Radar nhận việc: Hoàn thành giao diện hiển thị đơn hàng xung quanh cho Đối tác và chức năng nhận đơn trực tiếp.
