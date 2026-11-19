const db = require('../config/db');
const { evaluateAndSaveSession } = require('../services/aiEvaluationService');

// POST /api/v1/sessions
const createSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { position_id, total_questions } = req.body;

        if (!position_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng chọn vị trí ứng tuyển (position_id)'
            });
        }

        const [positions] = await db.query(
            'SELECT id, name, level FROM job_positions WHERE id = ? AND is_active = TRUE',
            [position_id]
        );

        if (positions.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Vị trí ứng tuyển không tồn tại hoặc đã ngừng hỗ trợ'
            });
        }

        const numQuestions = total_questions || 3;
        const initialStatus = 'IN_PROGRESS';

        const [result] = await db.query(
            'INSERT INTO interview_sessions (user_id, position_id, status, total_questions) VALUES (?, ?, ?, ?)',
            [userId, position_id, initialStatus, numQuestions]
        );

        const sessionId = result.insertId;

        const [availableQuestions] = await db.query(
            'SELECT id FROM questions WHERE position_id = ? AND is_active = TRUE ORDER BY RAND() LIMIT ?',
            [position_id, Number(numQuestions)]
        );

        for (let i = 0; i < availableQuestions.length; i++) {
            await db.query(
                'INSERT INTO session_questions (session_id, question_id, order_no) VALUES (?, ?, ?)',
                [sessionId, availableQuestions[i].id, i + 1]
            );
        }

        return res.status(201).json({
            status: 'success',
            message: 'Khởi tạo phiên phỏng vấn thành công',
            data: {
                sessionId,
                userId,
                position: positions[0],
                status: initialStatus,
                total_questions: availableQuestions.length
            }
        });
    } catch (error) {
        console.error('Lỗi API createSession:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi tạo phiên phỏng vấn',
            error: error.message
        });
    }
};

// GET /api/v1/sessions/:id/questions
const getSessionQuestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;

        const [sessions] = await db.query(
            'SELECT id, position_id, status, total_questions FROM interview_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy phiên phỏng vấn hoặc bạn không có quyền truy cập'
            });
        }

        const [questions] = await db.query(
            `SELECT 
                sq.id AS session_question_id,
                sq.order_no,
                q.id AS question_id,
                q.content,
                q.difficulty
            FROM session_questions sq
            INNER JOIN questions q ON sq.question_id = q.id
            WHERE sq.session_id = ?
            ORDER BY sq.order_no ASC`,
            [sessionId]
        );

        return res.status(200).json({
            status: 'success',
            message: 'Lấy danh sách câu hỏi theo thứ tự thành công',
            data: {
                session_id: Number(sessionId),
                status: sessions[0].status,
                total_questions: questions.length,
                questions
            }
        });
    } catch (error) {
        console.error('Lỗi API getSessionQuestions:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi lấy danh sách câu hỏi',
            error: error.message
        });
    }
};

// POST /api/v1/sessions/:id/answers
const submitAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;
        const { session_question_id, answer_text } = req.body;

        if (!session_question_id || !answer_text || answer_text.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp session_question_id và nội dung câu trả lời (answer_text)'
            });
        }

        const [sessions] = await db.query(
            'SELECT id, status FROM interview_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy phiên phỏng vấn hoặc bạn không có quyền truy cập'
            });
        }

        if (sessions[0].status !== 'IN_PROGRESS') {
            return res.status(400).json({
                status: 'error',
                message: 'Phiên phỏng vấn đã kết thúc, không thể gửi thêm câu trả lời'
            });
        }

        const [sqRows] = await db.query(
            'SELECT id, order_no FROM session_questions WHERE id = ? AND session_id = ?',
            [session_question_id, sessionId]
        );

        if (sqRows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Câu hỏi không thuộc phiên phỏng vấn này'
            });
        }

        const [existingAnswers] = await db.query(
            'SELECT id FROM answers WHERE session_id = ? AND session_question_id = ?',
            [sessionId, session_question_id]
        );

        let answerId;
        if (existingAnswers.length > 0) {
            answerId = existingAnswers[0].id;
            await db.query(
                'UPDATE answers SET answer_text = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?',
                [answer_text.trim(), answerId]
            );
        } else {
            const [insertRes] = await db.query(
                'INSERT INTO answers (session_id, session_question_id, answer_text) VALUES (?, ?, ?)',
                [sessionId, session_question_id, answer_text.trim()]
            );
            answerId = insertRes.insertId;
        }

        return res.status(201).json({
            status: 'success',
            message: 'Lưu câu trả lời ứng viên thành công',
            data: {
                answer_id: answerId,
                session_id: Number(sessionId),
                session_question_id: Number(session_question_id),
                answer_text: answer_text.trim()
            }
        });
    } catch (error) {
        console.error('Lỗi API submitAnswer:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi lưu câu trả lời',
            error: error.message
        });
    }
};

