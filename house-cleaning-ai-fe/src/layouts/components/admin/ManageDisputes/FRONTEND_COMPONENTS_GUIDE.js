/**
 * FRONTEND COMPONENTS GUIDE
 * 
 * Copy these components to: house-cleaning-ai-fe/src/layouts/components/admin/ManageDisputes/
 * 
 * This file shows example implementations for the new complaint management features
 */

// ============================================================================
// 1. PENALTY MODAL COMPONENT
// ============================================================================

/**
 * File: PenaltyModal.jsx
 * 
 * Usage:
 * <PenaltyModal
 *   isOpen={showPenaltyModal}
 *   complaintId={complaint._id}
 *   cleanerName={complaint.Cleaner_Id?.Full_Name}
 *   onClose={() => setShowPenaltyModal(false)}
 *   onSuccess={() => {
 *     setShowPenaltyModal(false);
 *     refreshComplaintDetail();
 *   }}
 * />
 */

export const PenaltyModalExample = `
import { useState } from 'react';
import axiosInstance from '../../../../../../utils/axiosConfig';

const PenaltyModal = ({ isOpen, complaintId, cleanerName, onClose, onSuccess }) => {
  const [penaltyType, setPenaltyType] = useState('LOCK_5_MIN');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const penaltyOptions = [
    { value: 'LOCK_5_MIN', label: 'Khóa nhận đơn 5 phút' },
    { value: 'LOCK_30_MIN', label: 'Khóa nhận đơn 30 phút' },
    { value: 'LOCK_1_HOUR', label: 'Khóa nhận đơn 1 giờ' },
    { value: 'LOCK_6_HOUR', label: 'Khóa nhận đơn 6 giờ' },
    { value: 'LOCK_24_HOUR', label: 'Khóa nhận đơn 24 giờ' },
    { value: 'ACCOUNT_LOCK', label: 'Khóa tài khoản' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do xử phạt');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(\`/admin/complaints/\${complaintId}/penalize\`, {
        penaltyType,
        reason,
        note
      });
      
      alert('Xử phạt thành công');
      onSuccess?.();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xử phạt');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-500px w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Xử phạt Cleaner</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Cleaner: {cleanerName}</label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Loại xử phạt</label>
            <select
              value={penaltyType}
              onChange={(e) => setPenaltyType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {penaltyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Lý do xử phạt *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do xử phạt..."
              className="w-full border rounded px-3 py-2 h-24"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{reason.length}/500</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ghi chú (tuỳ chọn)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm..."
              className="w-full border rounded px-3 py-2 h-16"
              maxLength={500}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
            >
              {loading ? 'Đang xử lý...' : 'Xử phạt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
`;

// ============================================================================
// 2. REFUND MODAL COMPONENT
// ============================================================================

export const RefundModalExample = `
import { useState } from 'react';
import axiosInstance from '../../../../../../utils/axiosConfig';

const RefundModal = ({ isOpen, complaintId, bookingAmount, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(bookingAmount || 0);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      alert('Nhập số tiền hợp lệ');
      return;
    }

    if (!reason.trim()) {
      alert('Vui lòng nhập lý do hoàn tiền');
      return;
    }

    const confirmed = confirm(
      \`Xác nhận hoàn tiền \${amount.toLocaleString('vi-VN')}đ cho khách hàng?\`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      await axiosInstance.post(\`/admin/complaints/\${complaintId}/refund\`, {
        amount: parseInt(amount),
        reason,
        note
      });
      
      alert('Hoàn tiền thành công');
      onSuccess?.();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi hoàn tiền');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-500px w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Hoàn tiền cho khách hàng</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Số tiền (VND) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="0"
              min="1000"
            />
            <p className="text-sm text-blue-600 mt-1">
              Hoàn tiền: {parseInt(amount || 0).toLocaleString('vi-VN')}đ
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Lý do hoàn tiền *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do..."
              className="w-full border rounded px-3 py-2 h-24"
              maxLength={500}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ghi chú (tuỳ chọn)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm..."
              className="w-full border rounded px-3 py-2 h-16"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Đang xử lý...' : 'Hoàn tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
`;

// ============================================================================
// 3. PROMO CODE MODAL COMPONENT
// ============================================================================

export const PromoCodeModalExample = `
import { useState } from 'react';
import axiosInstance from '../../../../../../utils/axiosConfig';

const PromoCodeModal = ({ isOpen, complaintId, onClose, onSuccess }) => {
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
      alert('Phần trăm giảm giá phải từ 1-100%');
      return;
    }

    if (!expiryDate) {
      alert('Chọn ngày hết hạn');
      return;
    }

    if (new Date(expiryDate) <= new Date()) {
      alert('Ngày hết hạn phải lớn hơn hôm nay');
      return;
    }

    if (!reason.trim()) {
      alert('Nhập lý do tặng mã');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        \`/admin/complaints/\${complaintId}/gift-promo\`,
        {
          discountPercentage: parseInt(discountPercentage),
          maxDiscountAmount: maxDiscountAmount ? parseInt(maxDiscountAmount) : null,
          expiryDate,
          reason,
          note
        }
      );

      const data = response.data.data;
      setGeneratedCode(data.Code || 'GENERATED');
      alert('Tặng mã thành công');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi tặng mã');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-500px w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Tặng mã khuyến mãi</h2>
        
        {generatedCode ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-bold text-2xl mb-4">{generatedCode}</p>
            <p className="text-gray-600 mb-4">Mã đã được tặng cho khách hàng</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Phần trăm giảm giá (%) *</label>
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-full border rounded px-3 py-2"
                min="1"
                max="100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Giá trị giảm tối đa (VND)</label>
              <input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Không giới hạn"
                min="0"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Ngày hết hạn *</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Lý do tặng *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do..."
                className="w-full border rounded px-3 py-2 h-20"
                maxLength={500}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Ghi chú (tuỳ chọn)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm..."
                className="w-full border rounded px-3 py-2 h-16"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
              >
                {loading ? 'Đang xử lý...' : 'Tặng mã'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
`;

