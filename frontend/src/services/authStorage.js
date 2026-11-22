
export function getCurrentUser() {
  const token = sessionStorage.getItem("token");
  const user = sessionStorage.getItem("user");

  if (!token || !user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function logoutUser() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}
