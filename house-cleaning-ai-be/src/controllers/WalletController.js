import mongoose from 'mongoose';
import Client from '../models/ClientModel.js';
import Cleaner from '../models/CleanerModel.js';
import WalletTransaction from '../models/WalletTransactionModel.js';
import { createNotification } from '../services/notificationService.js';

const MIN_TX = 10_000;
const MAX_TX = 100_000_000;

const parsePositiveIntAmount = (raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < MIN_TX) {
        return { error: `Số tiền tối thiểu ${MIN_TX.toLocaleString('vi-VN')}đ` };
    }
    if (n > MAX_TX) {
        return { error: `Số tiền tối đa ${MAX_TX.toLocaleString('vi-VN')}đ mỗi giao dịch` };
    }
    return { value: n };
};

// ---------- CLIENT ----------

export const getClientWallet = async (req, res) => {
    try {
        const client = await Client.findById(req.user.id).select('Full_Name IPay_Balance Phone_Number');
        if (!client) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
        }
        const balance = client.IPay_Balance ?? 0;
        return res.status(200).json({
            success: true,
            data: {
                balance,
                accountHolder: client.Full_Name || 'Khách hàng',
                phone: client.Phone_Number
            }
        });
    } catch (error) {
        console.error('getClientWallet:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

export const depositClientWallet = async (req, res) => {
    const parsed = parsePositiveIntAmount(req.body?.amount);
    if (parsed.error) {
        return res.status(400).json({ success: false, message: parsed.error });
    }
    const amount = parsed.value;
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const client = await Client.findById(req.user.id).session(session);
            if (!client) throw new Error('NOT_FOUND');
            client.IPay_Balance = (client.IPay_Balance ?? 0) + amount;
            await client.save({ session });
            await WalletTransaction.create(
                [
                    {
                        User_Type: 'client',
                        User_Id: client._id,
                        Category: 'DEPOSIT',
                        Amount: amount,
                        Description: 'Nạp tiền vào ví CleanAI iPay'
                    }
                ],
                { session }
            );
            await createNotification({
                userType: 'client',
                userId: client._id,
                title: 'Nạp tiền thành công',
                message: `Bạn đã nạp ${amount.toLocaleString('vi-VN')}đ vào ví CleanAI iPay.`,
                type: 'WALLET',
                session
            });
        });
        const updated = await Client.findById(req.user.id).select('IPay_Balance Full_Name');
        return res.status(200).json({
            success: true,
            message: 'Nạp tiền thành công',
            data: { balance: updated.IPay_Balance ?? 0, accountHolder: updated.Full_Name }
        });
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
        }
        console.error('depositClientWallet:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    } finally {
        await session.endSession();
    }
};

export const withdrawClientWallet = async (req, res) => {
    const parsed = parsePositiveIntAmount(req.body?.amount);
    if (parsed.error) {
        return res.status(400).json({ success: false, message: parsed.error });
    }
    const amount = parsed.value;
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const client = await Client.findById(req.user.id).session(session);
            if (!client) throw new Error('NOT_FOUND');
            const bal = client.IPay_Balance ?? 0;
            if (bal < amount) {
                throw new Error('INSUFFICIENT');
            }
            client.IPay_Balance = bal - amount;
            await client.save({ session });
            await WalletTransaction.create(
                [
                    {
                        User_Type: 'client',
                        User_Id: client._id,
                        Category: 'WITHDRAW',
                        Amount: amount,
                        Description: 'Rút tiền từ ví CleanAI iPay'
                    }
                ],
                { session }
            );
            await createNotification({
                userType: 'client',
                userId: client._id,
                title: 'Rút tiền thành công',
                message: `Bạn đã rút ${amount.toLocaleString('vi-VN')}đ từ ví CleanAI iPay.`,
                type: 'WALLET',
                session
            });
        });
        const updated = await Client.findById(req.user.id).select('IPay_Balance Full_Name');
        return res.status(200).json({
            success: true,
            message: 'Rút tiền thành công',
            data: { balance: updated.IPay_Balance ?? 0, accountHolder: updated.Full_Name }
        });
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
        }
        if (error.message === 'INSUFFICIENT') {
            return res.status(400).json({ success: false, message: 'Số dư không đủ' });
        }
        console.error('withdrawClientWallet:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    } finally {
        await session.endSession();
    }
};

