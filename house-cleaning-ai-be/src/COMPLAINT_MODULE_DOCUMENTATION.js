/**
 * COMPLAINT MODULE UPDATE DOCUMENTATION
 * 
 * Updated: May 13, 2026
 * Version: 2.0
 * 
 * This document outlines all new functionality added to the complaint management system.
 */

// ============================================================================
// BACKEND CHANGES
// ============================================================================

/**
 * 1. NEW MODELS CREATED
 */

// ============================================================================
// CleanerPenaltyModel.js
// ============================================================================
/**
 * Tracks penalties imposed on cleaners
 * 
 * Fields:
 * - Cleaner_Id: Reference to Cleaner
 * - Booking_Id: Reference to related Booking
 * - Complaint_Id: Reference to Complaint that triggered penalty
 * - Admin_Id: Admin who imposed penalty
 * - Penalty_Type: LOCK_5_MIN, LOCK_30_MIN, LOCK_1_HOUR, LOCK_6_HOUR, LOCK_24_HOUR, ACCOUNT_LOCK
 * - Reason: Required reason for penalty
 * - Note: Optional notes
 * - Penalty_Start_Date: When penalty starts
 * - Penalty_End_Date: When penalty expires (null for ACCOUNT_LOCK)
 * - Is_Active: Whether penalty is currently active
 * - Lifted_At: When penalty was lifted (if any)
 * - Lifted_Reason: Reason for lifting
 * 
 * Indexes:
 * - Cleaner_Id + Is_Active + Penalty_End_Date (for checking active penalties)
 */

// ============================================================================
// PromotionCodeModel.js
// ============================================================================
/**
 * Tracks promotion codes gifted to clients as complaint compensation
 * 
 * Fields:
 * - Code: Unique promotion code (auto-generated)
 * - Client_Id: Recipient client
 * - Booking_Id: Related booking
 * - Complaint_Id: Related complaint
 * - Admin_Id: Admin who created code
 * - Discount_Percentage: 1-100%
 * - Max_Discount_Amount: Optional maximum discount (in VND)
 * - Reason: Reason for gifting
 * - Note: Optional notes
 * - Expiry_Date: When code expires
 * - Is_Used: Whether code has been used
 * - Used_At: When code was used
 * - Used_For_Booking_Id: Which booking it was used on
 * - Is_Active: Whether code is active
 */

// ============================================================================
// ComplaintHistoryModel.js
// ============================================================================
/**
 * Logs all actions taken on complaints for audit trail
 * 
 * Fields:
 * - Complaint_Id: Which complaint
 * - Booking_Id: Which booking
 * - Admin_Id: Which admin took action
 * - Action_Type: CREATE, RESOLVE, REJECT, PENALIZE, REFUND, GIFT_PROMO, HIDE, DELETE, LIFT_PENALTY
 * - Old_Value: Previous values
 * - New_Value: New values
 * - Description: Human-readable description
 * - Additional_Data: Extra data (penalty ID, promo ID, etc.)
 * - Notes: Admin notes
 * - Is_Visible_To_Client: Whether client can see this action
 * - Is_Visible_To_Cleaner: Whether cleaner can see this action
 */

// ============================================================================
// UPDATED MODELS
// ============================================================================

/**
 * BookingComplaintModel - Added fields:
 * - Is_Hidden: Boolean (default: false) - Hides complaint from Client and Cleaner views
 */

// ============================================================================
// 2. NEW SERVICES
// ============================================================================

/**
 * complaintService.js
 * 
 * Functions:
 * - logComplaintAction(): Log any action on complaint for audit trail
 * - calculatePenaltyEndDate(): Calculate when penalty expires
 * - getPenaltyDurationText(): Get human-readable penalty duration
 * - sendComplaintActionNotifications(): Send notifications to both parties
 * - validatePromoCodeData(): Validate promo code input
 * - generatePromoCode(): Create unique promo code
 */

// ============================================================================
// 3. NEW CONTROLLER FUNCTIONS
// ============================================================================

/**
 * PENALTY MANAGEMENT
 */

/**
 * POST /admin/complaints/:complaintId/penalize
 * Penalize a cleaner for the complaint
 * 
 * Request Body:
 * {
 *   "penaltyType": "LOCK_5_MIN" | "LOCK_30_MIN" | "LOCK_1_HOUR" | "LOCK_6_HOUR" | "LOCK_24_HOUR" | "ACCOUNT_LOCK",
 *   "reason": "string", // Required - reason for penalty
 *   "note": "string" // Optional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Đã xử phạt Cleaner: X",
 *   "data": { complaint details }
 * }
 * 
 * Actions:
 * 1. Create CleanerPenalty record
 * 2. Log action in ComplaintHistory
 * 3. Send notifications to Client and Cleaner
 * 4. Cleaner cannot accept new bookings during penalty
 */

