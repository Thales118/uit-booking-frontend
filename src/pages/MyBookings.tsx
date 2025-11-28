import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Calendar, Clock, QrCode, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import QRCode from "react-qr-code";

interface Booking {
  id: string;
  booking_date: string;
  slot_start: string;
  slot_end: string;
  status: string;
  purpose: string;
  notes: string | null;
  qr_code: string | null;
  room: {
    name: string;
    type: string;
  };
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    // Không cần check !user ở đây vì ProtectedRoute đã lo rồi
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/bookings", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Lỗi tải dữ liệu");

      const data = await response.json();
      setBookings(data || []);
    } catch (error: any) {
      toast.error("Không thể tải lịch sử đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Lỗi khi hủy");

      toast.success("Đã hủy đặt phòng");
      fetchBookings(); // Tải lại danh sách sau khi hủy
    } catch (error: any) {
      toast.error("Không thể hủy đặt phòng");
    }
  };

  const showQRCode = (booking: Booking) => {
    setSelectedBooking(booking);
    setQrDialogOpen(true);
  };

  const showDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      approved: { label: "Đã duyệt", variant: "default" as const, className: "bg-success hover:bg-success" },
      pending: { label: "Chờ duyệt", variant: "secondary" as const, className: "bg-warning text-warning-foreground hover:bg-warning" },
      rejected: { label: "Từ chối", variant: "destructive" as const, className: "" },
      cancelled: { label: "Đã hủy", variant: "outline" as const, className: "" },
    };
    const { label, variant, className } = config[status as keyof typeof config];
    return <Badge variant={variant} className={className}>{label}</Badge>;
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
          <h1 className="text-3xl font-bold mb-2">Lịch sử đặt phòng</h1>
          <p className="text-muted-foreground text-lg">Quản lý và theo dõi các đặt phòng của bạn</p>
        </div>

        <div className="space-y-4">
          {bookings.map((booking, idx) => (
            <Card
              key={booking.id}
              className="animate-slide-up hover:shadow-lg transition-all"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{booking.room.name}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(booking.booking_date), "dd/MM/yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {booking.slot_start.substring(0, 5)} - {booking.slot_end.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {booking.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => showQRCode(booking)}>
                        <QrCode className="h-4 w-4 mr-2" />
                        QR Code
                      </Button>
                    )}
                    {booking.status === "pending" && (
                      <Button size="sm" variant="destructive" onClick={() => handleCancel(booking.id)}>
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => showDetails(booking)}>
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bookings.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Chưa có đặt phòng nào</h3>
              <p className="text-muted-foreground mb-6">
                Bắt đầu đặt phòng để sử dụng các cơ sở vật chất của trường
              </p>
              <Button onClick={() => navigate("/booking")}>
                Đặt phòng ngay
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code Check-in</DialogTitle>
            <DialogDescription>
              Quét mã QR này để check-in vào phòng đã đặt
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
            {selectedBooking && (
              <QRCode value={selectedBooking.qr_code || selectedBooking.id} size={256} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết đặt phòng</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Phòng</p>
                <p className="font-semibold">{selectedBooking.room.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày</p>
                <p className="font-semibold">{format(new Date(selectedBooking.booking_date), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giờ</p>
                <p className="font-semibold">
                  {selectedBooking.slot_start.substring(0, 5)} - {selectedBooking.slot_end.substring(0, 5)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mục đích</p>
                <p className="font-semibold">{selectedBooking.purpose}</p>
              </div>
              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Ghi chú</p>
                  <p className="font-semibold">{selectedBooking.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;
