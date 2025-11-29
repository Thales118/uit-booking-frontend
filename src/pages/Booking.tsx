import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, MapPin, Users, Clock, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api-config";

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  image_url?: string;
}

interface BusySlot {
  slot_start: string;
  slot_end: string;
  status: 'pending' | 'approved';
}

const Booking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date()); // Mặc định chọn hôm nay
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [note, setNote] = useState("");
  const [purpose, setPurpose] = useState("");
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]); // Danh sách giờ bận
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Định nghĩa các ca học cố định
  const timeSlots = [
    { id: "07:00-09:00", start: "07:00:00", end: "09:00:00", label: "Ca 1 (07:00 - 09:00)" },
    { id: "09:00-11:00", start: "09:00:00", end: "11:00:00", label: "Ca 2 (09:00 - 11:00)" },
    { id: "13:00-15:00", start: "13:00:00", end: "15:00:00", label: "Ca 3 (13:00 - 15:00)" },
    { id: "15:00-17:00", start: "15:00:00", end: "17:00:00", label: "Ca 4 (15:00 - 17:00)" },
    { id: "17:00-19:00", start: "17:00:00", end: "19:00:00", label: "Ca 5 (17:00 - 19:00)" },
  ];

  // 1. Tải danh sách phòng khi vào trang
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await api("/api/rooms");
        setRooms(data || []);
        if (data.length > 0) setSelectedRoom(data[0].id); // Tự chọn phòng đầu tiên
      } catch (error: any) {
        toast.error("Không thể tải danh sách phòng");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // 2. Tải lịch bận mỗi khi đổi Phòng hoặc Ngày
  useEffect(() => {
    if (selectedRoom && date) {
      fetchBusySlots();
      setSelectedSlot(""); // Reset slot đã chọn để tránh conflict
    }
  }, [selectedRoom, date]);

  const fetchBusySlots = async () => {
    try {
      const formattedDate = format(date!, "yyyy-MM-dd");
      // Gọi API check trùng
      const data = await api(`/api/bookings/check?roomId=${selectedRoom}&date=${formattedDate}`);
      setBusySlots(data);
    } catch (error) {
      console.error("Lỗi check lịch:", error);
    }
  };

  // Hàm kiểm tra xem 1 slot cố định có bị trùng với giờ bận không
  const getSlotStatus = (slotStart: string) => {
    const busy = busySlots.find(b => b.slot_start === slotStart);
    if (!busy) return "available";
    return busy.status; // 'pending' hoặc 'approved'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !date || !selectedSlot || !purpose) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    try {
      const slot = timeSlots.find(s => s.id === selectedSlot);
      if (!slot) throw new Error("Lỗi chọn giờ");

      await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          room_id: selectedRoom,
          booking_date: format(date!, "yyyy-MM-dd"),
          slot_start: slot.start,
          slot_end: slot.end,
          purpose: purpose,
          notes: note || ""
        })
      });

      toast.success("Đặt phòng thành công!", { description: "Vui lòng chờ Admin duyệt." });
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Đặt phòng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 dark:border-gray-700 border-b sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="container mx-auto max-w-6xl">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Đặt phòng mới</h1>
          <p className="text-muted-foreground text-lg dark:text-gray-400">Xem lịch trống và chọn phòng phù hợp</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: DANH SÁCH PHÒNG */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <MapPin className="w-5 h-5 text-blue-600" /> Chọn phòng
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`relative overflow-hidden rounded-xl border-2 cursor-pointer transition-all duration-200 group
                      ${selectedRoom === room.id 
                        ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-800" 
                        : "border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-900"
                      }`}
                  >
                    <div className="aspect-[16/9] w-full relative">
                      <img 
                        src={room.image_url || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80"} 
                        className="w-full h-full object-cover"
                        alt={room.name}
                      />
                      {/* Lớp phủ tên phòng */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                        <h3 className="text-white font-bold text-lg">{room.name}</h3>
                        <p className="text-gray-300 text-xs flex items-center gap-1"><Users className="w-3 h-3"/> {room.capacity} chỗ</p>
                      </div>
                      {selectedRoom === room.id && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PHẦN CHỌN GIỜ (TIMELINE VIEW) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-white">
                  <Clock className="w-5 h-5 text-orange-600" /> Chọn khung giờ
                </h2>
                {/* Chọn ngày nằm ngay đây cho tiện */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start text-left font-normal dark:bg-gray-900 dark:border-gray-600 dark:text-white">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Lưới giờ thông minh */}
              <div className="space-y-3">
                {timeSlots.map((slot) => {
                  const status = getSlotStatus(slot.start);
                  const isAvailable = status === 'available';
                  const isSelected = selectedSlot === slot.id;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => isAvailable && setSelectedSlot(slot.id)}
                      className={`
                        relative flex items-center justify-between p-4 rounded-lg border-2 transition-all
                        ${!isAvailable 
                          ? "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-70 cursor-not-allowed" 
                          : isSelected 
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600 cursor-pointer shadow-md"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500 cursor-pointer"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-semibold ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>{slot.label}</p>
                          <p className="text-xs text-muted-foreground">Thời lượng: 2 giờ</p>
                        </div>
                      </div>

                      {/* Trạng thái Slot */}
                      <div>
                        {status === 'approved' && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                            <XCircle className="w-3 h-3" /> Đã kín
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Chờ duyệt
                          </span>
                        )}
                        {status === 'available' && isSelected && (
                          <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Đang chọn
                          </span>
                        )}
                        {status === 'available' && !isSelected && (
                          <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                            Còn trống
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM XÁC NHẬN */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-lg">
              <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                <CardTitle className="text-lg dark:text-white">Thông tin đặt phòng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Phòng đã chọn</Label>
                  <div className="font-semibold text-primary text-lg">
                    {rooms.find(r => r.id === selectedRoom)?.name || "Chưa chọn"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Thời gian</Label>
                  <div className="text-sm dark:text-gray-400">
                    {date ? format(date, "dd/MM/yyyy") : "..."} <br/>
                    {timeSlots.find(s => s.id === selectedSlot)?.label || "..."}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t dark:border-gray-700">
                  <Label htmlFor="purpose" className="dark:text-gray-300">Mục đích sử dụng *</Label>
                  <Input 
                    id="purpose" placeholder="VD: Học nhóm..." 
                    className="dark:bg-gray-900 dark:border-gray-600"
                    value={purpose} onChange={(e) => setPurpose(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note" className="dark:text-gray-300">Ghi chú</Label>
                  <Input 
                    id="note" placeholder="..." 
                    className="dark:bg-gray-900 dark:border-gray-600"
                    value={note} onChange={(e) => setNote(e.target.value)} 
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={submitting || !selectedSlot}>
                  {submitting ? "Đang xử lý..." : "Xác nhận đặt phòng"}
                </Button>
              </CardContent>
            </Card>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Booking;