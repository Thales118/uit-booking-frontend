import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Calendar, Phone, Lock, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api-config";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    student_id: "",
    phone: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api("/api/profile");
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        student_id: data.student_id || "",
        phone: data.phone || ""
      });
    } catch (error: any) {
      toast.error("Lỗi", { description: "Không thể tải thông tin cá nhân" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone
        })
      });
      toast.success("Thành công", { description: "Thông tin đã được cập nhật" });
    } catch (error: any) {
      toast.error("Thất bại", { description: error.message });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setPasswordLoading(true);
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      toast.success("Thành công", { description: "Mật khẩu đã được thay đổi" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error("Thất bại", { description: error.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    // FIX: Thêm dark:bg-gray-900 để nền chuyển màu tối
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 transition-colors duration-300">
      
      {/* FIX: Header dark mode */}
      <header className="bg-white dark:bg-gray-800 dark:border-gray-700 border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="container mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="dark:text-gray-200 hover:dark:bg-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        <div>
          {/* FIX: Màu chữ tiêu đề */}
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground text-lg dark:text-gray-400">Quản lý thông tin và bảo mật</p>
        </div>

        {/* 1. THẺ THÔNG TIN CÁ NHÂN */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Thông tin chung</CardTitle>
            <CardDescription className="dark:text-gray-400">Cập nhật họ tên và số điện thoại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={profile.full_name} 
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="pl-10 dark:bg-gray-900 dark:border-gray-600 dark:text-white" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input value={profile.email} disabled className="pl-10 bg-gray-100 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">MSSV</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input value={profile.student_id} disabled className="pl-10 bg-gray-100 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-400" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="pl-10 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <Button className="w-full mt-2" onClick={handleUpdateProfile}>Lưu thông tin</Button>
          </CardContent>
        </Card>

        {/* 2. THẺ ĐỔI MẬT KHẨU */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Lock className="h-5 w-5" /> Bảo mật
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Đổi mật khẩu định kỳ để bảo vệ tài khoản</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Mật khẩu hiện tại</Label>
              <Input 
                type="password" 
                placeholder="••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Mật khẩu mới</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••"
                  className="pl-10 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••"
                  className="pl-10 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:hover:bg-red-900/40"
              onClick={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;