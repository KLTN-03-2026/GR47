import { cleanDataset, messyDataset } from './dataset.js';

/**
 * 🔥 NHỊP 1: Prompt "hỏi nhanh" để AI đoán loại phòng (Lấy mồi cho RAG)
 */
export const ROOM_IDENTIFICATION_PROMPT = `
Bạn là AI phân tích không gian. Nhiệm vụ của bạn là nhìn vào bức ảnh và xác định đây là loại phòng gì.
Chỉ trả về 1 TỪ DUY NHẤT bằng tiếng Việt (ví dụ: "khách", "ngủ", "bếp", "tắm", "vệ sinh", "khác").
Tuyệt đối không giải thích thêm.
`;

/**
 * 🔥 NHỊP 2: System Prompt chính để đánh giá độ bẩn (Như sếp đã viết)
 */
export const ROOM_ASSESSMENT_SYSTEM_PROMPT = `
Bạn là một chuyên gia AI giám định không gian nội thất và đánh giá tình trạng vệ sinh phòng.
Nhiệm vụ của bạn là quan sát hình ảnh căn phòng được người dùng cung cấp và đánh giá các thông số theo định dạng JSON.

HƯỚNG DẪN ƯỚC LƯỢNG DIỆN TÍCH (area):
- Hãy lấy các vật thể tiêu chuẩn trong ảnh làm hệ quy chiếu (Ví dụ: giường đôi thường 3-4m2, ghế sofa dài khoảng 2m2, cửa ra vào rộng khoảng 1m). 
- Nhân tỷ lệ lên so với tổng không gian sàn có thể nhìn thấy.

HƯỚNG DẪN ĐÁNH GIÁ MỨC ĐỘ BỪA BỘN (clutter_level):
- "low": Sàn nhà và các mặt phẳng (bàn, giường) trống trải, đồ đạc xếp ngăn nắp. 
- "high": Đánh giá là 'high' NẾU rác hoặc đồ vật cá nhân vứt lộn xộn che khuất hơn 30% diện tích mặt sàn/mặt bàn có thể nhìn thấy. Nếu đồ đạc nhiều nhưng xếp gọn trên kệ, vẫn tính là 'low'.

XỬ LÝ NGOẠI LỆ (Edge Cases):
- NẾU bức ảnh KHÔNG chứa không gian nội thất phòng ở (ví dụ: ảnh chân dung, phong cảnh ngoài trời, hoặc ảnh động vật), hãy trả về area: 0, clutter_level: "low", và ghi chú rõ trong phần description là ảnh không hợp lệ.

YÊU CẦU ĐẦU RA:
Bạn PHẢI trả về kết quả duy nhất là một object JSON hợp lệ, tuyệt đối không bao gồm markdown (\`\`\`json):
{
  "area": <số nguyên, diện tích m2>,
  "clutter_level": "<chỉ chọn 'low' hoặc 'high'>",
  "description": "<mô tả ngắn gọn bằng tiếng Việt>"
}
`;

const retrieveSimilarExamples = (dataset, roomTypeHint, count) => {
    if (!roomTypeHint) return dataset.slice(0, count);
    const keyword = roomTypeHint.toLowerCase();
    const filtered = dataset.filter(item => item.description && item.description.toLowerCase().includes(keyword));
    if (filtered.length >= count) return filtered.slice(0, count);
    const remaining = count - filtered.length;
    const fallbackItems = dataset.filter(item => !filtered.includes(item)).slice(0, remaining);
    return [...filtered, ...fallbackItems];
};

export const generateDynamicFewShotExamples = (roomTypeHint = "", count = 2) => {
    let examplesText = "\nDưới đây là một số ví dụ mẫu phù hợp với bối cảnh căn phòng để bạn tham khảo:\n";
    const smartCleanSamples = retrieveSimilarExamples(cleanDataset, roomTypeHint, count);
    smartCleanSamples.forEach((item, index) => {
        examplesText += `Ví dụ ${index + 1} (Phòng ngăn nắp):\n- Image: ${item.image_url}\n- Output: ${JSON.stringify({ area: item.area, clutter_level: item.clutter_level, description: item.description }, null, 2)}\n`;
    });
    const smartMessySamples = retrieveSimilarExamples(messyDataset, roomTypeHint, count);
    smartMessySamples.forEach((item, index) => {
        examplesText += `Ví dụ ${index + 1 + count} (Phòng bừa bộn):\n- Image: ${item.image_url}\n- Output: ${JSON.stringify({ area: item.area, clutter_level: item.clutter_level, description: item.description }, null, 2)}\n`;
    });
    return examplesText;
};

export const getFullAssessmentPrompt = (roomTypeHint = "") => {
    return ROOM_ASSESSMENT_SYSTEM_PROMPT + generateDynamicFewShotExamples(roomTypeHint, 2);
};