/**
 * POST /admin/penalties/:penaltyId/lift
 * Lift/remove a penalty
 * 
 * Request Body:
 * {
 *   "reason": "string", // Required - reason for lifting
 *   "note": "string" // Optional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Đã hủy xử phạt",
 *   "data": { penalty details }
 * }
 */

/**
 * GET /admin/cleaners/:cleanerId/penalties
 * Get all penalties for a cleaner
 * 
 * Query:
 * - page: int (default: 1)
 * - limit: int (default: 20)
 * - isActive: true|false|all (default: true)
 * 
 * Response includes populated Booking, Admin, and Complaint info
 */

/**
 * GET /admin/cleaners/:cleanerId/active-penalties
 * Get only active penalties blocking a cleaner (for validation during booking)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [ ... ],
 *   "isBlocked": true/false
 * }
 */

/**
 * REFUND MANAGEMENT
 */

/**
 * POST /admin/complaints/:complaintId/refund
 * Refund money to client's wallet
 * 
 * Request Body:
 * {
 *   "amount": 50000, // Required - amount in VND
 *   "reason": "string", // Required - reason for refund
 *   "note": "string" // Optional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Đã hoàn tiền X VND cho khách hàng",
 *   "data": { complaint details }
 * }
 * 
 * Actions:
 * 1. Add amount to Client.IPay_Balance
 * 2. Create WalletTransaction (REFUND category)
 * 3. Mark complaint as Is_Refunded = true
 * 4. Log action
 * 5. Send notifications
 * 
 * Important:
 * - Money comes from platform, NOT deducted from Cleaner
 * - Works for both cash and wallet payments
 */

/**
 * PROMOTION CODE MANAGEMENT
 */

/**
 * POST /admin/complaints/:complaintId/gift-promo
 * Gift promotion code to client as compensation
 * 
 * Request Body:
 * {
 *   "discountPercentage": 10, // Required: 1-100
 *   "maxDiscountAmount": 50000, // Optional: cap on discount amount
 *   "expiryDate": "2026-06-13", // Required: ISO date string
 *   "reason": "string", // Required
 *   "note": "string" // Optional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Đã tặng mã khuyến mãi COMP...",
 *   "data": { complaint details }
 * }
 * 
 * Features:
 * - Auto-generates unique code
 * - Client notified with code and expiry
 * - Can only be used once
 * - Cleaner earnings NOT affected
 */

/**
 * GET /admin/clients/:clientId/promo-codes
 * Get promotion codes for a client
 * 
 * Query:
 * - includeUsed: true|false (default: false) - include already-used codes
 * 
 * Returns only active, non-expired codes
 */

/**
 * POST /admin/promo-codes/apply
 * Apply promotion code to booking
 * 
 * Request Body:
 * {
 *   "code": "COMP...",
 *   "bookingId": "ObjectId"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Đã áp dụng mã khuyến mãi",
 *   "data": {
 *     "discountPercentage": 10,
 *     "maxDiscountAmount": 50000
 *   }
 * }
 * 
 * Validation:
 * - Code must be valid and not used
 * - Code must not be expired
 * - Code must belong to requesting client
 * - Marks code as used
 */

/**
 * COMPLAINT VISIBILITY
 */

/**
 * POST /admin/complaints/:complaintId/hide
 * Hide complaint from Client and Cleaner (Admin can still see)
 * 
 * Request Body:
 * {
 *   "reason": "string", // Required
 *   "note": "string" // Optional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Đã ẩn khiếu nại",
 *   "data": { complaint details }
 * }
 * 
 * Actions:
 * 1. Set Is_Hidden = true
 * 2. Log action
 * 3. Notify both parties
 */

/**
 * COMPLAINT HISTORY
 */

/**
 * GET /admin/complaints/:complaintId/history
 * Get audit trail of all actions on complaint
 * 
 * Query:
 * - page: int (default: 1)
 * - limit: int (default: 20)
 * 
 * Response includes Admin info
 * 
 * Shows all: resolve, reject, penalize, refund, promo, hide, etc.
 */

/**
 * EXISTING ROUTE UPDATES
 */

/**
 * PATCH /admin/complaints/:id/resolve
 * 
 * Updated to:
 * - Log action with ComplaintHistory
 * - Send notifications with updated messages
 * - Support hiding reviews
 * - Better refund tracking
 */

// ============================================================================
// CLIENT ROUTES (For applying promo codes)
// ============================================================================

/**
 * Client routes for applying promo codes during booking
 * Routes should be added to clientRoutes/index.js
 * 
 * POST /client/promo-codes/apply
 * - Client applies promo code to booking
 */

// ============================================================================
// FRONTEND CHANGES NEEDED
// ============================================================================

/**
 * 1. COMPLAINT DETAIL PAGE (Admin)
 * 
 * New Buttons:
 * - "Xử phạt Cleaner" - Opens penalty modal
 * - "Tặng mã khuyến mãi" - Opens promo code modal
 * - "Hoàn tiền" - Opens refund modal
 * - "Ẩn khiếu nại" - Opens hide confirmation
 * 
 * Each button should show confirmation dialog before action
 */

