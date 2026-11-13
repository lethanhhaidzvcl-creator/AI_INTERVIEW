# Thiết Kế Rubric & JSON Schema Chấm Điểm
## Dự án: AI Interview | TV4 – Sprint 1 – Task 3
**Ngày tạo:** 09/11/2026  
**Phụ trách:** TV4 (AI/LLM Integration)  
**Điểm:** 4đ | **Nộp:** File

---

## 1. TỔNG QUAN HỆ THỐNG CHẤM ĐIỂM

Hệ thống chấm điểm tự động sử dụng **Google Gemini 3.6 Flash** để đánh giá câu trả lời phỏng vấn theo **3 tiêu chí độc lập**, sau đó tính điểm tổng theo trọng số.

```
total_score = (chuyen_mon × 0.5) + (ro_rang × 0.3) + (chieu_sau × 0.2)
```

> Thang điểm: 0 – 10 | Làm tròn 1 chữ số thập phân

---

## 2. RUBRIC 3 TIÊU CHÍ CHI TIẾT

### 2.1 Tiêu chí 1: CHUYÊN MÔN KỸ THUẬT (Technical Accuracy)
**Trọng số: 50%** | Thang điểm: 0 – 10

| Mức điểm | Phân loại | Mô tả chi tiết |
|----------|-----------|----------------|
| **9 – 10** | Xuất sắc | Trả lời hoàn toàn chính xác về mặt kỹ thuật. Không có lỗi khái niệm. Sử dụng thuật ngữ chuyên ngành đúng. Có thể giải thích cơ chế hoạt động bên dưới (underlying mechanism). |
| **7 – 8** | Tốt | Trả lời đúng các ý chính, có thể thiếu 1–2 chi tiết nhỏ. Thuật ngữ sử dụng phần lớn chính xác. Không có lỗi nghiêm trọng. |
| **5 – 6** | Trung bình | Nắm được ý tổng quát nhưng thiếu chính xác ở một số điểm. Có thể nhầm lẫn giữa các khái niệm liên quan. Cần bổ sung kiến thức. |
| **3 – 4** | Yếu | Hiểu sai một phần lớn vấn đề. Có lỗi kỹ thuật rõ ràng. Câu trả lời chỉ đúng ở mức bề mặt. |
| **1 – 2** | Rất yếu | Câu trả lời hầu như sai hoặc không liên quan. Hiểu nhầm căn bản về khái niệm. |
| **0** | Không trả lời | Bỏ trống, trả lời "không biết", hoặc hoàn toàn sai chủ đề. |

**Ví dụ áp dụng** (Câu hỏi: "useEffect là gì?"):
- Điểm 9–10: Giải thích đúng lifecycle, dependency array, cleanup function, so sánh với componentDidMount/Update/WillUnmount
- Điểm 5–6: Biết useEffect dùng cho side effect nhưng nhầm dependency array [] và không có []
- Điểm 0–2: Nói "useEffect là hook quản lý state" (nhầm với useState)

---

### 2.2 Tiêu chí 2: RÕ RÀNG & DIỄN ĐẠT (Clarity & Communication)
**Trọng số: 30%** | Thang điểm: 0 – 10

| Mức điểm | Phân loại | Mô tả chi tiết |
|----------|-----------|----------------|
| **9 – 10** | Xuất sắc | Câu trả lời có cấu trúc rõ ràng (mở đầu → thân → kết). Ý tưởng mạch lạc, dễ theo dõi. Dùng từ nối logic ("đầu tiên", "tiếp theo", "ví dụ như"). Độ dài vừa phải, không dài dòng. |
| **7 – 8** | Tốt | Diễn đạt khá rõ ràng, có thể thiếu cấu trúc hóa nhưng vẫn dễ hiểu. Ý tưởng liên kết tốt. |
| **5 – 6** | Trung bình | Trả lời được nhưng lộn xộn, khó theo dõi. Nhảy ý đột ngột. Người nghe cần đoán ý. |
| **3 – 4** | Yếu | Câu trả lời rời rạc, thiếu logic. Khó hiểu mục đích muốn nói gì. |
| **1 – 2** | Rất yếu | Câu trả lời quá ngắn (1–2 từ) hoặc lan man vô nghĩa. |
| **0** | Không có | Bỏ trống hoặc không có nội dung có thể đánh giá. |

**Chú ý đặc biệt:**
- Câu trả lời quá ngắn (< 20 từ) → tối đa 5 điểm dù đúng
- Câu trả lời lặp đi lặp lại cùng ý → trừ điểm
- Dùng bullet point hay danh sách có cấu trúc → cộng điểm

---

