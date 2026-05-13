# CẬP NHẬT MODULE XỬ LÝ KHIẾU NẠI - HƯỚNG DẪN TRIỂN KHAI

**Ngày cập nhật:** 13 Tháng 5, 2026  
**Phiên bản:** 2.0  
**Trạng thái:** Sẵn sàng triển khai

---

## 📋 TÓMNHÂN LỰC

### ✅ Hoàn thành phía Backend

#### 1. Models Mới Tạo
- ✅ `CleanerPenaltyModel.js` - Quản lý xử phạt Cleaner
- ✅ `PromotionCodeModel.js` - Quản lý mã khuyến mãi
- ✅ `ComplaintHistoryModel.js` - Lịch sử hành động khiếu nại

#### 2. Models Được Cập Nhật
- ✅ `BookingComplaintModel.js` - Thêm field `Is_Hidden`

#### 3. Services Mới
- ✅ `complaintService.js` - Các hàm tiện ích cho khiếu nại

#### 4. Controller Functions Mới (9 functions)
- ✅ `penalizeCleaner()` - Xử phạt Cleaner
- ✅ `refundClient()` - Hoàn tiền cho Client
- ✅ `giftPromotionCode()` - Tặng mã khuyến mãi
- ✅ `hideComplaint()` - Ẩn khiếu nại
- ✅ `getComplaintHistory()` - Lấy lịch sử
- ✅ `getCleanerPenalties()` - Danh sách xử phạt
- ✅ `getActiveCleanerPenalties()` - Xử phạt đang hoạt động
- ✅ `liftPenalty()` - Hủy xử phạt
- ✅ `getClientPromoCodes()` - Lấy mã của Client
- ✅ `applyPromotionCode()` - Áp dụng mã khuyến mãi

#### 5. Routes Mới (13 endpoints)
- ✅ Cập nhật `adminRoutes/index.js` với tất cả endpoints

#### 6. Cập Nhật Controller Tồn Tại
- ✅ `resolveComplaint()` - Bổ sung logging và notifications

---

## 🎯 CÔNG VIỆC CẦN LÀM PHÍA FRONTEND

### 1. Modals & Components
| Công Việc | Mô Tả | Trạng Thái |
|-----------|--------|-----------|
| PenaltyModal | Modal xử phạt Cleaner | ⏳ TODO |
| RefundModal | Modal hoàn tiền | ⏳ TODO |
| PromoCodeModal | Modal tặng mã khuyến mãi | ⏳ TODO |
| HideComplaintModal | Modal ẩn khiếu nại | ⏳ TODO |
| ConfirmationDialog | Dialog xác nhận chung | ⏳ TODO |

### 2. Trang Quản Lý Khiếu Nại
| Công Việc | Mô Tả | Trạng Thái |
|-----------|--------|-----------|
| Chi Tiết Khiếu Nại | Thêm 5 nút hành động mới | ⏳ TODO |
| Hiển Thị Nút Hành Động | Điều kiện hiển thị nút dựa trên trạng thái | ⏳ TODO |
| Lịch Sử Khiếu Nại | Timeline hiển thị tất cả hành động | ⏳ TODO |
| Thông Báo Kết Quả | Toast/Alert hiển thị kết quả | ⏳ TODO |

### 3. Trang Xử Phạt Cleaner
| Công Việc | Mô Tả | Trạng Thái |
|-----------|--------|-----------|
| Danh Sách Xử Phạt | Hiển thị tất cả xử phạt của Cleaner | ⏳ TODO |
| Trạng Thái Xử Phạt | Countdown timer kết thúc xử phạt | ⏳ TODO |
| Nút Hủy Xử Phạt | Cho Admin hủy xử phạt sớm | ⏳ TODO |
| Filter | Lọc xử phạt đang hoạt động/lịch sử | ⏳ TODO |

### 4. Trang Mã Khuyến Mãi
| Công Việc | Mô Tả | Trạng Thái |
|-----------|--------|-----------|
| Danh Sách Mã Client | Hiển thị mã khuyến mãi của Client | ⏳ TODO |
| Mã Có Sẵn | Chỉ hiển thị mã chưa dùng và chưa hết hạn | ⏳ TODO |
| Chi Tiết Mã | Hiển thị % giảm, giới hạn tối đa, hạn sử dụng | ⏳ TODO |

### 5. Trang Booking Info (Client)
| Công Việc | Mô Tả | Trạng Thái |
|-----------|--------|-----------|
| Input Mã Giảm Giá | Thêm field "MÃ GIẢM GIÁ" | ⏳ TODO |
| Validate Mã | Kiểm tra mã khi nhập | ⏳ TODO |
| Hiển Thị Discount | Hiển thị % giảm và số tiền giảm | ⏳ TODO |
| Tính Toán Giá | Cập nhật tổng tiền khi áp dụng mã | ⏳ TODO |

### 6. Trang Ví Client
| Công Việc | Mô Tả | Trạng Thái |
|-----------|--------|-----------|
| Lịch Sử Transaction | Hiển thị loại REFUND | ⏳ TODO |
| Label Hoàn Tiền | "Hoàn tiền khiếu nại" | ⏳ TODO |
| Link Booking | Link đến booking liên quan | ⏳ TODO |

### 7. Validation Khiếu Nại Client
| Công Việc | Mô Tả | Trạng Thái |
|-----------|--------|-----------|
| Ẩn Khiếu Nại | Không hiển thị khiếu nại có Is_Hidden=true | ⏳ TODO |
| Lọc API | Khi fetch khiếu nại, loại bỏ hidden | ⏳ TODO |

---

## 🔌 API ENDPOINTS REFERENCE

