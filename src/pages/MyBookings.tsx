import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Search, Filter, MoreVertical, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-config";

interface Booking {
  id: string;
  booking_date: string;
  slot_start: string;
  slot_end: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  purpose: string;
  room: {
    name: string;
    type: string;
  };
}

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBookings = async () => {
    try {
      const data = await api("/api/bookings");
      setBookings(data || []);
    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy lịch đặt này không?")) return;

    try {
      await api(`/api/bookings/${id}/cancel`, { method: "PATCH" });
      toast.success("Đã hủy lịch đặt phòng");
      fetchBookings();
    } catch (error: any) {
      toast.error("Hủy thất bại", { description: error.message });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100/80";
      case "pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100/80";
      case "rejected": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100/80";
      case "cancelled": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100/80";
      case "completed": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100/80";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      approved: "Đã duyệt",
      pending: "Chờ duyệt",
      rejected: "Từ chối",
      cancelled: "Đã hủy",
      completed: "Hoàn thành"
    };
    return map[status] || status;
  };

  const filteredBookings = bookings.filter(b => 
    b.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-10">
      
      {/* --- MỚI THÊM: Header có nút Quay lại Dashboard --- */}
      <header className="bg-white dark:bg-gray-800 dark:border-gray-700 border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="container mx-auto max-w-5xl">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lịch sử đặt phòng</h1>
            <p className="text-muted-foreground mt-1 dark:text-gray-400">Quản lý và theo dõi trạng thái các yêu cầu của bạn</p>
          </div>
          <Button onClick={() => navigate("/booking")} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none">
            + Đặt phòng mới
          </Button>
        </div>

        {/* Thanh tìm kiếm & Bộ lọc */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Tìm kiếm theo tên phòng, mục đích..." 
              className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            <Filter className="h-4 w-4 mr-2" /> Bộ lọc
          </Button>
        </div>

        {/* Danh sách Booking */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium dark:text-white">Chưa có lịch đặt nào</h3>
            <p className="text-muted-foreground mb-4">Hãy tạo yêu cầu đặt phòng mới ngay bây giờ</p>
            <Button variant="outline" onClick={() => navigate("/booking")}>Đặt phòng ngay</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="group overflow-hidden transition-all hover:shadow-md border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    
                    {/* Cột trái: Thông tin chính */}
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{booking.room.name}</h3>
                            <Badge variant="secondary" className="text-xs font-normal bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {booking.room.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{booking.purpose}</p>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} border-0`}>
                          {getStatusText(booking.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {format(new Date(booking.booking_date), "EEEE, dd/MM/yyyy", { locale: vi })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>
                            {booking.slot_start.slice(0, 5)} - {booking.slot_end.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cột phải: Hành động */}
                    <div className="bg-gray-50 dark:bg-gray-900/30 p-4 md:w-48 flex flex-row md:flex-col justify-center items-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700">
                      <Button variant="outline" className="w-full bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" size="sm">
                        Chi tiết
                      </Button>
                      
                      {booking.status === 'pending' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <MoreVertical className="h-4 w-4 mr-2 md:hidden" />
                              Hủy đặt
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCancel(booking.id)} className="text-red-600 cursor-pointer">
                              Xác nhận hủy
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;