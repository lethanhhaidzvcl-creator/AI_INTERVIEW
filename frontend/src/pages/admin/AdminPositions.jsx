
import { useEffect, useState } from "react";
import {
  Plus, Search, Pencil, Eye, EyeOff, RefreshCw, X,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../styles/AdminQuestions.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const LEVELS = ["INTERN", "FRESHER", "JUNIOR", "MIDDLE", "SENIOR"];

const emptyForm = {
  name: "",
  description: "",
  level: "JUNIOR",
};

function AdminPositions() {
  const [positions, setPositions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function apiRequest(path, options = {}) {
    const token = sessionStorage.getItem("token");

    if (!token) {
      throw new Error("Vui lòng đăng nhập lại bằng tài khoản Admin.");
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.status !== "success") {
      if (response.status === 401) {
        throw new Error("Bạn chưa đăng nhập.");
      }
      if (response.status === 403) {
        throw new Error("Token hết hạn hoặc không có quyền ADMIN.");
      }
      throw new Error(result.message || "Không thể thực hiện yêu cầu.");
    }

    return result.data;
  }

  async function loadPositions() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/admin/positions");
      if (!Array.isArray(data)) {
        throw new Error("Danh sách vị trí không đúng định dạng.");
      }
      setPositions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPositions();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowModal(true);
  }

  function openEdit(position) {
    setEditingId(position.id);
    setForm({
      name: position.name || "",
      description: position.description || "",
      level: position.level || "JUNIOR",
    });
    setError("");
    setShowModal(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Tên vị trí không được để trống.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        level: form.level,
      };

      if (editingId !== null) {
        await apiRequest(`/admin/positions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess("Cập nhật vị trí thành công.");
      } else {
        await apiRequest("/admin/positions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess("Thêm vị trí thành công.");
      }

      setShowModal(false);
      await loadPositions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(position) {
    const active = Boolean(Number(position.is_active));

    if (!window.confirm(
      active
        ? `Bạn muốn ẩn vị trí "${position.name}"?`
        : `Bạn muốn kích hoạt lại "${position.name}"?`
    )) return;

    setError("");
    setSuccess("");

    try {
      if (active) {
        await apiRequest(`/admin/positions/${position.id}/hide`, {
          method: "PATCH",
        });
      } else {
        await apiRequest(`/admin/positions/${position.id}`, {
          method: "PUT",
          body: JSON.stringify({ is_active: true }),
        });
      }

      setSuccess(
        active ? "Đã ẩn vị trí." : "Đã kích hoạt lại vị trí."
      );
      await loadPositions();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = positions.filter((position) => {
    const keyword = search.toLowerCase();
    return (
      position.name?.toLowerCase().includes(keyword) ||
      position.level?.toLowerCase().includes(keyword) ||
      position.description?.toLowerCase().includes(keyword)
    );
  });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Quản lý vị trí</h1>
          <p>Quản lý các vị trí và cấp độ phỏng vấn</p>
        </div>

        <div className="aq-header-actions">
          <button
            className="aq-btn aq-btn-secondary"
            onClick={loadPositions}
            disabled={loading}
          >
            <RefreshCw size={18} /> Làm mới
          </button>

          <button
            className="aq-btn aq-btn-primary"
            onClick={openCreate}
          >
            <Plus size={18} /> Thêm vị trí
          </button>
        </div>
      </div>

      <div className="aq-summary">
        <strong>{positions.length}</strong> vị trí trong hệ thống
      </div>

      {success && <div className="aq-success">{success}</div>}
      {error && <div className="admin-error">{error}</div>}

      <div className="aq-toolbar">
        <div className="aq-search">
          <Search size={18} />
          <input
            placeholder="Tìm tên vị trí, cấp độ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="aq-table-wrap">
        <table className="aq-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên vị trí</th>
              <th>Mô tả</th>
              <th>Cấp độ</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="aq-empty">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="aq-empty">
                  Không tìm thấy vị trí.
                </td>
              </tr>
            ) : (
              filtered.map((position) => {
                const active = Boolean(Number(position.is_active));

                return (
                  <tr key={position.id}>
                    <td>#{position.id}</td>
                    <td><strong>{position.name}</strong></td>
                    <td>{position.description || "Chưa có mô tả"}</td>
                    <td>{position.level}</td>
                    <td>
                      <span className={
                        active ? "aq-status active" : "aq-status hidden"
                      }>
                        {active ? "Đang hoạt động" : "Đã ẩn"}
                      </span>
                    </td>
                    <td>
                      <div className="aq-actions">
                        <button
                          title="Chỉnh sửa"
                          onClick={() => openEdit(position)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          title={active ? "Ẩn" : "Kích hoạt lại"}
                          onClick={() => toggleStatus(position)}
                        >
                          {active
                            ? <EyeOff size={18} />
                            : <Eye size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="aq-modal-backdrop">
          <div
            className="aq-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Biểu mẫu vị trí"
          >
            <div className="aq-modal-header">
              <h2>
                {editingId !== null
                  ? "Chỉnh sửa vị trí"
                  : "Thêm vị trí mới"}
              </h2>
              <button
                aria-label="Đóng"
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Tên vị trí</label>
              <input
                className="ap-input"
                required
                maxLength={150}
                placeholder="Ví dụ: Backend Developer"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <label>Cấp độ</label>
              <select
                value={form.level}
                onChange={(e) =>
                  setForm({ ...form, level: e.target.value })
                }
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              <label>Mô tả</label>
              <textarea
                rows={4}
                placeholder="Nhập mô tả vị trí..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <div className="aq-modal-footer">
                <button
                  type="button"
                  className="aq-btn aq-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="aq-btn aq-btn-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu vị trí"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminPositions;
