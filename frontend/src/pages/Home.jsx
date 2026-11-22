import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../services/authStorage';
import '../App.css';

function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    closeMenu();
    navigate('/login');
  }

  return (
    <div className="home-page">
      <header className="header">
        <h2>🤖 AI Interview</h2>

        <button
          type="button"
          className="home-menu-toggle"
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
          aria-controls="home-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <nav
          id="home-navigation"
          className="home-nav"
          aria-label="Điều hướng chính"
        >
          {currentUser && (
            <p className="home-menu-user">Xin chào, {currentUser.full_name}</p>
          )}
          <a href="#home" onClick={closeMenu}>Trang chủ</a>
          <a href="#features" onClick={closeMenu}>Tính năng</a>
          <a href="#footer" onClick={closeMenu}>Liên hệ</a>

          {currentUser && (
            <Link to="/interview/history" onClick={closeMenu}>
              Lịch sử phỏng vấn
            </Link>
          )}

          {currentUser && (
            <button
              type="button"
              className="home-menu-logout"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          )}
        </nav>

        <div className={currentUser ? 'auth auth--signed-in' : 'auth'}>
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

      <main>
        <section className="hero" id="home">
          <h1>Luyện phỏng vấn cùng AI</h1>
          <p>
            Nâng cao kỹ năng phỏng vấn với công nghệ AI.
            Thực hành, nhận đánh giá và cải thiện mỗi ngày.
          </p>

          <Link to={currentUser ? '/interview' : '/login'} className="btn">
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

      <footer id="footer">
        <h3>AI Interview</h3>
        <p>Nền tảng luyện phỏng vấn thông minh</p>
        <p>© 2026 AI Interview</p>
      </footer>
    </div>
  );
}

export default Home;