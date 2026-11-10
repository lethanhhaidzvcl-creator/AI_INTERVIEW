-- ==============================================================================
-- DỰ ÁN AI INTERVIEW - SEED DATA CÂU HỎI PHỎNG VẤN KỸ THUẬT
-- Thành viên: TV4 (AI & Dữ liệu)
-- Sprint 1 - Task 6: Xây dựng bộ dữ liệu câu hỏi mẫu (Seed Data)
-- ==============================================================================

USE ai_interview_db;

-- 1. NẠP DỮ LIỆU DANH MỤC VỊ TRÍ ỨNG TUYỂN (job_positions)
-- Đảm bảo có sẵn 2 vị trí ứng tuyển mục tiêu cho phiên bản MVP
INSERT INTO job_positions (id, name, level, description, is_active) VALUES
(1, 'Frontend Developer', 'Junior', 'Vị trí lập trình viên giao diện sử dụng React, JavaScript, HTML5/CSS3 và Tailwind CSS.', TRUE),
(2, 'Backend Developer', 'Junior', 'Vị trí lập trình viên phía máy chủ sử dụng Node.js, Express, cơ sở dữ liệu MySQL và RESTful API.', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), level = VALUES(level);

-- Xóa dữ liệu cũ nếu có để tránh trùng lặp khi chạy lại script
DELETE FROM questions WHERE position_id IN (1, 2);

-- ==============================================================================
-- 2. NẠP 10 CÂU HỎI KỸ THUẬT FRONTEND DEVELOPER (position_id = 1)
-- ==============================================================================

-- [FRONTEND - EASY 1]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1, 
 'React Hook là gì? Hãy nêu công dụng của useState và useEffect kèm ví dụ minh họa ngắn gọn.',
 'Easy',
 'React Hook là các hàm đặc biệt được giới thiệu từ React 16.8, cho phép sử dụng state và các tính năng lifecycle trong functional components mà không cần viết class component.
- useState: Dùng để khai báo và quản lý trạng thái cục bộ của component. Ví dụ: const [count, setCount] = useState(0).
- useEffect: Dùng để thực hiện các side effects (tác vụ ngoại vi) như gọi API, lắng nghe sự kiện (event listener), hoặc thao tác trực tiếp với DOM sau khi component render.',
 TRUE);

-- [FRONTEND - EASY 2]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1,
 'Sự khác biệt cơ bản giữa props và state trong React là gì? Khi nào nên dùng props và khi nào nên dùng state?',
 'Easy',
 '- Props (Properties): Là dữ liệu được truyền từ component cha xuống component con, mang tính chất bất biến (read-only) đối với component nhận. Dùng khi muốn component con hiển thị dữ liệu hoặc nhận hàm callback từ cha.
- State: Là dữ liệu nội bộ được quản lý bên trong chính component đó, có thể thay đổi theo thời gian thông qua hàm cập nhật state (setState/useState). Khi state thay đổi, component sẽ re-render. Dùng khi dữ liệu có thể thay đổi do tương tác người dùng (nhập form, click nút).',
 TRUE);

-- [FRONTEND - EASY 3]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1,
 'CSS Flexbox và CSS Grid khác nhau như thế nào? Trong tình huống nào bạn sẽ ưu tiên dùng Flexbox thay vì Grid?',
 'Easy',
 '- Flexbox: Là hệ thống layout 1 chiều (One-dimensional), tối ưu cho việc căn chỉnh các phần tử theo một hàng (row) hoặc một cột (column). Thích hợp cho thanh điều hướng (Navbar), căn giữa phần tử, danh sách nút bấm, thanh công cụ.
- CSS Grid: Là hệ thống layout 2 chiều (Two-dimensional), kiểm soát đồng thời cả hàng và cột. Thích hợp cho bố cục toàn trang (layout dashboard, thư viện ảnh phức tạp, chia cột nội dung chính và sidebar).
- Ưu tiên dùng Flexbox khi chỉ cần phân bố không gian và căn gióng theo một trục đơn lẻ.',
 TRUE);

