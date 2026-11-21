const apiUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
).replace(/\/$/, '');

async function request(path, { method = 'GET', body, signal } = {}) {
  const token = sessionStorage.getItem('token');
  let response;

  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Không kết nối được backend. Hãy kiểm tra máy chủ và thử lại.');
  }

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status !== 'success') {
    throw new Error(result?.message || (
      response.status === 404
        ? 'Không tìm thấy API hoặc phiên phỏng vấn. Hãy kiểm tra phiên bản backend.'
        : 'Yêu cầu không thành công. Vui lòng thử lại.'
    ));
  }

  return result.data;
}

export function getPositions(signal) {
  return request('/positions', { signal });
}

export function createSession(positionId, questionCount) {
  return request('/sessions', {
    method: 'POST',
    body: { position_id: positionId, total_questions: questionCount },
  });
}

export function getSessionQuestions(sessionId, signal) {
  return request(`/sessions/${sessionId}/questions`, { signal });
}

export function submitAnswer(sessionId, questionId, text) {
  return request(`/sessions/${sessionId}/answers`, {
    method: 'POST',
    body: { session_question_id: questionId, answer_text: text },
  });
}

export function finishSession(sessionId) {
  return request(`/sessions/${sessionId}/finish`, { method: 'POST' });
}

export function getSessionResult(sessionId, signal) {
  return request(`/sessions/${encodeURIComponent(sessionId)}/result`, { signal });
}

export function getSessionHistory(userId, signal) {
  const query = new URLSearchParams({ user_id: userId });
  return request(`/sessions/history?${query}`, { signal });
}