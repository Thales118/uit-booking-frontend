import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Calendar, Clock, QrCode, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import { api } from "@/lib/api-config"; // <--- QUAN TRỌNG: Import cái này

interface Booking {
  id: string;
  booking_date: string;
  slot_start: string;
  slot_end: string;
  status: string;
  purpose: string;
  notes: string | null;
  qr_code: string | null;
  room: { name: string; type: string };
}

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Dùng api() thay vì fetch localhost
      // Nó sẽ tự động dùng đường dẫn đúng nhờ file config
      const data = await api("/api/bookings");
      setBookings(data || []);
    } catch (error: any) {
      toast.error("Không thể tải lịch sử đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đặt phòng này?")) return;
    try {
      await api(`/api/bookings/${bookingId}/cancel`, { method: "PATCH" });
      toast.success("Đã hủy đặt phòng");
      fetchBookings();
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
      approved: { label: "Đã duyệt", variant: "default" as const, className: "bg-green-600 hover:bg-green-700" },
      pending: { label: "Chờ duyệt", variant: "secondary" as const, className: "bg-yellow-500 text-white hover:bg-yellow-600" },
      rejected: { label: "Từ chối", variant: "destructive" as const, className: "" },
      cancelled: { label: "Đã hủy", variant: "outline" as const, className: "text-gray-500" },
    };
    // @ts-ignore
    const s = config[status] || config.pending;
    return <Badge variant={s.variant} className={s.className}>{s.label}</Badge>;
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lịch sử đặt phòng</h1>
          <p className="text-muted-foreground text-lg">Quản lý các đặt phòng của bạn</p>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-all">
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
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{format(new Date(booking.booking_date), "dd/MM/yyyy")}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{booking.slot_start.slice(0,5)} - {booking.slot_end.slice(0,5)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {booking.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => showQRCode(booking)}><QrCode className="h-4 w-4 mr-2" />QR Code</Button>
                    )}
                    {booking.status === "pending" && (
                      <Button size="sm" variant="destructive" onClick={() => handleCancel(booking.id)}><X className="h-4 w-4 mr-2" />Hủy</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => showDetails(booking)}>Chi tiết</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {bookings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed">
            <p className="text-muted-foreground mb-4">Chưa có đặt phòng nào</p>
            <Button onClick={() => navigate("/booking")}>Đặt phòng ngay</Button>
          </div>
        )}
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>QR Check-in</DialogTitle><DialogDescription>Đưa mã này cho quản lý</DialogDescription></DialogHeader>
          <div className="flex justify-center p-4 bg-white rounded"><QRCode value={selectedBooking ? `http://18.138.231.216/verify/${selectedBooking.id}` : ""} size={200} /></div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Chi tiết</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="space-y-2 text-sm">
               <p><strong>Phòng:</strong> {selectedBooking.room.name}</p>
               <p><strong>Mục đích:</strong> {selectedBooking.purpose}</p>
               {selectedBooking.notes && <p><strong>Ghi chú:</strong> {selectedBooking.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;