-- [FRONTEND - MEDIUM 4]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1,
 'Virtual DOM trong React hoạt động như thế nào? Tại sao nó giúp cải thiện hiệu năng so với việc thao tác trực tiếp với Real DOM?',
 'Medium',
 'Virtual DOM là một bản sao nhẹ của DOM thực tế, được lưu trữ dưới dạng cây đối tượng JavaScript trong bộ nhớ.
Khi state hoặc props thay đổi:
1. React tạo ra một cây Virtual DOM mới.
2. Quá trình Diffing: React so sánh cây Virtual DOM mới với cây Virtual DOM cũ bằng thuật toán đối soát (Reconciliation).
3. Batching & Patching: React tính toán những thay đổi tối thiểu và chỉ cập nhật chính xác các nút DOM thực bị thay đổi thay vì vẽ lại toàn bộ trang.
Thao tác với Real DOM rất tốn kém tài nguyên tính toán (reflow và repaint), do đó Virtual DOM giúp tối ưu tốc độ render đáng kể.',
 TRUE);

-- [FRONTEND - MEDIUM 5]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1,
 'Giải thích tác dụng của Dependency Array trong useEffect. Điều gì xảy ra khi không truyền mảng, truyền mảng rỗng [], và truyền mảng có biến [value]?',
 'Medium',
 'Dependency array quyết định thời điểm hàm callback trong useEffect được thực thi lại:
1. Không truyền dependency array: Callback chạy sau mỗi lần component render hoặc re-render (dễ gây lỗi lặp vô tận nếu cập nhật state bên trong).
2. Truyền mảng rỗng []: Callback chỉ chạy duy nhất một lần sau khi component được mount vào DOM (tương tự componentDidMount). Thường dùng khi fetch API lần đầu.
3. Truyền mảng có phần tử [value]: Callback chạy ở lần render đầu tiên và sẽ chạy lại mỗi khi bất kỳ giá trị nào trong mảng bị thay đổi giữa các lần render (so sánh qua Object.is).',
 TRUE);

-- [FRONTEND - MEDIUM 6]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1,
 'Khái niệm Event Bubbling và Event Capturing trong JavaScript là gì? Làm thế nào để ngăn chặn sự kiện nổi bọt?',
 'Medium',
 '- Event Capturing: Sự kiện bắt đầu từ phần tử gốc (window, document) đi dần xuống phần tử mục tiêu (target element) nơi sự kiện thực sự diễn ra.
- Event Bubbling: Sau khi đến target, sự kiện sẽ nổi ngược từ phần tử con lên các phần tử cha bao bọc nó theo cây DOM tree.
- Trong thực tế, mặc định addEventListener lắng nghe ở giai đoạn Bubbling.
- Để ngăn chặn sự kiện tiếp tục nổi bọt lên các phần tử cha, ta gọi phương thức event.stopPropagation(). Khác với event.preventDefault() dùng để ngăn hành vi mặc định của trình duyệt (như submit form reload trang).',
 TRUE);

-- [FRONTEND - MEDIUM 7]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1,
 'Tại sao không nên sử dụng index của mảng làm prop key khi render danh sách trong React? Điều gì có thể xảy ra?',
 'Medium',
 'React sử dụng prop "key" để định danh duy nhất mỗi phần tử trong danh sách ảo nhằm xác định phần tử nào được thêm, xóa hoặc thay đổi vị trí trong quá trình Reconciliation.
Nếu dùng index làm key:
- Khi danh sách bị đảo thứ tự, thêm phần tử vào đầu mảng, hoặc xóa phần tử ở giữa, index của các item sẽ bị thay đổi.
- React sẽ nhầm lẫn trạng thái giữa các component, dẫn đến render sai giao diện, lỗi giữ state của các input control không đúng phần tử, và làm giảm hiệu năng re-render.
Giải pháp chuẩn là sử dụng ID duy nhất và ổn định (như item.id từ database hoặc uuid).',
 TRUE);

-- [FRONTEND - HARD 8]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1,
 'Phân biệt useMemo và useCallback trong React. Khi nào việc sử dụng hai hook này thực sự mang lại lợi ích và khi nào thì không nên lạm dụng?',
 'Hard',
 '- useMemo: Dùng để ghi nhớ (cache) KẾT QUẢ của một phép tính toán nặng (expensive computation), chỉ tính lại khi các dependency thay đổi. Trả về một giá trị.
