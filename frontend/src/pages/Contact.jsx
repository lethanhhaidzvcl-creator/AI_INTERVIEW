
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  MessageCircle,
} from "lucide-react";

import "../styles/Contact.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

function Contact() {
  const [subject, setSubject] = useState("Góp ý");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (message.trim().length < 10) {
      setError("Nội dung phải có ít nhất 10 ký tự.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(
          result.message || "Gửi phản hồi thất bại."
        );
      }

      setSuccess("Gửi phản hồi thành công!");
      setMessage("");
      setSubject("Góp ý");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Không thể kết nối Backend. Vui lòng thử lại."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contact-page">
      <header className="contact-header">
        <Link to="/" className="contact-logo">
          🤖 AI Interview
        </Link>

        <Link to="/" className="contact-back">
          <ArrowLeft size={18} />
          Trang chủ
        </Link>
      </header>

      <main className="contact-main">
        <div className="contact-heading">
          <span className="contact-tag">
            <MessageCircle size={16} />
            LIÊN HỆ & GÓP Ý
          </span>

          <h1>
            Liên hệ với <span>AI Interview</span>
          </h1>

          <p>
            Hãy gửi góp ý hoặc báo lỗi để giúp
            AI Interview ngày càng hoàn thiện.
          </p>
        </div>

        <section
          className="contact-form-card"
          style={{ maxWidth: 650, margin: "0 auto" }}
        >
          <h2>Gửi phản hồi</h2>

          <p className="contact-form-description">
            Ý kiến của bạn sẽ được lưu vào hệ thống.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="contact-field">
              <label htmlFor="subject">Chủ đề</label>

              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              >
                <option value="Góp ý">Góp ý</option>
                <option value="Báo lỗi">Báo lỗi</option>
                <option value="Hỗ trợ">Hỗ trợ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="contact-field">
              <label htmlFor="message">Nội dung</label>

              <textarea
                id="message"
                rows={6}
                placeholder="Nhập nội dung phản hồi..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minLength={10}
                maxLength={3000}
                required
              />
            </div>

            {error && (
              <p role="alert" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            {success && (
              <p role="status" style={{ color: "#15803d" }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              className="contact-submit"
              disabled={loading}
            >
              <Send size={18} />
              {loading ? "Đang gửi..." : "Gửi phản hồi"}
            </button>
          </form>
        </section>
      </main>

      <footer className="contact-footer">
        <p>© 2026 AI Interview</p>
        <Link to="/">Quay về trang chủ</Link>
      </footer>
    </div>
  );
}

export default Contact;
