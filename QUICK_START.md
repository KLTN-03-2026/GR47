# QUICK START GUIDE - COMPLAINT MODULE UPDATE

## 🚀 ĐỂ BẮT ĐẦU NGAY

### Backend Status: ✅ READY
Tất cả code backend đã hoàn thành và sẵn sàng sử dụng.

**Các file đã tạo:**
1. `CleanerPenaltyModel.js` - Xử phạt Cleaner
2. `PromotionCodeModel.js` - Mã khuyến mãi
3. `ComplaintHistoryModel.js` - Lịch sử
4. `complaintService.js` - Service functions
5. Updated `ComplaintController.js` - 9 functions mới
6. Updated `adminRoutes/index.js` - 13 endpoints

---

## 🎮 TEST ENDPOINTS NGAY

### 1. Xử phạt Cleaner
```bash
curl -X POST http://localhost:5000/admin/complaints/COMPLAINT_ID/penalize \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "penaltyType": "LOCK_1_HOUR",
    "reason": "Không tuân thủ chất lượng dịch vụ",
    "note": "Để ý thêm"
  }'
```

### 2. Hoàn tiền
```bash
curl -X POST http://localhost:5000/admin/complaints/COMPLAINT_ID/refund \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "reason": "Khách hàng không hài lòng",
    "note": "Được xử lý ngay"
  }'
```

### 3. Tặng mã khuyến mãi
```bash
curl -X POST http://localhost:5000/admin/complaints/COMPLAINT_ID/gift-promo \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discountPercentage": 20,
    "maxDiscountAmount": 50000,
    "expiryDate": "2026-06-13",
    "reason": "Bù trừ cho khách hàng",
    "note": "Hết hạn: 1 tháng"
  }'
```

### 4. Ẩn khiếu nại
```bash
curl -X POST http://localhost:5000/admin/complaints/COMPLAINT_ID/hide \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "DUPLICATE",
    "note": "Khiếu nại trùng lặp với #12345"
  }'
```

### 5. Lấy lịch sử khiếu nại
```bash
curl -X GET "http://localhost:5000/admin/complaints/COMPLAINT_ID/history?page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📝 FRONTEND WORKFLOW

### Page: Admin > ManageDisputes > Complaint Detail

**Bước 1:** Mở dialog chi tiết khiếu nại
- Hiển thị thông tin complaint/client/cleaner

**Bước 2:** Thêm 5 nút hành động
```jsx
<button onClick={() => setShowPenaltyModal(true)}>
  🔴 Xử phạt Cleaner
</button>

<button onClick={() => setShowRefundModal(true)}>
  💚 Hoàn tiền
</button>

<button onClick={() => setShowPromoModal(true)}>
  🎁 Tặng mã khuyến mãi
</button>

<button onClick={() => setShowHideModal(true)}>
  👁️ Ẩn khiếu nại
</button>

<button onClick={() => setShowHistory(true)}>
  📋 Xem lịch sử
</button>
```

**Bước 3:** Mỗi nút mở modal tương ứng
- Form validation
- Confirmation dialog (Xác nhận)
- Call API endpoint
- Refresh complaint data
- Show success toast

---

## 📦 MODAL STRUCTURE

### PenaltyModal
```jsx
- Select penalty type
- Textarea reason (required)
- Textarea note (optional)
- Confirm/Cancel buttons
```

### RefundModal
```jsx
- Input amount (required)
- Textarea reason (required)
- Textarea note (optional)
- Show preview: "Hoàn 100,000đ"
- Confirm/Cancel buttons
```

### PromoCodeModal
```jsx
- Input discount % (1-100)
- Input max discount amount (optional)
- Date picker expiry date
- Textarea reason (required)
- Textarea note (optional)
- After success: Show generated code
- Confirm/Cancel buttons
```

### HideComplaintModal
```jsx
- Select hide reason dropdown
- Textarea note (optional)
- ⚠️ Warning: "Không thể xem lại"
- Confirm/Cancel buttons
```

---

## 🔗 API ENDPOINTS SUMMARY

### Penalty
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/admin/complaints/:id/penalize` | Xử phạt |
| GET | `/admin/cleaners/:id/penalties` | Danh sách xử phạt |
| GET | `/admin/cleaners/:id/active-penalties` | Xử phạt hoạt động |
| POST | `/admin/penalties/:id/lift` | Hủy xử phạt |