- useCallback: Dùng để ghi nhớ INSTANCE CỦA MỘT HÀM (function definition), tránh việc tạo ra địa chỉ tham chiếu hàm mới sau mỗi lần render. Trả về một hàm. Thường dùng khi truyền callback xuống component con được bọc bởi React.memo.
- Khi nào nên dùng: Khi có phép tính toán dữ liệu lớn (lọc, sắp xếp mảng lớn) hoặc tránh re-render không cần thiết ở các component con phức tạp.
- Khi nào không nên lạm dụng: Với các hàm hoặc phép tính đơn giản, việc thêm useMemo/useCallback tạo thêm chi phí bộ nhớ để lưu dependency array và so sánh, đôi khi tốn tài nguyên hơn cả re-render bình thường.',
 TRUE);

-- [FRONTEND - HARD 9]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1,
 'Trình bày kỹ thuật Code Splitting và Lazy Loading trong ứng dụng React. Làm thế nào để áp dụng với React.lazy và Suspense?',
 'Hard',
 'Code Splitting là kỹ thuật chia nhỏ gói bundle JavaScript tổng thể thành các đoạn chunk nhỏ hơn, chỉ tải về trình duyệt khi người dùng thực sự cần đến trang hoặc component đó, giúp giảm dung lượng tải ban đầu (Initial Bundle Size) và tăng tốc độ First Contentful Paint (FCP).
Cách triển khai trong React:
- Sử dụng React.lazy(): const Dashboard = React.lazy(() => import("./Dashboard"));
- Bọc component trong <Suspense fallback={<LoadingSpinner />}>: Hiển thị giao diện chờ trong thời gian file chunk tương ứng đang được tải qua mạng.
Thường được áp dụng phổ biến nhất ở cấp độ Route (Route-based code splitting) với React Router.',
 TRUE);

-- [FRONTEND - HARD 10]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(1,
 'Giải thích cơ chế Cleanup function trong useEffect. Hãy viết ví dụ thực tế xử lý Memory Leak khi làm việc với timer hoặc API call khi component unmount.',
 'Hard',
 'Cleanup function là một hàm được return bên trong callback của useEffect.
Nó được kích hoạt:
1. Trước khi component bị unmount khỏi DOM.
2. Hoặc trước khi useEffect chạy lại ở lần render tiếp theo (khi dependency thay đổi).
Tác dụng chính: Hủy các tiến trình ngầm, giải phóng bộ nhớ (tránh Memory Leak), xóa các listener.

Ví dụ minh họa với timer:
useEffect(() => {
  const timerId = setInterval(() => {
    console.log("Tick");
  }, 1000);

  // Cleanup function bắt buộc
  return () => {
    clearInterval(timerId);
  };
}, []);

Nếu không có clearInterval trong return, timer sẽ tiếp tục chạy ngầm trong bộ nhớ trình duyệt ngay cả khi người dùng đã chuyển trang, gây tiêu hao tài nguyên và lỗi cập nhật state trên unmounted component.',
 TRUE);


-- ==============================================================================
-- 3. NẠP 10 CÂU HỎI KỸ THUẬT BACKEND DEVELOPER (position_id = 2)
-- ==============================================================================

-- [BACKEND - EASY 11]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'RESTful API là gì? Nêu ý nghĩa và phân biệt các phương thức HTTP phổ biến: GET, POST, PUT, PATCH, DELETE.',
 'Easy',
 'RESTful API là tiêu chuẩn kiến trúc thiết kế dịch vụ web dựa trên giao thức HTTP, định danh tài nguyên thông qua các endpoint URI và sử dụng định dạng JSON/XML để trao đổi dữ liệu.
- GET: Truy xuất tài nguyên từ máy chủ (idempotent, an toàn, không làm thay đổi trạng thái dữ liệu).
- POST: Tạo mới một tài nguyên trên máy chủ.
- PUT: Cập nhật thay thế toàn bộ tài nguyên bằng dữ liệu mới gửi lên (idempotent).
- PATCH: Cập nhật một phần thuộc tính cụ thể của tài nguyên.
- DELETE: Xóa một tài nguyên khỏi máy chủ (idempotent).',
 TRUE);

