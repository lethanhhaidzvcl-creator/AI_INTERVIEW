DROP DATABASE IF EXISTS ai_interview_db;
CREATE DATABASE ai_interview_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_interview_db;

-- 1. Bảng users
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    target_role VARCHAR(100) NULL,
    skills TEXT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'candidate',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Bảng job_positions
CREATE TABLE job_positions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Bảng questions
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    position_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Medium',
    sample_answer TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_position 
        FOREIGN KEY (position_id) REFERENCES job_positions(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Bảng interview_sessions
CREATE TABLE interview_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    position_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
    total_questions INT NOT NULL DEFAULT 3,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME NULL,
    CONSTRAINT fk_sessions_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_sessions_position 
        FOREIGN KEY (position_id) REFERENCES job_positions(id) 
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. Bảng session_questions
CREATE TABLE session_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    order_no INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sq_session 
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_sq_question 
        FOREIGN KEY (question_id) REFERENCES questions(id) 
        ON DELETE RESTRICT,
    UNIQUE KEY uq_session_order (session_id, order_no)
) ENGINE=InnoDB;

-- 6. Bảng answers
CREATE TABLE answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    session_question_id BIGINT NOT NULL,
    answer_text TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_answers_session 
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_answers_sq 
        FOREIGN KEY (session_question_id) REFERENCES session_questions(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Bảng evaluations
CREATE TABLE evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    criterion_name VARCHAR(50) NOT NULL,
    score DECIMAL(3, 1) NOT NULL,
    strength TEXT NULL,
    weakness TEXT NULL,
    suggestion TEXT NULL,
    CONSTRAINT fk_evaluations_session 
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Bảng session_results
CREATE TABLE session_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    overall_score DECIMAL(3, 1) NOT NULL,
    summary_feedback TEXT NULL,
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_results_session 
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Chèn dữ liệu danh mục vị trí trước
INSERT INTO job_positions (name, level, description) VALUES
('Frontend Developer', 'Fresher', 'Lập trình viên Frontend HTML/CSS, JS, React.'),
('Backend Developer', 'Fresher', 'Lập trình viên Backend Node.js, Express, MySQL.');

-- Chèn câu hỏi kỹ thuật tương ứng theo ID vị trí (1: Frontend, 2: Backend)
INSERT INTO questions (position_id, content, difficulty) VALUES
(1, 'Phân biệt var, let và const trong JavaScript?', 'Easy'),
(1, 'Virtual DOM trong React hoạt động như thế nào?', 'Medium'),
(2, 'Phân biệt GET và POST trong HTTP?', 'Easy'),
(2, 'Mục đích của việc đánh Index trong cơ sở dữ liệu quan hệ?', 'Medium');