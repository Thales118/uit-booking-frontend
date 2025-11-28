import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Định nghĩa lại kiểu dữ liệu User
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'student';
  student_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userRole: 'admin' | 'student' | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, studentId?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  // 2. Khởi tạo State từ LocalStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).role : null;
  });

  const [loading, setLoading] = useState(false);

  // 3. Hàm Đăng ký (Gọi API Node.js)
  const signUp = async (email: string, password: string, fullName: string, studentId?: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, studentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || "Đăng ký thất bại" } };
      }

      return { error: null };
    } catch (err) {
      return { error: { message: "Lỗi kết nối server" } };
    }
  };

  // 4. Hàm Đăng nhập (Gọi API Node.js)
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || "Đăng nhập thất bại" } };
      }

      // Lưu thông tin vào LocalStorage và State
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setUserRole(data.user.role);

      return { error: null };
    } catch (err) {
      return { error: { message: "Lỗi kết nối server" } };
    }
  };

  // 5. Hàm Đăng xuất
  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setUserRole(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, userRole, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