export const getClientWalletTransactions = async (req, res) => {
    try {
        const { category = 'all', limit = 30, page = 1 } = req.query;
        const lim = Math.min(100, Math.max(1, Number(limit) || 30));
        const pg = Math.max(1, Number(page) || 1);
        const skip = (pg - 1) * lim;

        const filter = { User_Type: 'client', User_Id: req.user.id };
        if (category && category !== 'all') {
            if (!['DEPOSIT', 'WITHDRAW', 'SPEND', 'REFUND'].includes(category)) {
                return res.status(400).json({ success: false, message: 'category không hợp lệ' });
            }
            filter.Category = category;
        }

        const [items, total] = await Promise.all([
            WalletTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
            WalletTransaction.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                transactions: items,
                total,
                page: pg,
                limit: lim,
                totalPages: Math.ceil(total / lim)
            }
        });
    } catch (error) {
        console.error('getClientWalletTransactions:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

// ---------- CLEANER ----------

export const getCleanerWallet = async (req, res) => {
    try {
        const cleaner = await Cleaner.findById(req.user.id).select('Full_Name Wallet_Balance Phone_Number');
        if (!cleaner) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
        }
        const balance = cleaner.Wallet_Balance ?? 0;
        return res.status(200).json({
            success: true,
            data: {
                balance,
                accountHolder: cleaner.Full_Name || 'Đối tác',
                phone: cleaner.Phone_Number
            }
        });
    } catch (error) {
        console.error('getCleanerWallet:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

export const withdrawCleanerWallet = async (req, res) => {
    const parsed = parsePositiveIntAmount(req.body?.amount);
    if (parsed.error) {
        return res.status(400).json({ success: false, message: parsed.error });
    }
    const amount = parsed.value;
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const cleaner = await Cleaner.findById(req.user.id).session(session);
            if (!cleaner) throw new Error('NOT_FOUND');
            const bal = cleaner.Wallet_Balance ?? 0;
            if (bal < amount) {
                throw new Error('INSUFFICIENT');
            }
            cleaner.Wallet_Balance = bal - amount;
            await cleaner.save({ session });
            await WalletTransaction.create(
                [
                    {
                        User_Type: 'cleaner',
                        User_Id: cleaner._id,
                        Category: 'WITHDRAW',
                        Amount: amount,
                        Description: 'Rút tiền từ ví thu nhập'
                    }
                ],
                { session }
            );
            await createNotification({
                userType: 'cleaner',
                userId: cleaner._id,
                title: 'Rút tiền thành công',
                message: `Bạn đã rút ${amount.toLocaleString('vi-VN')}đ từ ví thu nhập.`,
                type: 'WALLET',
                session
            });
        });
        const updated = await Cleaner.findById(req.user.id).select('Wallet_Balance Full_Name');
        return res.status(200).json({
            success: true,
            message: 'Rút tiền thành công',
            data: { balance: updated.Wallet_Balance ?? 0, accountHolder: updated.Full_Name }
        });
    } catch (error) {
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
        }
        if (error.message === 'INSUFFICIENT') {
            return res.status(400).json({ success: false, message: 'Số dư không đủ' });
        }
        console.error('withdrawCleanerWallet:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    } finally {
        await session.endSession();
    }
};

export const getCleanerWalletTransactions = async (req, res) => {
    try {
        const { limit = 40, page = 1 } = req.query;
        const lim = Math.min(100, Math.max(1, Number(limit) || 40));
        const pg = Math.max(1, Number(page) || 1);
        const skip = (pg - 1) * lim;

        const filter = {
            User_Type: 'cleaner',
            User_Id: req.user.id,
            Category: { $in: ['INCOME', 'WITHDRAW'] }
        };

        const [items, total] = await Promise.all([
            WalletTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
            WalletTransaction.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                transactions: items,
                total,
                page: pg,
                limit: lim,
                totalPages: Math.ceil(total / lim)
            }
        });
    } catch (error) {
        console.error('getCleanerWalletTransactions:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};
