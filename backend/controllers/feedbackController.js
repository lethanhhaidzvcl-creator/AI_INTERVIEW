const db = require("../config/db");

const createFeedback = async (req, res) => {
  try {
    const { subject, message } = req.body || {};

    if (typeof subject !== "string" ||
        typeof message !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Thông tin phản hồi không hợp lệ",
      });
    }

    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanSubject || !cleanMessage) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng nhập đầy đủ chủ đề và nội dung",
      });
    }

    if (cleanSubject.length > 100 ||
        cleanMessage.length < 10 ||
        cleanMessage.length > 3000) {
      return res.status(400).json({
        status: "error",
        message: "Chủ đề tối đa 100 ký tự, nội dung từ 10 đến 3000 ký tự",
      });
    }

    const [result] = await db.query(
      "INSERT INTO feedback (subject, message) VALUES (?, ?)",
      [cleanSubject, cleanMessage]
    );

    return res.status(201).json({
      status: "success",
      message: "Gửi phản hồi thành công!",
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return res.status(500).json({
      status: "error",
      message: "Không thể lưu phản hồi. Vui lòng thử lại.",
    });
  }
};

module.exports = { createFeedback };