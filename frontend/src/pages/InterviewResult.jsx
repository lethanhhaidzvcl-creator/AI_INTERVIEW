import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { getSessionResult } from '../services/interviewService.js';
import '../styles/InterviewResult.css';

const scoreFormat = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 2,
});

function formatScore(score) {
  return Number.isFinite(score) ? `${scoreFormat.format(score)}/10` : '—';
}

function CriteriaRadar({ criteria }) {
  const data = criteria
    .map((item, index) => ({
      axis: String(index + 1),
      name: item.criterion_name,
      score: item.score,
    }))
    .filter(({ score }) => Number.isFinite(score) && score >= 0 && score <= 10);

  return (
    <section className="interview-result__card" aria-labelledby="result-radar">
      <h2 id="result-radar">Biểu đồ Radar</h2>
      {data.length ? (
        <div className="interview-result__chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <RadarChart data={data} outerRadius="75%">
              <PolarGrid gridType="circle" />
              <PolarAngleAxis dataKey="axis" />
              <PolarRadiusAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
              <Tooltip
                labelFormatter={(axis) =>
                  data.find((item) => item.axis === String(axis))?.name ?? axis
                }
                formatter={(score) => [formatScore(Number(score)), 'Điểm']}
              />
              <Radar
                dataKey="score"
                stroke="#4338ca"
                strokeWidth={2}
                fill="#818cf8"
                fillOpacity={data.length >= 3 ? 0.28 : 0}
                dot={{ r: 5, fill: '#4338ca' }}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p>Chưa có điểm theo tiêu chí để vẽ biểu đồ.</p>
      )}
    </section>
  );
}

function Feedback({ title, criteria, field }) {
  const items = criteria.filter((item) => item[field]?.trim());

  return (
    <section className="interview-result__card">
      <h2>{title}</h2>
      {items.length ? (
        <ul className="interview-result__feedback">
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.criterion_name}</strong>
              <p>{item[field]}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Chưa có nhận xét cho mục này.</p>
      )}
    </section>
  );
}

function renderInlineCode(text = '') {
  return text.split(/(`[^`\n]+`)/g).map((part, index) =>
    index % 2 ? <code key={index}>{part.slice(1, -1)}</code> : part,
  );
}

function QuestionReviews({ items }) {
  return (
    <section
      className="interview-result__card interview-result__questions"
      aria-labelledby="result-questions"
    >
      <h2 id="result-questions">Xem lại câu hỏi và câu trả lời</h2>

      <div className="question-review-list">
        {items.map((item) => (
          <details className="question-review" key={item.order_no}>
            <summary className="question-review__summary">
              <span className="question-review__number">Câu {item.order_no}</span>
              <span>{renderInlineCode(item.question_content)}</span>
              <span className="question-review__chevron" aria-hidden="true" />
            </summary>

            <div className="question-review__body">
              <div className="question-review__answer">
                <h3>Câu trả lời của bạn</h3>
                <p>
                  {renderInlineCode(
                    item.candidate_answer?.trim() || 'Chưa có câu trả lời.',
                  )}
                </p>
              </div>

              {item.suggested_answer?.trim() && (
                <div className="question-review__answer question-review__answer--reference">
                  <h3>Đáp án tham khảo</h3>
                  <p>{renderInlineCode(item.suggested_answer)}</p>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function InterviewResult() {
  const { sessionId } = useParams();
  const [request, setRequest] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getSessionResult(sessionId, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) {
          setRequest({ sessionId, attempt, data });
        }
      },
      (error) => {
        if (!controller.signal.aborted) {
          setRequest({ sessionId, attempt, error: error.message });
        }
      },
    );

    return () => controller.abort();
  }, [sessionId, attempt]);

  const currentRequest =
    request?.sessionId === sessionId && request?.attempt === attempt
      ? request
      : null;

  const result = currentRequest?.data;
  const criteria = result?.criteria_evaluations ?? [];
  const position = result?.session?.position;
  const questionReviews = result?.questions_review ?? [];

  return (
    <main className="interview-result">
      <nav className="interview-result__navigation" aria-label="Điều hướng kết quả">
        <Link to="/interview">← Về màn hình cấu hình</Link>
        <Link to="/interview/history">Lịch sử phỏng vấn</Link>
      </nav>

      <h1>Kết quả phỏng vấn</h1>

      {!currentRequest && <p role="status">Đang tải kết quả…</p>}

      {currentRequest?.error && (
        <div className="interview-result__card">
          <p role="alert">{currentRequest.error}</p>
          <button type="button" onClick={() => setAttempt((current) => current + 1)}>
            Tải lại kết quả
          </button>
        </div>
      )}

      {result && (
        <>
          <section className="interview-result__summary" aria-labelledby="result-overall">
            <div>
              <h2 id="result-overall">Điểm tổng</h2>
              {position && <p>{position.name} · {position.level}</p>}
            </div>
            <strong>{formatScore(result.overall_score)}</strong>
            {result.summary_feedback && <p>{result.summary_feedback}</p>}
          </section>

          <div className="interview-result__grid">
            <section className="interview-result__card">
              <h2>Bảng điểm theo tiêu chí</h2>

              {criteria.length ? (
                <table className="interview-result__table">
                  <thead>
                    <tr>
                      <th scope="col">Trục</th>
                      <th scope="col">Tiêu chí</th>
                      <th scope="col">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <th scope="row">{item.criterion_name}</th>
                        <td>{formatScore(item.score)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Chưa có điểm theo tiêu chí.</p>
              )}
            </section>

            <CriteriaRadar criteria={criteria} />
            <Feedback title="Điểm mạnh" criteria={criteria} field="strength" />
            <Feedback
              title="Điểm cần cải thiện"
              criteria={criteria}
              field="weakness"
            />
          </div>

          {questionReviews.length > 0 && <QuestionReviews items={questionReviews} />}
        </>
      )}
    </main>
  );
}