-- [BACKEND - EASY 12]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'Cấu trúc của JSON Web Token (JWT) gồm mấy phần? Nêu chức năng của từng phần và giải thích luồng xác thực bằng JWT.',
 'Easy',
 'JWT gồm 3 phần được phân tách bằng dấu chấm (.):
1. Header: Chứa kiểu token (JWT) và thuật toán băm chữ ký (ví dụ: HS256, RS256).
2. Payload: Chứa các thông tin truyền tải (claims) như userId, email, role, thời gian hết hạn (exp). Phần này chỉ được mã hóa Base64URL chứ không bảo mật nội dung, không để lộ thông tin nhạy cảm (mật khẩu).
3. Signature: Chữ ký số được tạo bằng cách băm (Header + Payload) với một Secret Key phía server nhằm đảm bảo dữ liệu không bị can thiệp.
Luồng xác thực: Người dùng đăng nhập thành công -> Server cấp JWT -> Client lưu token và gửi kèm trong header "Authorization: Bearer <token>" ở các request tiếp theo -> Server xác minh chữ ký mà không cần truy vấn session trong database.',
 TRUE);

-- [BACKEND - EASY 13]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'Phân biệt sự khác nhau giữa Authentication (Xác thực) và Authorization (Phân quyền) trong hệ thống Backend. Cho ví dụ minh họa.',
 'Easy',
 '- Authentication (Xác thực): Là quá trình xác minh danh tính người dùng xem "Bạn là ai?". Ví dụ: Người dùng nhập email và mật khẩu đúng, hệ thống xác nhận đây là tài khoản của người dùng Nguyễn Văn A.
- Authorization (Phân quyền): Là quá trình kiểm tra quyền hạn của người dùng đã được xác thực xem "Bạn được phép làm những hành động gì?". Ví dụ: Nguyễn Văn A là vai trò "candidate" (ứng viên) thì chỉ được xem bài thi của chính mình, không được phép vào trang quản trị xem danh sách toàn bộ người dùng như vai trò "admin".',
 TRUE);

-- [BACKEND - MEDIUM 14]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'Thuật toán bcrypt hoạt động như thế nào? Tại sao cần sử dụng Salt khi băm mật khẩu thay vì dùng các thuật toán như MD5 hay SHA256?',
 'Medium',
 'bcrypt là hàm băm một chiều được thiết kế đặc thù cho việc lưu trữ mật khẩu an toàn:
1. Salt: Là một chuỗi ký tự ngẫu nhiên được tự động sinh ra và ghép vào mật khẩu trước khi băm. Nhờ có Salt, hai người dùng có mật khẩu giống nhau (ví dụ: "123456") vẫn sẽ có hai chuỗi hash hoàn toàn khác nhau trong database. Điều này vô hiệu hóa hoàn toàn các cuộc tấn công dùng bảng băm sẵn (Rainbow Table Attack).
2. Cost factor (Độ phức tạp tính toán): Cho phép tăng số vòng lặp tính toán để làm chậm tốc độ băm, chống lại các cuộc tấn công dò mật khẩu vét cạn (Brute-force).
Các thuật toán như MD5 hay SHA-256 được thiết kế để chạy cực nhanh (cho kiểm tra toàn vẹn file), nên hacker có thể thử hàng tỷ mật khẩu mỗi giây, không an toàn để lưu mật khẩu người dùng.',
 TRUE);

-- [BACKEND - MEDIUM 15]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'Connection Pool trong MySQL là gì? Tại sao trong ứng dụng Node.js/Express chúng ta nên dùng Connection Pool thay vì mở kết nối đơn lẻ (single connection)?',
 'Medium',
 'Connection Pool là một tập hợp các kết nối cơ sở dữ liệu được khởi tạo sẵn và duy trì trong bộ nhớ máy chủ.
