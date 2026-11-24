
import { useEffect, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  RefreshCw,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

function AdminDashboard() {
  const [positions, setPositions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Vui lòng đăng nhập lại.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [positionRes, questionRes] = await Promise.all([
          fetch(`${API_URL}/admin/positions`, {
            headers,
            signal: controller.signal,
          }),
          fetch(`${API_URL}/admin/questions`, {
            headers,
            signal: controller.signal,
          }),
        ]);

        if ([positionRes.status, questionRes.status].includes(401)) {
          throw new Error("Phiên đăng nhập không hợp lệ.");
        }

        if ([positionRes.status, questionRes.status].includes(403)) {
          throw new Error(
            "Token hết hạn hoặc tài khoản không có quyền ADMIN."
          );
        }

        if (!positionRes.ok || !questionRes.ok) {
          throw new Error("Không thể tải dữ liệu từ backend.");
        }

        const positionJSON = await positionRes.json();
        const questionJSON = await questionRes.json();

        if (
          positionJSON.status !== "success" ||
          questionJSON.status !== "success" ||
          !Array.isArray(positionJSON.data) ||
          !Array.isArray(questionJSON.data)
        ) {
          throw new Error("Dữ liệu API không đúng định dạng.");
        }

        setPositions(positionJSON.data);
        setQuestions(questionJSON.data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Tổng quan hệ thống AI Interview</p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          disabled={loading}
          onClick={() => setReloadKey((prev) => prev + 1)}
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      {loading && (
        <p className="admin-notice">Đang tải dữ liệu...</p>
      )}

      {error && (
        <p className="admin-error">{error}</p>
      )}

      {!loading && !error && (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <BriefcaseBusiness size={28} />
            <h2>{positions.length}</h2>
            <p>Tổng vị trí phỏng vấn</p>
          </div>

          <div className="admin-stat-card">
            <BookOpen size={28} />
            <h2>{questions.length}</h2>
            <p>Tổng câu hỏi phỏng vấn</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