// ============================================================================
// 4. HIDE COMPLAINT MODAL
// ============================================================================

export const HideComplaintModalExample = `
import { useState } from 'react';
import axiosInstance from '../../../../../../utils/axiosConfig';

const HideComplaintModal = ({ isOpen, complaintId, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const hideReasons = [
    { value: 'DUPLICATE', label: 'Khiếu nại trùng lặp' },
    { value: 'SPAM', label: 'Khiếu nại spam' },
    { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp' },
    { value: 'RESOLVED_OFFLINE', label: 'Đã giải quyết ngoài hệ thống' },
    { value: 'OTHER', label: 'Lý do khác' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      alert('Chọn lý do ẩn khiếu nại');
      return;
    }

    const confirmed = confirm(
      'Xác nhận ẩn khiếu nại? Khách hàng và Cleaner sẽ không nhìn thấy khiếu nại này.'
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      await axiosInstance.post(\`/admin/complaints/\${complaintId}/hide\`, {
        reason,
        note
      });
      
      alert('Ẩn khiếu nại thành công');
      onSuccess?.();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi ẩn khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-500px w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Ẩn khiếu nại</h2>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          ⚠️ Khách hàng và Cleaner sẽ không thể xem khiếu nại này sau khi ẩn.
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Lý do ẩn *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Chọn lý do --</option>
              {hideReasons.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ghi chú (tuỳ chọn)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm..."
              className="w-full border rounded px-3 py-2 h-16"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
            >
              {loading ? 'Đang xử lý...' : 'Ẩn khiếu nại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
`;

// ============================================================================
// 5. COMPLAINT DETAIL PAGE MODIFICATIONS
// ============================================================================

export const ComplaintDetailPageExample = `
// In ManageDisputes/ComplaintDetail.jsx or similar

import { useState, useEffect } from 'react';
import PenaltyModal from './modals/PenaltyModal';
import RefundModal from './modals/RefundModal';
import PromoCodeModal from './modals/PromoCodeModal';
import HideComplaintModal from './modals/HideComplaintModal';
import ComplaintHistory from './ComplaintHistory';

export default function ComplaintDetail() {
  const [complaint, setComplaint] = useState(null);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const refreshComplaint = async () => {
    // Fetch fresh complaint data
  };

  return (
    <div className="p-6">
      {/* Complaint Details */}
      <div className="bg-white rounded-lg p-6 mb-6">
        {/* ... existing complaint info ... */}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowPenaltyModal(true)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Xử phạt Cleaner
        </button>
        <button
          onClick={() => setShowRefundModal(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Hoàn tiền
        </button>
        <button
          onClick={() => setShowPromoModal(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Tặng mã khuyến mãi
        </button>
        <button
          onClick={() => setShowHideModal(true)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Ẩn khiếu nại
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Xem lịch sử
        </button>
      </div>

      {/* Modals */}
      <PenaltyModal
        isOpen={showPenaltyModal}
        complaintId={complaint?._id}
        cleanerName={complaint?.Cleaner_Id?.Full_Name}
        onClose={() => setShowPenaltyModal(false)}
        onSuccess={() => {
          setShowPenaltyModal(false);
          refreshComplaint();
        }}
      />

      <RefundModal
        isOpen={showRefundModal}
        complaintId={complaint?._id}
        bookingAmount={complaint?.Booking_Id?.Total_Amount}
        onClose={() => setShowRefundModal(false)}
        onSuccess={() => {
          setShowRefundModal(false);
          refreshComplaint();
        }}
      />

      <PromoCodeModal
        isOpen={showPromoModal}
        complaintId={complaint?._id}
        onClose={() => setShowPromoModal(false)}
        onSuccess={() => {
          setShowPromoModal(false);
          refreshComplaint();
        }}
      />

      <HideComplaintModal
        isOpen={showHideModal}
        complaintId={complaint?._id}
        onClose={() => setShowHideModal(false)}
        onSuccess={() => {
          setShowHideModal(false);
          refreshComplaint();
        }}
      />

      {/* History Modal/Sidebar */}
      {showHistory && (
        <ComplaintHistory
          complaintId={complaint?._id}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
`;

export default {
  PenaltyModalExample,
  RefundModalExample,
  PromoCodeModalExample,
  HideComplaintModalExample,
  ComplaintDetailPageExample
};