// POST /api/v1/sessions/:id/finish
const finishSession = async (req, res) => {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const simulateError = Boolean(req.body?.simulate_ai_error);

    try {
        const [sessions] = await db.query(
            'SELECT id, status FROM interview_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy phiên phỏng vấn hoặc bạn không có quyền truy cập'
            });
        }

        const currentStatus = sessions[0].status;

        if (currentStatus === 'COMPLETED') {
            return res.status(400).json({
                status: 'error',
                message: 'Phiên phỏng vấn này đã được chấm điểm hoàn tất'
            });
        }

        if (currentStatus !== 'IN_PROGRESS' && currentStatus !== 'PENDING_EVALUATION') {
            return res.status(400).json({
                status: 'error',
                message: `Không thể xử lý phiên phỏng vấn ở trạng thái ${currentStatus}`
            });
        }

        if (currentStatus === 'IN_PROGRESS') {
            await db.query(
                'UPDATE interview_sessions SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['PENDING_EVALUATION', sessionId]
            );
        }

        const evaluation = await evaluateAndSaveSession(sessionId, { simulateError });

        return res.status(200).json({
            status: 'success',
            message: 'Hoàn thành phiên phỏng vấn và chấm điểm AI thành công',
            data: {
                session_id: Number(sessionId),
                status: 'COMPLETED',
                evaluation
            }
        });
    } catch (error) {
        console.error('Lỗi xử lý AI khi kết thúc phiên (BR-06):', error.message);

        const isAiError = ['AI_TIMEOUT', 'AI_NETWORK_ERROR', 'AI_PROVIDER_ERROR', 'AI_INVALID_RESPONSE'].includes(error.code);
        return res.status(isAiError ? 503 : 500).json({
            status: 'error',
            error_code: error.code || 'EVALUATION_FAILED',
            message: 'Dịch vụ AI tạm thời gián đoạn hoặc quá thời gian phản hồi. Bài làm của bạn đã được bảo toàn, vui lòng thử gọi lại.',
            data: {
                session_id: Number(sessionId),
                status: 'PENDING_EVALUATION',
                can_retry: true
            }
        });
    }
};

// GET /api/v1/sessions/:id/result (FR-10: Kết quả đánh giá chi tiết)
const getSessionResult = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;

        const [sessions] = await db.query(
            `SELECT 
                s.id AS session_id,
                s.status,
                s.total_questions,
                s.started_at,
                s.finished_at,
                jp.id AS position_id,
                jp.name AS position_name,
                jp.level AS position_level
             FROM interview_sessions s
             INNER JOIN job_positions jp ON s.position_id = jp.id
             WHERE s.id = ? AND s.user_id = ?`,
            [sessionId, userId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy phiên phỏng vấn hoặc bạn không có quyền truy cập'
            });
        }

        const sessionInfo = sessions[0];

        if (sessionInfo.status !== 'COMPLETED') {
            return res.status(400).json({
                status: 'error',
                message: `Phiên phỏng vấn chưa hoàn tất chấm điểm (trạng thái hiện tại: ${sessionInfo.status})`
            });
        }

        const [resultRows] = await db.query(
            'SELECT overall_score, summary_feedback, evaluated_at FROM session_results WHERE session_id = ?',
            [sessionId]
        );

        const [criteriaRows] = await db.query(
            `SELECT id, criterion_name, score, strength, weakness, suggestion
             FROM evaluations
             WHERE session_id = ?
             ORDER BY id ASC`,
            [sessionId]
        );

        const [questionReviewRows] = await db.query(
            `SELECT 
                sq.order_no,
                q.id AS question_id,
                q.content AS question_content,
                q.difficulty,
                a.answer_text AS candidate_answer,
                q.sample_answer AS suggested_answer,
                a.submitted_at
             FROM session_questions sq
             INNER JOIN questions q ON sq.question_id = q.id
             LEFT JOIN answers a ON a.session_question_id = sq.id AND a.session_id = sq.session_id
             WHERE sq.session_id = ?
             ORDER BY sq.order_no ASC`,
            [sessionId]
        );

        const summary = resultRows[0] || {
            overall_score: null,
            summary_feedback: null,
            evaluated_at: null
        };

        return res.status(200).json({
            status: 'success',
            message: 'Lấy kết quả đánh giá chi tiết thành công',
            data: {
                session: {
                    session_id: sessionInfo.session_id,
                    status: sessionInfo.status,
                    position: {
                        id: sessionInfo.position_id,
                        name: sessionInfo.position_name,
                        level: sessionInfo.position_level
                    },
                    total_questions: sessionInfo.total_questions,
                    started_at: sessionInfo.started_at,
                    finished_at: sessionInfo.finished_at
                },
                overall_score: Number(summary.overall_score),
                summary_feedback: summary.summary_feedback,
                evaluated_at: summary.evaluated_at,
                criteria_evaluations: criteriaRows.map(item => ({
                    id: item.id,
                    criterion_name: item.criterion_name,
                    score: Number(item.score),
                    strength: item.strength,
                    weakness: item.weakness,
                    suggestion: item.suggestion
                })),
                questions_review: questionReviewRows
            }
        });
    } catch (error) {
        console.error('Lỗi API getSessionResult:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống khi lấy kết quả đánh giá chi tiết',
            error: error.message
        });
    }
};

module.exports = {
    createSession,
    getSessionQuestions,
    submitAnswer,
    finishSession,
    getSessionResult
};