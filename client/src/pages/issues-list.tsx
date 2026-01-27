import { useState } from "react";
import { useIssues } from "@/hooks/use-issues";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { Link } from "wouter";
import { Search, Filter, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function IssuesList() {
  const { data: issues, isLoading } = useIssues();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredIssues = issues?.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) || 
                          issue.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || issue.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Issue Tracker</h1>
          <p className="text-muted-foreground">View and track all hostel maintenance reports.</p>
        </div>
        <Link href="/report-issue">
          <Button className="shadow-lg shadow-primary/20">Report Issue</Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search issues..." 
            className="pl-9" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
             <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Plumbing">Plumbing</SelectItem>
            <SelectItem value="Electrical">Electrical</SelectItem>
            <SelectItem value="Internet">Internet</SelectItem>
            <SelectItem value="Furniture">Furniture</SelectItem>
            <SelectItem value="Cleanliness">Cleanliness</SelectItem>
            <SelectItem value="Others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : (
        <div className="grid gap-4">
          {filteredIssues.length === 0 ? (
             <div className="text-center p-12 bg-muted/20 rounded-xl border border-dashed">
               <p className="text-muted-foreground">No issues found matching your filters.</p>
             </div>
          ) : (
            filteredIssues.map(issue => (
              <Link key={issue.id} href={`/issues/${issue.id}`} className="block group">
                <Card className="hover:shadow-md transition-all border-l-4 border-l-transparent group-hover:border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                           <PriorityBadge priority={issue.priority} />
                           <span className="text-xs text-muted-foreground">•</span>
                           <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{issue.category}</span>
                        </div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{issue.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{issue.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>Reported by {issue.reporter?.name || "Student"}</span>
                          <span>{format(new Date(issue.createdAt!), "PPP")}</span>
                          <span>{issue.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <StatusBadge status={issue.status} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
