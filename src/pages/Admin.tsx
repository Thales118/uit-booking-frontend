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
import { api } from "@/lib/api-config"; // Dùng api config mới

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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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
      const data: Booking[] = await api("/api/admin/bookings");
      setAllBookings(data);
      setFilteredBookings(data);

      const statsData = await api("/api/admin/stats");
      setStats(statsData);

    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api(`/api/admin/bookings/${id}/${action}`, { method: "PATCH" });
      toast.success(action === 'approve' ? "Đã duyệt" : "Đã từ chối");
      fetchData(); 
    } catch (error: any) {
      toast.error("Lỗi", { description: error.message });
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">Loading...</div>;
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
    // FIX: Nền trang tối
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 dark:border-gray-700 border-b sticky top-0 z-50 px-4 py-4 flex justify-between items-center shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="dark:text-gray-200 hover:dark:bg-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Dashboard
        </Button>
        <Badge variant="default" className="bg-primary">Admin Panel</Badge>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, idx) => (
            <Card key={idx} className="shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground font-medium dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 dark:text-white">{stat.value}</p>
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
          <TabsList className="mb-6 dark:bg-gray-800">
            <TabsTrigger value="pending" className="px-8 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
              Cần xử lý ({allBookings.filter(b => b.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="history" className="px-8 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
              Lịch sử xử lý
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingList.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed dark:border-gray-700">
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

// Component BookingCard (Fix mạnh phần hiển thị)
const BookingCard = ({ booking, onApprove, onReject, isReadOnly }: any) => (
  <Card className="hover:shadow-md transition-all border-gray-200 dark:border-gray-700 dark:bg-gray-800">
    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
      
      {/* Cột trái: Thông tin phòng */}
      <div className="w-full md:w-[200px] flex-shrink-0">
        <Badge variant="outline" className="mb-2 dark:border-gray-600 dark:text-gray-300">{booking.room.type}</Badge>
        <h3 className="font-bold text-lg text-primary dark:text-blue-400">{booking.room.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 dark:text-gray-400">
           <Calendar className="h-4 w-4" /> {format(new Date(booking.booking_date), "dd/MM/yyyy")}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 dark:text-gray-400">
           <Clock className="h-4 w-4" /> {booking.slot_start.slice(0,5)} - {booking.slot_end.slice(0,5)}
        </div>
      </div>

      {/* Cột giữa: Thông tin Sinh viên */}
      <div className="flex-1 border-l pl-0 md:pl-6 border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-1">
           <Users className="h-4 w-4 text-gray-400" /> 
           <span className="font-semibold dark:text-white">{booking.profile.full_name}</span>
           <span className="text-sm text-muted-foreground">({booking.profile.student_id})</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{booking.profile.email}</p>
        
        {/* FIX: Ô hiển thị mục đích bị trắng -> Chuyển sang tối */}
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm border dark:border-gray-700">
          <p className="dark:text-gray-300"><span className="font-medium dark:text-white">Mục đích:</span> {booking.purpose}</p>
          {booking.notes && <p className="text-muted-foreground mt-1 italic">Note: {booking.notes}</p>}
        </div>
      </div>
      
      {/* Cột phải: Hành động */}
      <div className="flex flex-row md:flex-col gap-2 min-w-[120px]">
        {!isReadOnly ? (
          <>
            <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 w-full dark:text-white">
              <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
            </Button>
            <Button onClick={onReject} variant="destructive" className="w-full">
              <XCircle className="h-4 w-4 mr-2" /> Từ chối
            </Button>
          </>
        ) : (
          <div className={`text-center px-4 py-2 rounded-lg font-semibold border ${
            booking.status === 'approved' 
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
          }`}>
            {booking.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default Admin;