import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, MapPin, Users, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api-config"; // <--- Import hàm api thông minh
import { Skeleton } from "@/components/ui/skeleton";

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  image_url?: string;
}

const Booking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [note, setNote] = useState("");
  const [purpose, setPurpose] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = [
    { id: "07:00-09:00", start: "07:00:00", end: "09:00:00", time: "07:00 - 09:00" },
    { id: "09:00-11:00", start: "09:00:00", end: "11:00:00", time: "09:00 - 11:00" },
    { id: "13:00-15:00", start: "13:00:00", end: "15:00:00", time: "13:00 - 15:00" },
    { id: "15:00-17:00", start: "15:00:00", end: "17:00:00", time: "15:00 - 17:00" },
    { id: "17:00-19:00", start: "17:00:00", end: "19:00:00", time: "17:00 - 19:00" },
  ];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // SỬA ĐỔI: Dùng hàm api() thay vì fetch thủ công
        const data = await api("/api/rooms");
        setRooms(data || []);
      } catch (error: any) {
        toast.error("Không thể tải danh sách phòng", { description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !date || !selectedSlot || !purpose) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Vui lòng đăng nhập lại");
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    try {
      const slot = timeSlots.find(s => s.id === selectedSlot);
      if (!slot) throw new Error("Khung giờ không hợp lệ");

      // SỬA ĐỔI: Dùng hàm api() để POST
      await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          room_id: selectedRoom,
          booking_date: format(date, "yyyy-MM-dd"),
          slot_start: slot.start,
          slot_end: slot.end,
          purpose: purpose,
          notes: note || ""
        })
      });

      toast.success("Đặt phòng thành công!", { description: "Vui lòng chờ Admin duyệt." });
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (error: any) {
      toast.error("Đặt phòng thất bại", { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Skeleton Loading khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid md:grid-cols-2 gap-5">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 dark:border-gray-700 border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="container mx-auto max-w-5xl">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Đặt phòng mới</h1>
          <p className="text-muted-foreground text-lg dark:text-gray-400">Chọn không gian phù hợp nhất cho nhu cầu của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. SECTION CHỌN PHÒNG */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold dark:text-white">Bước 1: Chọn phòng</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`group relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md ${
                    selectedRoom === room.id
                      ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900"
                      : "border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  }`}
                >
                  {/* Ảnh phòng */}
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img 
                      src={room.image_url || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80"} 
                      alt={room.name}
                      className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                        selectedRoom === room.id ? "scale-110" : ""
                      }`}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                        selectedRoom === room.id ? "opacity-90" : "opacity-60 group-hover:opacity-80"
                    }`} />
                    
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 dark:bg-black/80 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-gray-800 dark:text-white uppercase tracking-wide">
                        {room.type}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin phòng */}
                  <div className="absolute bottom-0 left-0 p-4 w-full text-white">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-xl font-bold mb-1 group-hover:text-blue-200 transition-colors">{room.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-200">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" /> {room.capacity} chỗ
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> Cơ sở chính
                          </span>
                        </div>
                      </div>
                      {selectedRoom === room.id && (
                        <div className="bg-blue-600 p-1.5 rounded-full animate-in zoom-in spin-in-12">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 2. SECTION CHỌN NGÀY & GIỜ */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold dark:text-white">Bước 2: Thời gian</h2>
              </div>

              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-6">
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">Ngày sử dụng</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal h-12 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd/MM/yyyy") : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">Khung giờ</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((slot) => (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`
                            relative px-4 py-3 rounded-lg text-sm font-medium cursor-pointer text-center transition-all duration-200 border
                            ${selectedSlot === slot.id
                              ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            }
                          `}
                        >
                          {slot.time}
                          {selectedSlot === slot.id && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white p-0.5 rounded-full shadow-sm"><CheckCircle2 className="w-3 h-3" /></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 3. SECTION CHI TIẾT */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold dark:text-white">Bước 3: Chi tiết</h2>
              </div>

              <Card className="border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="purpose" className="dark:text-gray-300">Mục đích sử dụng *</Label>
                    <Input 
                      id="purpose" 
                      placeholder="VD: Học nhóm, họp CLB..." 
                      className="h-12 text-base dark:bg-gray-900 dark:border-gray-600 dark:text-white" 
                      value={purpose} 
                      onChange={(e) => setPurpose(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note" className="dark:text-gray-300">Ghi chú (tùy chọn)</Label>
                    <Input 
                      id="note" 
                      placeholder="Số lượng người, thiết bị cần..." 
                      className="h-12 text-base dark:bg-gray-900 dark:border-gray-600 dark:text-white" 
                      value={note} 
                      onChange={(e) => setNote(e.target.value)} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1 h-12 text-base dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                  Hủy bỏ
                </Button>
                <Button type="submit" className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none" disabled={submitting}>
                  {submitting ? "Đang xử lý..." : "Xác nhận đặt phòng"}
                </Button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;