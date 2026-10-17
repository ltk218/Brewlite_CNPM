# BrewLite — Hệ Thống Đặt Cà Phê Không Tiền Mặt & Quản Trị Quầy Barista

Dự án bài tập lớn môn **Công nghệ phần mềm**  
Đơn vị thực hiện: **Nhóm 19** — Khoa Công nghệ Thông tin, Trường Đại học Sài Gòn (SGU)

---

## 1. Giới thiệu dự án

BrewLite là ứng dụng web đặt cà phê và thanh toán không tiếp xúc (Cashless & Contactless Ordering). Hệ thống giải quyết bài toán giảm thiểu thời gian xếp hàng tại quầy trong giờ cao điểm, loại bỏ việc dùng tiền mặt và số hóa quy trình vận hành quầy pha chế:

- Khách hàng tự xem thực đơn, tùy chọn cỡ ly (S/M/L), mức đường, mức đá, topping và ghi chú riêng cho Barista.
- Thanh toán điện tử qua Ví điện tử hoặc Thẻ ngân hàng với cơ chế chống trừ tiền trùng lặp (Idempotent Payment).
- Quầy Barista tiếp nhận đơn theo máy trạng thái (State Machine), tự động trừ kho nguyên liệu thô theo công thức định lượng (BOM) và theo dõi tiến độ trên màn hình KDS.
- Cổng quản trị Admin theo dõi doanh thu, phân bổ trạng thái đơn hàng, quản lý kho nguyên liệu và công thức pha chế.

---

## 2. Công nghệ sử dụng

- **Frontend (`frontend/`)**: Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand (quản lý giỏ hàng và phiên làm việc), Lucide Icons.
- **Backend (`backend/`)**: NestJS, TypeScript, class-validator, class-transformer, Passport JWT, Jest.
- **Cơ sở dữ liệu**: PostgreSQL 16 quản lý qua Prisma ORM (16 bảng quan hệ).
- **Môi trường & Đóng gói**: Docker, Docker Compose.

---

## 3. Yêu cầu môi trường cài đặt

Trước khi bắt đầu, máy tính cần cài sẵn các phần mềm sau (nếu chưa có):

1. **Docker Desktop** (Bắt buộc để chạy nhanh toàn bộ hệ thống):
   - Tải về tại: https://www.docker.com/products/docker-desktop/
   - Cài đặt xong, hãy mở ứng dụng Docker Desktop lên và chờ biểu tượng ở góc thanh taskbar chuyển sang trạng thái hoạt động (màu xanh).
2. **Node.js phiên bản LTS (v20 trở lên)** (Cần thiết nếu muốn chạy code trực tiếp trên máy mà không dùng Docker):
   - Tải về tại: https://nodejs.org/
   - Cài đặt mặc định bằng cách bấm Next cho đến khi hoàn tất.
3. **Git** (Dùng để clone mã nguồn nếu lấy từ GitHub):
   - Tải về tại: https://git-scm.com/
4. **Trình duyệt web**: Google Chrome, Microsoft Edge hoặc bất kỳ trình duyệt hiện đại nào.

---

## 4. Hướng dẫn chạy từ đầu cho máy mới (Dùng Docker Desktop)

Đây là cách đơn giản và chuẩn xác nhất để chạy toàn bộ hệ thống gồm Database, Backend và Frontend chỉ với một câu lệnh.

### Bước 1: Mở thư mục dự án trong Terminal

1. Giải nén mã nguồn hoặc clone repository về máy tính của bạn.
2. Mở cửa sổ dòng lệnh tại thư mục gốc `brewlite` (nơi chứa file `docker-compose.yml`):
   - **Trên Windows**: Mở thư mục `brewlite`, nhấp chuột vào thanh địa chỉ thư mục ở trên cùng, gõ `cmd` hoặc `powershell` rồi nhấn `Enter`.
   - **Trên macOS / Linux**: Mở ứng dụng Terminal và chuyển vào thư mục dự án bằng lệnh:
     ```bash
     cd /duong-dan-toi-thu-muc/brewlite
     ```

### Bước 2: Dọn dẹp phiên bản cũ (Nếu đã từng chạy trước đó)

Nếu trên máy của bạn đã từng chạy container cũ, hãy chạy lệnh sau để xóa sạch dữ liệu cũ và tránh xung đột cổng:

```bash
docker compose down -v
```

### Bước 3: Khởi động toàn bộ hệ thống

Chạy lệnh sau để Docker tự động tải image PostgreSQL, build Backend, build Frontend và nạp dữ liệu mẫu:

```bash
docker compose up --build -d
```

Quá trình này mất khoảng 2 đến 4 phút trong lần đầu tiên tùy thuộc vào tốc độ mạng của bạn. Khi terminal hiển thị trạng thái `Started` cho cả 3 container (`brewlite-db`, `brewlite-backend`, `brewlite-frontend`), hệ thống đã sẵn sàng.

### Bước 4: Truy cập các cổng dịch vụ

Mở trình duyệt web và truy cập các địa chỉ tương ứng:

