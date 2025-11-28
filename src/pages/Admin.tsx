import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, XCircle, Calendar, Clock, Users, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

// Định nghĩa kiểu dữ liệu cho Booking
interface Booking {
  id: string;
  booking_date: string;
  slot_start: string;
  slot_end: string;
  purpose: string;
  notes: string | null;
  status: string;
  room: { name: string; type: string };
  profile: { full_name: string; email: string };
}

const Admin = () => {
  const navigate = useNavigate();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingCount: 0,
    totalUsers: 0,
    activeRooms: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. GỌI API BACKEND LOCALHOST
      const resBookings = await fetch("http://localhost:5000/api/admin/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!resBookings.ok) throw new Error("Không thể kết nối Backend");
      
      const allBookings: Booking[] = await resBookings.json();

      // Phân loại booking
      setPendingBookings(allBookings.filter(b => b.status === 'pending'));
      setApprovedBookings(allBookings.filter(b => b.status === 'approved'));

      // 2. Lấy thống kê từ Backend Local
      const resStats = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resStats.ok) {
        setStats(await resStats.json());
      }

    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      // Gọi API duyệt/từ chối
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${id}/${action}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Thao tác thất bại");

      toast.success(action === 'approve' ? "Đã duyệt" : "Đã từ chối");
      fetchData(); // Load lại dữ liệu mới nhất
    } catch (error: any) {
      toast.error("Lỗi", { description: error.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statsData = [
    { label: "Tổng đặt phòng", value: stats.totalBookings, icon: Calendar, color: "text-primary" },
    { label: "Chờ duyệt", value: stats.pendingCount, icon: Clock, color: "text-warning" },
    { label: "Người dùng", value: stats.totalUsers, icon: Users, color: "text-accent" },
    { label: "Phòng hoạt động", value: stats.activeRooms, icon: Building, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 flex justify-between items-center shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Dashboard
        </Button>
        <Badge variant="default" className="bg-primary">Admin Panel (Local DB)</Badge>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Chờ duyệt ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="approved">Đã duyệt ({approvedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Không có yêu cầu nào đang chờ.</p>
            ) : (
              pendingBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onApprove={() => handleAction(booking.id, 'approve')}
                  onReject={() => handleAction(booking.id, 'reject')}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isReadOnly />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Component con hiển thị thẻ Booking
const BookingCard = ({ booking, onApprove, onReject, isReadOnly }: any) => (
  <Card className="hover:shadow-md transition-all">
    <CardContent className="p-6 flex flex-col md:flex-row gap-6">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{booking.room.type}</Badge>
          <h3 className="font-bold text-lg">{booking.room.name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {format(new Date(booking.booking_date), "dd/MM/yyyy")}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> {booking.slot_start} - {booking.slot_end}
          </div>
          <div className="flex items-center gap-2 mt-1 col-span-2">
            <Users className="h-4 w-4" /> {booking.profile.full_name} ({booking.profile.email})
          </div>
        </div>
        <p className="text-sm mt-2 bg-gray-50 p-2 rounded">
          <span className="font-medium">Mục đích:</span> {booking.purpose}
        </p>
        {booking.notes && (
           <p className="text-sm text-muted-foreground italic">Note: {booking.notes}</p>
        )}
      </div>
      
      {!isReadOnly && (
        <div className="flex md:flex-col gap-2 justify-center min-w-[120px]">
          <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
          </Button>
          <Button onClick={onReject} variant="destructive">
            <XCircle className="h-4 w-4 mr-2" /> Từ chối
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default Admin;