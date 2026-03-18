import {
  Phone, LayoutDashboard, Bot, PhoneCall, FileText,
  Briefcase, ShoppingCart, HelpCircle, CreditCard,
  LifeBuoy, Settings, ChevronLeft, PhoneForwarded,
  ClipboardList
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainNav = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Agent", url: "/dashboard/agent", icon: Bot },
  { title: "Phone Setup", url: "/dashboard/phone", icon: PhoneForwarded },
  { title: "Calls", url: "/dashboard/calls", icon: PhoneCall },
  { title: "Transcripts", url: "/dashboard/transcripts", icon: FileText },
  { title: "Actions", url: "/dashboard/actions", icon: ClipboardList },
];

const configNav = [
  { title: "Services", url: "/dashboard/services", icon: Briefcase },
  { title: "Products", url: "/dashboard/products", icon: ShoppingCart },
  { title: "FAQs", url: "/dashboard/faqs", icon: HelpCircle },
];

const accountNav = [
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Support", url: "/dashboard/support", icon: LifeBuoy },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const renderGroup = (label: string, items: typeof mainNav) => (
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

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Phone className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && <span className="font-display text-lg font-bold text-sidebar-foreground">{!collapsed && <span className="font-display text-lg font-bold text-sidebar-foreground">Callio</span>}</span>}
      </div>
      <SidebarContent className="px-2">
        {renderGroup("Main", mainNav)}
        {renderGroup("Knowledge Base", configNav)}
        {renderGroup("Account", accountNav)}
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground">
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
