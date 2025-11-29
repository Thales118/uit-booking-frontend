import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn({ email, password });
    
    if (error) {
      if (error.message.includes("Invalid login credentials") || error.message.includes("Sai email")) {
        toast.error("Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.");
      } else {
        toast.error(error.message || "Đăng nhập thất bại");
      }
      setLoading(false);
    } else {
      toast.success("Đăng nhập thành công!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const studentId = formData.get("studentId") as string;

    const { error } = await signUp({ 
      email, 
      password, 
      fullName: name, 
      studentId 
    });
    
    if (error) {
      if (error.message.includes("already registered") || error.message.includes("tồn tại")) {
        toast.error("Email này đã được đăng ký. Vui lòng đăng nhập.");
      } else {
        toast.error(error.message || "Đăng ký thất bại");
      }
      setLoading(false);
    } else {
      toast.success("Đăng ký thành công! Đang chuyển sang đăng nhập...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">UIT Booking System</CardTitle>
              <CardDescription className="text-base mt-2">
                Hệ thống đặt phòng dành cho sinh viên UIT
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>

              {/* --- FORM ĐĂNG NHẬP --- */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email UIT</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="mssv@gm.uit.edu.vn"
                      required
                      className="h-11"
                    />
                  </div>
                  
                  {/* 👇 ĐOẠN ĐƯỢC THÊM NÚT QUÊN MẬT KHẨU 👇 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Mật khẩu</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 text-xs text-blue-600 hover:text-blue-800 h-auto font-normal"
                        onClick={() => window.location.href = "https://auth.uit.edu.vn/"}
                      >
                        Quên mật khẩu?
                      </Button>
                    </div>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="h-11"
                    />
                  </div>
                  {/* 👆 HẾT ĐOẠN THÊM 👆 */}

                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </form>
              </TabsContent>

              {/* --- FORM ĐĂNG KÝ --- */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Họ và tên</Label>
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-studentId">MSSV</Label>
                    <Input
                      id="register-studentId"
                      name="studentId"
                      type="text"
                      placeholder="21520000"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email UIT</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="mssv@gm.uit.edu.vn"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Dành cho sinh viên UIT với email @gm.uit.edu.vn</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;