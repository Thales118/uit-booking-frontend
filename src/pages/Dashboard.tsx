import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Bell, ArrowRight, Plus, LogOut, User as UserIcon, Settings, CheckCircle2, Timer, Search, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { format, isAfter, isToday, parseISO, differenceInHours, differenceInMinutes, isFuture } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api-config";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/mode-toggle"; 

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
  
  // ✅ SỬA LẠI: Dùng signOut và userRole (theo đúng hook cũ của bạn)
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
    type: "default"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data: Booking[] = await api("/api/bookings");
      setBookings(data || []);
      calculateStats(data || []);
      generateSmartNotification(data || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu Dashboard");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleLogout = () => {
    // ✅ GỌI HÀM signOut ĐÚNG TÊN
    signOut();
    navigate("/auth");
    toast.success("Đã đăng xuất");
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

    // Giả sử mỗi slot là 2 tiếng
    const totalHours = total * 2; 
    setStats({ total, favoriteRoom, totalHours });
  };

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

      if (nearest.status === 'approved' && diffHours < 24) {
        setNotification({
          title: diffMinutes < 60 ? "Sắp đến giờ!" : "Nhắc nhở lịch hẹn",
          message: `Bạn có lịch tại ${nearest.room.name} vào lúc ${nearest.slot_start.slice(0,5)} hôm nay.`,
          type: "warning"
        });
        return;
      }

      if (nearest.status === 'approved') {
        setNotification({
          title: "Đã được duyệt",
          message: `Phòng ${nearest.room.name} (${format(parseISO(nearest.booking_date), "dd/MM")}) đã sẵn sàng.`,
          type: "success"
        });
        return;
      }
      
      if (nearest.status === 'pending') {
         setNotification({
          title: "Đang chờ duyệt",
          message: `Yêu cầu đặt phòng ${nearest.room.name} của bạn đang được xem xét.`,
          type: "default"
        });
        return;
      }
    }
    setNotification({ title: "Chào mừng trở lại!", message: "Bạn có thể đặt phòng mới ngay bây giờ.", type: "default" });
  };

  const upcomingBookings = bookings
    .filter(b => {
      const bookingDate = parseISO(b.booking_date);
      // Lấy lịch từ hôm nay trở đi và chưa bị hủy
      return (isAfter(bookingDate, new Date()) || isToday(bookingDate)) && 
             b.status !== 'cancelled' && b.status !== 'rejected';
    })
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
    .slice(0, 3);

  // Skeleton Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
        <div className="flex justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <Skeleton className="md:col-span-4 lg:col-span-5 h-[300px] rounded-xl" />
          <div className="md:col-span-3 lg:col-span-2 space-y-6">
            <Skeleton className="h-[150px] rounded-xl" />
            <Skeleton className="h-[100px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Styles thông báo
  const getNotificationStyles = () => {
    switch (notification.type) {
      case "success": return { icon: <CheckCircle2 className="w-5 h-5" />, bg: "bg-gradient-to-br from-green-500 to-emerald-600" };
      case "warning": return { icon: <Timer className="w-5 h-5" />, bg: "bg-gradient-to-br from-orange-500 to-red-500" };
      default: return { icon: <Bell className="w-5 h-5" />, bg: "bg-blue-600 dark:bg-blue-700" };
    }
  };
  const notiStyle = getNotificationStyles();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Xin chào, <span className="font-semibold text-primary">{user?.full_name}</span>!</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Nút Admin (Check theo userRole) */}
          {userRole === 'admin' && (
             <Button variant="outline" size="sm" className="hidden md:flex dark:border-gray-600 dark:text-gray-200 border-purple-200 text-purple-700 hover:bg-purple-50" onClick={() => navigate("/admin")}>
                <Settings className="w-4 h-4 mr-2" /> Admin Panel
             </Button>
          )}
          
          {/* Nút Đổi giao diện (ModeToggle) */}
          <ModeToggle />

          {/* Nút Profile */}
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title="Thông tin cá nhân" className="dark:text-gray-200 hover:dark:bg-gray-700">
            <UserIcon className="w-5 h-5" />
          </Button>

          {/* Nút Logout */}
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Đăng xuất" className="hover:dark:bg-gray-700">
            <LogOut className="w-5 h-5 text-red-500" />
          </Button>

          {/* Nút Đặt phòng */}
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:text-white ml-2" onClick={() => navigate("/booking")}>
            <Plus className="w-4 h-4 mr-2" /> <span className="hidden md:inline">Đặt phòng mới</span><span className="md:hidden">Đặt mới</span>
          </Button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard 
          title="Tổng lượt đặt" value={stats.total} subtext="Tích cực hoạt động" 
          icon={<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />} 
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard 
          title="Phòng yêu thích" value={stats.favoriteRoom} subtext="Hay sử dụng nhất" 
          icon={<MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />} 
          bg="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard 
          title="Thời gian sử dụng" value={`${stats.totalHours} giờ`} subtext="Ước tính tổng cộng" 
          icon={<Clock className="w-5 h-5 text-green-600 dark:text-green-400" />} 
          bg="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* LỊCH SẮP TỚI */}
        <Card className="md:col-span-4 lg:col-span-5 shadow-sm border-gray-100 dark:border-gray-700 dark:bg-gray-800 h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Lịch trình sắp tới</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:dark:bg-gray-700" onClick={() => navigate("/my-bookings")}>
              Xem lịch sử <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-sm mb-3">
                    <CalendarDays className="w-8 h-8 text-gray-400 dark:text-gray-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Lịch trống trơn!</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] mb-4 mt-1">
                    Bạn chưa có lịch đặt phòng nào sắp diễn ra.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/booking")} className="dark:border-gray-600 dark:text-gray-200">Đặt phòng ngay</Button>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <BookingItem key={booking.id} booking={booking} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* SIDEBAR RIGHT */}
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
           <Card className={`${notiStyle.bg} text-white border-none shadow-lg transition-all duration-500`}>
             <CardContent className="p-6">
               <div className="mb-4 bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center">
                 {notiStyle.icon}
               </div>
               {notification.type === 'default' && notification.title === "" ? (
                 <>
                   <h3 className="font-bold text-lg mb-1">Cần phòng gấp?</h3>
                   <p className="text-blue-100 text-sm mb-4">Tìm phòng trống ngay lập tức.</p>
                   <Button variant="secondary" className="w-full text-blue-700 font-semibold hover:bg-white" onClick={() => navigate("/booking")}>
                     <Search className="w-4 h-4 mr-2" /> Tìm phòng trống
                   </Button>
                 </>
               ) : (
                 <>
                   <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
                   <p className="text-white/90 text-sm">{notification.message}</p>
                 </>
               )}
             </CardContent>
           </Card>
           
           <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 shadow-sm">
             <CardHeader className="pb-3"><CardTitle className="text-base text-gray-900 dark:text-white">Hoạt động gần đây</CardTitle></CardHeader>
             <CardContent className="space-y-4">
               <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-2 bg-green-500 rounded-full flex-shrink-0" />
                 <p className="text-sm text-gray-600 dark:text-gray-300">Hệ thống đã ghi nhận <span className="font-medium text-gray-900 dark:text-white">{stats.total}</span> lượt đặt phòng của bạn.</p>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0" />
                 <p className="text-sm text-gray-600 dark:text-gray-300">Đừng quên check-in QR code khi đến phòng nhé!</p>
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
    <Card className="hover:shadow-md transition-all border-gray-100 dark:border-gray-700 dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function BookingItem({ booking }: { booking: Booking }) {
    const isApproved = booking.status === 'approved';
    const isPending = booking.status === 'pending';
    const isRejected = booking.status === 'rejected';

    let statusColor = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    let statusText = 'Khác';

    if (isApproved) {
        statusColor = 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        statusText = 'Đã duyệt';
    } else if (isPending) {
        statusColor = 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        statusText = 'Đang chờ';
    } else if (isRejected) {
        statusColor = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        statusText = 'Từ chối';
    }
    
    return (
        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors bg-white dark:bg-gray-800 dark:border-gray-700 group">
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <span className="text-xs uppercase">{format(parseISO(booking.booking_date), "MMM")}</span>
                    <span className="text-xl">{format(parseISO(booking.booking_date), "dd")}</span>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base">{booking.room.name}</h4>
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