Khi có truy vấn đến: Ứng dụng mượn một kết nối rảnh rỗi từ pool, thực thi câu lệnh SQL, sau đó trả kết nối lại cho pool để các request khác tái sử dụng.
Lợi ích vượt trội:
1. Tiết kiệm thời gian và tài nguyên: Việc tạo mới một kết nối TCP và bắt tay xác thực MySQL tốn độ trễ đáng kể. Tái sử dụng kết nối giúp giảm thiểu thời gian phản hồi API.
2. Kiểm soát quá tải (Rate Limiting DB): Giới hạn số lượng kết nối đồng thời tối đa (connectionLimit), ngăn chặn việc lượng truy cập tăng đột biến làm sập máy chủ MySQL.
3. Hỗ trợ đa luồng bất đồng bộ: Phục vụ nhiều request đồng thời mượt mà trong mô hình non-blocking của Node.js.',
 TRUE);

-- [BACKEND - MEDIUM 16]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'Khái niệm Middleware trong framework Express.js là gì? Nêu vai trò của tham số next và cách tổ chức middleware xử lý lỗi tập trung (Error Handling Middleware).',
 'Medium',
 'Middleware trong Express.js là các hàm trung gian có quyền truy cập vào đối tượng Request (req), Response (res) và hàm next trong chu trình request-response của ứng dụng.
- Vai trò của next(): Được gọi để chuyển quyền điều khiển sang middleware kế tiếp trong chuỗi. Nếu middleware không kết thúc response (bằng res.send/res.json) mà không gọi next(), request sẽ bị treo vô thời hạn.
- Middleware xử lý lỗi tập trung: Là middleware đặc biệt có đúng 4 tham số (err, req, res, next), được đặt ở cuối cùng của file cấu hình route. Khi có lỗi ở bất kỳ controller nào (gọi next(err)), Express sẽ tự động bỏ qua các route thông thường và chuyển thẳng tới middleware này để định dạng lỗi và trả về mã HTTP thích hợp (500, 400, 404).',
 TRUE);

-- [BACKEND - MEDIUM 17]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'Lỗ hổng SQL Injection là gì? Làm thế nào để phòng chống triệt để SQL Injection khi làm việc với MySQL trong môi trường Node.js?',
 'Medium',
 'SQL Injection là kỹ thuật tấn công mà kẻ xấu chèn các đoạn mã SQL độc hại vào các trường nhập liệu của ứng dụng, nhằm thay đổi ngữ cảnh của câu truy vấn gốc trên máy chủ cơ sở dữ liệu, cho phép đọc trộm dữ liệu, thay đổi dữ liệu hoặc chiếm quyền kiểm soát máy chủ.
Cách phòng chống triệt để:
1. Luôn sử dụng Prepared Statements (Parameterized Queries): Thư viện mysql2 hoặc Sequelize tách biệt hoàn toàn phần câu lệnh SQL và phần dữ liệu đầu vào. Ví dụ: db.execute("SELECT * FROM users WHERE email = ?", [email]). Các ký tự đặc biệt sẽ được coi là chuỗi văn bản thuần túy, không thể thực thi như mã lệnh.
2. Sử dụng thư viện ORM/Query Builder (Sequelize, Prisma) giúp tự động escape dữ liệu.
3. Validate và Sanitize dữ liệu đầu vào nghiêm ngặt từ client (kiểm tra định dạng email, độ dài).
4. Phân quyền tài khoản cơ sở dữ liệu theo nguyên tắc đặc quyền tối thiểu (Least Privilege).',
 TRUE);

-- [BACKEND - HARD 18]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'Transaction trong cơ sở dữ liệu quan hệ (RDBMS) là gì? Giải thích 4 tính chất ACID và đưa ra ví dụ cụ thể cần dùng Transaction trong hệ thống phỏng vấn AI.',
 'Hard',
 'Transaction (Giao dịch) là một tập hợp các thao tác cơ sở dữ liệu được thực thi như một khối duy nhất, tuân theo nguyên tắc "hoặc tất cả thành công, hoặc không có thao tác nào được ghi nhận".
4 tính chất ACID:
- Atomicity (Nguyên tử): Tất cả các câu lệnh trong transaction phải thành công (COMMIT). Nếu một lệnh lỗi, toàn bộ phải hoàn tác về trạng thái ban đầu (ROLLBACK).
- Consistency (Nhất quán): Dữ liệu luôn chuyển từ trạng thái hợp lệ này sang trạng thái hợp lệ khác, không vi phạm ràng buộc toàn vẹn.
- Isolation (Cô lập): Các transaction chạy đồng thời không can thiệp hay nhìn thấy dữ liệu trung gian chưa commit của nhau.
- Durability (Bền vững): Một khi transaction đã commit thành công, dữ liệu sẽ được lưu vĩnh viễn ngay cả khi hệ thống gặp sự cố mất điện.

