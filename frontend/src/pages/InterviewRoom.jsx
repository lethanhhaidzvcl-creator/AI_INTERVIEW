import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/InterviewRoom.css';

const questionCounts = [3, 5, 10];
const demoResponseDelay = 900;

const questionBank = [
  'Bạn hãy giới thiệu ngắn gọn về bản thân và kinh nghiệm lập trình của mình.',
  'Hãy kể về một dự án bạn đã làm. Bạn phụ trách phần nào trong dự án đó?',
  'Khi gặp một lỗi khó, bạn thường tìm nguyên nhân và kiểm tra cách sửa như thế nào?',
  'Bạn sử dụng Git như thế nào khi làm việc nhóm?',
  'Bạn kiểm tra những gì khi một chức năng chạy trên máy bạn nhưng lỗi trên máy đồng đội?',
  'Bạn sẽ giải thích sự khác nhau giữa frontend và backend như thế nào?',
  'Khi làm biểu mẫu đăng ký, bạn sẽ kiểm tra dữ liệu đầu vào ra sao?',
  'Bạn kiểm tra thế nào khi giao diện báo không kết nối được máy chủ?',
  'Bạn sẽ làm gì để giữ dữ liệu người dùng đã nhập khi gửi biểu mẫu thất bại?',
  'Nếu có thêm một tuần để cải thiện dự án gần nhất, bạn sẽ ưu tiên việc gì và vì sao?',
];

export default function InterviewRoom() {
  const { state } = useLocation();
  const [answers, setAnswers] = useState([]);
  const [draft, setDraft] = useState('');
  const [pendingAnswer, setPendingAnswer] = useState('');
  const responseTimer = useRef(null);

  useEffect(() => {
    return () => window.clearTimeout(responseTimer.current);
  }, []);

  const requestedCount = state?.count;
  const questionCount = questionCounts.includes(requestedCount)
    ? requestedCount
    : questionCounts[0];

  const questions = questionBank.slice(0, questionCount);
  const currentIndex = answers.length;
  const finished = currentIndex === questions.length;
  const questionNumber = Math.min(currentIndex + 1, questions.length);
  const isWaiting = Boolean(pendingAnswer);

  function handleSubmit(event) {
    event.preventDefault();
    const answer = draft.trim();

    if (!answer || finished || responseTimer.current !== null) return;

    setPendingAnswer(answer);
    setDraft('');

    responseTimer.current = window.setTimeout(() => {
      setAnswers((current) => [...current, answer]);
      setPendingAnswer('');
      responseTimer.current = null;
    }, demoResponseDelay);
  }

  return (
    <main className="interview-room">
      <Link className="interview-room__back" to="/interview">
        ← Về màn hình cấu hình
      </Link>

      <h1>Phòng phỏng vấn</h1>

      <section
        className="interview-room__panel"
        aria-label="Phòng chat phỏng vấn"
      >
        <div className="interview-room__progress">
          <p aria-live="polite">
            {finished ? 'Đã hoàn thành' : 'Câu hỏi'}{' '}
            <strong>{questionNumber}/{questions.length}</strong>
          </p>
          <progress
            value={questionNumber}
            max={questions.length}
            aria-label="Tiến độ câu hỏi"
          />
        </div>

        <div className="interview-room__messages" role="log" aria-label="Tin nhắn">
          {answers.map((answer, index) => (
            <div className="interview-room__exchange" key={questions[index]}>
              <div className="interview-room__bubble">
                <strong>Người phỏng vấn</strong>
                <p>{questions[index]}</p>
              </div>
              <div className="interview-room__bubble interview-room__bubble--answer">
                <strong>Bạn</strong>
                <p>{answer}</p>
              </div>
            </div>
          ))}

          {finished ? (
            <p className="interview-room__done">
              Bạn đã trả lời đủ {questions.length} câu hỏi.
            </p>
          ) : (
            <div
              key={currentIndex}
              className="interview-room__bubble interview-room__bubble--current"
            >
              <strong>Người phỏng vấn</strong>
              <p>{questions[currentIndex]}</p>
            </div>
          )}

          {isWaiting && (
            <>
              <div className="interview-room__bubble interview-room__bubble--answer">
                <strong>Bạn</strong>
                <p>{pendingAnswer}</p>
              </div>
              <p className="interview-room__typing" role="status">
                <span className="interview-room__typing-dots" aria-hidden="true">
                  ● ● ●
                </span>
                Đang chuẩn bị câu hỏi…
              </p>
            </>
          )}
        </div>

        {!finished && (
          <form className="interview-room__form" onSubmit={handleSubmit}>
            <label htmlFor="interview-answer">Câu trả lời của bạn</label>
            <textarea
              id="interview-answer"
              rows={3}
              value={draft}
              disabled={isWaiting}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Nhập câu trả lời..."
            />
            <button type="submit" disabled={isWaiting || !draft.trim()}>
              Gửi câu trả lời
            </button>
          </form>
        )}
      </section>
    </main>
  );
}