import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const navigate = useNavigate();
  // Lấy hàm signIn, signUp từ hook useAuth mới
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
  const [confirmPassword, setConfirmPassword] = useState(""); 

  // Xử lý Đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return toast.error("Vui lòng nhập đủ thông tin");

    setLoading(true);
    // Gọi hàm signIn từ useAuth (đã được bọc try-catch bên trong hook rồi, trả về { error })
    const { error } = await signIn({ email: loginEmail, password: loginPassword });
    setLoading(false);

    if (error) {
      if (error.message?.includes("Sai thông tin") || error.message?.includes("credentials")) {
        toast.error("Email hoặc mật khẩu không đúng.");
      } else {
        toast.error("Đăng nhập thất bại", { description: error.message });
      }
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

    // 2. Kiểm tra mật khẩu trùng khớp
    if (regPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp!", {
        description: "Vui lòng kiểm tra lại mật khẩu bạn vừa nhập."
      });
    }

    setLoading(true);
    // 3. Gọi hàm signUp từ useAuth
    const { error } = await signUp({ 
      email: regEmail, 
      password: regPassword, 
      fullName, 
      studentId 
    });
    setLoading(false);

    if (error) {
      if (error.message?.includes("tồn tại")) {
        toast.error("Email này đã được đăng ký. Vui lòng đăng nhập.");
      } else {
        toast.error("Đăng ký thất bại", { description: error.message });
      }
    } else {
      toast.success("Đăng ký thành công!", { description: "Vui lòng đăng nhập ngay." });
      // Reload trang để reset form và chuyển về tab login mặc định
      window.location.reload(); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        
        {/* Nút Quay lại */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại trang chủ
        </Button>

        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200 dark:shadow-none">
            <Calendar className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UIT Booking System</h1>
          <p className="text-muted-foreground">Hệ thống đặt phòng dành cho sinh viên UIT</p>
        </div>

        {/* Auth Forms */}
        <Card className="shadow-xl border-border/50 bg-white dark:bg-gray-800">
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 dark:text-gray-200 dark:data-[state=active]:text-white">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 dark:text-gray-200 dark:data-[state=active]:text-white">Đăng ký</TabsTrigger>
              </TabsList>

              {/* --- TAB ĐĂNG NHẬP --- */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email UIT</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="mssv@gm.uit.edu.vn" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-11 dark:bg-gray-900 dark:border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Mật khẩu</Label>
                      <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => window.open("https://auth.uit.edu.vn/", "_blank")}>
                        Quên mật khẩu?
                      </span>
                    </div>
                    <Input 
                      id="login-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 dark:bg-gray-900 dark:border-gray-600"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                    Đăng nhập
                  </Button>
                </form>
              </TabsContent>

              {/* --- TAB ĐĂNG KÝ --- */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Họ và tên</Label>
                    <Input 
                      id="reg-name"
                      placeholder="Nguyễn Văn A" 
                      value={fullName} onChange={(e) => setFullName(e.target.value)} 
                      className="h-11 dark:bg-gray-900 dark:border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-mssv">MSSV</Label>
                    <Input 
                      id="reg-mssv"
                      placeholder="2152xxxx" 
                      value={studentId} onChange={(e) => setStudentId(e.target.value)} 
                      className="h-11 dark:bg-gray-900 dark:border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email UIT</Label>
                    <Input 
                      id="reg-email"
                      type="email" placeholder="mssv@gm.uit.edu.vn" 
                      value={regEmail} onChange={(e) => setRegEmail(e.target.value)} 
                      className="h-11 dark:bg-gray-900 dark:border-gray-600"
                    />
                  </div>
                  
                  {/* Mật khẩu & Xác nhận */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="reg-pass">Mật khẩu</Label>
                        <Input 
                          id="reg-pass"
                          type="password" placeholder="••••••••" 
                          value={regPassword} onChange={(e) => setRegPassword(e.target.value)} 
                          className="h-11 dark:bg-gray-900 dark:border-gray-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reg-confirm">Xác nhận</Label>
                        <Input 
                          id="reg-confirm"
                          type="password" placeholder="••••••••" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          className={`h-11 dark:bg-gray-900 dark:border-gray-600 ${confirmPassword && regPassword !== confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                    </div>
                  </div>
                  {confirmPassword && regPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 font-medium animate-pulse">Mật khẩu xác nhận không khớp!</p>
                  )}

                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                    Đăng ký
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-xs text-muted-foreground border-t pt-4 dark:border-gray-700">
              <p>Dành cho sinh viên UIT với email @gm.uit.edu.vn</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}