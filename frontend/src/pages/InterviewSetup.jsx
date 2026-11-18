import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/InterviewSetup.css';

const positions = ['Frontend Developer', 'Backend Developer'];
const levels = ['Fresher', 'Junior'];
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
  const [config, setConfig] = useState({
    position: positions[0],
    level: levels[0],
    count: questionCounts[0],
  });
  const [confirmed, setConfirmed] = useState(false);

  function updateOption(name, value) {
    setConfig((current) => ({ ...current, [name]: value }));
    setConfirmed(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setConfirmed(true);
  }

  return (
    <main className="interview-setup">
      <div className="interview-setup__container">
        <a className="interview-setup__back" href="/">← Về trang chủ</a>
        <h1>Cấu hình buổi phỏng vấn</h1>
        <p>Chọn vị trí ứng tuyển, cấp độ và số câu hỏi cho buổi luyện tập.</p>

        <form className="interview-setup__layout" onSubmit={handleSubmit}>
          <div className="interview-setup__panel">
            <OptionGroup
              title="Vị trí ứng tuyển"
              name="position"
              options={positions}
              selected={config.position}
              onChange={(value) => updateOption('position', value)}
            />
            <OptionGroup
              title="Cấp độ"
              name="level"
              options={levels}
              selected={config.level}
              onChange={(value) => updateOption('level', value)}
            />
            <OptionGroup
              title="Số lượng câu hỏi"
              name="count"
              options={questionCounts}
              selected={config.count}
              onChange={(value) => updateOption('count', value)}
              suffix=" câu"
            />
          </div>

          <aside className="interview-setup__summary" aria-labelledby="summary-title">
            <h2 id="summary-title">Tóm tắt buổi phỏng vấn</h2>
            <dl>
              <div><dt>Vị trí</dt><dd>{config.position}</dd></div>
              <div><dt>Cấp độ</dt><dd>{config.level}</dd></div>
              <div><dt>Số câu hỏi</dt><dd>{config.count} câu</dd></div>
            </dl>
                        <button type="submit">Xác nhận cấu hình</button>

            <div className="interview-setup__status" role="status">
              {confirmed && 'Đã xác nhận cấu hình.'}
            </div>

            {confirmed && (
            <Link className="interview-setup__room-link" to="/interview/room" state={{ count: config.count }}>
                Vào phòng phỏng vấn →
            </Link>
            )}
          </aside>
        </form>
      </div>
    </main>
  );
}