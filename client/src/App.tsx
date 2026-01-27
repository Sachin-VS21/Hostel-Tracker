import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout-sidebar";
import { Loader2 } from "lucide-react";

// Pages
import AuthPage from "@/pages/auth-page";
import StudentDashboard from "@/pages/student-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ReportIssue from "@/pages/report-issue";
import IssuesList from "@/pages/issues-list";
import IssueDetail from "@/pages/issue-detail";
import Announcements from "@/pages/announcements";
import LostFoundPage from "@/pages/lost-found";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType<any>, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized
    if (user.role === "admin") setLocation("/admin");
    else setLocation("/dashboard");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:pl-72">
        <div className="container max-w-7xl mx-auto p-4 md:p-8 pt-20 lg:pt-8">
           <Component />
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      
      {/* Student Routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>
      <Route path="/report-issue">
        {() => <ProtectedRoute component={ReportIssue} allowedRoles={["student"]} />}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>

      {/* Shared Routes */}
      <Route path="/issues">
        {() => <ProtectedRoute component={IssuesList} />}
      </Route>
      <Route path="/issues/:id">
        {() => <ProtectedRoute component={IssueDetail} />}
      </Route>
      <Route path="/announcements">
        {() => <ProtectedRoute component={Announcements} />}
      </Route>
      <Route path="/lost-found">
        {() => <ProtectedRoute component={LostFoundPage} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