Ví dụ thực tế trong hệ thống phỏng vấn AI:
Khi hoàn thành phiên phỏng vấn: Cần (1) Cập nhật trạng thái session sang "COMPLETED" trong bảng interview_sessions, và (2) Thêm kết quả điểm các tiêu chí vào bảng evaluation_details.
Nếu bước (1) thành công nhưng bước (2) bị lỗi, bắt buộc phải ROLLBACK bước (1) để dữ liệu không bị mâu thuẫn.',
 TRUE);

-- [BACKEND - HARD 19]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'Trình bày cách thiết kế API lấy lịch sử phỏng vấn có phân trang (Pagination) và lọc theo vị trí (Filtering). Viết câu truy vấn SQL tối ưu tương ứng.',
 'Hard',
 'Thiết kế endpoint REST:
GET /api/v1/sessions/history?page=1&limit=10&position_id=1
Header: Authorization: Bearer <token>

Quy trình xử lý:
1. Trích xuất userId từ JWT xác thực để đảm bảo chỉ lấy bài thi của chính người đó (BR-07).
2. Tính toán phân trang: offset = (page - 1) * limit.
3. Câu lệnh SQL tối ưu:
SELECT s.id, s.status, s.total_questions, s.started_at, s.finished_at, p.name AS position_name, p.level
FROM interview_sessions s
JOIN job_positions p ON s.position_id = p.id
WHERE s.user_id = ? AND (? IS NULL OR s.position_id = ?)
ORDER BY s.started_at DESC
LIMIT ? OFFSET ?;

4. Đồng thời thực hiện câu truy vấn SELECT COUNT(*) để trả về tổng số trang (totalPages) và tổng số bản ghi (totalItems) phục vụ hiển thị thanh phân trang trên giao diện Frontend.',
 TRUE);

-- [BACKEND - HARD 20]
INSERT INTO questions (position_id, content, difficulty, sample_answer, is_active) VALUES
(2,
 'Khi tích hợp gọi dịch vụ AI (như Google Gemini API) từ Backend, cần thiết kế cơ chế xử lý lỗi Timeout và Retry như thế nào để đảm bảo hệ thống không bị treo và người dùng không bị mất bài làm (BR-06)?',
 'Hard',
 'Do các mô hình LLM có thời gian phản hồi phụ thuộc vào mạng và độ dài token (có thể từ 5 đến 15 giây), hệ thống cần áp dụng các cơ chế sau:
1. Request Timeout: Thiết lập giới hạn thời gian (ví dụ: axios timeout: 20000ms hoặc AbortController sau 20s). Nếu vượt quá, tự động hủy request để không làm cạn kiệt connection pool của server.
2. Lưu trữ trung gian: Lưu bài làm văn bản của ứng viên vào bảng answers TRƯỚC KHI kích hoạt tiến trình gọi AI. Nhờ đó, nếu AI lỗi hoặc timeout, câu trả lời của ứng viên vẫn được bảo toàn nguyên vẹn.
3. Xử lý trạng thái (BR-06): Giữ trạng thái phiên là "PENDING_EVALUATION" hoặc cho phép hiển thị nút "Thử chấm lại" (Retry Evaluation) trên giao diện thay vì đánh dấu phiên thi thất bại.
4. Quản lý bí mật: API Key của Gemini luôn đặt trong file .env trên server, không bao giờ gửi về client.',
 TRUE);

-- ==============================================================================
-- KIỂM TRA TỔNG SỐ LƯỢNG BẢN GHI ĐÃ NẠP
-- ==============================================================================
SELECT p.name AS position, q.difficulty, COUNT(*) AS total_questions
FROM questions q
JOIN job_positions p ON q.position_id = p.id
GROUP BY p.name, q.difficulty
ORDER BY p.name, FIELD(q.difficulty, 'Easy', 'Medium', 'Hard');
