// src/controllers/ClientController.js
import Client from '../models/ClientModel.js';
import jwt from 'jsonwebtoken';
import { CLIENTSTATUS } from '../utils/statusUtils.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const login = async (req, res) => {
    try {
        const { Phone_Number, Password } = req.body;

        // 1. Kiểm tra đầu vào
        if (!Phone_Number || !Password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ số điện thoại và mật khẩu.'
            });
        }

        const client = await Client.findOne({ Phone_Number }).select('+Password');
        if (!client) {
            return res.status(401).json({
                success: false,
                message: 'Số điện thoại hoặc mật khẩu không chính xác.'
            });
        }

        // 3. So sánh Password
        const isMatch = await client.comparePassword(Password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Số điện thoại hoặc mật khẩu không chính xác.'
            });
        }

        if (client.Status === CLIENTSTATUS.BANNED) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách. Vui lòng liên hệ CSKH để được hỗ trợ.'
            });
        }

        const token = jwt.sign(
            {
                id: client._id,
                phone: client.Phone_Number,
                role: 'client'
            },
            process.env.JWT_SECRET || 'fallback_secret_key_please_change',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            data: client
        });

    } catch (error) {
        console.error('Lỗi Login Controller (Client):', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi máy chủ trong quá trình đăng nhập.',
            error: error.message
        });
    }
};

export const register = async (req, res) => {
    try {
        const { Full_Name, Phone_Number, Password, Confirm_Password } = req.body;

        if (!Full_Name || !Phone_Number || !Password || !Confirm_Password) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        if (Password !== Confirm_Password) {
            return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp.' });
        }

        const existingClient = await Client.findOne({ Phone_Number });
        if (existingClient) {
            return res.status(409).json({ success: false, message: 'Số điện thoại này đã được đăng ký.' });
        }

        const newClient = await Client.create({
            Full_Name,
            Phone_Number,
            Password
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo tài khoản thành công',
            data: newClient
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
};

export const getAllClientsFull = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { Full_Name: { $regex: search, $options: 'i' } },
                { Phone_Number: { $regex: search, $options: 'i' } }
            ];
        }

        if (status !== undefined && status !== '') {
            query.Status = Number(status);
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        const [clients, totalItems] = await Promise.all([
            Client.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNumber),
            Client.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách khách hàng thành công',
            data: clients,
            pagination: {
                currentPage: pageNumber,
                itemsPerPage: limitNumber,
                totalItems,
                totalPages: Math.ceil(totalItems / limitNumber)
            }
        });

    } catch (error) {
        console.error('Lỗi getAllClientsFull Controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi máy chủ khi lấy danh sách khách hàng.',
            error: error.message
        });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const client = await Client.findById(req.user.id);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
        }

        if (client.Status !== CLIENTSTATUS.ACTIVE) {
            return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Xác thực thành công',
            data: client
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};

export const updateAvatar = async (req, res) => {
    try {
        const urlId = req.params.id;

        const tokenId = req.user.id;
        if (urlId !== String(tokenId)) {
            return res.status(403).json({
                success: false,
                message: 'Cảnh báo bảo mật: Bạn không được phép đổi ảnh của người khác!'
            });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn một ảnh để tải lên!'
            });
        }

        const client = await Client.findById(urlId);
        if (!client) {
            return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
        }

        console.log("☁️ Đang tải Avatar lên Cloudinary...");
        const uploadStreamToCloudinary = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "cleanai_avatars" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(buffer);
            });
        };

        const cloudinaryResult = await uploadStreamToCloudinary(file.buffer);
        const secureImageUrl = cloudinaryResult.secure_url;

        client.Avatar = secureImageUrl;
        await client.save();

        return res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công!',
            data: {
                _id: client._id,
                Full_Name: client.Full_Name,
                Email: client.Email,
                Avatar: client.Avatar
            }
        });

    } catch (error) {
        console.error("❌ Lỗi Update Avatar Controller:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi cập nhật ảnh đại diện'
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const tokenId = req.user.id;

        if (!tokenId) {
            return res.status(401).json({
                success: false,
                message: 'Không có quyền truy cập. Token không hợp lệ!'
            });
        }

        const profile = await Client.findById(tokenId).select('-Password -__v');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Khách hàng không tồn tại'
            });
        }

        return res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error("❌ Lỗi Get My Profile Controller:", error);

        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi lấy thông tin cá nhân',
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const clientId = req.user.id;

        const { Full_Name, Email, Gender, Birth_Date, Address } = req.body;

        const updateData = {};
        if (Full_Name) updateData.Full_Name = Full_Name;
        if (Email) updateData.Email = Email;
        if (Gender) updateData.Gender = Gender;
        if (Birth_Date) updateData.Birth_Date = Birth_Date;
        if (Address) updateData.Address = Address;

        const updatedClient = await Client.findByIdAndUpdate(
            clientId,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        ).select('-Password -__v');

        if (!updatedClient) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin khách hàng!'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin cá nhân thành công!',
            data: updatedClient
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi cập nhật hồ sơ',
            loi_that_su_la_gi: error.message
        });
    }
};

