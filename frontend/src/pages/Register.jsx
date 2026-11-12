import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }



async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  const { full_name, email, password, confirmPassword } = form;

  // 1. Kiểm tra các trường bắt buộc
  if (
    !full_name.trim() ||
    !email.trim() ||
    !password ||
    !confirmPassword
  ) {
    setError("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  // 2. Kiểm tra email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    setError("Email không đúng định dạng!");
    return;
  }

  // 3. Kiểm tra mật khẩu
  if (password.length < 6) {
    setError("Mật khẩu phải có ít nhất 6 ký tự!");
    return;
  }

  // 4. Kiểm tra xác nhận mật khẩu
  if (password !== confirmPassword) {
    setError("Mật khẩu xác nhận không khớp!");
    return;
  }

  // 5. Gọi API đăng ký
  try {
    const result = await registerUser({
      full_name: full_name.trim(),
      email: email.trim(),
      password,
    });

    // 6. Thông báo thành công
    alert(result.message || "Đăng ký thành công!");

    // 7. Chuyển sang trang đăng nhập
    navigate("/login");

  } catch (error) {
    setError(error.message || "Đăng ký thất bại!");
  }
}


  return (
    <main className="auth-page">
      <div className="auth-container">
        <section className="auth-banner">
          <Link to="/" className="auth-brand">
            ✦ AI Interview
          </Link>

          <div className="auth-banner-content">
            <div className="auth-robot">🚀</div>
            <h1>Bắt đầu hành trình cùng AI</h1>
            <p>
              Tạo tài khoản để thực hành phỏng vấn,
              nhận đánh giá và theo dõi sự tiến bộ
              của bản thân.
            </p>
          </div>

          <span>Sẵn sàng chinh phục cơ hội nghề nghiệp mới</span>
        </section>

        <section className="auth-form-section">
          <Link to="/" className="auth-back">
            ← Quay về trang chủ
          </Link>

          <div className="auth-form-content">
            <div className="auth-mobile-logo">✦ AI Interview</div>

            <h2>Tạo tài khoản</h2>
            <p className="auth-subtitle">
              Đăng ký để bắt đầu luyện phỏng vấn
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="full-name">Họ và tên</label>
                <input
                  id="full-name"
                  name="full_name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-password">Mật khẩu</label>

                <div className="auth-password">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ít nhất 6 ký tự"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
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

              <div className="auth-field">
                <label htmlFor="confirm-password">
                  Xác nhận mật khẩu
                </label>

                <div className="auth-password">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                  >
                    {showConfirm ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="auth-submit">
                Đăng ký tài khoản
              </button>
            </form>

            <p className="auth-switch">
              Đã có tài khoản?{" "}
              <Link to="/login">Đăng nhập ngay</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;
