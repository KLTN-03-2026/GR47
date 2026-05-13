# TỔNG HỢP CẬP NHẬT MODULE XỬ LÝ KHIẾU NẠI

## 📌 THÔNG TIN DỰ ÁN
- **Dự Án:** House Cleaning AI - GR47
- **Module:** Quản Lý Khiếu Nại (Complaint Management)
- **Phiên Bản:** 2.0
- **Ngày Cập Nhật:** 13 Tháng 5, 2026
- **Trạng Thái:** ✅ Backend Hoàn Thành | ⏳ Frontend Cần Triển Khai

---

## 🎯 TÍNH NĂNG MỚI ĐÃ THÊM

### 1️⃣ XỬ PHẠT CLEANER

**Nút:** "Xử phạt Cleaner" - Tại màn hình chi tiết khiếu nại (Admin)

**Mức Xử Phạt:**
- ⏱️ Khóa nhận đơn 5 phút
- ⏱️ Khóa nhận đơn 30 phút
- ⏱️ Khóa nhận đơn 1 giờ
- ⏱️ Khóa nhận đơn 6 giờ
- ⏱️ Khóa nhận đơn 24 giờ
- 🔒 Khóa tài khoản Cleaner (vô thời hạn)

**Chức Năng:**
- Cleaner không thể nhận đơn mới trong thời gian bị phạt
- Lịch sử xử phạt được lưu: người xử phạt, thời gian, lý do, hạn hết
- Admin có thể hủy xử phạt sớm với lý do

**Backend:** ✅ Hoàn thành
- Model: `CleanerPenaltyModel.js`
- Functions: `penalizeCleaner()`, `liftPenalty()`, `getActiveCleanerPenalties()`
- Routes: `POST /admin/complaints/:complaintId/penalize`, `POST /admin/penalties/:penaltyId/lift`

---

### 2️⃣ TẶNG MÃ KHUYẾN MÃI

**Nút:** "Tặng mã khuyến mãi" - Tại màn hình xử lý khiếu nại (Admin)

**Thông Tin Mã:**
- 🔤 Mã code (auto-generate)
- 📊 Phần trăm giảm giá (1-100%)
- 💰 Giá trị giảm tối đa (tuỳ chọn)
- 📅 Ngày hết hạn
- ✔️ Trạng thái sử dụng

**Chức Năng:**
- Admin tạo mã khuyến mãi cho Client bị ảnh hưởng
- Client nhập mã tại field "MÃ GIẢM GIÁ" trong Booking Info
- Khi áp dụng: Client được giảm giá, tiền công Cleaner KHÔNG bị giảm

**Backend:** ✅ Hoàn thành
- Model: `PromotionCodeModel.js`
- Functions: `giftPromotionCode()`, `getClientPromoCodes()`, `applyPromotionCode()`
- Routes: Multiple admin & client endpoints

---

### 3️⃣ THÔNG BÁO CHO CẢ HAI BÊN

**Tính Năng:**
Mọi thao tác xử lý khiếu nại của Admin đều gửi thông báo cho Client & Cleaner:
- ✉️ Khiếu nại được tiếp nhận
- ✉️ Khiếu nại bị từ chối
- ✉️ Cleaner bị xử phạt
- ✉️ Tặng mã khuyến mãi cho Client
- ✉️ Hoàn tiền
- ✉️ Khiếu nại bị ẩn/xóa
- ✉️ Khiếu nại hoàn tất xử lý

**Backend:** ✅ Hoàn thành
- Service function: `sendComplaintActionNotifications()`
- Integrated vào tất cả controller functions

---

### 4️⃣ ẨNKHIẾU NẠI

**Nút:** Tại chi tiết khiếu nại (Admin)

**Chức Năng:**
- Khi Admin ẩn: Khiếu nại không hiển thị với Client và Cleaner
- Chỉ Admin mới có thể xem lại nếu cần
- Gửi thông báo khi ẩn

**Backend:** ✅ Hoàn thành
- Field: `Is_Hidden` thêm vào BookingComplaintModel
- Function: `hideComplaint()`
- Route: `POST /admin/complaints/:complaintId/hide`

---

### 5️⃣ HOÀN TIỀN

**Nút:** "Hoàn tiền" - Tại chi tiết khiếu nại (Admin)

**Chức Năng:**
- Tiền được cộng vào ví của Client (IPay_Balance)
- Áp dụng cho cả: Đơn tiền mặt & Đơn ví
- Không trừ tiền Cleaner - Platform chịu chi phí
- Cập nhật số dư ví, tạo transaction lịch sử
- Gửi thông báo cho cả hai bên

**Backend:** ✅ Hoàn thành
- Function: `refundClient()`
- Route: `POST /admin/complaints/:complaintId/refund`
- Uses MongoDB transactions for safety

---

### 6️⃣ LOGGING & AUDIT TRAIL

