import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
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
        const response = await fetch("http://localhost:5000/api/rooms");
        
        if (!response.ok) {
          throw new Error("Không thể kết nối đến server");
        }

        const data = await response.json();
        setRooms(data || []);
      } catch (error: any) {
        toast.error("Không thể tải danh sách phòng", {
          description: error.message,
        });
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

    // Lấy token từ LocalStorage
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

      // GỌI API BACKEND NODE.JS
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Gửi kèm token xác thực
        },
        body: JSON.stringify({
          room_id: selectedRoom,
          booking_date: format(date, "yyyy-MM-dd"),
          slot_start: slot.start,
          slot_end: slot.end,
          purpose: purpose,
          notes: note || ""
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Đặt phòng thất bại");
      }

      toast.success("Đặt phòng thành công!", {
        description: "Yêu cầu của bạn đang chờ admin phê duyệt",
      });
      
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (error: any) {
      toast.error("Đặt phòng thất bại", {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoomIcon = (type: string) => {
    return <MapPin className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Đặt phòng mới</h1>
          <p className="text-muted-foreground text-lg">Chọn phòng, thời gian và xác nhận đặt phòng</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Selection */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Chọn phòng
              </CardTitle>
              <CardDescription>Tìm và chọn phòng phù hợp với nhu cầu của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRoom === room.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getRoomIcon(room.type)}
                        <h4 className="font-semibold">{room.name}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {room.capacity} chỗ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Chọn ngày và giờ
              </CardTitle>
              <CardDescription>Chọn ngày và khung giờ bạn muốn sử dụng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Ngày sử dụng</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
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
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Khung giờ</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedSlot === slot.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-medium">{slot.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purpose and Note */}
          <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Mục đích sử dụng *</Label>
                <Input
                  id="purpose"
                  placeholder="VD: Học nhóm, họp CLB, tập luyện..."
                  className="h-11"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                <Input
                  id="note"
                  placeholder="Số lượng người, thiết bị cần thiết..."
                  className="h-11"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Xác nhận đặt phòng"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