export const lockAndUnlockClient = async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findById(id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin khách hàng trong hệ thống để xử lý!'
            });
        }

        const newStatus = client.Status === CLIENTSTATUS.ACTIVE
            ? CLIENTSTATUS.BANNED
            : CLIENTSTATUS.ACTIVE;

        client.Status = newStatus;
        await client.save();

        const statusMessage = newStatus === CLIENTSTATUS.ACTIVE ? 'mở khóa' : 'khóa';

        return res.status(200).json({
            success: true,
            message: `Đã ${statusMessage} tài khoản của khách hàng thành công!`,
            data: client
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố khi cập nhật trạng thái tài khoản khách hàng',
            error: error.message
        });
    }
};

export const forgetPassword = async (req, res) => {
    try {
        const { Phone_Number } = req.body;

        if (!Phone_Number) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp số điện thoại để tiến hành khôi phục mật khẩu!'
            });
        }

        const client = await Client.findOne({ Phone_Number });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Số điện thoại này chưa được đăng ký trong hệ thống CleanAI.'
            });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        client.Reset_OTP = otpCode;
        client.Reset_OTP_Expiry = otpExpiry;
        await client.save();

        console.log(`\n======================================================`);
        console.log(`🚀 [MÔ PHỎNG SMS] Khách hàng: ${client.Full_Name}`);
        console.log(`📱 Số điện thoại nhận: ${Phone_Number}`);
        console.log(`🔑 Mã OTP khôi phục mật khẩu CleanAI của bạn là: ${otpCode}`);
        console.log(`⏳ Mã này sẽ tự động hết hạn sau 5 phút.`);
        console.log(`======================================================\n`);

        return res.status(200).json({
            success: true,
            message: 'Mã OTP khôi phục đã được tạo thành công. Vui lòng kiểm tra tin nhắn điện thoại!'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố khi thiết lập mã khôi phục mật khẩu',
            error: error.message
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { Phone_Number, OTP, New_Password } = req.body;

        // 1. Kiểm tra tính toàn vẹn của dữ liệu gửi lên
        if (!Phone_Number || !OTP || !New_Password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ số điện thoại, mã OTP và mật khẩu mới!'
            });
        }

        // 2. Tìm kiếm khách hàng (lấy kèm cả các trường OTP để kiểm tra)
        const client = await Client.findOne({ Phone_Number });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản hợp lệ với số điện thoại này.'
            });
        }

        // 3. Đối chiếu tính chính xác của mã OTP
        if (client.Reset_OTP !== OTP) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại tin nhắn của bạn!'
            });
        }

        // 4. Kiểm tra thời hạn của mã OTP (Phải còn hạn so với thời gian hiện tại)
        if (!client.Reset_OTP_Expiry || client.Reset_OTP_Expiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP này đã hết hạn sử dụng. Vui lòng quay lại bước trước để nhận mã mới!'
            });
        }

        // 5. Gán mật khẩu mới (hook pre-save trong Model sẽ tự động băm mật khẩu này)
        client.Password = New_Password;

        // 6. Xóa bỏ dấu vết OTP để khóa luồng, tránh việc tái sử dụng mã
        client.Reset_OTP = undefined;
        client.Reset_OTP_Expiry = undefined;

        await client.save();

        return res.status(200).json({
            success: true,
            message: 'Tuyệt vời! Mật khẩu của bạn đã được cập nhật thành công. Hãy thử đăng nhập lại nhé.'
        });

    } catch (error) {
        console.error('Lỗi khi thiết lập lại mật khẩu:', error);
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố trong quá trình đổi mật khẩu',
            error: error.message
        });
    }
};

