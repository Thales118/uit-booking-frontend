import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Bell, ArrowRight, Plus, LogOut, User, Settings, CheckCircle2, Timer, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { format, isAfter, isToday, parseISO, differenceInHours, differenceInMinutes, isFuture } from "date-fns";
import { toast } from "sonner";

interface Booking {
  id: string;
  booking_date: string;
  slot_start: string;
  slot_end: string;
  status: string;
  purpose: string;
  room: { name: string; type: string };
}

interface NotificationState {
  title: string;
  message: string;
  type: "default" | "success" | "warning"; 
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    favoriteRoom: "Chưa có",
    totalHours: 0
  });

  const [notification, setNotification] = useState<NotificationState>({
    title: "",
    message: "",
    type: "default" // Mặc định là hiện thẻ "Cần phòng gấp"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error();
      const data: Booking[] = await response.json();
      
      setBookings(data);
      calculateStats(data);
      generateSmartNotification(data);
    } catch (error) {
      toast.error("Không thể tải dữ liệu Dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate("/auth");
  };

  const calculateStats = (data: Booking[]) => {
    const total = data.length;
    const roomCounts: Record<string, number> = {};
    data.forEach(b => {
      roomCounts[b.room.name] = (roomCounts[b.room.name] || 0) + 1;
    });
    const favoriteRoom = Object.keys(roomCounts).length > 0 
      ? Object.keys(roomCounts).reduce((a, b) => roomCounts[a] > roomCounts[b] ? a : b) 
      : "Chưa có";

    const totalHours = total * 2; 
    setStats({ total, favoriteRoom, totalHours });
  };

  // --- LOGIC THÔNG BÁO THÔNG MINH ---
  const generateSmartNotification = (data: Booking[]) => {
    const now = new Date();
    const futureBookings = data
      .map(b => ({ ...b, startDateTime: parseISO(`${b.booking_date}T${b.slot_start}`) }))
      .filter(b => isFuture(b.startDateTime) && b.status !== 'cancelled' && b.status !== 'rejected')
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

    if (futureBookings.length > 0) {
      const nearest = futureBookings[0];
      const diffHours = differenceInHours(nearest.startDateTime, now);
      const diffMinutes = differenceInMinutes(nearest.startDateTime, now);

      // 1. Sắp đến giờ (trong vòng 24h) -> Cảnh báo
      if (nearest.status === 'approved' && diffHours < 24) {
        setNotification({
          title: diffMinutes < 60 ? "Sắp đến giờ!" : "Nhắc nhở lịch hẹn",
          message: `Bạn có lịch tại ${nearest.room.name} vào lúc ${nearest.slot_start.slice(0,5)} hôm nay.`,
          type: "warning"
        });
        return;
      }

      // 2. Vừa được duyệt (ví dụ) -> Thông báo vui
      if (nearest.status === 'approved') {
        setNotification({
          title: "Đã được duyệt",
          message: `Phòng ${nearest.room.name} (${format(parseISO(nearest.booking_date), "dd/MM")}) đã sẵn sàng.`,
          type: "success"
        });
        return;
      }
    }
    
    // Nếu không có gì đặc biệt -> Giữ type "default" để hiện thẻ "Cần phòng gấp"
    setNotification({ title: "", message: "", type: "default" });
  };

  const upcomingBookings = bookings
    .filter(b => {
      const bookingDate = parseISO(b.booking_date);
      return (isAfter(bookingDate, new Date()) || isToday(bookingDate)) && 
             b.status !== 'cancelled' && b.status !== 'rejected';
    })
    .slice(0, 3);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  // Cấu hình màu sắc cho thẻ thông báo
  const getNotificationStyles = () => {
    switch (notification.type) {
      case "success": return { icon: <CheckCircle2 className="w-5 h-5" />, bg: "bg-gradient-to-br from-green-500 to-emerald-600" };
      case "warning": return { icon: <Timer className="w-5 h-5" />, bg: "bg-gradient-to-br from-orange-500 to-red-500" };
      default: return { icon: <Bell className="w-5 h-5" />, bg: "bg-blue-600" }; // Màu xanh chuẩn của nút "Cần phòng gấp"
    }
  };
  const notiStyle = getNotificationStyles();

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Xin chào, <span className="font-semibold text-primary">{user?.full_name}</span>!</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {userRole === 'admin' && (
             <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => navigate("/admin")}>
                <Settings className="w-4 h-4 mr-2" /> Admin
             </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title="Thông tin cá nhân">
            <User className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Đăng xuất">
            <LogOut className="w-5 h-5 text-red-500" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 ml-2" onClick={() => navigate("/booking")}>
            <Plus className="w-4 h-4 mr-2" /> <span className="hidden md:inline">Đặt phòng mới</span><span className="md:hidden">Đặt mới</span>
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard title="Tổng lượt đặt" value={stats.total} subtext="Tích cực hoạt động" icon={<Calendar className="w-5 h-5 text-blue-600" />} bg="bg-blue-50" />
        <StatCard title="Phòng yêu thích" value={stats.favoriteRoom} subtext="Hay sử dụng nhất" icon={<MapPin className="w-5 h-5 text-orange-600" />} bg="bg-orange-50" />
        <StatCard title="Thời gian sử dụng" value={`${stats.totalHours} giờ`} subtext="Ước tính tổng cộng" icon={<Clock className="w-5 h-5 text-green-600" />} bg="bg-green-50" />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* CỘT TRÁI: Lịch sắp tới */}
        <Card className="md:col-span-4 lg:col-span-5 shadow-sm border-gray-100 h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Lịch trình sắp tới</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate("/my-bookings")}>
              Xem lịch sử <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                  <p>Bạn không có lịch đặt phòng nào sắp tới.</p>
                  <Button variant="link" onClick={() => navigate("/booking")}>Đặt ngay</Button>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <BookingItem key={booking.id} booking={booking} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* CỘT PHẢI: 2 CARD (Thông báo + Hoạt động) */}
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
           
           {/* CARD 1: Thông báo Hoặc Cần phòng gấp */}
           <Card className={`${notiStyle.bg} text-white border-none shadow-lg transition-all duration-500`}>
             <CardContent className="p-6">
               <div className="mb-4 bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center">
                 {notiStyle.icon}
               </div>
               
               {notification.type === 'default' ? (
                 /* Layout Mặc định: "Cần phòng gấp?" giống ảnh */
                 <>
                   <h3 className="font-bold text-lg mb-1">Cần phòng gấp?</h3>
                   <p className="text-blue-100 text-sm mb-4">Hệ thống check trùng lịch thông minh giúp bạn tìm phòng trống ngay lập tức.</p>
                   <Button variant="secondary" className="w-full text-blue-700 font-semibold hover:bg-white" onClick={() => navigate("/booking")}>
                     <Search className="w-4 h-4 mr-2" /> Tìm phòng trống
                   </Button>
                 </>
               ) : (
                 /* Layout Thông báo: Khi có sự kiện quan trọng */
                 <>
                   <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
                   <p className="text-white/90 text-sm">{notification.message}</p>
                 </>
               )}
             </CardContent>
           </Card>
           
           {/* CARD 2: Hoạt động gần đây (Đã khôi phục) */}
           <Card className="border-gray-100 shadow-sm">
             <CardHeader className="pb-3"><CardTitle className="text-base">Hoạt động gần đây</CardTitle></CardHeader>
             <CardContent className="space-y-4">
               <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-2 bg-green-500 rounded-full flex-shrink-0" />
                 <p className="text-sm text-gray-600">Hệ thống đã ghi nhận <span className="font-medium text-gray-900">{stats.total}</span> lượt đặt phòng của bạn.</p>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0" />
                 <p className="text-sm text-gray-600">Đừng quên check-in QR code khi đến phòng nhé!</p>
               </div>
             </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---
function StatCard({ title, value, subtext, icon, bg }: any) {
  return (
    <Card className="hover:shadow-md transition-all border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function BookingItem({ booking }: { booking: Booking }) {
    const isApproved = booking.status === 'approved';
    const statusColor = isApproved ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    const statusText = isApproved ? 'Đã duyệt' : 'Đang chờ';
    
    return (
        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors bg-white group">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 rounded-lg text-blue-700 font-bold border border-blue-100 group-hover:bg-blue-100 transition-colors">
                    <span className="text-xs uppercase">{format(parseISO(booking.booking_date), "MMM")}</span>
                    <span className="text-xl">{format(parseISO(booking.booking_date), "dd")}</span>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 text-base">{booking.room.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{booking.slot_start.slice(0,5)} - {booking.slot_end.slice(0,5)}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                    {statusText}
                </span>
            </div>
        </div>
    )
}

export default Dashboard;