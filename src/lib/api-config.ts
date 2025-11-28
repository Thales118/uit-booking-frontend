// src/lib/api-config.ts

// 1. Tự động chọn URL (Dev hoặc Production)
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 2. Hàm helper gọi API (Thay thế cho fetch)
export const api = async (endpoint: string, options: RequestInit = {}) => {
  // Tự động lấy token từ LocalStorage
  const token = localStorage.getItem('token');
  
  // Tự động gộp Headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }), // Nếu có token thì tự thêm vào
    ...options.headers,
  };

  // Gọi fetch
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Xử lý lỗi tập trung
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Lỗi kết nối server");
  }

  // Trả về dữ liệu JSON
  return response.json();
};