### 2.3 Tiêu chí 3: CHIỀU SÂU & VÍ DỤ (Depth & Examples)
**Trọng số: 20%** | Thang điểm: 0 – 10

| Mức điểm | Phân loại | Mô tả chi tiết |
|----------|-----------|----------------|
| **9 – 10** | Xuất sắc | Có ví dụ code cụ thể hoặc tình huống thực tế. So sánh với cách tiếp cận khác. Đề cập trường hợp đặc biệt (edge case). Liên kết với kinh nghiệm thực tế hoặc dự án đã làm. |
| **7 – 8** | Tốt | Có ví dụ cụ thể (dù không có code). Giải thích được "khi nào dùng" và "tại sao". |
| **5 – 6** | Trung bình | Chỉ giải thích lý thuyết, không có ví dụ. Hoặc ví dụ quá chung chung, không cụ thể. |
| **3 – 4** | Yếu | Câu trả lời thuần lý thuyết ngắn, không có minh họa. |
| **1 – 2** | Rất yếu | Gần như không có nội dung thực chất. |
| **0** | Không có | Bỏ trống. |

---

## 3. QUY TẮC NGHIỆP VỤ TÍNH ĐIỂM (Business Rules)

```
BR-04: Công thức tính điểm tổng
total_score = (chuyen_mon × 0.5) + (ro_rang × 0.3) + (chieu_sau × 0.2)
Làm tròn đến 1 chữ số thập phân (Math.round(score * 10) / 10)

BR-04a: Giới hạn điểm
- Mỗi tiêu chí: 0.0 ≤ score ≤ 10.0
- Điểm tổng: 0.0 ≤ total_score ≤ 10.0

BR-04b: Trường hợp câu trả lời rỗng
- Nếu user_answer_text = "" hoặc < 10 ký tự → tất cả scores = 0, total_score = 0.0

BR-04c: Trường hợp câu trả lời lạc đề
- Nếu câu trả lời hoàn toàn không liên quan đến câu hỏi → chuyen_mon = 0
```

---

## 4. JSON SCHEMA ĐẦU RA CHUẨN

### 4.1 Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "InterviewEvaluationResult",
  "description": "Kết quả đánh giá câu trả lời phỏng vấn từ AI LLM",
  "type": "object",
  "required": [
    "session_id",
    "question_id",
    "question_order",
    "scores",
    "total_score",
    "feedback"
  ],
  "additionalProperties": false,
  "properties": {
    "session_id": {
      "type": "string",
      "format": "uuid",
      "description": "UUID của phiên phỏng vấn (VARCHAR(36) trong DB)",
      "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    },
    "question_id": {
      "type": "integer",
      "minimum": 1,
      "description": "ID của câu hỏi trong bảng questions"
    },
    "question_order": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "description": "Thứ tự câu hỏi trong phiên phỏng vấn (1, 2, 3...)"
    },
    "scores": {
      "type": "object",
      "required": ["chuyen_mon", "ro_rang", "chieu_sau"],
      "additionalProperties": false,
      "description": "Điểm 3 tiêu chí, mỗi tiêu chí từ 0.0 đến 10.0",
      "properties": {
        "chuyen_mon": {
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "multipleOf": 0.5,
          "description": "Điểm chuyên môn kỹ thuật (trọng số 50%)"
        },
        "ro_rang": {
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "multipleOf": 0.5,
          "description": "Điểm rõ ràng, diễn đạt (trọng số 30%)"
        },
        "chieu_sau": {
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "multipleOf": 0.5,
          "description": "Điểm chiều sâu, ví dụ cụ thể (trọng số 20%)"
        }
      }
    },
    "total_score": {
      "type": "number",
      "minimum": 0,
      "maximum": 10,
      "description": "Điểm tổng = chuyen_mon×0.5 + ro_rang×0.3 + chieu_sau×0.2, làm tròn 1 chữ số thập phân"
    },
    "feedback": {
      "type": "object",
      "required": ["strength", "weakness", "suggestion"],
      "additionalProperties": false,
      "properties": {
        "strength": {
          "type": "string",
          "minLength": 10,
          "maxLength": 500,
          "description": "Điểm mạnh của câu trả lời, viết bằng tiếng Việt"
        },
        "weakness": {
          "type": "string",
          "minLength": 10,
          "maxLength": 500,
          "description": "Điểm yếu hoặc thiếu sót, viết bằng tiếng Việt"
        },
        "suggestion": {
          "type": "string",
          "minLength": 10,
          "maxLength": 500,
          "description": "Gợi ý cải thiện cụ thể, viết bằng tiếng Việt"
        }
      }
    },
    "evaluation_level": {
      "type": "string",
      "enum": ["EXCELLENT", "GOOD", "AVERAGE", "WEAK", "FAIL"],
      "description": "Phân loại tổng thể dựa trên total_score: EXCELLENT≥8.5, GOOD≥7, AVERAGE≥5, WEAK≥3, FAIL<3"
    }
  }
}
```

### 4.2 Bảng Enum `evaluation_level`

| Giá trị | Điều kiện | Ý nghĩa |
|---------|-----------|---------|
| `EXCELLENT` | total_score ≥ 8.5 | Xuất sắc — Ứng viên nắm rất chắc kiến thức |
| `GOOD` | 7.0 ≤ score < 8.5 | Tốt — Đáp ứng yêu cầu vị trí |
| `AVERAGE` | 5.0 ≤ score < 7.0 | Trung bình — Cần phát triển thêm |
| `WEAK` | 3.0 ≤ score < 5.0 | Yếu — Thiếu kiến thức cơ bản |
| `FAIL` | score < 3.0 | Không đạt — Không phù hợp vị trí |

---

## 5. SYSTEM PROMPT GỬI CHO GEMINI API

```
Bạn là một giám khảo chấm điểm phỏng vấn kỹ thuật chuyên nghiệp.

