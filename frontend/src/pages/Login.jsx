
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  // State quản lý dữ liệu
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý đăng nhập
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // 1. Kiểm tra dữ liệu đầu vào
    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // 2. Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Email không đúng định dạng!");
      return;
    }

    // 3. Gọi API đăng nhập
    setLoading(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      // 4. Kiểm tra phản hồi từ Backend
      if (
        result.status !== "success" ||
        !result.data?.token ||
        !result.data?.user
      ) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ!");
      }

      const { token, user } = result.data;

      // 5. Lưu thông tin đăng nhập
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      // 6. Chuyển về trang chủ
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        {/* BANNER BÊN TRÁI */}
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

        {/* FORM ĐĂNG NHẬP */}
        <section className="auth-form-section">
          <Link to="/" className="auth-back">
            ← Quay về trang chủ
          </Link>

          <div className="auth-form-content">
            <div className="auth-mobile-logo">
              ✦ AI Interview
            </div>

            <h2>Đăng nhập</h2>

            <p className="auth-subtitle">
              Chào mừng bạn quay trở lại AI Interview
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* EMAIL */}
              <div className="auth-field">
                <label htmlFor="login-email">
                  Email
                </label>

                <input
                  id="login-email"
                  type="email"
                  placeholder="example@gmail.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* MẬT KHẨU */}
              <div className="auth-field">
                <label htmlFor="login-password">
                  Mật khẩu
                </label>

                <div className="auth-password">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Ẩn mật khẩu"
                        : "Hiện mật khẩu"
                    }
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              {/* THÔNG BÁO LỖI */}
              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              {/* NÚT ĐĂNG NHẬP */}
              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Đang đăng nhập..."
                  : "Đăng nhập"}
              </button>
            </form>

            {/* CHUYỂN SANG ĐĂNG KÝ */}
            <p className="auth-switch">
              Chưa có tài khoản?{" "}
              <Link to="/register">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
