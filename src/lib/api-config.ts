// src/lib/api-config.ts

// Kiểm tra xem đang ở chế độ nào (Dev hay Production)
// Nếu là Production (trên AWS) -> Dùng chuỗi rỗng "" (để Nginx tự lo)
// Nếu là Dev (máy bạn) -> Dùng localhost:5000
export const API_BASE_URL = import.meta.env.PROD ? "" : "http://localhost:5000";

export const api = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // Nó sẽ tự nối: "" + "/api/bookings" -> thành đường dẫn tương đối
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Lỗi kết nối server");
  }

  return response.json();
};