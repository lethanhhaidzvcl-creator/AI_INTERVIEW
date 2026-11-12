
const API_URL = import.meta.env.VITE_API_URL;

async function authRequest(endpoint, data) {
  const response = await fetch(`${API_URL}/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || result.status !== "success") {
    throw new Error(result.message || "Có lỗi xảy ra");
  }

  return result;
}

export const registerUser = (data) =>
  authRequest("register", data);

export const loginUser = (data) =>
  authRequest("login", data);
