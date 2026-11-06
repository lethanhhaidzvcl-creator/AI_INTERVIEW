# AI Interview – Hệ thống luyện phỏng vấn với AI

## 1. Giới thiệu

**AI Interview** là dự án website hỗ trợ sinh viên và người tìm việc luyện tập phỏng vấn trực tuyến. Người dùng có thể lựa chọn chủ đề phỏng vấn, trả lời các câu hỏi và (khi hoàn thiện chức năng tích hợp AI) nhận điểm số cùng góp ý để cải thiện kỹ năng phỏng vấn.

Đây là **dự án học tập theo nhóm gồm 4 thành viên**, dự kiến triển khai trong **3 tuần**. Repository hiện đang ở giai đoạn thiết lập và phát triển ban đầu; các chức năng dưới đây là **mục tiêu của phiên bản MVP**, không có nghĩa tất cả đã được hoàn thành.

## 2. Mục tiêu dự án

- Xây dựng giao diện đơn giản, dễ sử dụng trên máy tính và điện thoại.
- Hỗ trợ luyện tập trả lời câu hỏi phỏng vấn theo chủ đề.
- Sử dụng AI để đánh giá câu trả lời và đưa ra nhận xét cụ thể.
- Cho phép người dùng xem lại kết quả các lần luyện tập (trong phạm vi MVP nếu kịp tiến độ).
- Giúp nhóm thực hành phát triển web, cơ sở dữ liệu, GitHub và quy trình quản lý công việc trên Trello.

## 3. Phạm vi MVP (dự kiến)

| Chức năng | Mô tả | Trạng thái |
| --- | --- | --- |
| Đăng ký / đăng nhập | Tạo tài khoản và đăng nhập hệ thống | Dự kiến phát triển |
| Chọn chủ đề phỏng vấn | Chọn lĩnh vực hoặc vị trí muốn luyện tập | Dự kiến phát triển |
| Hiển thị câu hỏi | Đưa ra các câu hỏi phỏng vấn theo chủ đề | Dự kiến phát triển |
| Nhập câu trả lời | Người dùng trả lời bằng văn bản | Dự kiến phát triển |
| AI đánh giá | Chấm điểm và nhận xét ưu điểm, điểm cần cải thiện | Dự kiến phát triển |
| Xem kết quả | Hiển thị điểm và nhận xét sau buổi phỏng vấn | Dự kiến phát triển |
| Lịch sử luyện tập | Lưu và xem lại các buổi phỏng vấn | Mở rộng nếu đủ thời gian |

**Ngoài phạm vi MVP:** phỏng vấn bằng video, nhận diện cảm xúc, phân tích giọng nói và các tính năng thời gian thực phức tạp.

## 4. Công nghệ sử dụng

| Thành phần | Công nghệ / định hướng |
| --- | --- |
| Giao diện (Frontend) | HTML, CSS, JavaScript |
| Cơ sở dữ liệu | MySQL (dự kiến) |
| Backend | Sẽ lựa chọn và triển khai trong quá trình phát triển |
| Đánh giá bằng AI | Dự kiến kết nối một dịch vụ AI thông qua backend/API |
| Quản lý mã nguồn | Git, GitHub |
| Quản lý công việc | Trello |

> **Lưu ý:** Để AI thực sự đánh giá câu trả lời, dự án cần phần xử lý phía server và một mô hình/dịch vụ AI phù hợp. Không đặt API key trực tiếp trong mã JavaScript chạy trên trình duyệt và không đưa khóa bí mật lên GitHub.

## 5. Cấu trúc thư mục

Cấu trúc cấp cao hiện có trên repository:

```text
AI_INTERVIEW/
├── assets/             # Hình ảnh, biểu tượng và tài nguyên chung
├── backend/            # Mã nguồn xử lý phía server (phát triển tiếp)
├── database/           # Thiết kế và script cơ sở dữ liệu
├── frontend/           # CSS, JavaScript và giao diện phía người dùng
├── index.html          # Trang HTML khởi đầu
└── README.md           # Tài liệu giới thiệu dự án
```

Trang `index.html` hiện tham chiếu đến `frontend/css/style.css` và `frontend/js/main.js`. Cấu trúc chi tiết có thể thay đổi khi nhóm hoàn thiện dự án.

## 6. Hướng dẫn chạy giao diện hiện tại

### Bước 1: Tải mã nguồn

```bash
git clone https://github.com/lethanhhaidzvcl-creator/AI_INTERVIEW.git
cd AI_INTERVIEW
```

### Bước 2: Mở dự án

Mở thư mục `AI_INTERVIEW` bằng **Visual Studio Code**.

### Bước 3: Chạy giao diện

Mở file `index.html` bằng trình duyệt, hoặc dùng tiện ích **Live Server** trong VS Code:

1. Cài đặt tiện ích **Live Server** nếu chưa có.
2. Nhấp chuột phải vào file `index.html`.
3. Chọn **Open with Live Server**.

> Đây là cách chạy **giao diện ban đầu**. Các chức năng đăng nhập, lưu dữ liệu MySQL và AI chấm điểm sẽ cần cấu hình backend, cơ sở dữ liệu và dịch vụ AI sau khi được xây dựng.

## 7. Kế hoạch thực hiện (3 tuần)

| Thời gian | Công việc chính |
| --- | --- |
| Tuần 1 | Khảo sát yêu cầu, xác định MVP, lập Trello, tạo GitHub, thiết kế giao diện và cơ sở dữ liệu |
| Tuần 2 | Phát triển các trang giao diện, chức năng tài khoản, câu hỏi và câu trả lời; xây dựng backend |
| Tuần 3 | Tích hợp AI đánh giá, kiểm thử, sửa lỗi, hoàn thiện tài liệu và demo sản phẩm |

## 8. Làm việc nhóm

- Nhóm có **4 thành viên**; công việc được phân công và theo dõi trên **Trello**.
- Mỗi thành viên cập nhật tiến độ các thẻ được giao.
- Trước khi đẩy code, kiểm tra thay đổi để tránh ghi đè công việc của người khác.
- Ưu tiên sử dụng nhánh riêng và Pull Request khi cùng làm một phần chức năng.

## 9. Trạng thái dự án

**Đang phát triển.** Repository đã được khởi tạo và có giao diện HTML ban đầu. Những chức năng trong bảng MVP là kế hoạch phát triển, chưa phải danh sách tính năng đã chạy hoàn chỉnh.

## 10. Liên kết dự án

- **GitHub:** https://github.com/lethanhhaidzvcl-creator/AI_INTERVIEW
- **Trello:** https://trello.com/b/Tp8FqDDD/interview-ai

---

*Tài liệu README phục vụ việc giới thiệu, theo dõi và phát triển dự án AI Interview.*
