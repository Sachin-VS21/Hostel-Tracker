import { useAuth } from "@/hooks/use-auth";
import { useIssues } from "@/hooks/use-issues";
import { useAnnouncements } from "@/hooks/use-announcements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: issues } = useIssues();
  const { data: announcements } = useAnnouncements();

  // Filter issues for current student
  const myIssues = issues?.filter(i => i.reporterId === user?.id) || [];
  const pending = myIssues.filter(i => i.status !== "Resolved").length;
  const resolved = myIssues.filter(i => i.status === "Resolved").length;
  
  // Get recent 3 issues
  const recentIssues = [...myIssues].sort((a, b) => 
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  ).slice(0, 3);

  // Get urgent announcements
  const urgentAnnouncements = announcements?.filter(a => a.urgent).slice(0, 2) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}. Here's what's happening.</p>
        </div>
        <Link href="/report-issue">
          <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Report New Issue
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reported</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myIssues.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Issues submitted this semester</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Issues being worked on</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resolved}</div>
            <p className="text-xs text-muted-foreground mt-1">Issues fixed successfully</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Recent Activity</h2>
            <Link href="/issues" className="text-sm text-primary font-medium hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentIssues.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                <p>No issues reported yet. Everything looks good!</p>
              </Card>
            ) : (
              recentIssues.map(issue => (
                <Link key={issue.id} href={`/issues/${issue.id}`} className="block group">
                  <Card className="hover:shadow-md transition-all border-l-4 border-l-transparent group-hover:border-l-primary">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{issue.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{format(new Date(issue.createdAt!), "MMM d, yyyy")}</span>
                            <span>•</span>
                            <span>{issue.category}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={issue.status} />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Urgent Announcements */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Announcements</h2>
            <Link href="/announcements" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
             {urgentAnnouncements.length === 0 && (
               <Card className="p-6 text-center text-sm text-muted-foreground border-dashed">
                 No urgent announcements.
               </Card>
             )}
             {urgentAnnouncements.map(announcement => (
               <Card key={announcement.id} className="border-red-100 bg-red-50/50">
                 <CardHeader className="pb-2">
                   <div className="flex justify-between items-start">
                     <span className="text-xs font-bold text-red-600 px-2 py-0.5 bg-red-100 rounded-full">URGENT</span>
                     <span className="text-xs text-muted-foreground">{format(new Date(announcement.createdAt!), "MMM d")}</span>
                   </div>
                   <CardTitle className="text-base font-bold mt-2">{announcement.title}</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-sm text-muted-foreground line-clamp-3">{announcement.content}</p>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
