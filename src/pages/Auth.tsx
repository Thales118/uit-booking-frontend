import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  // --- Login States ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // --- Register States ---
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // <--- MỚI: State cho xác nhận pass

  // Xử lý Đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return toast.error("Vui lòng nhập đủ thông tin");

    setLoading(true);
    const { error } = await signIn({ email: loginEmail, password: loginPassword });
    setLoading(false);

    if (error) {
      toast.error("Đăng nhập thất bại", { description: error.message });
    } else {
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    }
  };

  // Xử lý Đăng ký
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Kiểm tra điền đủ
    if (!fullName || !studentId || !regEmail || !regPassword || !confirmPassword) {
      return toast.error("Vui lòng điền đầy đủ thông tin");
    }

    // 2. Kiểm tra mật khẩu trùng khớp (QUAN TRỌNG)
    if (regPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp!", {
        description: "Vui lòng kiểm tra lại mật khẩu bạn vừa nhập."
      });
    }

    // 3. Gửi lên server
    setLoading(true);
    const { error } = await signUp({ 
      email: regEmail, 
      password: regPassword, 
      fullName, 
      studentId 
    });
    setLoading(false);

    if (error) {
      toast.error("Đăng ký thất bại", { description: error.message });
    } else {
      toast.success("Đăng ký thành công!", { description: "Vui lòng đăng nhập ngay." });
      // Tự động chuyển sang tab Đăng nhập (hoặc reload trang)
      window.location.reload(); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200 dark:shadow-none">
            <Calendar className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UIT Booking System</h1>
          <p className="text-muted-foreground">Hệ thống đặt phòng dành cho sinh viên UIT</p>
        </div>

        {/* Auth Forms */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          {/* --- FORM ĐĂNG NHẬP --- */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Đăng nhập</CardTitle>
                <CardDescription>Nhập email và mật khẩu của bạn để tiếp tục</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email UIT</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="mssv@gm.uit.edu.vn" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mật khẩu</Label>
                      <span className="text-xs text-blue-600 cursor-pointer hover:underline">Quên mật khẩu?</span>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                    Đăng nhập
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- FORM ĐĂNG KÝ (CÓ XÁC NHẬN MẬT KHẨU) --- */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Tạo tài khoản mới</CardTitle>
                <CardDescription>Điền thông tin để đăng ký thành viên</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <Input 
                      placeholder="Nguyễn Văn A" 
                      value={fullName} onChange={(e) => setFullName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>MSSV</Label>
                    <Input 
                      placeholder="2152xxxx" 
                      value={studentId} onChange={(e) => setStudentId(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email UIT</Label>
                    <Input 
                      type="email" placeholder="mssv@gm.uit.edu.vn" 
                      value={regEmail} onChange={(e) => setRegEmail(e.target.value)} 
                    />
                  </div>
                  
                  {/* Mật khẩu & Xác nhận */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Mật khẩu</Label>
                        <Input 
                        type="password" placeholder="••••••••" 
                        value={regPassword} onChange={(e) => setRegPassword(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Xác nhận mật khẩu</Label>
                        <Input 
                        type="password" placeholder="••••••••" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className={confirmPassword && regPassword !== confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                    </div>
                  </div>
                  {confirmPassword && regPassword !== confirmPassword && (
                    <p className="text-xs text-red-500">Mật khẩu không khớp!</p>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                    Đăng ký
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground">
          Dành cho sinh viên UIT với email @gm.uit.edu.vn
        </p>
      </div>
    </div>
  );
}