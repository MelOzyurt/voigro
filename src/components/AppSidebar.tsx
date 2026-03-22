import {
  Phone, LayoutDashboard, Bot, PhoneCall, FileText,
  Briefcase, ShoppingCart, HelpCircle, CreditCard,
  LifeBuoy, Settings, ChevronLeft, PhoneForwarded,
  ClipboardList, LogOut, ChevronDown,
  CalendarDays, Users, Globe, Megaphone,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useOrganization, useCurrentUser } from "@/hooks/use-organization";
import { useEnabledModules, type ModuleKey } from "@/hooks/use-modules";
import { supabase } from "@/integrations/supabase/client";

/* ─── nav item with optional module requirement ─── */
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: ModuleKey;
}

const mainNav: NavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Phone Setup", url: "/dashboard/phone", icon: PhoneForwarded, module: "voice_agent" },
  { title: "Calls", url: "/dashboard/calls", icon: PhoneCall, module: "voice_agent" },
  { title: "Transcripts", url: "/dashboard/transcripts", icon: FileText, module: "voice_agent" },
  { title: "Actions", url: "/dashboard/actions", icon: ClipboardList, module: "voice_agent" },
];

const agentSubNav: NavItem[] = [
  { title: "Configuration", url: "/dashboard/agent", icon: Bot },
  { title: "Services", url: "/dashboard/services", icon: Briefcase },
  { title: "Products", url: "/dashboard/products", icon: ShoppingCart },
  { title: "FAQs", url: "/dashboard/faqs", icon: HelpCircle },
];

const bookingNav: NavItem[] = [
  { title: "Bookings", url: "/dashboard/bookings", icon: CalendarDays },
  { title: "Calendar", url: "/dashboard/calendar", icon: CalendarDays },
  { title: "Customers", url: "/dashboard/customers", icon: Users },
  { title: "Availability", url: "/dashboard/availability", icon: CalendarDays },
];

const marketingNav: NavItem[] = [
  { title: "Marketing", url: "/dashboard/marketing", icon: Megaphone },
];

const accountNav: NavItem[] = [
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Support", url: "/dashboard/support", icon: LifeBuoy },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { data: org } = useOrganization();
  const { data: profile } = useCurrentUser();
  const enabledModules = useEnabledModules();
  const navigate = useNavigate();
  const location = useLocation();

  const orgName = org?.name ?? "My Business";
  const orgLogo = org?.logo_url ?? null;

  const userInitials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isEnabled = (mod?: ModuleKey) => !mod || enabledModules.includes(mod);
  const filterItems = (items: NavItem[]) => items.filter((i) => isEnabled(i.module));

  const filteredMain = filterItems(mainNav);

  const renderGroup = (label: string, items: NavItem[]) => {
    if (items.length === 0) return null;
    return (
      <SidebarGroup>
        {!collapsed && <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider">{label}</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end={item.url === "/dashboard"}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  const renderCollapsibleGroup = (label: string, icon: React.ComponentType<{ className?: string }>, items: NavItem[], pathPrefixes: string[]) => {
    if (items.length === 0) return null;
    const Icon = icon;
    const isOpen = pathPrefixes.some((p) => location.pathname.startsWith(p));

    return (
      <SidebarGroup>
        {!collapsed ? (
          <Collapsible defaultOpen={isOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu className="ml-4 border-l border-sidebar-border pl-2 mt-1">
                {items.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SidebarMenu>
            {items.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarGroup>
    );
  };

  const showVoiceAgent = isEnabled("voice_agent");
  const showBooking = isEnabled("booking");
  const showMarketing = isEnabled("marketing");

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex h-16 items-center gap-3 px-4">
        {orgLogo ? (
          <img src={orgLogo} alt={orgName} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Phone className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
        )}
        {!collapsed && (
          <span className="font-display text-lg font-bold text-sidebar-foreground truncate">
            {orgName}
          </span>
        )}
      </div>
      <SidebarContent className="px-2">
        {renderGroup("Main", filteredMain)}

        {showVoiceAgent && renderCollapsibleGroup("Agent", Bot, agentSubNav, ["/dashboard/agent", "/dashboard/services", "/dashboard/products", "/dashboard/faqs"])}

        {showBooking && renderCollapsibleGroup("Booking", CalendarDays, bookingNav, ["/dashboard/bookings", "/dashboard/calendar", "/dashboard/customers", "/dashboard/availability"])}

        {showMarketing && renderGroup("Marketing", marketingNav)}

        {renderGroup("Account", accountNav)}
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">{profile?.full_name || "User"}</p>
              <p className="truncate text-[10px] text-sidebar-foreground/50">{profile?.email}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground">
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
