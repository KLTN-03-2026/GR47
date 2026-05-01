export const updateClientAvatar = async (clientId, file) => {
    const client = await Client.findById(clientId);
    if (!client) {
        throw new Error('Khách hàng không tồn tại');
    }

    const cloudinaryResult = await uploadStreamToCloudinary(file.buffer, "cleanai_avatars");
    const secureImageUrl = cloudinaryResult.secure_url;

    client.Avatar = secureImageUrl;
    await client.save();

    return {
        _id: client._id,
        Full_Name: client.Full_Name,
        Email: client.Email,
        Avatar: client.Avatar
    };
};