import { useState } from "react";
import { format } from "date-fns";
import { useBookings, useCreateBooking, useUpdateBooking } from "@/hooks/use-bookings";
import { useCustomers } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Plus, Search, X, CheckCircle, Clock, Ban } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  no_show: "bg-muted text-muted-foreground border-border",
};

const statusIcons: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle className="h-3 w-3" />,
  pending: <Clock className="h-3 w-3" />,
  cancelled: <Ban className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
};

export default function Bookings() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: bookings = [], isLoading } = useBookings(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const { data: customers = [] } = useCustomers();
  const createBooking = useCreateBooking();

  const [form, setForm] = useState({
    customer_id: "",
    start_at: "",
    end_at: "",
    notes: "",
    source: "manual",
  });

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const name = b.customer?.full_name?.toLowerCase() ?? "";
    const svc = b.service?.name?.toLowerCase() ?? "";
    return name.includes(search.toLowerCase()) || svc.includes(search.toLowerCase());
  });

  const handleCreate = () => {
    if (!form.start_at || !form.end_at) {
      toast.error("Start and end time required");
      return;
    }
    createBooking.mutate(
      {
        customer_id: form.customer_id || null,
        start_at: form.start_at,
        end_at: form.end_at,
        notes: form.notes || undefined,
        source: form.source,
      },
      { onSuccess: () => { setDialogOpen(false); setForm({ customer_id: "", start_at: "", end_at: "", notes: "", source: "manual" }); } }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground">Manage appointments and reservations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Booking</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Booking</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Customer</Label>
                <Select value={form.customer_id} onValueChange={(v) => setForm((p) => ({ ...p, customer_id: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select customer (optional)" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start</Label>
                  <Input type="datetime-local" className="mt-1.5" value={form.start_at} onChange={(e) => setForm((p) => ({ ...p, start_at: e.target.value }))} />
                </div>
                <div>
                  <Label>End</Label>
                  <Input type="datetime-local" className="mt-1.5" value={form.end_at} onChange={(e) => setForm((p) => ({ ...p, end_at: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea className="mt-1.5" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." rows={2} />
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={createBooking.isPending}>
                {createBooking.isPending ? "Creating..." : "Create Booking"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search bookings..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Calendar className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No bookings found</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => {
                const start = new Date(b.start_at);
                const end = new Date(b.end_at);
                const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.customer?.full_name ?? "Walk-in"}</TableCell>
                    <TableCell>{b.service?.name ?? "—"}</TableCell>
                    <TableCell>
                      <div className="text-sm">{format(start, "MMM d, yyyy")}</div>
                      <div className="text-xs text-muted-foreground">{format(start, "h:mm a")} – {format(end, "h:mm a")}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{durationMin} min</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[b.status] ?? ""}>
                        {statusIcons[b.status]} {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">{b.source.replace("_", " ")}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
