
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  EyeOff,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import "../../styles/AdminQuestions.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const initialForm = {
  position_id: "",
  content: "",
  difficulty: "MEDIUM",
  sample_answer: "",
};

function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [positions, setPositions] = useState([]);

  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const getHeaders = () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      throw new Error("Vui lòng đăng nhập lại.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const apiRequest = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Bạn chưa đăng nhập.");
      }

      if (response.status === 403) {
        throw new Error(
          "Token hết hạn hoặc bạn không có quyền ADMIN."
        );
      }

      throw new Error(result.message || "Có lỗi xảy ra.");
    }

    if (result.status !== "success") {
      throw new Error(result.message || "API không thành công.");
    }

    return result.data;
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [questionsData, positionsData] = await Promise.all([
        apiRequest("/admin/questions"),
        apiRequest("/admin/positions"),
      ]);

      if (
        !Array.isArray(questionsData) ||
        !Array.isArray(positionsData)
      ) {
        throw new Error("Dữ liệu API không đúng định dạng.");
      }

      setQuestions(questionsData);
      setPositions(positionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      position_id: String(
        positions.find((p) => Boolean(Number(p.is_active)))?.id || ""
      ),
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (question) => {
    setEditingId(question.id);
    setForm({
      position_id: String(question.position_id),
      content: question.content || "",
      difficulty: question.difficulty || "MEDIUM",
      sample_answer: question.sample_answer || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.position_id || !form.content.trim()) {
      setError("Vui lòng chọn vị trí và nhập nội dung câu hỏi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        position_id: Number(form.position_id),
        content: form.content.trim(),
        difficulty: form.difficulty,
        sample_answer: form.sample_answer.trim() || null,
      };

      if (editingId !== null) {
        await apiRequest(`/admin/questions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess("Cập nhật câu hỏi thành công.");
      } else {
        await apiRequest("/admin/questions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess("Thêm câu hỏi thành công.");
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (question) => {
    const isActive = Boolean(Number(question.is_active));

    const confirmed = window.confirm(
      isActive
        ? "Bạn có chắc muốn ẩn câu hỏi này?"
        : "Bạn có muốn kích hoạt lại câu hỏi này?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      if (isActive) {
        await apiRequest(`/admin/questions/${question.id}/hide`, {
          method: "PATCH",
        });
      } else {
        await apiRequest(`/admin/questions/${question.id}`, {
          method: "PUT",
          body: JSON.stringify({ is_active: true }),
        });
      }

      setSuccess(
        isActive
          ? "Đã ẩn câu hỏi thành công."
          : "Đã kích hoạt lại câu hỏi."
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredQuestions = questions.filter((question) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      question.content?.toLowerCase().includes(keyword) ||
      question.position_name?.toLowerCase().includes(keyword);

    const matchesPosition =
      !positionFilter ||
      String(question.position_id) === positionFilter;

    const matchesDifficulty =
      !difficultyFilter ||
      question.difficulty === difficultyFilter;

    return matchesSearch && matchesPosition && matchesDifficulty;
  });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>Quản lý câu hỏi</h1>
          <p>Quản lý ngân hàng câu hỏi phỏng vấn AI</p>
        </div>

        <div className="aq-header-actions">
          <button
            className="aq-btn aq-btn-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={18} />
            Làm mới
          </button>

          <button
            className="aq-btn aq-btn-primary"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Thêm câu hỏi
          </button>
        </div>
      </div>

      <div className="aq-summary">
        <strong>{questions.length}</strong> câu hỏi trong hệ thống
      </div>

      {success && <div className="aq-success">{success}</div>}
      {error && <div className="admin-error">{error}</div>}

      <div className="aq-toolbar">
        <div className="aq-search">
          <Search size={18} />
          <input
            placeholder="Tìm kiếm câu hỏi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
        >
          <option value="">Tất cả vị trí</option>
          {positions.map((position) => (
            <option key={position.id} value={position.id}>
              {position.name} - {position.level}
            </option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="">Tất cả độ khó</option>
          <option value="EASY">Dễ</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HARD">Khó</option>
        </select>
      </div>

      <div className="aq-table-wrap">
        <table className="aq-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nội dung câu hỏi</th>
              <th>Vị trí</th>
              <th>Độ khó</th>
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
            ) : filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan="6" className="aq-empty">
                  Không tìm thấy câu hỏi.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((question) => {
                const active = Boolean(
                  Number(question.is_active)
                );

                return (
                  <tr key={question.id}>
                    <td>#{question.id}</td>
                    <td className="aq-question-content">
                      {question.content}
                    </td>
                    <td>{question.position_name}</td>
                    <td>
                      <span className="aq-difficulty">
                        {question.difficulty === "EASY"
                          ? "Dễ"
                          : question.difficulty === "HARD"
                          ? "Khó"
                          : "Trung bình"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          active
                            ? "aq-status active"
                            : "aq-status hidden"
                        }
                      >
                        {active ? "Đang hoạt động" : "Đã ẩn"}
                      </span>
                    </td>
                    <td>
                      <div className="aq-actions">
                        <button
                          title="Chỉnh sửa"
                          onClick={() => openEditModal(question)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title={
                            active ? "Ẩn câu hỏi" : "Kích hoạt lại"
                          }
                          onClick={() => handleToggleStatus(question)}
                        >
                          {active ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
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
            aria-label={
              editingId !== null
                ? "Chỉnh sửa câu hỏi"
                : "Thêm câu hỏi"
            }
          >
            <div className="aq-modal-header">
              <h2>
                {editingId !== null
                  ? "Chỉnh sửa câu hỏi"
                  : "Thêm câu hỏi mới"}
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
              <label>Vị trí phỏng vấn</label>
              <select
                required
                value={form.position_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    position_id: e.target.value,
                  })
                }
              >
                <option value="">Chọn vị trí</option>
                {positions
                  .filter(
                    (p) =>
                      Boolean(Number(p.is_active)) ||
                      String(p.id) === form.position_id
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.level}
                    </option>
                  ))}
              </select>

              <label>Nội dung câu hỏi</label>
              <textarea
                required
                rows={4}
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                placeholder="Nhập nội dung câu hỏi..."
              />

              <label>Độ khó</label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm({
                    ...form,
                    difficulty: e.target.value,
                  })
                }
              >
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>

              <label>Đáp án tham khảo</label>
              <textarea
                rows={4}
                value={form.sample_answer}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sample_answer: e.target.value,
                  })
                }
                placeholder="Nhập đáp án tham khảo..."
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
                  type="submit"
                  className="aq-btn aq-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu câu hỏi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminQuestions;
