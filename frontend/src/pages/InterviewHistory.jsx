import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser } from '../services/authStorage.js';
import { getSessionHistory } from '../services/interviewService.js';
import '../styles/InterviewHistory.css';

const dateFormat = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const scoreFormat = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 2,
});

const statusLabels = {
  IN_PROGRESS: 'Đang làm',
  PENDING_EVALUATION: 'Chờ chấm điểm',
  COMPLETED: 'Đã hoàn thành',
  FAILED: 'Chấm điểm thất bại',
  CANCELLED: 'Đã hủy',
};

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? dateFormat.format(date) : '—';
}

function HistoryList({ userId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const positionFilter = searchParams.get('position') ?? '';
  const [request, setRequest] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getSessionHistory(userId, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) {
          setRequest({ sessions: data.sessions ?? [] });
        }
      },
      (error) => {
        if (!controller.signal.aborted) {
          setRequest({ error: error.message });
        }
      },
    );

    return () => controller.abort();
  }, [userId, attempt]);

  const sessions = request?.sessions ?? [];
  const positions = Array.from(
    new Map(
      sessions.map(({ position }) => [String(position.id), position]),
    ).entries(),
  );

  const positionId = positions.some(([id]) => id === positionFilter)
    ? positionFilter
    : '';

  const visibleSessions = positionId
    ? sessions.filter(({ position }) => String(position.id) === positionId)
    : sessions;

  function retry() {
    setRequest(null);
    setAttempt((current) => current + 1);
  }

  return (
    <main className="interview-history">
      <Link to="/">← Về trang chủ</Link>
      <h1>Lịch sử phỏng vấn</h1>

      {!request && <p role="status">Đang tải lịch sử…</p>}

      {request?.error && (
        <div className="interview-history__card">
          <p role="alert">{request.error}</p>
          <button type="button" onClick={retry}>Tải lại</button>
        </div>
      )}

      {request?.sessions && (
        <section className="interview-history__card" aria-label="Danh sách phiên">
          <div className="interview-history__filter">
            <label htmlFor="interview-history-position">Vị trí ứng tuyển</label>
            <select
              id="interview-history-position"
              value={positionId}
              onChange={(event) => {
                const value = event.target.value;
                setSearchParams(value ? { position: value } : {}, { replace: true });
              }}
            >
              <option value="">Tất cả vị trí</option>
              {positions.map(([id, position]) => (
                <option key={id} value={id}>
                  {position.name} · {position.level}
                </option>
              ))}
            </select>
          </div>

          {visibleSessions.length ? (
            <div className="interview-history__table-wrap">
              <table className="interview-history__table">
                <thead>
                  <tr>
                    <th scope="col">Vị trí</th>
                    <th scope="col">Bắt đầu</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Điểm</th>
                    <th scope="col">Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSessions.map((session) => (
                    <tr key={session.session_id}>
                      <th scope="row">
                        {session.position.name}
                        <span>{session.position.level}</span>
                      </th>
                      <td>{formatDate(session.started_at)}</td>
                      <td>{statusLabels[session.status] ?? session.status}</td>
                      <td>
                        {Number.isFinite(session.overall_score)
                          ? `${scoreFormat.format(session.overall_score)}/10`
                          : '—'}
                      </td>
                      <td>
                        {session.status === 'COMPLETED' ? (
                          <Link
                            to={`/interview/results/${session.session_id}`}
                            aria-label={`Xem chi tiết phiên ${session.session_id}`}
                          >
                            Xem chi tiết
                          </Link>
                        ) : 'Chưa có kết quả'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
              Bạn chưa có phiên phỏng vấn.{' '}
              <Link to="/interview">Bắt đầu luyện tập</Link>
            </p>
          )}
        </section>
      )}
    </main>
  );
}

export default function InterviewHistory() {
  const userId = getCurrentUser()?.id;
  return userId ? <HistoryList userId={userId} /> : <Navigate to="/login" replace />;
}