import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarCheck, UserPlus, ShoppingCart, MessageCircleQuestion, PhoneForwarded } from "lucide-react";
import { useKnowledgeItems } from "@/hooks/use-knowledge-items";

export interface ObjectivesData {
  objectives: string[];
  book_appointment: {
    services: string[];
    collect_fields: string[];
    calendar_type: string;
    confirm_readback: boolean;
  };
  generate_lead: {
    collect_fields: string[];
    qualifying_question: string;
    send_to_email: boolean;
    send_to_webhook: boolean;
  };
  take_order: {
    order_type: string;
    collect_fields: string[];
    readback_summary: boolean;
  };
  answer_questions: {
    use_faqs: boolean;
    collect_contact_at_end: boolean;
  };
  transfer_to_human: {
    when: string;
  };
}

export const DEFAULT_OBJECTIVES: ObjectivesData = {
  objectives: [],
  book_appointment: {
    services: [],
    collect_fields: ["name", "phone", "datetime"],
    calendar_type: "manual",
    confirm_readback: true,
  },
  generate_lead: {
    collect_fields: ["name", "phone"],
    qualifying_question: "",
    send_to_email: true,
    send_to_webhook: false,
  },
  take_order: {
    order_type: "both",
    collect_fields: ["items", "quantity", "name", "phone"],
    readback_summary: true,
  },
  answer_questions: {
    use_faqs: true,
    collect_contact_at_end: false,
  },
  transfer_to_human: {
    when: "after_qualification",
  },
};

interface Props {
  value: ObjectivesData;
  onChange: (v: ObjectivesData) => void;
  disabled?: boolean;
}

const OBJECTIVES_META = [
  { key: "book_appointment", icon: CalendarCheck, title: "Book Appointment", desc: "Let callers schedule appointments for your services" },
  { key: "generate_lead", icon: UserPlus, title: "Generate Lead", desc: "Capture contact info and qualify potential customers" },
  { key: "take_order", icon: ShoppingCart, title: "Take Order", desc: "Accept product or service orders over the phone" },
  { key: "answer_questions", icon: MessageCircleQuestion, title: "Answer Questions & Qualify", desc: "Use your knowledge base to answer caller questions" },
  { key: "transfer_to_human", icon: PhoneForwarded, title: "Transfer to Human", desc: "Route calls to a human agent when needed" },
] as const;

type ObjKey = typeof OBJECTIVES_META[number]["key"];

