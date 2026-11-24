import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authStorage.js';
import { createSession, getPositions } from '../services/interviewService.js';
import '../styles/InterviewSetup.css';

const questionCounts = [3, 5, 10];

function OptionGroup({ title, name, options, selected, onChange, suffix = '' }) {
  return (
    <fieldset className="interview-setup__group">
      <legend>{title}</legend>
      <div className="interview-setup__options">
        {options.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={selected === option}
              onChange={() => onChange(option)}
            />
            {option}{suffix}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [positionName, setPositionName] = useState('');
  const [levelName, setLevelName] = useState('');
  const [count, setCount] = useState(questionCounts[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [startError, setStartError] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const starting = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    getPositions(controller.signal).then(
      setCatalog,
      (error) => {
        if (!controller.signal.aborted) setCatalogError(error.message);
      },
    );

    return () => controller.abort();
  }, [catalogAttempt]);

  const positions = [...new Set((catalog ?? []).map((item) => item.name))];
  const selectedName = positionName || positions[0];
  const matchingPositions = (catalog ?? []).filter((item) => item.name === selectedName);
  const levels = [...new Set(matchingPositions.map((item) => item.level))];
  const position = matchingPositions.find((item) => item.level === levelName)
    ?? matchingPositions[0];

  function changeOption(setValue, value) {
    setValue(value);
    setConfirmed(false);
    setStartError('');
  }

  function confirmSetup(event) {
    event.preventDefault();
    setConfirmed(true);
  }

  function retryCatalog() {
    setCatalogError('');
    setCatalogAttempt((attempt) => attempt + 1);
  }

  async function startInterview() {
    if (!position || starting.current) return;

    if (!getCurrentUser()) {
      navigate('/login');
      return;
    }

    starting.current = true;
    setIsStarting(true);
    setStartError('');

    try {
      const session = await createSession(position.id, count);
      navigate('/interview/room', { state: { sessionId: session.sessionId } });
    } catch (error) {
      setStartError(error.message);
    } finally {
      starting.current = false;
      setIsStarting(false);
    }
  }

  return (
    <main className="interview-setup">
      <div className="interview-setup__container">
        <Link className="interview-setup__back" to="/">← Về trang chủ</Link>
        <h1>Cấu hình buổi phỏng vấn</h1>
        <p>Chọn vị trí ứng tuyển, cấp độ và số câu hỏi cho buổi luyện tập.</p>

        {!catalog && !catalogError && <p role="status">Đang tải vị trí ứng tuyển…</p>}

        {catalogError && (
          <div>
            <p role="alert">{catalogError}</p>
            <button type="button" onClick={retryCatalog}>Tải lại vị trí</button>
          </div>
        )}

        {catalog?.length === 0 && <p>Chưa có vị trí ứng tuyển để luyện tập.</p>}

        {position && (
          <form className="interview-setup__layout" onSubmit={confirmSetup}>
            <fieldset className="interview-setup__panel" disabled={isStarting}>
              <OptionGroup
                title="Vị trí ứng tuyển"
                name="position"
                options={positions}
                selected={selectedName}
                onChange={(value) => {
                  setLevelName('');
                  changeOption(setPositionName, value);
                }}
              />
              <OptionGroup
                title="Cấp độ"
                name="level"
                options={levels}
                selected={position.level}
                onChange={(value) => changeOption(setLevelName, value)}
              />
              <OptionGroup
                title="Số lượng câu hỏi"
                name="count"
                options={questionCounts}
                selected={count}
                onChange={(value) => changeOption(setCount, value)}
                suffix=" câu"
              />
            </fieldset>

            <aside className="interview-setup__summary" aria-labelledby="summary-title">
              <h2 id="summary-title">Tóm tắt buổi phỏng vấn</h2>
              <dl>
                <div><dt>Vị trí</dt><dd>{position.name}</dd></div>
                <div><dt>Cấp độ</dt><dd>{position.level}</dd></div>
                <div><dt>Số câu hỏi</dt><dd>{count} câu</dd></div>
              </dl>

              <button type="submit" disabled={isStarting}>Xác nhận cấu hình</button>
              <div className="interview-setup__status" role="status">
                {confirmed && 'Đã xác nhận cấu hình.'}
              </div>

              {confirmed && (
                <button
                  className="interview-setup__room-link"
                  type="button"
                  onClick={startInterview}
                  disabled={isStarting}
                >
                  <span>{isStarting ? 'Đang tạo phiên…' : 'Vào phòng phỏng vấn'}</span>
                  {!isStarting && <span aria-hidden="true">→</span>}
                </button>
              )}

              {startError && <p role="alert">{startError}</p>}
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}