NHIỆM VỤ:
Đánh giá câu trả lời của ứng viên dựa trên câu hỏi và đáp án mẫu được cung cấp.

TIÊU CHÍ CHẤM ĐIỂM (mỗi tiêu chí từ 0.0 đến 10.0, bước 0.5):
1. chuyen_mon (Chuyên môn kỹ thuật - 50%): Độ chính xác về mặt kỹ thuật, không sai khái niệm
2. ro_rang (Rõ ràng - 30%): Diễn đạt mạch lạc, có cấu trúc, dễ hiểu  
3. chieu_sau (Chiều sâu - 20%): Có ví dụ cụ thể, so sánh, edge case

TÍNH ĐIỂM TỔNG:
total_score = round((chuyen_mon × 0.5) + (ro_rang × 0.3) + (chieu_sau × 0.2), 1)

QUY TẮC:
- Nếu câu trả lời rỗng hoặc dưới 10 ký tự: tất cả điểm = 0
- Chỉ trả về JSON thuần túy, KHÔNG thêm markdown (```json), KHÔNG giải thích thêm
- Tất cả text trong feedback phải bằng tiếng Việt

ĐỊNH DẠNG JSON ĐẦU RA BẮT BUỘC:
{
  "session_id": "<session_id được cung cấp>",
  "question_id": <question_id được cung cấp>,
  "question_order": <question_order được cung cấp>,
  "scores": {
    "chuyen_mon": <0.0-10.0>,
    "ro_rang": <0.0-10.0>,
    "chieu_sau": <0.0-10.0>
  },
  "total_score": <0.0-10.0>,
  "feedback": {
    "strength": "<điểm mạnh tiếng Việt>",
    "weakness": "<điểm yếu tiếng Việt>",
    "suggestion": "<gợi ý cải thiện tiếng Việt>"
  },
  "evaluation_level": "<EXCELLENT|GOOD|AVERAGE|WEAK|FAIL>"
}
```

---

## 6. VÍ DỤ JSON ĐẦU RA (3 mức độ)

### Ví dụ 1: Câu trả lời XUẤT SẮC (total_score = 9.0)

**Câu hỏi:** "useEffect dependency array có tác dụng gì? Giải thích 3 trường hợp."  
**Câu trả lời ứng viên:** *"Dependency array quyết định khi nào useEffect chạy lại. Có 3 trường hợp: (1) Không truyền → chạy sau mỗi render, dễ gây infinite loop. (2) Mảng rỗng [] → chỉ chạy 1 lần sau mount, giống componentDidMount. (3) [count] → chạy lại mỗi khi count thay đổi. Cleanup thì return một function trong useEffect, ví dụ clearInterval khi unmount."*

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "question_id": 3,
  "question_order": 2,
  "scores": {
    "chuyen_mon": 9.5,
    "ro_rang": 9.0,
    "chieu_sau": 8.5
  },
  "total_score": 9.2,
  "feedback": {
    "strength": "Phân biệt chính xác và đầy đủ cả 3 trường hợp dependency array. Đặc biệt biết cảnh báo nguy cơ infinite loop ở trường hợp không truyền mảng — đây là điểm thể hiện kinh nghiệm thực tế. Có đề cập cleanup function đúng cách.",
    "weakness": "Chưa đề cập đến cơ chế so sánh của React (Object.is) khi kiểm tra dependency thay đổi, dẫn đến có thể gặp vấn đề với object/array reference.",
    "suggestion": "Nên bổ sung ví dụ về trường hợp dependency là object/array và tại sao cần useMemo hoặc useCallback để tránh re-render không mong muốn."
  },
  "evaluation_level": "EXCELLENT"
}
```

---

### Ví dụ 2: Câu trả lời TRUNG BÌNH (total_score = 5.9)

**Câu trả lời ứng viên:** *"useEffect dùng để xử lý side effect như gọi API. Dependency array là mảng các biến mà useEffect phụ thuộc vào. Nếu truyền [] thì chạy 1 lần, còn không truyền thì chạy mỗi lần."*

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "question_id": 3,
  "question_order": 2,
  "scores": {
    "chuyen_mon": 6.0,
    "ro_rang": 6.5,
    "chieu_sau": 4.0
  },
  "total_score": 5.9,
  "feedback": {
    "strength": "Nắm được ý chính về công dụng của useEffect và phân biệt được 2 trong 3 trường hợp dependency array một cách chính xác.",
    "weakness": "Bỏ sót trường hợp thứ 3 (dependency có giá trị cụ thể như [count]). Không đề cập đến cleanup function — đây là phần quan trọng để tránh memory leak. Chưa nhắc đến rủi ro infinite loop.",
    "suggestion": "Hãy học thêm về cleanup function trong useEffect: 'return () => { ... }' để dọn dẹp subscription, timer khi component unmount. Thực hành viết ví dụ setInterval với cleanup."
  },
  "evaluation_level": "AVERAGE"
}
```

