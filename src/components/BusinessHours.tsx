import { useState, useEffect, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, Copy, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// ── Types ──────────────────────────────────────────────────────────

interface DaySchedule {
  open: boolean;
  from: string;
  to: string;
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface PublicHolidays {
  enabled: boolean;
  country: string;
  closed_on_holidays: boolean;
}

interface CustomClosure {
  id: string;
  date: string;
  endDate?: string;
  label: string;
  allDay: boolean;
  from?: string;
  to?: string;
}

interface CustomOpening {
  id: string;
  date: string;
  label: string;
  from: string;
  to: string;
}

export interface BusinessHoursData {
  timezone: string;
  weekly_schedule: WeeklySchedule;
  public_holidays: PublicHolidays;
  custom_closures: CustomClosure[];
  custom_openings: CustomOpening[];
}

interface BusinessHoursProps {
  value: BusinessHoursData;
  onChange: (data: BusinessHoursData) => void;
}

// ── Constants ──────────────────────────────────────────────────────

const DAYS: (keyof WeeklySchedule)[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

const DAY_LABELS: Record<keyof WeeklySchedule, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of ["00", "30"]) {
    TIME_SLOTS.push(`${String(h).padStart(2, "0")}:${m}`);
  }
}

const TIMEZONE_OPTIONS = [
  { value: "UTC+0", label: "UTC+0 — GMT (UK Standard)" },
  { value: "UTC+1", label: "UTC+1 — BST / CET" },
  { value: "UTC+2", label: "UTC+2 — EET / South Africa" },
  { value: "UTC+3", label: "UTC+3 — MSK / Turkey" },
  { value: "UTC+4", label: "UTC+4 — GST / UAE" },
  { value: "UTC+5", label: "UTC+5 — PKT" },
  { value: "UTC+5:30", label: "UTC+5:30 — IST (India)" },
  { value: "UTC+6", label: "UTC+6 — BST (Bangladesh)" },
  { value: "UTC+7", label: "UTC+7 — ICT (Indochina)" },
  { value: "UTC+8", label: "UTC+8 — CST (China / Singapore)" },
  { value: "UTC+9", label: "UTC+9 — JST (Japan / Korea)" },
  { value: "UTC+10", label: "UTC+10 — AEST (Australia East)" },
  { value: "UTC+11", label: "UTC+11 — AEDT" },
  { value: "UTC+12", label: "UTC+12 — NZST (New Zealand)" },
  { value: "UTC-5", label: "UTC-5 — EST (US Eastern)" },
  { value: "UTC-6", label: "UTC-6 — CST (US Central)" },
  { value: "UTC-7", label: "UTC-7 — MST (US Mountain)" },
  { value: "UTC-8", label: "UTC-8 — PST (US Pacific)" },
];

const COUNTRY_OPTIONS = [
  { value: "GB", label: "United Kingdom" },
  { value: "TR", label: "Turkey" },
  { value: "US", label: "United States" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "AE", label: "United Arab Emirates" },
];

// ── Helpers ────────────────────────────────────────────────────────

function parseUtcOffset(tz: string): number {
  const match = tz.match(/^UTC([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3] || "0", 10);
  return sign * (hours * 60 + minutes);
}

function getCurrentTimeInOffset(offsetMinutes: number): string {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utcMs + offsetMinutes * 60000);
  return local.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatTime12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

export function generateBusinessHoursSummary(data: BusinessHoursData): string {
  const parts: string[] = [];
  const { weekly_schedule, timezone, public_holidays, custom_closures, custom_openings } = data;

  // Group days by schedule
  const groups: { days: string[]; from: string; to: string }[] = [];
  let closedDays: string[] = [];

  for (const day of DAYS) {
    const s = weekly_schedule[day];
    if (!s.open) {
      closedDays.push(DAY_LABELS[day]);
      continue;
    }
    const last = groups[groups.length - 1];
    if (last && last.from === s.from && last.to === s.to) {
      last.days.push(DAY_LABELS[day]);
    } else {
      groups.push({ days: [DAY_LABELS[day]], from: s.from, to: s.to });
    }
  }

  for (const g of groups) {
    const dayRange = g.days.length > 2
      ? `${g.days[0]} to ${g.days[g.days.length - 1]}`
      : g.days.join(" and ");
    parts.push(`Open ${dayRange} ${formatTime12(g.from)}–${formatTime12(g.to)} (${timezone}).`);
  }

  if (closedDays.length > 0) {
    parts.push(`Closed ${closedDays.join(" and ")}.`);
  }

  if (public_holidays.enabled && public_holidays.closed_on_holidays) {
    const countryLabel = COUNTRY_OPTIONS.find(c => c.value === public_holidays.country)?.label || public_holidays.country;
    parts.push(`Automatically closed on ${countryLabel} public holidays.`);
  }

  if (custom_closures.length > 0) {
    const closureTexts = custom_closures.map(c => {
      const dateStr = format(new Date(c.date), "d MMM yyyy");
      return `${dateStr} (${c.label})`;
    });
    parts.push(`Additional closures: ${closureTexts.join(", ")}.`);
  }

  if (custom_openings.length > 0) {
    const openingTexts = custom_openings.map(o => {
      const dateStr = format(new Date(o.date), "d MMM yyyy");
      return `${dateStr} ${formatTime12(o.from)}–${formatTime12(o.to)} (${o.label})`;
    });
    parts.push(`Special openings: ${openingTexts.join(", ")}.`);
  }

  return parts.join("\n");
}

// ── Time Select ────────────────────────────────────────────────────

function TimeSelect({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {TIME_SLOTS.map(t => (
          <SelectItem key={t} value={t}>{t}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export default function BusinessHours({ value, onChange }: BusinessHoursProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [showClosureForm, setShowClosureForm] = useState(false);
  const [showOpeningForm, setShowOpeningForm] = useState(false);

  // Closure form state
  const [closureDate, setClosureDate] = useState<Date>();
  const [closureLabel, setClosureLabel] = useState("");
  const [closureAllDay, setClosureAllDay] = useState(true);
  const [closureFrom, setClosureFrom] = useState("09:00");
  const [closureTo, setClosureTo] = useState("17:00");

  // Opening form state
  const [openingDate, setOpeningDate] = useState<Date>();
  const [openingLabel, setOpeningLabel] = useState("");
  const [openingFrom, setOpeningFrom] = useState("09:00");
  const [openingTo, setOpeningTo] = useState("17:00");

  const offsetMinutes = useMemo(() => parseUtcOffset(value.timezone), [value.timezone]);

  useEffect(() => {
    const update = () => setCurrentTime(getCurrentTimeInOffset(offsetMinutes));
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [offsetMinutes]);

  const updateSchedule = useCallback((day: keyof WeeklySchedule, patch: Partial<DaySchedule>) => {
    onChange({
      ...value,
      weekly_schedule: {
        ...value.weekly_schedule,
        [day]: { ...value.weekly_schedule[day], ...patch },
      },
    });
  }, [value, onChange]);

  const copyMondayToWeekdays = useCallback(() => {
    const mon = value.weekly_schedule.monday;
    onChange({
      ...value,
      weekly_schedule: {
        ...value.weekly_schedule,
        tuesday: { ...mon },
        wednesday: { ...mon },
        thursday: { ...mon },
        friday: { ...mon },
      },
    });
  }, [value, onChange]);

  const addClosure = useCallback(() => {
    if (!closureDate || !closureLabel.trim()) return;
    if (value.custom_closures.length >= 50) return;
    const newClosure: CustomClosure = {
      id: crypto.randomUUID(),
      date: closureDate.toISOString(),
      label: closureLabel.trim(),
      allDay: closureAllDay,
      ...(closureAllDay ? {} : { from: closureFrom, to: closureTo }),
    };
    onChange({ ...value, custom_closures: [...value.custom_closures, newClosure] });
    setClosureDate(undefined);
    setClosureLabel("");
    setClosureAllDay(true);
    setShowClosureForm(false);
  }, [closureDate, closureLabel, closureAllDay, closureFrom, closureTo, value, onChange]);

  const removeClosure = useCallback((id: string) => {
    onChange({ ...value, custom_closures: value.custom_closures.filter(c => c.id !== id) });
  }, [value, onChange]);

  const addOpening = useCallback(() => {
    if (!openingDate || !openingLabel.trim()) return;
    const newOpening: CustomOpening = {
      id: crypto.randomUUID(),
      date: openingDate.toISOString(),
      label: openingLabel.trim(),
      from: openingFrom,
      to: openingTo,
    };
    onChange({ ...value, custom_openings: [...value.custom_openings, newOpening] });
    setOpeningDate(undefined);
    setOpeningLabel("");
    setShowOpeningForm(false);
  }, [openingDate, openingLabel, openingFrom, openingTo, value, onChange]);

  const removeOpening = useCallback((id: string) => {
    onChange({ ...value, custom_openings: value.custom_openings.filter(o => o.id !== id) });
  }, [value, onChange]);

  const summary = useMemo(() => generateBusinessHoursSummary(value), [value]);

  return (
    <div className="space-y-6">
      {/* ── Weekly Schedule ──────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Weekly Schedule</Label>
          <Button variant="ghost" size="sm" onClick={copyMondayToWeekdays} className="text-xs gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy Mon → Weekdays
          </Button>
        </div>

        <div className="space-y-2">
          {DAYS.map(day => {
            const s = value.weekly_schedule[day];
            return (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border p-3"
              >
                <span className="w-24 text-sm font-medium text-foreground shrink-0">
                  {DAY_LABELS[day]}
                </span>
                <Switch
                  checked={s.open}
                  onCheckedChange={open => updateSchedule(day, { open })}
                />
                {s.open ? (
                  <div className="flex items-center gap-2">
                    <TimeSelect value={s.from} onChange={from => updateSchedule(day, { from })} />
                    <span className="text-xs text-muted-foreground">to</span>
                    <TimeSelect value={s.to} onChange={to => updateSchedule(day, { to })} />
                  </div>
                ) : (
                  <Badge variant="secondary" className="w-fit">Closed</Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Timezone ─────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Timezone</Label>
        <div className="flex items-center gap-3">
          <Select
            value={value.timezone}
            onValueChange={tz => onChange({ ...value, timezone: tz })}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map(tz => (
                <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentTime && (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Now: {currentTime}
            </span>
          )}
        </div>
      </div>

      {/* ── Public Holidays ──────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Public Holidays</Label>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Automatically closed on public holidays</p>
            <p className="text-xs text-muted-foreground">Your AI will use after-hours greeting on these days</p>
          </div>
          <Switch
            checked={value.public_holidays.enabled}
            onCheckedChange={enabled =>
              onChange({ ...value, public_holidays: { ...value.public_holidays, enabled } })
            }
          />
        </div>
        {value.public_holidays.enabled && (
          <>
            <div>
              <Label className="text-xs">Country</Label>
              <Select
                value={value.public_holidays.country}
                onValueChange={country =>
                  onChange({ ...value, public_holidays: { ...value.public_holidays, country } })
                }
              >
                <SelectTrigger className="mt-1 w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
              Your AI will automatically treat public holidays as closed days and use your after-hours greeting.
            </p>
          </>
        )}
      </div>

      {/* ── Custom Closures ──────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Custom Closures</Label>
          {!showClosureForm && value.custom_closures.length < 50 && (
            <Button variant="ghost" size="sm" onClick={() => setShowClosureForm(true)} className="text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Closure
            </Button>
          )}
        </div>

        {showClosureForm && (
          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <Label className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("mt-1 w-full max-w-xs justify-start text-left font-normal", !closureDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {closureDate ? format(closureDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={closureDate} onSelect={setClosureDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">Label</Label>
              <Input className="mt-1 max-w-xs" placeholder="e.g. Staff training day" value={closureLabel} onChange={e => setClosureLabel(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={closureAllDay} onCheckedChange={setClosureAllDay} />
              <span className="text-sm text-foreground">All day</span>
            </div>
            {!closureAllDay && (
              <div className="flex items-center gap-2">
                <TimeSelect value={closureFrom} onChange={setClosureFrom} />
                <span className="text-xs text-muted-foreground">to</span>
                <TimeSelect value={closureTo} onChange={setClosureTo} />
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={addClosure} disabled={!closureDate || !closureLabel.trim()}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowClosureForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {value.custom_closures.length > 0 && (
          <div className="space-y-1.5">
            {value.custom_closures.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm text-foreground">
                  {format(new Date(c.date), "d MMM yyyy")}
                  {!c.allDay && c.from && c.to && `, ${c.from}–${c.to}`}
                  {" — "}{c.label}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeClosure(c.id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Custom Openings ──────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Special Openings</Label>
          {!showOpeningForm && (
            <Button variant="ghost" size="sm" onClick={() => setShowOpeningForm(true)} className="text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Special Opening
            </Button>
          )}
        </div>

        {showOpeningForm && (
          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <Label className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("mt-1 w-full max-w-xs justify-start text-left font-normal", !openingDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {openingDate ? format(openingDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={openingDate} onSelect={setOpeningDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs">Label</Label>
              <Input className="mt-1 max-w-xs" placeholder="e.g. Bank Holiday special hours" value={openingLabel} onChange={e => setOpeningLabel(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <TimeSelect value={openingFrom} onChange={setOpeningFrom} />
              <span className="text-xs text-muted-foreground">to</span>
              <TimeSelect value={openingTo} onChange={setOpeningTo} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addOpening} disabled={!openingDate || !openingLabel.trim()}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowOpeningForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {value.custom_openings.length > 0 && (
          <div className="space-y-1.5">
            {value.custom_openings.map(o => (
              <div key={o.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm text-foreground">
                  {format(new Date(o.date), "d MMM yyyy")}, {o.from}–{o.to} — {o.label}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeOpening(o.id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── AI Summary ───────────────────────────────── */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm font-medium px-3">
            Preview: What your AI sees
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="rounded-lg bg-muted/50 p-4 mt-2">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {summary}
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
