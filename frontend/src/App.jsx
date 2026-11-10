
import './App.css';

function App() {
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
          <a href="/login">Đăng nhập</a>
          <a href="/register">Đăng ký</a>
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
          <a href="/interview" className="btn">
            Bắt đầu phỏng vấn
          </a>
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

export default App;