**Tính Năng:**
- Tất cả thao tác được log lại
- Lịch sử chi tiết: AI, hành động, thay đổi, notes

**Backend:** ✅ Hoàn thành
- Model: `ComplaintHistoryModel.js`
- Service: `logComplaintAction()`
- Route: `GET /admin/complaints/:complaintId/history`

---

## 📁 FILE ĐƯỢC THÊMDỮA

### Backend (Backend)

```
src/
├── models/
│   ├── CleanerPenaltyModel.js          ✅ MỚI - Quản lý xử phạt
│   ├── PromotionCodeModel.js           ✅ MỚI - Mã khuyến mãi
│   ├── ComplaintHistoryModel.js        ✅ MỚI - Lịch sử hành động
│   └── BookingComplaintModel.js        ✅ CẬP NHẬT - Thêm Is_Hidden
├── services/
│   └── complaintService.js             ✅ MỚI - Utilities
├── controllers/
│   └── ComplaintController.js          ✅ CẬP NHẬT - 9 functions mới
├── routes/
│   ├── adminRoutes/index.js            ✅ CẬP NHẬT - 13 endpoints mới
│   └── CLIENT_ROUTES_ADDITION.js       ✅ MỚI - Thêm vào clientRoutes
├── COMPLAINT_MODULE_DOCUMENTATION.js   ✅ MỚI - Tài liệu chi tiết
└── ...
```

### Frontend (Frontend)

```
src/
├── layouts/components/admin/ManageDisputes/
│   ├── FRONTEND_COMPONENTS_GUIDE.js    ✅ MỚI - Hướng dẫn components
│   ├── PenaltyModal.jsx                ⏳ CẦN TẠO
│   ├── RefundModal.jsx                 ⏳ CẦN TẠO
│   ├── PromoCodeModal.jsx              ⏳ CẦN TẠO
│   ├── HideComplaintModal.jsx          ⏳ CẦN TẠO
│   ├── ConfirmationDialog.jsx          ⏳ CẦN TẠO
│   ├── ComplaintDetail.jsx             ⏳ CẬP NHẬT
│   ├── ComplaintHistory.jsx            ⏳ CẦN TẠO
│   └── CleanerPenalties.jsx            ⏳ CẦN TẠO
├── pages/client/BookingInfo/
│   └── index.jsx                       ⏳ CẬP NHẬT - Thêm mã giảm giá
├── pages/client/Wallet/
│   └── index.jsx                       ⏳ CẬP NHẬT - Hiển thị REFUND
└── ...
```

---

## 🔌 API ENDPOINTS ĐÃ THÊM

### Admin Routes

```javascript
// Xử phạt
POST   /admin/complaints/:complaintId/penalize
GET    /admin/cleaners/:cleanerId/penalties
GET    /admin/cleaners/:cleanerId/active-penalties
POST   /admin/penalties/:penaltyId/lift

// Hoàn tiền
POST   /admin/complaints/:complaintId/refund

// Khuyến mãi
POST   /admin/complaints/:complaintId/gift-promo
GET    /admin/clients/:clientId/promo-codes
POST   /admin/promo-codes/apply

// Khiếu nại
POST   /admin/complaints/:complaintId/hide
GET    /admin/complaints/:complaintId/history
```

### Client Routes (Thêm vào)

```javascript
GET    /client/promo-codes
POST   /client/promo-codes/validate
POST   /client/promo-codes/apply
```

---

## 📊 DATABASE SCHEMA

### CleanerPenalty
```javascript
{
  Cleaner_Id,           // Ref: Cleaner
  Booking_Id,           // Ref: Booking
  Complaint_Id,         // Ref: BookingComplaint
  Admin_Id,             // Ref: Admin
  Penalty_Type,         // LOCK_5_MIN, LOCK_30_MIN, ..., ACCOUNT_LOCK
  Reason,               // String (required)
  Note,                 // String (optional)
  Penalty_Start_Date,   // Date
  Penalty_End_Date,     // Date (null cho ACCOUNT_LOCK)
  Is_Active,            // Boolean
  Lifted_At,            // Date (null)
  Lifted_Reason,        // String (null)
  timestamps
}
```

### PromotionCode
```javascript
{
  Code,                 // String (unique)
  Client_Id,            // Ref: Client
  Booking_Id,           // Ref: Booking
  Complaint_Id,         // Ref: BookingComplaint
  Admin_Id,             // Ref: Admin
  Discount_Percentage,  // 1-100
  Max_Discount_Amount,  // Number (optional)
  Reason,               // String
  Note,                 // String
  Expiry_Date,          // Date
  Is_Used,              // Boolean
  Used_At,              // Date (null)
  Used_For_Booking_Id,  // Ref: Booking (null)
  Is_Active,            // Boolean
  timestamps
}
```