export const getMyAddresses = async (req, res) => {
    try {
        const clientId = req.user.id;

        const client = await Client.findById(clientId).select('Address');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin tài khoản khách hàng trong hệ thống!'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách địa chỉ cá nhân thành công!',
            data: client.Address
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố khi trích xuất danh sách địa chỉ',
            error: error.message
        });
    }
};

export const addAddress = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { Detail, Is_Default } = req.body;

        if (!Detail || Detail.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp chi tiết địa chỉ mới!'
            });
        }

        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin tài khoản khách hàng trong hệ thống!'
            });
        }

        let isNewDefault = Is_Default === true;

        if (client.Address.length === 0) {
            isNewDefault = true;
        }

        if (isNewDefault) {
            client.Address.forEach(addr => {
                addr.Is_Default = false;
            });
        }

        client.Address.push({
            Detail: Detail.trim(),
            Is_Default: isNewDefault
        });

        await client.save();

        return res.status(201).json({
            success: true,
            message: 'Đã thêm địa chỉ mới vào sổ địa chỉ thành công!',
            data: client.Address
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố khi xử lý thêm địa chỉ',
            error: error.message
        });
    }
};

export const requestChangePasswordOTP = async (req, res) => {
    try {
        const clientId = req.user.id;
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin tài khoản khách hàng!'
            });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // Hạn 5 phút

        client.Reset_OTP = otpCode;
        client.Reset_OTP_Expiry = otpExpiry;
        await client.save();

        console.log(`\n======================================================`);
        console.log(`🛡️ [MÔ PHỎNG SMS BẢO MẬT 2 LỚP] Khách hàng: ${client.Full_Name}`);
        console.log(`📱 Số điện thoại nhận: ${client.Phone_Number}`);
        console.log(`🔑 Mã OTP ĐỔI MẬT KHẨU của bạn là: ${otpCode}`);
        console.log(`⏳ Mã này sẽ tự động hết hạn sau 5 phút.`);
        console.log(`======================================================\n`);

        return res.status(200).json({
            success: true,
            message: 'Mã OTP xác thực đã được gửi đến số điện thoại của bạn!'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố khi tạo mã xác thực',
            error: error.message
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { Old_Password, New_Password, OTP } = req.body;

        // 1. Kiểm tra tính toàn vẹn dữ liệu
        if (!Old_Password || !New_Password || !OTP) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ mật khẩu hiện tại, mật khẩu mới và mã OTP!'
            });
        }

        if (Old_Password === New_Password) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại!'
            });
        }

        // 2. Tìm khách hàng (BẮT BUỘC có .select('+Password') để đối chiếu mật khẩu cũ)
        const client = await Client.findById(clientId).select('+Password');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin tài khoản khách hàng!'
            });
        }

        // 3. Kiểm tra mã OTP (Ép kiểu String để tránh lỗi Postman gửi kiểu số)
        if (client.Reset_OTP !== String(OTP)) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại!'
            });
        }

        if (!client.Reset_OTP_Expiry || client.Reset_OTP_Expiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới!'
            });
        }

        // 4. Kiểm tra mật khẩu cũ
        const isMatch = await client.comparePassword(Old_Password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không chính xác!'
            });
        }

        // 5. Cập nhật mật khẩu mới và dọn dẹp hiện trường OTP
        client.Password = New_Password;
        client.Reset_OTP = undefined;
        client.Reset_OTP_Expiry = undefined;
        
        await client.save();

        return res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công! Tài khoản của bạn đã được bảo vệ an toàn.'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Máy chủ gặp sự cố khi xử lý yêu cầu đổi mật khẩu',
            error: error.message
        });
    }
};