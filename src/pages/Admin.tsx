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
import { api } from "@/lib/api-config"; // Import hàm api chuẩn
import { useAuth } from "@/hooks/useAuth"; // Import hook auth để kiểm tra quyền

// Định nghĩa kiểu dữ liệu rõ ràng hơn
interface Booking {
  id: string;
  booking_date: string;
  slot_start: string;
  slot_end: string;
  purpose: string;
  notes: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  room: { name: string; type: string };
  profile: { full_name: string; email: string; student_id: string };
}

interface Stats {
  totalBookings: number;
  pendingCount: number;
  totalUsers: number;
  activeRooms: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin user hiện tại
  
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null); // Trạng thái đang xử lý từng nút
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingCount: 0,
    totalUsers: 0,
    activeRooms: 0,
  });

  // Kiểm tra quyền Admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Gọi song song 2 API để tiết kiệm thời gian
      const [bookingsData, statsData] = await Promise.all([
        api("/api/admin/bookings"),
        api("/api/admin/stats")
      ]);

      setAllBookings(bookingsData || []);
      setFilteredBookings(bookingsData || []);
      setStats(statsData || { totalBookings: 0, pendingCount: 0, totalUsers: 0, activeRooms: 0 });

    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logic lọc dữ liệu
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

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(action === 'approve' ? "Bạn có chắc muốn DUYỆT yêu cầu này?" : "Bạn có chắc muốn TỪ CHỐI yêu cầu này?")) return;

    setProcessingId(id);
    try {
      await api(`/api/admin/bookings/${id}/${action}`, { method: "PATCH" });
      toast.success(action === 'approve' ? "Đã duyệt thành công" : "Đã từ chối yêu cầu");
      fetchData(); // Tải lại dữ liệu mới nhất
    } catch (error: any) {
      toast.error("Thao tác thất bại", { description: error.message });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Dữ liệu Stats (Đã thêm màu Dark Mode)
  const statsData = [
    { label: "Tổng đặt phòng", value: stats.totalBookings, icon: Calendar, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/20" },
    { label: "Chờ duyệt", value: stats.pendingCount, icon: Clock, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/20" },
    { label: "Người dùng", value: stats.totalUsers, icon: Users, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/20" },
    { label: "Phòng hoạt động", value: stats.activeRooms, icon: Building, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/20" },
  ];

  const pendingList = filteredBookings.filter(b => b.status === 'pending');
  const historyList = filteredBookings.filter(b => b.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-10">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 dark:border-gray-700 border-b sticky top-0 z-50 px-4 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="dark:text-gray-200 hover:dark:bg-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Dashboard
          </Button>
          <Badge variant="default" className="bg-primary hidden sm:inline-flex">Admin Panel</Badge>
        </div>
        <div className="text-sm text-muted-foreground hidden md:block">
            Xin chào, <span className="font-semibold text-primary">{user?.full_name}</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, idx) => (
            <Card key={idx} className="shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground font-medium dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên SV, MSSV, Email hoặc tên phòng..." 
              className="pl-9 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="dark:bg-gray-900 dark:border-gray-600 dark:text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TABS */}
        <Tabs defaultValue="pending">
          <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800 p-1 h-auto">
            <TabsTrigger value="pending" className="px-6 py-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white shadow-sm">
              Cần xử lý <Badge className="ml-2 bg-yellow-500 text-white hover:bg-yellow-600">{allBookings.filter(b => b.status === 'pending').length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="px-6 py-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white shadow-sm">
              Lịch sử xử lý
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 animate-in fade-in-50">
            {pendingList.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed dark:border-gray-700">
                <p className="text-muted-foreground">Không tìm thấy yêu cầu nào cần duyệt.</p>
              </div>
            ) : (
              pendingList.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onApprove={() => handleAction(booking.id, 'approve')}
                  onReject={() => handleAction(booking.id, 'reject')}
                  processingId={processingId}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 animate-in fade-in-50">
            {historyList.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed dark:border-gray-700">
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

// Component BookingCard (Tách ra cho gọn)
const BookingCard = ({ booking, onApprove, onReject, isReadOnly, processingId }: any) => (
  <Card className="hover:shadow-md transition-all border-gray-200 dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
      
      {/* Cột trái: Thông tin phòng */}
      <div className="w-full md:w-[220px] flex-shrink-0 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
        <Badge variant="outline" className="mb-2 dark:border-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800">{booking.room.type}</Badge>
        <h3 className="font-bold text-lg text-primary dark:text-blue-400 mb-2">{booking.room.name}</h3>
        <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                <Calendar className="h-4 w-4 text-blue-500" /> {format(new Date(booking.booking_date), "dd/MM/yyyy")}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                <Clock className="h-4 w-4 text-orange-500" /> {booking.slot_start.slice(0,5)} - {booking.slot_end.slice(0,5)}
            </div>
        </div>
      </div>

      {/* Cột giữa: Thông tin Sinh viên */}
      <div className="flex-1 space-y-3">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-gray-400" /> 
                <span className="font-semibold text-gray-900 dark:text-white text-lg">{booking.profile.full_name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground pl-6">
                <span>MSSV: {booking.profile.student_id}</span>
                <span className="hidden sm:inline">•</span>
                <span>{booking.profile.email}</span>
            </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
          <p className="text-sm dark:text-gray-300">
            <span className="font-medium text-blue-700 dark:text-blue-300">Mục đích:</span> {booking.purpose}
          </p>
          {booking.notes && <p className="text-sm text-muted-foreground mt-1 italic">Note: {booking.notes}</p>}
        </div>
      </div>
      
      {/* Cột phải: Hành động */}
      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto md:min-w-[140px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 md:pl-6">
        {!isReadOnly ? (
          <>
            <Button 
                onClick={onApprove} 
                className="bg-green-600 hover:bg-green-700 w-full dark:text-white shadow-sm"
                disabled={processingId === booking.id}
            >
              {processingId === booking.id ? "..." : <><CheckCircle className="h-4 w-4 mr-2" /> Duyệt</>}
            </Button>
            <Button 
                onClick={onReject} 
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                disabled={processingId === booking.id}
            >
              {processingId === booking.id ? "..." : <><XCircle className="h-4 w-4 mr-2" /> Từ chối</>}
            </Button>
          </>
        ) : (
          <div className={`text-center px-4 py-2 rounded-lg font-semibold border flex items-center justify-center gap-2 h-10 ${
            booking.status === 'approved' 
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
              : booking.status === 'completed'
              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
          }`}>
            {booking.status === 'approved' && <CheckCircle className="h-4 w-4" />}
            {booking.status === 'rejected' && <XCircle className="h-4 w-4" />}
            {booking.status === 'approved' ? 'Đã duyệt' : booking.status === 'completed' ? 'Hoàn thành' : 'Đã từ chối'}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);