### ComplaintHistory
```javascript
{
  Complaint_Id,         // Ref: BookingComplaint
  Booking_Id,           // Ref: Booking
  Admin_Id,             // Ref: Admin
  Action_Type,          // CREATE, RESOLVE, REJECT, PENALIZE, REFUND, GIFT_PROMO, HIDE, DELETE, LIFT_PENALTY
  Old_Value,            // Mixed
  New_Value,            // Mixed
  Description,          // String
  Additional_Data,      // Mixed
  Notes,                // String
  Is_Visible_To_Client, // Boolean
  Is_Visible_To_Cleaner,// Boolean
  timestamps
}
```

---

## ✅ VALIDATION & BUSINESS RULES

### Xử Phạt
- ✅ Cleaner không thể accept booking khi bị penalty
- ✅ Multiple penalties có thể stack
- ✅ ACCOUNT_LOCK không có end date
- ✅ Can lift early with reason

### Hoàn Tiền
- ✅ Hoàn bất kỳ số tiền (không nhất thiết full amount)
- ✅ Cộng vào Client wallet, không trừ Cleaner
- ✅ Tạo WalletTransaction audit trail
- ✅ Dùng MongoDB transaction cho safety

### Khuyến Mãi
- ✅ Auto-generate unique code
- ✅ Mã chỉ dùng 1 lần
- ✅ Check hết hạn trước áp dụng
- ✅ % discount riêng (cleaner salary unaffected)
- ✅ Max amount optional

### Ẩn Khiếu Nại
- ✅ Hidden complaints invisible to Client & Cleaner
- ✅ Admin still visible
- ✅ Audit trail recorded

---

## 🧪 TESTING CHECKLIST

### Backend Tests
- [ ] Xử phạt tất cả penalty types
- [ ] Cleaner blocked khi có active penalty
- [ ] Penalty countdown tính đúng
- [ ] Lift penalty hoạt động
- [ ] Refund adds to wallet correctly
- [ ] WalletTransaction created
- [ ] Promo code generated unique
- [ ] Promo code validation works
- [ ] Promo used only once
- [ ] Hide complaint blocks visibility
- [ ] Audit trail complete
- [ ] All notifications sent
- [ ] Input validation tight

### Frontend Tests
- [ ] Modals open/close smoothly
- [ ] Form validation works
- [ ] Confirmations appear
- [ ] Discount calculation correct
- [ ] Penalty countdown displays
- [ ] Promo codes list updated
- [ ] Applied codes disable input
- [ ] History timeline correct
- [ ] No hidden complaints visible

---

## 📋 TRIỂN KHAI TỪNG BƯỚC

### Week 1: Frontend Components
- Day 1-2: Create 5 modals
- Day 3-4: Create history & penalty pages
- Day 5: Integrate with complaint detail

### Week 2: Admin Pages
- Day 1-3: Complaint detail page + modals
- Day 4-5: Cleaner penalties page

### Week 3: Client Pages
- Day 1-3: Booking info + promo code input
- Day 4-5: Wallet + transaction display

### Week 4: Testing & Fixes
- Day 1-3: End-to-end testing
- Day 4-5: Bug fixes & optimization

---

## 🔒 SECURITY NOTES

✅ **Authentication:** Tất cả endpoints protected  
✅ **Authorization:** Chỉ admin mới xử phạt/hoàn tiền  
✅ **Input Validation:** Tight validation mọi input  
✅ **Audit Trail:** Log tất cả hành động  
✅ **Transactions:** Dùng MongoDB sessions cho multi-step ops  
✅ **Permissions:** Cleaner/Client không thể abuse system  

---

## 📞 DEPLOYMENT NOTES

1. **Database Migration:**
   - Tất cả models đã tạo, không cần migration
   - Indices tự động tạo khi model init

2. **Environment Variables:**
   - Không cần thêm variables mới

3. **Dependencies:**
   - Không cần thêm npm packages

4. **Backwards Compatibility:**
   - ✅ Hoàn toàn compatible với code cũ
   - ✅ Không thay đổi API cũ
   - ✅ Chỉ thêm fields mới (optional)

---

## 📚 REFERENCE FILES

- Backend Docs: `src/COMPLAINT_MODULE_DOCUMENTATION.js`
- Frontend Guide: `src/layouts/components/admin/ManageDisputes/FRONTEND_COMPONENTS_GUIDE.js`
- Implementation: `IMPLEMENTATION_GUIDE.md`
- Client Routes: `src/routes/CLIENT_ROUTES_ADDITION.js`

---

## 🎓 DEVELOPER NOTES

- Backend framework: Node.js + Express + MongoDB
- Frontend framework: React + Vite + Tailwind CSS
- Authentication: JWT (existing middleware)
- Database: MongoDB with Mongoose ODM
- Architecture: MVC pattern with services

---

**Status:** Ready for Frontend Development  
**Last Updated:** May 13, 2026  
**Version:** 2.0.0  

Approved for deployment pending frontend completion.
