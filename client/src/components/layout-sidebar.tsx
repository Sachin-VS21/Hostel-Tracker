import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  Megaphone, 
  Search, 
  LogOut, 
  Menu,
  X,
  User as UserIcon,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);

  const studentLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/report-issue", icon: PlusCircle, label: "Report Issue" },
    { href: "/issues", icon: ListTodo, label: "My Issues" },
    { href: "/announcements", icon: Megaphone, label: "Announcements" },
    { href: "/lost-found", icon: Search, label: "Lost & Found" },
  ];

  const adminLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Admin Dashboard" },
    { href: "/issues", icon: ListTodo, label: "Manage Issues" },
    { href: "/announcements", icon: Megaphone, label: "Announcements" },
    { href: "/lost-found", icon: Search, label: "Lost & Found" },
  ];

  const links = user?.role === "admin" ? adminLinks : studentLinks;

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold font-display text-primary flex items-center gap-2">
          <ShieldAlert className="h-8 w-8" />
          SmartHostel
        </h1>
        <div className="mt-4 flex items-center gap-3 p-3 bg-sidebar-accent/10 rounded-lg">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b px-4 flex items-center justify-between z-40">
        <h1 className="text-xl font-bold font-display text-primary flex items-center gap-2">
          <ShieldAlert className="h-6 w-6" />
          SmartHostel
        </h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 bg-sidebar border-r-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 flex-col border-r bg-sidebar z-30 shadow-xl shadow-black/5">
        <NavContent />
      </div>
    </>
  );
}