/**
 * 2. MODALS NEEDED
 * 
 * a) PenaltyModal
 *    - Dropdown for penalty type (5 min, 30 min, 1h, 6h, 24h, Account Lock)
 *    - Text area for reason
 *    - Optional notes
 *    - Confirm/Cancel buttons
 * 
 * b) RefundModal
 *    - Input for refund amount
 *    - Text area for reason
 *    - Optional notes
 *    - Show confirmation with amount
 *    - Confirm/Cancel buttons
 * 
 * c) PromoCodeModal
 *    - Input for discount percentage (1-100)
 *    - Input for max discount amount (optional)
 *    - Date picker for expiry date
 *    - Text area for reason
 *    - Optional notes
 *    - Auto-generated code display (after creation)
 *    - Confirm/Cancel buttons
 * 
 * d) HideComplaintModal
 *    - Confirmation message
 *    - Dropdown for hide reason
 *    - Optional notes
 *    - Confirm/Cancel buttons
 */

/**
 * 3. CLEANER PENALTIES PAGE (Admin)
 * 
 * Show:
 * - Cleaner info
 * - Active penalties
 * - Historical penalties (with lift/cancel option for old ones)
 * - Penalty duration countdown
 * - Related complaint info
 * - Option to lift penalty early
 */

/**
 * 4. COMPLAINT HISTORY VIEW
 * 
 * Show timeline of:
 * - Who did what
 * - When it happened
 * - What changed
 * - Admin notes
 * - Related entities (penalties, promos, etc.)
 */

/**
 * 5. BOOKING INFO PAGE (Client)
 * 
 * Add:
 * - "PROMOTION CODE" input field
 * - When code is applied:
 *   - Show discount percentage
 *   - Show max discount
 *   - Show discount preview
 *   - Cannot remove after applied
 */

/**
 * 6. CLIENT WALLET PAGE
 * 
 * Update:
 * - Show REFUND transactions in history
 * - Label refunds as "Hoàn tiền khiếu nại"
 * - Show related booking ID
 */

// ============================================================================
// VALIDATION & BUSINESS RULES
// ============================================================================

/**
 * 1. PENALTIES
 * 
 * - Cleaner cannot accept new bookings during penalty
 * - Use getActiveCleanerPenalties() when cleaner tries to accept booking
 * - Each penalty is tied to a specific complaint
 * - Multiple penalties can stack (e.g., 2 different violations)
 * - ACCOUNT_LOCK has no end date (manual lift only)
 */

/**
 * 2. REFUNDS
 * 
 * - Can refund any amount (not just total)
 * - Works for both cash and wallet payments
 * - Money added to client wallet (IPay_Balance)
 * - Does NOT deduct from Cleaner earnings
 * - Creates audit trail in WalletTransaction
 */

/**
 * 3. PROMO CODES
 * 
 * - Cannot be used more than once
 * - Expires on specified date
 * - Can have percentage and max amount
 * - Only Cleaner earnings = unaffected
 * - Only Client (service) price = discounted
 * - Applied during booking creation
 */

/**
 * 4. COMPLAINT HIDING
 * 
 * - Client and Cleaner cannot see hidden complaints
 * - Admin can still see and manage hidden complaints
 * - Hiding does NOT delete complaint
 * - Audit trail is created
 */

/**
 * 5. NOTIFICATIONS
 * 
 * - Both parties notified of all actions
 * - Notification messages are specific to action type
 * - Include booking reference number
 * - Link to complaint details if needed
 */

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * All endpoints return:
 * - 400: Invalid input/validation error
 * - 401: Unauthorized (not logged in)
 * - 403: Forbidden (not admin)
 * - 404: Resource not found
 * - 500: Server error
 */

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * [ ] Admin can penalize cleaner with all penalty types
 * [ ] Cleaner cannot accept bookings during penalty
 * [ ] Penalty countdown works correctly
 * [ ] Admin can lift penalty early
 * [ ] Admin can refund money to client
 * [ ] Refund appears in client wallet
 * [ ] WalletTransaction created for refund
 * [ ] Admin can gift promo code
 * [ ] Client receives promo code notification
 * [ ] Client can apply promo code (code shows in booking)
 * [ ] Discount applied only to service price (not cleaner payment)
 * [ ] Admin can hide complaint
 * [ ] Hidden complaint not visible to client/cleaner
 * [ ] Hidden complaint still visible to admin
 * [ ] Complaint history shows all actions
 * [ ] Each action has admin name and timestamp
 * [ ] All notifications sent successfully
 * [ ] Notifications have correct titles and messages
 * [ ] Duplicate penalties prevented
 * [ ] Expired promo codes not applicable
 * [ ] Already-used promo codes not applicable
 */

export {};