function CheckboxGroup({ options, selected, onChange, disabled }: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(o => (
        <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={selected.includes(o.value)}
            onCheckedChange={(checked) => {
              onChange(checked ? [...selected, o.value] : selected.filter(v => v !== o.value));
            }}
            disabled={disabled}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function BookAppointmentConfig({ value, onChange, disabled }: {
  value: ObjectivesData["book_appointment"];
  onChange: (v: ObjectivesData["book_appointment"]) => void;
  disabled?: boolean;
}) {
  const { data: services } = useKnowledgeItems("service");

  const collectOptions = [
    { value: "name", label: "Name" },
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "datetime", label: "Preferred Date/Time" },
  ];

  return (
    <div className="space-y-4 pt-3 border-t">
      {services && services.length > 0 && (
        <div>
          <Label className="text-xs">Which services to offer?</Label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {services.map(s => (
              <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={value.services.includes(s.id)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...value.services, s.id]
                      : value.services.filter(id => id !== s.id);
                    onChange({ ...value, services: next });
                  }}
                  disabled={disabled}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>
      )}
      <div>
        <Label className="text-xs">Collect from caller</Label>
        <div className="mt-1.5">
          <CheckboxGroup
            options={collectOptions}
            selected={value.collect_fields}
            onChange={f => onChange({ ...value, collect_fields: f })}
            disabled={disabled}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Calendar integration</Label>
        <Select value={value.calendar_type} onValueChange={v => onChange({ ...value, calendar_type: v })} disabled={disabled}>
          <SelectTrigger className="mt-1.5" disabled={disabled}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual (staff confirms later)</SelectItem>
            <SelectItem value="google_calendar">Google Calendar</SelectItem>
            <SelectItem value="calendly">Calendly URL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Read back booking details for confirmation?</Label>
        <Switch checked={value.confirm_readback} onCheckedChange={v => onChange({ ...value, confirm_readback: v })} disabled={disabled} />
      </div>
    </div>
  );
}

function GenerateLeadConfig({ value, onChange, disabled }: {
  value: ObjectivesData["generate_lead"];
  onChange: (v: ObjectivesData["generate_lead"]) => void;
  disabled?: boolean;
}) {
  const collectOptions = [
    { value: "name", label: "Name" },
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "interest", label: "Interest / Service Type" },
    { value: "budget", label: "Budget Range" },
    { value: "urgency", label: "Urgency" },
  ];

  return (
    <div className="space-y-4 pt-3 border-t">
      <div>
        <Label className="text-xs">What info to collect?</Label>
        <div className="mt-1.5">
          <CheckboxGroup
            options={collectOptions}
            selected={value.collect_fields}
            onChange={f => onChange({ ...value, collect_fields: f })}
            disabled={disabled}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Qualifying question</Label>
        <Input
          value={value.qualifying_question}
          onChange={e => onChange({ ...value, qualifying_question: e.target.value })}
          placeholder='e.g. "Are you looking for residential or commercial?"'
          className="mt-1.5"
          disabled={disabled}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Send lead to email</Label>
        <Switch checked={value.send_to_email} onCheckedChange={v => onChange({ ...value, send_to_email: v })} disabled={disabled} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Send lead to webhook</Label>
        <Switch checked={value.send_to_webhook} onCheckedChange={v => onChange({ ...value, send_to_webhook: v })} disabled={disabled} />
      </div>
    </div>
  );
}

function TakeOrderConfig({ value, onChange, disabled }: {
  value: ObjectivesData["take_order"];
  onChange: (v: ObjectivesData["take_order"]) => void;
  disabled?: boolean;
}) {
  const collectOptions = [
    { value: "items", label: "Items" },
    { value: "quantity", label: "Quantity" },
    { value: "name", label: "Name" },
    { value: "phone", label: "Phone" },
    { value: "address", label: "Delivery Address" },
  ];

  return (
    <div className="space-y-4 pt-3 border-t">
      <div>
        <Label className="text-xs">Order type</Label>
        <Select value={value.order_type} onValueChange={v => onChange({ ...value, order_type: v })} disabled={disabled}>
          <SelectTrigger className="mt-1.5" disabled={disabled}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="collection">Collection only</SelectItem>
            <SelectItem value="delivery">Delivery only</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Collect from caller</Label>
        <div className="mt-1.5">
          <CheckboxGroup
            options={collectOptions}
            selected={value.collect_fields}
            onChange={f => onChange({ ...value, collect_fields: f })}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Read back order summary?</Label>
        <Switch checked={value.readback_summary} onCheckedChange={v => onChange({ ...value, readback_summary: v })} disabled={disabled} />
      </div>
    </div>
  );
}

function AnswerQuestionsConfig({ value, onChange, disabled }: {
  value: ObjectivesData["answer_questions"];
  onChange: (v: ObjectivesData["answer_questions"]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4 pt-3 border-t">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Use FAQs from Knowledge Base</Label>
        <Switch checked={value.use_faqs} onCheckedChange={v => onChange({ ...value, use_faqs: v })} disabled={disabled} />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Always collect contact info at end of call</Label>
        <Switch checked={value.collect_contact_at_end} onCheckedChange={v => onChange({ ...value, collect_contact_at_end: v })} disabled={disabled} />
      </div>
    </div>
  );
}

function TransferConfig({ value, onChange, disabled }: {
  value: ObjectivesData["transfer_to_human"];
  onChange: (v: ObjectivesData["transfer_to_human"]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4 pt-3 border-t">
      <div>
        <Label className="text-xs">When to transfer</Label>
        <Select value={value.when} onValueChange={v => onChange({ ...value, when: v })} disabled={disabled}>
          <SelectTrigger className="mt-1.5" disabled={disabled}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="immediately">Immediately</SelectItem>
            <SelectItem value="after_qualification">After qualification</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">Transfer number is configured in the Escalation tab.</p>
      </div>
    </div>
  );
}

const CONFIG_MAP: Record<ObjKey, React.FC<{ value: any; onChange: (v: any) => void; disabled?: boolean }>> = {
  book_appointment: BookAppointmentConfig,
  generate_lead: GenerateLeadConfig,
  take_order: TakeOrderConfig,
  answer_questions: AnswerQuestionsConfig,
  transfer_to_human: TransferConfig,
};

function generateConversationStyle(data: ObjectivesData): string {
  if (data.objectives.length === 0) return "No objectives selected. Your AI will only greet callers and offer basic help.";

  const steps: string[] = ["greet the caller"];

  if (data.objectives.includes("answer_questions")) {
    steps.push("answer questions using your knowledge base");
  }
  if (data.objectives.includes("book_appointment")) {
    const svcCount = data.book_appointment.services.length;
    steps.push(`help them book an appointment${svcCount > 0 ? ` from ${svcCount} available service(s)` : ""}`);
  }
  if (data.objectives.includes("generate_lead")) {
    const fields = data.generate_lead.collect_fields.join(", ");
    steps.push(`qualify and capture lead info (${fields})`);
  }
  if (data.objectives.includes("take_order")) {
    steps.push(`take their order (${data.take_order.order_type})`);
  }
  if (data.objectives.includes("transfer_to_human")) {
    steps.push(`transfer to a human ${data.transfer_to_human.when === "immediately" ? "immediately if requested" : "after qualification"}`);
  }

  return `Your AI will: ${steps.join(" → ")}. It will handle these objectives in priority order based on the caller's needs.`;
}

export default function CallObjectives({ value, onChange, disabled }: Props) {
  const isEnabled = (key: string) => value.objectives.includes(key);

  const toggleObjective = (key: string, enabled: boolean) => {
    const next = enabled
      ? [...value.objectives, key]
      : value.objectives.filter(k => k !== key);
    onChange({ ...value, objectives: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Select what your AI agent should accomplish during calls. Enable objectives and configure each one.
        </p>
      </div>

      {OBJECTIVES_META.map(({ key, icon: Icon, title, desc }) => {
        const enabled = isEnabled(key);
        const ConfigComponent = CONFIG_MAP[key];

        return (
          <Card key={key} className={enabled ? "border-primary/40 bg-primary/[0.02]" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${enabled ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`h-4.5 w-4.5 ${enabled ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={v => toggleObjective(key, v)}
                  disabled={disabled}
                />
              </div>

              {enabled && (
                <div className="mt-4 ml-12">
                  <ConfigComponent
                    value={value[key as keyof ObjectivesData]}
                    onChange={(v: any) => onChange({ ...value, [key]: v })}
                    disabled={disabled}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* AI Conversation Style preview */}
      <Card className="bg-muted/50">
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Conversation Flow (auto-generated)</p>
          <p className="text-sm text-foreground italic">
            {generateConversationStyle(value)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
