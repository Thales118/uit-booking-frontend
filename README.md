# 🏫 UIT Campus Booking System - Frontend

Đây là giao diện người dùng (Client-side) cho hệ thống đặt phòng học và cơ sở vật chất tại trường Đại học Công nghệ Thông tin (UIT). Dự án được xây dựng dựa trên React và Vite, tập trung vào trải nghiệm người dùng nhanh chóng và hiện đại.

## 🚀 Công nghệ sử dụng

* **Core:** React 18, TypeScript, Vite.
* **Styling:** Tailwind CSS.
* **UI Components:** Shadcn/UI.
* **Icons:** Lucide React.
* **Routing:** React Router Dom v6.
* **State Management:** React Hooks, Tanstack Query.

## ✨ Tính năng chính

1.  **Authentication:** Đăng ký, Đăng nhập (Sinh viên & Admin).
2.  **Dashboard:** Xem tổng quan thông tin, lối tắt nhanh.
3.  **Booking:**
    * Xem danh sách phòng.
    * Đặt phòng theo khung giờ.
    * **Kiểm tra trùng lịch (Conflict Detection):** Ngăn chặn đặt trùng giờ ngay lập tức.
4.  **History:** Xem lịch sử đặt phòng, trạng thái duyệt, hủy đặt phòng.
5.  **Profile:** Xem và cập nhật thông tin cá nhân.
6.  **Admin Panel (Dành cho Quản trị viên):**
    * Xem thống kê hệ thống (số lượng phòng, user, booking).
    * Duyệt hoặc Từ chối yêu cầu đặt phòng.

## 🛠️ Hướng dẫn cài đặt và chạy

### 1. Yêu cầu tiên quyết
* Node.js (phiên bản 18 trở lên).
* Backend Server đã được chạy (xem hướng dẫn ở repo Backend).

### 2. Cài đặt

# Clone dự án
git clone <LINK_GITHUB_FRONTEND_CUA_BAN>
cd uit-booking-frontend

# Cài đặt các thư viện (dependencies)
npm install

### 3. Chạy dự án

# Chạy server development
npm run dev

Sau khi chạy, truy cập vào đường dẫn hiển thị trên terminal (thường là http://localhost:8080 hoặc http://localhost:5173).

---
**Lưu ý:** Dự án này cần kết nối với API Server chạy ở cổng `5000`. Vui lòng đảm bảo Backend đang hoạt động.