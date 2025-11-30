// src/lib/api-config.ts

// Tự động chuyển đổi:
// - Khi chạy dưới máy bạn (npm run dev) -> http://localhost:5000
// - Khi build lên AWS (npm run build) -> "" (dùng đường dẫn tương đối, Nginx sẽ tự lo phần còn lại)
export const API_BASE_URL = import.meta.env.PROD ? "" : "http://localhost:5000";

export const api = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  } as HeadersInit;

  // Tự động nối URL: localhost hoặc đường dẫn tương đối
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