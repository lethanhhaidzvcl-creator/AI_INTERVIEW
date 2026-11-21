import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  finishSession,
  getSessionQuestions,
  submitAnswer,
} from '../services/interviewService.js';
import '../styles/InterviewRoom.css';

const estimatedScoringSeconds = 15;

function InterviewScoringWait() {
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  useEffect(() => {
    const reminder = window.setTimeout(() => {
      setIsTakingLonger(true);
    }, estimatedScoringSeconds * 1000);

    return () => window.clearTimeout(reminder);
  }, []);

  return (
    <main className="interview-room interview-room--scoring">
      <section className="interview-scoring" aria-labelledby="interview-scoring-title">
        <span className="interview-scoring__spinner" aria-hidden="true" />
        <h1 id="interview-scoring-title">Đang phân tích kết quả</h1>
        <p role="status">
          {isTakingLonger
            ? 'AI đang xử lý lâu hơn dự kiến. Kết quả sẽ hiện khi có phản hồi.'
            : `Thời gian ước tính khoảng ${estimatedScoringSeconds} giây. Kết quả sẽ tự hiện khi chấm xong.`}
        </p>
      </section>
    </main>
  );
}

export default function InterviewRoom() {
  const { state } = useLocation();
  const sessionId = state?.sessionId;
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [draft, setDraft] = useState('');
  const [pendingAnswer, setPendingAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const requestInProgress = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    const controller = new AbortController();

    getSessionQuestions(sessionId, controller.signal).then(
      setSession,
      (error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      },
    );

    return () => controller.abort();
  }, [sessionId, loadAttempt]);

  const questions = session?.questions ?? [];
  const currentQuestion = questions[answers.length];
  const status = session?.status;
  const completed = status === 'COMPLETED';
  const canAnswer = status === 'IN_PROGRESS' && Boolean(currentQuestion);
  const canFinish = status === 'PENDING_EVALUATION' ||
    (status === 'IN_PROGRESS' && questions.length > 0 && !currentQuestion);
  const questionNumber = canAnswer ? answers.length + 1 : questions.length;
  const busy = Boolean(pendingAnswer) || isSubmitting;

  function retryQuestions() {
    setLoadError('');
    setLoadAttempt((attempt) => attempt + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const answer = draft.trim();

    if (!answer || !canAnswer || requestInProgress.current) return;

    requestInProgress.current = true;
    setPendingAnswer(answer);
    setActionError('');

    try {
      await submitAnswer(sessionId, currentQuestion.session_question_id, answer);
      setAnswers((current) => [...current, answer]);
      setDraft('');
    } catch (error) {
      setActionError(error.message);
    } finally {
      requestInProgress.current = false;
      setPendingAnswer('');
    }
  }

  async function handleFinish() {
    if (!canFinish || requestInProgress.current) return;

    requestInProgress.current = true;
    setIsSubmitting(true);
    setActionError('');

    try {
      const result = await finishSession(sessionId);
      setEvaluation(result.evaluation);
      setSession((current) => ({ ...current, status: result.status }));
    } catch (error) {
      setActionError(error.message);
    } finally {
      requestInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) return <InterviewScoringWait />;

  return (
    <main className="interview-room">
      <Link className="interview-room__back" to="/interview">
        ← Về màn hình cấu hình
      </Link>
      <h1>Phòng phỏng vấn</h1>

      {!sessionId && <p>Chọn cấu hình để bắt đầu một phiên phỏng vấn.</p>}
      {sessionId && !session && !loadError && <p role="status">Đang tải câu hỏi…</p>}

      {loadError && (
        <div>
          <p role="alert">{loadError}</p>
          <button type="button" onClick={retryQuestions}>Tải lại câu hỏi</button>
        </div>
      )}

      {session && (
        <section className="interview-room__panel" aria-label="Phòng chat phỏng vấn">
          {questions.length > 0 && (
            <div className="interview-room__progress">
              <p aria-live="polite">
                {completed ? 'Đã hoàn thành' : canFinish ? 'Đã trả lời' : 'Câu hỏi'}{' '}
                <strong>{questionNumber}/{questions.length}</strong>
              </p>
              <progress
                value={questionNumber}
                max={questions.length}
                aria-label="Tiến độ câu hỏi"
              />
            </div>
          )}

          <div className="interview-room__messages" role="log" aria-label="Tin nhắn">
            {answers.map((answer, index) => (
              <div className="interview-room__exchange" key={questions[index].session_question_id}>
                <div className="interview-room__bubble">
                  <strong>Người phỏng vấn</strong>
                  <p>{questions[index].content}</p>
                </div>
                <div className="interview-room__bubble interview-room__bubble--answer">
                  <strong>Bạn</strong>
                  <p>{answer}</p>
                </div>
              </div>
            ))}

            {questions.length === 0 && <p>Phiên này chưa có câu hỏi. Hãy chọn lại vị trí.</p>}

            {completed && (
              <div className="interview-room__done">
                <p>Đã nộp bài thành công.</p>
                {evaluation && (
                  <>
                    <p>Điểm tổng: {evaluation.overall_score}/10</p>
                    <p>{evaluation.summary_feedback}</p>
                  </>
                )}
              </div>
            )}

            {canAnswer && (
              <div
                key={currentQuestion.session_question_id}
                className="interview-room__bubble interview-room__bubble--current"
              >
                <strong>Người phỏng vấn</strong>
                <p>{currentQuestion.content}</p>
              </div>
            )}

            {pendingAnswer && (
              <>
                <div className="interview-room__bubble interview-room__bubble--answer">
                  <strong>Bạn</strong>
                  <p>{pendingAnswer}</p>
                </div>
                <p className="interview-room__typing" role="status">
                  <span className="interview-room__typing-dots" aria-hidden="true">
                    ● ● ●
                  </span>
                  Đang lưu câu trả lời…
                </p>
              </>
            )}

            {actionError && <p role="alert">{actionError}</p>}
          </div>

          {canAnswer && (
            <form className="interview-room__form" onSubmit={handleSubmit}>
              <label htmlFor="interview-answer">Câu trả lời của bạn</label>
              <textarea
                id="interview-answer"
                rows={3}
                value={draft}
                disabled={busy}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Nhập câu trả lời..."
              />
              <button type="submit" disabled={busy || !draft.trim()}>
                Gửi câu trả lời
              </button>
            </form>
          )}

          {canFinish && (
            <div className="interview-room__form">
              <button type="button" disabled={busy} onClick={handleFinish}>
                {actionError ? 'Thử nộp lại' : 'Nộp bài'}
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}