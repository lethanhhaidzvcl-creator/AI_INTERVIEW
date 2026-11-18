
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

async function authRequest(endpoint, data) {
  try {
    const response = await fetch(
      `${API_URL}/auth/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      throw new Error(
        result.message || "Yêu cầu không thành công!"
      );
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Không thể kết nối đến Backend. Vui lòng kiểm tra máy chủ!"
      );
    }

    throw error;
  }
}

// Đăng ký
export function registerUser(data) {
  return authRequest("register", data);
}

// Đăng nhập
export function loginUser(data) {
  return authRequest("login", data);
}
