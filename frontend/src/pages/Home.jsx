
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../services/authStorage";
import "../App.css";

function Home() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(
    () => getCurrentUser()
  );

  // Xử lý đăng xuất
  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    navigate("/login");
  }

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <h2>🤖 AI Interview</h2>

        <nav>
          <a href="#home">Trang chủ</a>
          <a href="#features">Tính năng</a>
          <a href="#footer">Liên hệ</a>
        </nav>

        <div className="auth">
          {currentUser ? (
            <>
              <span className="user-name">
                Xin chào, {currentUser.full_name}
              </span>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </>
          )}
        </div>
      </header>

      {/* TRANG CHỦ */}
      <main>
        <section className="hero" id="home">
          <h1>Luyện phỏng vấn cùng AI</h1>
          <p>
            Nâng cao kỹ năng phỏng vấn với công nghệ AI.
            Thực hành, nhận đánh giá và cải thiện mỗi ngày.
          </p>

          <Link
            to={currentUser ? "/interview" : "/login"}
            className="btn"
          >
            Bắt đầu phỏng vấn
          </Link>
        </section>

        <section className="features" id="features">
          <h2>Tính năng nổi bật</h2>

          <div className="feature-list">
            <div className="card">
              <h3>💬 Phỏng vấn AI</h3>
              <p>Mô phỏng buổi phỏng vấn thực tế.</p>
            </div>

            <div className="card">
              <h3>📊 AI chấm điểm</h3>
              <p>Đánh giá và nhận xét câu trả lời.</p>
            </div>

            <div className="card">
              <h3>📈 Theo dõi tiến bộ</h3>
              <p>Xem lịch sử và kết quả phỏng vấn.</p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="footer">
        <h3>AI Interview</h3>
        <p>Nền tảng luyện phỏng vấn thông minh</p>
        <p>© 2026 AI Interview</p>
      </footer>
    </>
  );
}

export default Home;