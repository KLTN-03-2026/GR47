export const updateClientAvatar = async (clientId, file) => {
    // 1. Lấy user
    const client = await Client.findById(clientId);
    if (!client) {
        throw new Error('Khách hàng không tồn tại');
    }

    // 2. Tải ảnh lên Cloudinary
    console.log("☁️ Đang tải Avatar lên Cloudinary...");
    const cloudinaryResult = await uploadStreamToCloudinary(file.buffer, "cleanai_avatars");
    const secureImageUrl = cloudinaryResult.secure_url;

    // 3. 🔥 SỬA CHỖ NÀY: Phải là chữ 'A' viết hoa để khớp với Model
    client.Avatar = secureImageUrl; 
    await client.save();

    // 4. 🔥 SỬA CHỖ NÀY: Trả về đúng tên cột đã khai báo trong Model
    return {
        _id: client._id,
        Full_Name: client.Full_Name, // Đổi name thành Full_Name
        Email: client.Email,         // Đổi email thành Email
        Avatar: client.Avatar        // Đổi avatar thành Avatar
    };
};