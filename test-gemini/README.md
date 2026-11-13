# Module Kiểm Thử Độc Lập Prompt AI (Sprint 1 - Task 19)

Thư mục này chứa toàn bộ mã nguồn kiểm thử tự động khả năng gọi **Google Gemini API bằng SDK chính thức**, đo độ trễ và kiểm tra tính hợp lệ của JSON Schema đầu ra cho hệ thống **AI Interview**.

## 1. Cấu trúc thư mục

```text
test-gemini/
├── .env.example                 # Mẫu cấu hình biến môi trường
├── .env                         # Khóa API bí mật của bạn (không commit lên git)
├── .gitignore                   # Loại trừ node_modules và .env
├── package.json                 # Quản lý thư viện phụ thuộc (@google/generative-ai, dotenv)
├── test_gemini_evaluation.js     # Script kiểm thử chính
├── README.md                    # Tài liệu hướng dẫn sử dụng
└── results/                     # Thư mục tự động sinh ra sau khi chạy test
    ├── test_results.json        # Dữ liệu kết quả chi tiết từng test case
    └── test_report.md           # Báo cáo tổng hợp hiệu năng phục vụ nghiệm thu
```

## 2. Hướng dẫn cài đặt & Thực thi

### Bước 1: Cấu hình API Key
Mở file `.env` và điền Gemini API Key của bạn (lấy tại [Google AI Studio](https://aistudio.google.com/)):

```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-3.6-flash
```

### Bước 2: Chạy script kiểm thử
Mở Terminal / PowerShell tại thư mục này và gõ:

```bash
node test_gemini_evaluation.js
```

## 3. Nội dung kiểm thử
Script tự động chạy qua 4 kịch bản điển hình:
1. **Kịch bản 1 (Frontend):** Câu trả lời xuất sắc -> Kiểm tra khả năng nhận diện kiến thức nâng cao, feedback chuyên sâu.
2. **Kịch bản 2 (Backend):** Câu trả lời trung bình -> Kiểm tra khả năng chỉ ra thiếu sót và tính điểm theo trọng số.
3. **Kịch bản 3 (Frontend):** Câu trả lời sai lệch / yếu -> Kiểm tra tính khách quan, xếp loại WEAK.
4. **Kịch bản 4 (Backend):** Câu trả lời bỏ trống / ngắn cụt lủn -> Kiểm chứng quy tắc nghiệp vụ BR-04b tự động cho 0 điểm.
