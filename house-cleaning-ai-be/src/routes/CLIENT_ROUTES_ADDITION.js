/**
 * ADDITIONAL CLIENT ROUTES
 * 
 * File: house-cleaning-ai-be/src/routes/clientRoutes/index.js
 * 
 * Add these routes to client routes for promo code functionality
 */

// Add to top of file (imports):
import * as ComplaintController from '../../controllers/ComplaintController.js';

// Add to clientRouter routes:

/**
 * Get available promo codes for current user
 * GET /client/promo-codes
 * 
 * Query:
 * - includeUsed: true|false (default: false)
 */
clientRouter.get('/promo-codes', ClientMiddleware.protect, async (req, res) => {
    const clientId = req.user?.id;
    const { includeUsed = 'false' } = req.query;

    try {
        const query = {
            Client_Id: clientId,
            Is_Active: true,
            Expiry_Date: { $gt: new Date() }
        };

        if (includeUsed !== 'true') {
            query.Is_Used = false;
        }

        const codes = await PromotionCode.find(query)
            .select('Code Discount_Percentage Max_Discount_Amount Expiry_Date Is_Used')
            .sort({ Expiry_Date: 1 });

        return res.status(200).json({
            success: true,
            data: codes.map(code => ({
                _id: code._id,
                code: code.Code,
                discountPercentage: code.Discount_Percentage,
                maxDiscountAmount: code.Max_Discount_Amount,
                expiryDate: code.Expiry_Date,
                isUsed: code.Is_Used,
                isExpired: new Date(code.Expiry_Date) <= new Date()
            }))
        });
    } catch (error) {
        console.error('getClientPromoCodes:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * Validate and preview promo code
 * POST /client/promo-codes/validate
 * 
 * Body:
 * {
 *   "code": "COMP...",
 *   "totalAmount": 500000
 * }
 * 
 * Returns discount details without using the code
 */
clientRouter.post('/promo-codes/validate', ClientMiddleware.protect, async (req, res) => {
    const clientId = req.user?.id;
    const { code, totalAmount } = req.body;

    try {
        if (!code || code.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập mã' });
        }

        const promo = await PromotionCode.findOne({
            Code: code.toUpperCase(),
            Client_Id: clientId,
            Is_Active: true,
            Is_Used: false,
            Expiry_Date: { $gt: new Date() }
        });

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Mã không hợp lệ hoặc đã hết hạn' });
        }

        const discountAmount = Math.floor((totalAmount * promo.Discount_Percentage) / 100);
        const finalDiscount = promo.Max_Discount_Amount
            ? Math.min(discountAmount, promo.Max_Discount_Amount)
            : discountAmount;

        return res.status(200).json({
            success: true,
            data: {
                code: promo.Code,
                discountPercentage: promo.Discount_Percentage,
                discountAmount: finalDiscount,
                maxDiscountAmount: promo.Max_Discount_Amount,
                expiryDate: promo.Expiry_Date,
                originalAmount: totalAmount,
                finalAmount: totalAmount - finalDiscount
            }
        });
    } catch (error) {
        console.error('validatePromoCode:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
});

/**
 * Apply promo code to booking
 * POST /client/promo-codes/apply
 * (Note: Can also use ComplaintController.applyPromotionCode)
 * 
 * Body:
 * {
 *   "code": "COMP...",
 *   "bookingId": "ObjectId"
 * }
 */
clientRouter.post('/promo-codes/apply', ClientMiddleware.protect, 
    ComplaintController.applyPromotionCode);

// Export modified router at bottom:
// export default clientRouter;
