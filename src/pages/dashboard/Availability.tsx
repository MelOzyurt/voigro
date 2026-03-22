import { useState } from "react";
import { useAvailabilityRules, useUpsertAvailabilityRule, useAvailabilityOverrides, useUpsertAvailabilityOverride, useDeleteAvailabilityOverride } from "@/hooks/use-availability";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Availability() {
  const { data: rules = [], isLoading } = useAvailabilityRules();
  const upsertRule = useUpsertAvailabilityRule();
  const { data: overrides = [] } = useAvailabilityOverrides();
  const upsertOverride = useUpsertAvailabilityOverride();
  const deleteOverride = useDeleteAvailabilityOverride();

  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    date: undefined as Date | undefined,
    is_closed: true,
    start_time: "09:00",
    end_time: "17:00",
    reason: "",
  });

  // Build a full week view with defaults
  const weekSchedule = DAY_NAMES.map((name, i) => {
    const existing = rules.find((r) => r.day_of_week === i);
    return {
      day: i,
      name,
      start_time: existing?.start_time ?? "09:00",
      end_time: existing?.end_time ?? "17:00",
      slot_duration_minutes: existing?.slot_duration_minutes ?? 30,
      is_active: existing?.is_active ?? false,
    };
  });

  const handleToggleDay = (day: number, active: boolean) => {
    const existing = weekSchedule[day];
    upsertRule.mutate({
      day_of_week: day,
      start_time: existing.start_time,
      end_time: existing.end_time,
      slot_duration_minutes: existing.slot_duration_minutes,
      is_active: active,
    });
  };

  const handleTimeChange = (day: number, field: "start_time" | "end_time", value: string) => {
    const existing = weekSchedule[day];
    upsertRule.mutate({
      day_of_week: day,
      start_time: field === "start_time" ? value : existing.start_time,
      end_time: field === "end_time" ? value : existing.end_time,
      slot_duration_minutes: existing.slot_duration_minutes,
      is_active: existing.is_active,
    });
  };

  const handleSlotChange = (day: number, minutes: number) => {
    const existing = weekSchedule[day];
    upsertRule.mutate({
      day_of_week: day,
      start_time: existing.start_time,
      end_time: existing.end_time,
      slot_duration_minutes: minutes,
      is_active: existing.is_active,
    });
  };

  const handleAddOverride = () => {
    if (!overrideForm.date) return;
    upsertOverride.mutate(
      {
        override_date: format(overrideForm.date, "yyyy-MM-dd"),
        is_closed: overrideForm.is_closed,
        start_time: overrideForm.is_closed ? undefined : overrideForm.start_time,
        end_time: overrideForm.is_closed ? undefined : overrideForm.end_time,
        reason: overrideForm.reason || undefined,
      },
      { onSuccess: () => { setOverrideDialogOpen(false); setOverrideForm({ date: undefined, is_closed: true, start_time: "09:00", end_time: "17:00", reason: "" }); } }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Availability</h1>
        <p className="text-sm text-muted-foreground">Set your weekly schedule and date-specific overrides</p>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Weekly Schedule</h2>
        <div className="rounded-xl border bg-card divide-y">
          {weekSchedule.map((day) => (
            <div key={day.day} className="flex items-center gap-4 px-4 py-3">
              <div className="w-28">
                <span className={`text-sm font-medium ${day.is_active ? "text-foreground" : "text-muted-foreground"}`}>{day.name}</span>
              </div>
              <Switch checked={day.is_active} onCheckedChange={(v) => handleToggleDay(day.day, v)} />
              {day.is_active ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    className="w-[120px]"
                    value={day.start_time}
                    onChange={(e) => handleTimeChange(day.day, "start_time", e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="time"
                    className="w-[120px]"
                    value={day.end_time}
                    onChange={(e) => handleTimeChange(day.day, "end_time", e.target.value)}
                  />
                  <div className="flex items-center gap-1.5 ml-4">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="number"
                      className="w-[70px]"
                      value={day.slot_duration_minutes}
                      onChange={(e) => handleSlotChange(day.day, parseInt(e.target.value) || 30)}
                      min={5}
                      max={240}
                    />
                    <span className="text-xs text-muted-foreground">min slots</span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overrides */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Date Overrides</h2>
          <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Add Override</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Date Override</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full mt-1.5 justify-start text-left", !overrideForm.date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {overrideForm.date ? format(overrideForm.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={overrideForm.date} onSelect={(d) => setOverrideForm((p) => ({ ...p, date: d }))} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={overrideForm.is_closed} onCheckedChange={(v) => setOverrideForm((p) => ({ ...p, is_closed: v }))} />
                  <Label>Closed all day</Label>
                </div>
                {!overrideForm.is_closed && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Start</Label>
                      <Input type="time" className="mt-1.5" value={overrideForm.start_time} onChange={(e) => setOverrideForm((p) => ({ ...p, start_time: e.target.value }))} />
                    </div>
                    <div>
                      <Label>End</Label>
                      <Input type="time" className="mt-1.5" value={overrideForm.end_time} onChange={(e) => setOverrideForm((p) => ({ ...p, end_time: e.target.value }))} />
                    </div>
                  </div>
                )}
                <div>
                  <Label>Reason (optional)</Label>
                  <Input className="mt-1.5" value={overrideForm.reason} onChange={(e) => setOverrideForm((p) => ({ ...p, reason: e.target.value }))} placeholder="e.g. Holiday, Staff training" />
                </div>
                <Button className="w-full" onClick={handleAddOverride} disabled={!overrideForm.date || upsertOverride.isPending}>
                  {upsertOverride.isPending ? "Saving..." : "Save Override"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overrides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No overrides set</TableCell>
                </TableRow>
              ) : (
                overrides.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{format(new Date(o.override_date + "T00:00"), "MMM d, yyyy (EEEE)")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={o.is_closed ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}>
                        {o.is_closed ? "Closed" : "Modified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.is_closed ? "—" : `${o.start_time} – ${o.end_time}`}</TableCell>
                    <TableCell className="text-muted-foreground">{o.reason ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteOverride.mutate(o.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
