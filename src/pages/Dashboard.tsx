import { useState, useEffect } from "react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Plus, History, BarChart3, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut, user, userRole } = useAuth(); 

  const handleLogout = async () => {
    signOut();
    navigate("/auth");
  };

  // Dữ liệu đặt phòng demo 
  const stats = [
    { label: "Đặt phòng trong tháng", value: "12", icon: Calendar, color: "text-primary" },
    { label: "Phòng yêu thích", value: "Lab A401", icon: MapPin, color: "text-accent" },
    { label: "Thời gian sử dụng", value: "24h", icon: Clock, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">UIT Booking</h1>
              <p className="text-xs text-muted-foreground">Xin chào, {user?.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Chỉ hiện nút này nếu là Admin */}
            {userRole === "admin" && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Xin chào! 👋</h2>
          <p className="text-muted-foreground text-lg">Quản lý việc đặt phòng học và cơ sở vật chất.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button
            size="lg"
            className="h-auto py-6 flex-col gap-2 shadow-sm"
            onClick={() => navigate("/booking")}
          >
            <Plus className="h-6 w-6" />
            <span>Đặt phòng mới</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6 flex-col gap-2 bg-white"
            onClick={() => navigate("/my-bookings")}
          >
            <History className="h-6 w-6" />
            <span>Lịch sử đặt phòng</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6 flex-col gap-2 bg-white"
            onClick={() => navigate("/profile")}
          >
            <User className="h-6 w-6" />
            <span>Thông tin cá nhân</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;