import { Checkbox } from "@/components/ui/checkbox";
import { Phone, CalendarDays, Globe, Users, Megaphone, Bot } from "lucide-react";
import type { ModuleKey } from "@/hooks/use-modules";

interface ModuleOption {
  key: ModuleKey;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  core?: boolean;
  comingSoon?: boolean;
}

const modules: ModuleOption[] = [
  {
    key: "voice_agent",
    label: "AI Voice Assistant",
    desc: "Automated call handling, transcripts, and actions",
    icon: Phone,
    core: true,
  },
  {
    key: "booking",
    label: "Booking System",
    desc: "Online appointment scheduling and management",
    icon: CalendarDays,
  },
  {
    key: "calendar",
    label: "Calendar & Availability",
    desc: "Manage staff schedules and availability rules",
    icon: CalendarDays,
  },
  {
    key: "public_booking_page",
    label: "Public Booking Page",
    desc: "Let customers book directly from your website",
    icon: Globe,
  },
  {
    key: "crm",
    label: "Customer CRM",
    desc: "Track customers, history, and contact info",
    icon: Users,
  },
  {
    key: "marketing",
    label: "Marketing Tools",
    desc: "Promotions, campaigns, and reminders",
    icon: Megaphone,
    comingSoon: true,
  },
];

interface ModuleSelectionProps {
  selected: ModuleKey[];
  onToggle: (key: ModuleKey) => void;
}

export default function ModuleSelection({ selected, onToggle }: ModuleSelectionProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose the modules you'd like to activate. You can always enable more later from Settings.
      </p>
      <div className="space-y-2">
        {modules.map((mod) => {
          const isSelected = selected.includes(mod.key);
          const Icon = mod.icon;
          return (
            <label
              key={mod.key}
              className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                mod.core
                  ? "border-primary/30 bg-primary/5"
                  : isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : mod.comingSoon
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/50"
              }`}
            >
              <Checkbox
                checked={isSelected}
                disabled={mod.core || mod.comingSoon}
                onCheckedChange={() => {
                  if (!mod.core && !mod.comingSoon) onToggle(mod.key);
                }}
              />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-4 w-4 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{mod.label}</span>
                  {mod.core && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      Core
                    </span>
                  )}
                  {mod.comingSoon && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{mod.desc}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
