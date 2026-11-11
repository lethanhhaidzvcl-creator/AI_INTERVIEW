
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Email không đúng định dạng!");
      return;
    }

    // Chưa kết nối API Backend
    setError("Chưa kết nối máy chủ đăng nhập.");
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <section className="auth-banner">
          <Link to="/" className="auth-brand">
            ✦ AI Interview
          </Link>

          <div className="auth-banner-content">
            <div className="auth-robot">🤖</div>
            <h1>Chào mừng trở lại!</h1>
            <p>
              Luyện phỏng vấn cùng AI, phát triển kỹ năng
              và tự tin chinh phục công việc mơ ước.
            </p>
          </div>

          <span>Nền tảng luyện phỏng vấn thông minh</span>
        </section>

        <section className="auth-form-section">
          <Link to="/" className="auth-back">
            ← Quay về trang chủ
          </Link>

          <div className="auth-form-content">
            <div className="auth-mobile-logo">✦ AI Interview</div>

            <h2>Đăng nhập</h2>
            <p className="auth-subtitle">
              Chào mừng bạn quay trở lại AI Interview
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="example@gmail.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Mật khẩu</label>

                <div className="auth-password">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="auth-submit">
                Đăng nhập
              </button>
            </form>

            <p className="auth-switch">
              Chưa có tài khoản?{" "}
              <Link to="/register">Đăng ký ngay</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