---

### Ví dụ 3: Câu trả lời KHÔNG ĐẠT (total_score = 1.5)

**Câu trả lời ứng viên:** *"useEffect là hook để quản lý state trong React."*

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "question_id": 3,
  "question_order": 2,
  "scores": {
    "chuyen_mon": 1.0,
    "ro_rang": 3.0,
    "chieu_sau": 0.0
  },
  "total_score": 1.4,
  "feedback": {
    "strength": "Có nhắc đến tên hook useEffect, cho thấy ứng viên đã từng nghe đến khái niệm này.",
    "weakness": "Nhầm lẫn nghiêm trọng: useEffect KHÔNG phải dùng để quản lý state (đó là useState). useEffect dùng để xử lý side effects. Hoàn toàn không trả lời được câu hỏi về dependency array. Câu trả lời quá ngắn và sai kiến thức cơ bản.",
    "suggestion": "Cần học lại toàn bộ phần React Hooks cơ bản: phân biệt useState (quản lý state), useEffect (side effects như gọi API, subscription, timer). Đọc tài liệu chính thức tại react.dev/learn/synchronizing-with-effects."
  },
  "evaluation_level": "FAIL"
}
```

---

## 7. MAPPING VÀO DATABASE (ERD)

Dữ liệu JSON sau khi parse sẽ được lưu vào 2 bảng:

### Bảng `evaluation_details`
```sql
-- Mỗi tiêu chí → 1 row trong evaluation_details
INSERT INTO evaluation_details 
  (session_id, criterion_name, score, strength, weakness, suggestion)
VALUES
  ('a1b2c3d4...', 'chuyen_mon', 9.5, 'strength text', 'weakness text', 'suggestion text'),
  ('a1b2c3d4...', 'ro_rang',    9.0, '...', '...', '...'),
  ('a1b2c3d4...', 'chieu_sau',  8.5, '...', '...', '...');
```

### Bảng `interview_sessions` (cập nhật)
```sql
-- Cập nhật điểm tổng và trạng thái
UPDATE interview_sessions 
SET 
  total_score     = 9.2,
  status          = 'COMPLETED',
  summary_feedback = 'EXCELLENT — Ứng viên nắm chắc kiến thức...',
  finished_at     = NOW()
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

---

## 8. XỬ LÝ LỖI JSON (Error Handling)

```javascript
// Hàm parse JSON an toàn từ Gemini response
function parseEvaluationResult(rawText) {
  // Bước 1: Thử parse trực tiếp
  try {
    return JSON.parse(rawText);
  } catch (e) {}

  // Bước 2: Extract JSON nếu có markdown wrapper
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {}
  }

  // Bước 3: Trả về fallback nếu không parse được
  return {
    session_id: null,
    question_id: null,
    question_order: null,
    scores: { chuyen_mon: 0, ro_rang: 0, chieu_sau: 0 },
    total_score: 0.0,
    feedback: {
      strength: "Không thể phân tích câu trả lời.",
      weakness: "Hệ thống gặp lỗi khi xử lý kết quả AI.",
      suggestion: "Vui lòng thử lại."
    },
    evaluation_level: "FAIL",
    _parse_error: true
  };
}
```
