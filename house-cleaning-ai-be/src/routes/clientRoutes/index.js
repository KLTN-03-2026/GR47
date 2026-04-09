import express from 'express';
import multer from 'multer'; // 1. Phải import multer
import * as ClientController from '../../controllers/ClientController.js';
import * as AIController from '../../controllers/AIController.js';
import * as ClientMiddleware from '../../middlewares/ClientMiddleware.js';

const clientRouter = express.Router();

// 2. Cấu hình multer để xử lý file (lưu tạm vào RAM)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB cho an toàn
});

clientRouter.post('/login', ClientController.login);
clientRouter.post('/register', ClientController.register);

clientRouter.post('/check-auth', ClientMiddleware.protect, ClientController.checkAuth);

// 3. THÊM upload.single('room_image') VÀO ĐÂY 👇
clientRouter.post(
    '/analyze-room-image',
    ClientMiddleware.protect,
    upload.single('room_image'), // Middleware này bóc tách file từ payload
    AIController.analyzeRoomImage
);

export default clientRouter;