| Dịch vụ | Địa chỉ truy cập | Mục đích |
| :--- | :--- | :--- |
| **Giao diện Khách hàng** | `http://localhost:3000` | Xem menu, chọn size, topping, đường đá, đặt món và thanh toán |
| **Cổng Quản trị Admin** | `http://localhost:3000/admin` | Bảng điều khiển doanh thu, duyệt trạng thái đơn KDS, quản lý kho & BOM |
| **Kho & Định lượng BOM** | `http://localhost:3000/admin/inventory` | Xem tồn kho nguyên liệu thô, biên lợi nhuận công thức và nhập kho |
| **Trang Đăng nhập** | `http://localhost:3000/login` | Đăng nhập tài khoản (có sẵn nút bấm điền nhanh) |
| **Backend API Health** | `http://localhost:4000/health` | Kiểm tra trạng thái máy chủ NestJS và kết nối Database |
| **Prisma Studio (Xem DB)** | `http://localhost:5555` | Xem và chỉnh sửa trực tiếp các bảng dữ liệu qua giao diện web |

---

## 5. Tài khoản mẫu và dữ liệu thử nghiệm

Hệ thống đã nạp sẵn tài khoản và dữ liệu trong Database để phục vụ chấm bài và kiểm thử:

### Tài khoản đăng nhập
- **Khách hàng**: `khachhang@brewlite.vn` / Mật khẩu: `BrewLite@123` (Có sẵn 25 điểm thưởng thành viên).
- **Quản trị viên (Admin)**: `admin@brewlite.vn` / Mật khẩu: `BrewLite@123` (Toàn quyền quản trị quầy và kho).
- **Barista (Admin)**: `barista@brewlite.vn` / Mật khẩu: `BrewLite@123`.

*(Tại trang đăng nhập `/login`, bạn có thể bấm trực tiếp vào nút "Điền nhanh Khách hàng" hoặc "Điền nhanh Admin" để hệ thống tự điền thông tin).*

### Mã khuyến mãi thử nghiệm
- `BREWLITE10`: Giảm 10%, tối đa 20.000đ cho đơn hàng từ 40.000đ.
- `CHAOBANMOI`: Giảm 20%, tối đa 30.000đ cho đơn hàng từ 80.000đ.

---

## 6. Hướng dẫn xem và quản lý Cơ sở dữ liệu

Nếu bạn muốn mở giao diện trực quan dạng bảng để xem hoặc sửa dữ liệu trong PostgreSQL tương tự phpMyAdmin:

1. Mở một cửa sổ dòng lệnh tại thư mục `backend`:
   ```bash
   cd backend
   npx prisma@5 studio
   ```
2. Trình duyệt sẽ tự động mở trang `http://localhost:5555`.
3. Bạn có thể chọn từng bảng (`User`, `Product`, `Ingredient`, `Recipe`, `Order`, `Payment`...) để xem chi tiết, sửa trực tiếp trên ô và nhấn `Save changes`.

---

## 7. Hướng dẫn chạy thủ công từng phần (Không qua Docker)

Nếu máy tính của bạn gặp sự cố với Docker hoặc bạn muốn chỉnh sửa code và xem cập nhật ngay lập tức:

### Bước 1: Khởi động riêng Database
Giữ lại container Database chạy nền:
```bash
docker compose up -d db
```

### Bước 2: Chạy Backend (`backend/`)
Mở cửa sổ dòng lệnh thứ nhất:
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run start:dev
```
Backend sẽ khởi động trên cổng `http://localhost:4000`.

### Bước 3: Chạy Frontend (`frontend/`)
Mở cửa sổ dòng lệnh thứ hai:
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ khởi động trên cổng `http://localhost:3000`.

---

## 8. Chạy kiểm thử tự động Backend (Jest - Task 10)

Hệ thống đã viết đầy đủ 3 bộ kiểm thử chứng minh đúng yêu cầu Task 10 của đề bài:
1. `task10-state-machine.spec.ts`: Kiểm tra các nhánh chuyển trạng thái hợp lệ và chặn chuyển sai.
2. `task10-idempotency.spec.ts`: Kiểm tra thanh toán lặp với cùng một Idempotency-Key không bị trừ tiền hay cộng điểm 2 lần.
3. `task10-concurrency-stock.spec.ts`: Kiểm tra 5 yêu cầu mua đồng thời khi tồn kho chỉ còn 2 ly (chứng minh khóa lạc quan chặn đúng 3 yêu cầu và giữ tồn kho không âm).

Để chạy kiểm thử, mở terminal tại thư mục `backend` và gõ:

```bash
cd backend
npm test
```

---

## 9. Xử lý sự cố thường gặp

- **Lỗi cổng 5432 hoặc 3000 bị chiếm dụng**:  
  Nếu máy bạn đang chạy PostgreSQL hoặc ứng dụng khác ở cổng 5432, hãy tắt dịch vụ đó hoặc đổi cổng ánh xạ trong `docker-compose.yml`.
- **Lỗi không kết nối được Docker daemon**:  
  Đảm bảo ứng dụng Docker Desktop đã được bật trước khi gõ lệnh `docker compose`.
- **Lỗi build do bộ nhớ cache cũ**:  
  Chạy lệnh `docker compose build --no-cache` để buộc Docker tải và biên dịch lại toàn bộ từ đầu.
- **Dừng toàn bộ hệ thống khi dùng xong**:  
  ```bash
  docker compose down
  ```