### Penalty Management
```
POST /admin/complaints/:complaintId/penalize
  Body: { penaltyType, reason, note }
  Response: { success, message, data }

GET /admin/cleaners/:cleanerId/penalties?page=1&limit=20&isActive=true
  Response: { success, data: [], pagination }

GET /admin/cleaners/:cleanerId/active-penalties
  Response: { success, data: [], isBlocked }

POST /admin/penalties/:penaltyId/lift
  Body: { reason, note }
  Response: { success, message, data }
```

### Refund
```
POST /admin/complaints/:complaintId/refund
  Body: { amount, reason, note }
  Response: { success, message, data }
```

### Promotion Code
```
POST /admin/complaints/:complaintId/gift-promo
  Body: { discountPercentage, maxDiscountAmount, expiryDate, reason, note }
  Response: { success, message, data }

GET /admin/clients/:clientId/promo-codes?includeUsed=false
  Response: { success, data: [] }

POST /admin/promo-codes/apply
  Body: { code, bookingId }
  Response: { success, message, data: { discountPercentage, maxDiscountAmount } }
```

### Complaint Management
```
POST /admin/complaints/:complaintId/hide
  Body: { reason, note }
  Response: { success, message, data }

GET /admin/complaints/:complaintId/history?page=1&limit=20
  Response: { success, data: [], pagination }

PATCH /admin/complaints/:id/resolve
  Body: { status, adminNote, isRefunded, isReviewHidden }
  Response: { success, message, data }
```

---

## 📝 IMPLEMENTATION STEPS

### Phase 1: Components (1-2 ngày)
1. Tạo 5 Modals (Penalty, Refund, PromoCode, Hide, Confirm)
2. Tạo ComplaintHistory timeline component
3. Tạo ConfirmationDialog component

### Phase 2: Admin Pages (2-3 ngày)
1. Cập nhật ComplaintDetail page
   - Thêm 5 nút hành động
   - Integrate modals
   - Thêm lịch sử view
2. Tạo CleanerPenalties page
   - Danh sách + filter
   - Countdown timer
   - Nút lift penalty

### Phase 3: Client Pages (2-3 ngày)
1. Cập nhật BookingInfo page
   - Thêm input mã khuyến mãi
   - Validate + apply
   - Hiển thị discount preview
2. Cập nhật Wallet page
   - Hiển thị REFUND transactions
   - Link booking

### Phase 4: Validation (1-2 ngày)
1. Lọc khiếu nại ẩn trước khi display
2. Check penalties khi accept booking
3. Validate promo code khi áp dụng

### Phase 5: Testing (1-2 ngày)
1. End-to-end testing
2. Edge cases
3. Notification testing

---

## 🧪 TEST CASES

### Penalty Tests
```
[ ] Xử phạt với mỗi loại penalty
[ ] Cleaner không thể accept booking khi có penalty
[ ] Countdown timer hoạt động đúng
[ ] Lift penalty sớm hoạt động
[ ] History ghi lại tất cả hành động
```

### Refund Tests
```
[ ] Tiền được cộng vào wallet Client
[ ] WalletTransaction được tạo với category REFUND
[ ] Không trừ tiền Cleaner
[ ] Notification gửi cho cả Client và Cleaner
```

### Promo Code Tests
```
[ ] Mã được tạo ngẫu nhiên và unique
[ ] Client nhận notification khi được tặng mã
[ ] Mã chỉ dùng được 1 lần
[ ] Mã không dùng được sau khi hết hạn
[ ] Discount áp dụng đúng cách
[ ] Tiền công Cleaner không bị giảm
```

### Complaint Hiding Tests
```
[ ] Khiếu nại bị ẩn không hiển thị cho Client
[ ] Khiếu nại bị ẩn không hiển thị cho Cleaner
[ ] Admin vẫn thấy được khiếu nại ẩn
[ ] Notification gửi cho cả hai bên
```

---

## 🔒 Security Considerations

1. **Authentication**: Tất cả endpoints đều protected với `AdminMiddleware.protect`
2. **Authorization**: Chỉ Admin mới có thể xử phạt/hoàn tiền/tặng mã
3. **Input Validation**: Tất cả input được validate trước khi xử lý
4. **Audit Trail**: Mọi hành động được log trong ComplaintHistory
5. **Transaction Safety**: Dùng MongoDB sessions cho refund (multi-step operation)

---

## 📊 DATABASE INDICES

Tất cả indices đã được setup trong models:

```
CleanerPenalty
- Cleaner_Id + Is_Active + Penalty_End_Date (check active penalties)

PromotionCode
- Client_Id + Is_Active + Is_Used + Expiry_Date (get valid codes)

ComplaintHistory
- Admin_Id + createdAt
- Complaint_Id + createdAt

BookingComplaint
- Client_Id + Is_Hidden
- Cleaner_Id + Is_Hidden
```

---

## 🐛 TROUBLESHOOTING

### Problem: Cleaner vẫn có thể accept booking khi bị penalty
**Solution**: Tại BookingController khi accept, gọi `getActiveCleanerPenalties()` và reject nếu isBlocked=true

### Problem: Promo code không được áp dụng
**Solution**: Kiểm tra mã hết hạn, đã dùng, hoặc thuộc Client khác

### Problem: Khiếu nại ẩn vẫn hiển thị
**Solution**: Thêm filter `Is_Hidden: false` khi fetch khiếu nại Client/Cleaner

### Problem: Tiền hoàn không xuất hiện trong wallet
**Solution**: Check Client đúng, check transaction được tạo, refresh page

---

## 📞 SUPPORT

Liên hệ Developer nếu có vấn đề:
- Backend API Issues: Server logs
- Frontend Issues: Browser console
- Database Issues: MongoDB compass

---

**Prepared by:** Development Team  
**Last Updated:** May 13, 2026  
**Next Review:** June 1, 2026