### Refund
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/admin/complaints/:id/refund` | Hoàn tiền |

### Promo
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/admin/complaints/:id/gift-promo` | Tặng mã |
| GET | `/admin/clients/:id/promo-codes` | Danh sách mã |
| POST | `/admin/promo-codes/apply` | Áp dụng mã |

### Complaint
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/admin/complaints/:id/hide` | Ẩn khiếu nại |
| GET | `/admin/complaints/:id/history` | Lịch sử |

---

## 💾 DATABASE FIELDS

### CleanerPenalty
```javascript
{
  Cleaner_Id, Booking_Id, Complaint_Id, Admin_Id,
  Penalty_Type: "LOCK_5_MIN" | "LOCK_30_MIN" | ... | "ACCOUNT_LOCK",
  Reason, Note,
  Penalty_Start_Date, Penalty_End_Date,
  Is_Active, Lifted_At, Lifted_Reason
}
```

### PromotionCode
```javascript
{
  Code,
  Client_Id, Booking_Id, Complaint_Id, Admin_Id,
  Discount_Percentage (1-100),
  Max_Discount_Amount,
  Reason, Note,
  Expiry_Date,
  Is_Used, Used_At, Used_For_Booking_Id,
  Is_Active
}
```

### ComplaintHistory
```javascript
{
  Complaint_Id, Booking_Id, Admin_Id,
  Action_Type: "RESOLVE" | "REJECT" | "PENALIZE" | ...,
  Old_Value, New_Value,
  Description, Additional_Data, Notes,
  Is_Visible_To_Client, Is_Visible_To_Cleaner
}
```

---

## ✨ KEY FEATURES

### ✅ Xử Phạt
- Admin chọn loại penalty (5 min - 24 hour - lock account)
- Tự động tính ngày hết hạn
- Cleaner bị chặn không nhận đơn
- Can lift early

### ✅ Hoàn Tiền
- Tiền cộng vào ví Client
- Tạo WalletTransaction
- Không trừ tiền Cleaner
- Gửi notification cả 2 bên

### ✅ Mã Khuyến Mãi
- Auto-generate unique code
- % discount + max amount
- Chỉ dùng 1 lần
- Expiry date checking

### ✅ Ẩn Khiếu Nại
- Hidden từ Client & Cleaner
- Admin vẫn thấy
- Notification gửi

### ✅ Lịch Sử
- Log tất cả hành động
- Admin + timestamp + details
- Timeline view

---

## 🧪 VALIDATION RULES

```javascript
// Penalty
- penaltyType in ['LOCK_5_MIN', 'LOCK_30_MIN', ...]
- reason: required, max 500 chars
- note: optional

// Refund
- amount > 0
- reason: required

// Promo
- discountPercentage: 1-100
- expiryDate > today
- reason: required

// Hide
- reason: required
```

---

## 📱 CLIENT SIDE FEATURES

### Booking Info (Client)
```jsx
<input placeholder="Mã giảm giá" maxLength="20" />
// When applied:
- Show discount %
- Show discount amount
- Disable input
```

### Wallet (Client)
```jsx
// Show REFUND transactions
- Date
- "Hoàn tiền khiếu nại"
- Amount
- Link to booking
```

### View Complaints (Client/Cleaner)
```jsx
// Don't show Is_Hidden complaints
// Filter: Is_Hidden: false
```

---

## 🔐 SECURITY

✅ All endpoints require Admin token  
✅ Tight input validation  
✅ Audit trail logged  
✅ Transactions used for safety  
✅ Permissions enforced  

---

## 🐞 DEBUGGING

### If promo code not working:
1. Check expiry date
2. Check Is_Used flag
3. Check Client_Id match
4. Check Is_Active flag

### If refund not appearing:
1. Check Client ID
2. Check wallet transaction created
3. Check IPay_Balance updated
4. Refresh page

### If penalty not blocking:
1. Check Is_Active flag
2. Check Penalty_End_Date > now
3. When accept booking, call `getActiveCleanerPenalties`

---

## 📞 SUPPORT

**Issues:** Check Browser Console + Server Logs  
**Questions:** See DOCUMENTATION files  
**Specific:** Check inline code comments  

---

**Ready to deploy!** 🚀
