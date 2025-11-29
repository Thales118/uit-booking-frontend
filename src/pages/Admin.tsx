import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, XCircle, Calendar, Clock, Users, Search, Filter, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Booking {
  id: string;
  booking_date: string;
  slot_start: string;
  slot_end: string;
  purpose: string;
  notes: string | null;
  status: string;
  room: { name: string; type: string };
  profile: { full_name: string; email: string; student_id: string };
}

const Admin = () => {
  const navigate = useNavigate();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // State thống kê
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingCount: 0,
    totalUsers: 0,
    activeRooms: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = allBookings;

    if (filterStatus !== "all") {
      result = result.filter(b => b.status === filterStatus);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.profile.full_name?.toLowerCase().includes(lowerTerm) ||
        b.profile.email?.toLowerCase().includes(lowerTerm) ||
        b.profile.student_id?.toLowerCase().includes(lowerTerm) ||
        b.room.name?.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredBookings(result);
  }, [searchTerm, filterStatus, allBookings]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. Lấy danh sách Booking
      const resBookings = await fetch("http://localhost:5000/api/admin/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!resBookings.ok) throw new Error("Không thể kết nối Backend");
      
      const data: Booking[] = await resBookings.json();
      setAllBookings(data);
      setFilteredBookings(data);

      // 2. Lấy thống kê (STATS)
      const resStats = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resStats.ok) setStats(await resStats.json());

    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${id}/${action}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Thao tác thất bại");

      toast.success(action === 'approve' ? "Đã duyệt" : "Đã từ chối");
      fetchData(); 
    } catch (error: any) {
      toast.error("Lỗi", { description: error.message });
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // Dữ liệu cho các thẻ thống kê (ĐÃ THÊM LẠI PHẦN NÀY)
  const statsData = [
    { label: "Tổng đặt phòng", value: stats.totalBookings, icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Chờ duyệt", value: stats.pendingCount, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Người dùng", value: stats.totalUsers, icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Phòng hoạt động", value: stats.activeRooms, icon: Building, color: "text-green-600", bg: "bg-green-100" },
  ];

  const pendingList = filteredBookings.filter(b => b.status === 'pending');
  const historyList = filteredBookings.filter(b => b.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-4 flex justify-between items-center shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Dashboard
        </Button>
        <Badge variant="default" className="bg-primary">Admin Panel</Badge>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* --- PHẦN THỐNG KÊ (ĐÃ KHÔI PHỤC) --- */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, idx) => (
            <Card key={idx} className="shadow-sm hover:shadow-md transition-all">
              <CardContent className="pt-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* THANH TÌM KIẾM & LỌC */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên SV, MSSV, Email hoặc tên phòng..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TABS DANH SÁCH */}
        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="px-8">Cần xử lý ({allBookings.filter(b => b.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="history" className="px-8">Lịch sử xử lý</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingList.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                <p className="text-muted-foreground">Không tìm thấy yêu cầu nào.</p>
              </div>
            ) : (
              pendingList.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onApprove={() => handleAction(booking.id, 'approve')}
                  onReject={() => handleAction(booking.id, 'reject')}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {historyList.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                <p className="text-muted-foreground">Chưa có lịch sử xử lý nào.</p>
              </div>
            ) : (
              historyList.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isReadOnly />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Component BookingCard
const BookingCard = ({ booking, onApprove, onReject, isReadOnly }: any) => (
  <Card className="hover:shadow-md transition-all border-gray-200">
    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
      
      <div className="w-full md:w-[200px] flex-shrink-0">
        <Badge variant="outline" className="mb-2">{booking.room.type}</Badge>
        <h3 className="font-bold text-lg text-primary">{booking.room.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
           <Calendar className="h-4 w-4" /> {format(new Date(booking.booking_date), "dd/MM/yyyy")}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
           <Clock className="h-4 w-4" /> {booking.slot_start.slice(0,5)} - {booking.slot_end.slice(0,5)}
        </div>
      </div>

      <div className="flex-1 border-l pl-0 md:pl-6 border-gray-100">
        <div className="flex items-center gap-2 mb-1">
           <Users className="h-4 w-4 text-gray-400" /> 
           <span className="font-semibold">{booking.profile.full_name}</span>
           <span className="text-sm text-muted-foreground">({booking.profile.student_id})</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">{booking.profile.email}</p>
        
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <p><span className="font-medium">Mục đích:</span> {booking.purpose}</p>
          {booking.notes && <p className="text-muted-foreground mt-1 italic">Note: {booking.notes}</p>}
        </div>
      </div>
      
      <div className="flex flex-row md:flex-col gap-2 min-w-[120px]">
        {!isReadOnly ? (
          <>
            <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 w-full">
              <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
            </Button>
            <Button onClick={onReject} variant="destructive" className="w-full">
              <XCircle className="h-4 w-4 mr-2" /> Từ chối
            </Button>
          </>
        ) : (
          <div className={`text-center px-4 py-2 rounded-lg font-semibold border ${
            booking.status === 'approved' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {booking.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default Admin;