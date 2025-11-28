import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  // Lấy thông tin từ hook useAuth mới
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ kiểm tra khi đã load xong thông tin user
    if (!loading) {
      if (!user) {
        // Nếu chưa đăng nhập -> đá về trang login
        navigate('/auth');
      } else if (requireAdmin && userRole !== 'admin') {
        // Nếu cần quyền admin mà không phải admin -> đá về dashboard
        navigate('/dashboard');
      }
    }
  }, [user, userRole, loading, navigate, requireAdmin]);

  // Hiển thị loading trong lúc chờ check token từ localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Nếu user không hợp lệ thì không render gì cả (đợi useEffect chuyển trang)
  if (!user || (requireAdmin && userRole !== 'admin')) {
    return null;
  }

  return <>{children}</>;
}
