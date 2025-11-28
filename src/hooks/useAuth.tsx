import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-config'; // Import thư ký

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
  signUp: (data: any) => Promise<{ error: any }>;
  signIn: (data: any) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  // Khởi tạo State từ LocalStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser).role : null;
  });

  const [loading, setLoading] = useState(false);

  // Hàm Đăng ký (Gọn gàng)
  const signUp = async (formData: any) => {
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  };

  // Hàm Đăng nhập (Gọn gàng)
  const signIn = async (formData: any) => {
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // Lưu thông tin
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setUserRole(data.user.role);

      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  };

  const signOut = () => {
    localStorage.clear(); // Xóa sạch mọi thứ
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
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}