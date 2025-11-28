import { Button } from "@/components/ui/button";
import { Calendar, Clock, Shield, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">UIT Booking</h1>
              <p className="text-xs text-muted-foreground">Campus Facility System</p>
            </div>
          </div>
          <Button onClick={() => navigate("/auth")} variant="default" size="sm">
            Đăng nhập
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold text-foreground leading-tight">
            Đặt phòng học & thể thao
            <br />
            <span className="text-primary">Dễ dàng & Nhanh chóng</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hệ thống đặt phòng thông minh dành cho sinh viên UIT. 
            Tìm phòng, đặt lịch và check-in với QR code chỉ trong vài giây.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={() => navigate("/auth")} size="lg" className="text-lg px-8">
              Bắt đầu ngay
            </Button>
            <Button onClick={() => navigate("/auth")} variant="outline" size="lg" className="text-lg px-8">
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Calendar,
              title: "Đặt phòng dễ dàng",
              description: "Chọn phòng, chọn giờ và xác nhận chỉ trong 3 bước đơn giản"
            },
            {
              icon: Clock,
              title: "Quản lý thời gian",
              description: "Xem lịch trống, tránh xung đột và tối ưu thời gian sử dụng"
            },
            {
              icon: QrCode,
              title: "QR Check-in",
              description: "Check-in tự động bằng QR code, không cần giấy tờ thủ công"
            },
            {
              icon: Shield,
              title: "An toàn & bảo mật",
              description: "Hệ thống xác thực UIT, đảm bảo quyền truy cập hợp lệ"
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { value: "50+", label: "Phòng học & Lab" },
              { value: "1000+", label: "Sinh viên sử dụng" },
              { value: "99%", label: "Thời gian hoạt động" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Sẵn sàng đặt phòng?</h2>
          <p className="text-xl text-muted-foreground">
            Đăng nhập với email UIT của bạn và trải nghiệm ngay hôm nay
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" className="text-lg px-12">
            Đăng nhập ngay
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 UIT Campus Facility Booking System. Made with ❤️ by UIT Students</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
