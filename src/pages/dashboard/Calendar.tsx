import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { useBookings } from "@/hooks/use-bookings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

type View = "month" | "week";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");

  const monthStr = format(currentDate, "yyyy-MM");
  const { data: bookings = [] } = useBookings({ from: `${monthStr}-01`, to: `${monthStr}-31` });

  const prev = () => setCurrentDate((d) => (view === "month" ? subMonths(d, 1) : addDays(d, -7)));
  const next = () => setCurrentDate((d) => (view === "month" ? addMonths(d, 1) : addDays(d, 7)));

  const days = useMemo(() => {
    if (view === "month") {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const monthDays = eachDayOfInterval({ start, end });
      // Pad start
      const firstDow = start.getDay();
      const padStart = Array.from({ length: firstDow }, (_, i) => addDays(start, -(firstDow - i)));
      // Pad end to fill 6 rows (42 cells)
      const total = padStart.length + monthDays.length;
      const padEnd = Array.from({ length: Math.max(0, 42 - total) }, (_, i) => addDays(end, i + 1));
      return [...padStart, ...monthDays, ...padEnd];
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentDate, view]);

  const bookingsByDay = useMemo(() => {
    const map: Record<string, typeof bookings> = {};
    bookings.forEach((b) => {
      const key = format(new Date(b.start_at), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground">View your schedule at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>Month</Button>
          <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Week</Button>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {view === "month" ? format(currentDate, "MMMM yyyy") : `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d, yyyy")}`}
        </h2>
        <Button variant="outline" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {/* Grid */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div className={`grid grid-cols-7 ${view === "month" ? "grid-rows-6" : "grid-rows-1"}`}>
          {days.map((day, i) => {
            const key = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDay[key] ?? [];
            const inMonth = view === "month" ? isSameMonth(day, currentDate) : true;
            return (
              <div
                key={i}
                className={`min-h-[100px] border-b border-r p-1.5 ${!inMonth ? "bg-muted/30" : ""} ${isToday(day) ? "bg-primary/5" : ""}`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday(day) ? "text-primary" : inMonth ? "text-foreground" : "text-muted-foreground/50"}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary truncate"
                    >
                      {format(new Date(b.start_at), "h:mm a")} {b.customer?.full_name ?? "Booking"}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">+{dayBookings.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
