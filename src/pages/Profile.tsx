import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Calendar, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    student_id: "",
    phone: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      // GỌI API BACKEND
      const response = await fetch("http://localhost:5000/api/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Không thể tải thông tin");

      const data = await response.json();
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
      const token = localStorage.getItem('token');
      
      // GỌI API UPDATE
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone
        })
      });

      if (!response.ok) throw new Error("Cập nhật thất bại");

      toast.success("Thành công", {
        description: "Thông tin của bạn đã được cập nhật",
      });
    } catch (error: any) {
      toast.error("Thất bại", {
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="container mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Thông tin cá nhân</h1>
          <p className="text-muted-foreground text-lg">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Cập nhật thông tin cá nhân</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    value={profile.full_name} 
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="pl-10 h-11" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="pl-10 h-11 bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-id">MSSV / ID</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="student-id"
                    value={profile.student_id}
                    disabled
                    className="pl-10 h-11 bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="Nhập số điện thoại"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full" onClick={handleUpdateProfile}>
                Lưu thay đổi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
