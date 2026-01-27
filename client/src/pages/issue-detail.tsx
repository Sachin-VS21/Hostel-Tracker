import { useRoute } from "wouter";
import { useIssue, useUpdateIssue, useCreateComment } from "@/hooks/use-issues";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, User, MapPin, Calendar, Clock, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { Loader } from "lucide-react";

export default function IssueDetail() {
  const [, params] = useRoute("/issues/:id");
  const id = parseInt(params?.id || "0");
  const { user } = useAuth();
  const { data: issue, isLoading } = useIssue(id);
  const updateIssue = useUpdateIssue();
  const createComment = useCreateComment();
  const [commentText, setCommentText] = useState("");

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!issue) return <div>Issue not found</div>;

  const handleStatusChange = (newStatus: string) => {
    updateIssue.mutate({ id, status: newStatus });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createComment.mutate({ issueId: id, content: commentText }, {
      onSuccess: () => setCommentText("")
    });
  };

  const isAuthorOrAdmin = user?.role === "admin" || user?.id === issue.reporterId;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/issues" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Issues
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PriorityBadge priority={issue.priority} />
            <span className="text-xs font-medium text-muted-foreground uppercase">{issue.category}</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">{issue.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
             <div className="flex items-center gap-1"><User className="h-3 w-3" /> {issue.reporter?.name}</div>
             <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {issue.location}</div>
             <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(issue.createdAt!), "PPP p")}</div>
          </div>
        </div>
        
        {user?.role === "admin" && (
           <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
             <span className="text-sm font-medium px-2">Update Status:</span>
             <Select value={issue.status} onValueChange={handleStatusChange}>
               <SelectTrigger className="w-[140px] h-8">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="Open">Open</SelectItem>
                 <SelectItem value="In Progress">In Progress</SelectItem>
                 <SelectItem value="Resolved">Resolved</SelectItem>
               </SelectContent>
             </Select>
           </div>
        )}
        {user?.role !== "admin" && <div className="scale-110"><StatusBadge status={issue.status} /></div>}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">{issue.description}</p>
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display">Discussion</h3>
            {issue.comments?.map((comment) => (
              <Card key={comment.id} className="bg-muted/30 border-none">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{comment.user?.name}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt!), "MMM d, h:mm a")}</span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
            
            {issue.comments?.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No comments yet.</p>
            )}

            <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
              <Textarea 
                placeholder="Add a comment..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px]"
              />
              <Button type="submit" size="icon" className="h-[80px] w-[60px]" disabled={createComment.isPending}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="relative border-l border-muted pl-4 ml-2 space-y-6">
                  <div className="relative">
                     <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                     <p className="text-sm font-medium">Issue Reported</p>
                     <p className="text-xs text-muted-foreground">{format(new Date(issue.createdAt!), "MMM d, yyyy")}</p>
                  </div>
                  {issue.status !== "Open" && (
                    <div className="relative">
                       <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-background" />
                       <p className="text-sm font-medium">Work Started</p>
                       <p className="text-xs text-muted-foreground">Status changed to In Progress</p>
                    </div>
                  )}
                  {issue.status === "Resolved" && (
                    <div className="relative">
                       <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                       <p className="text-sm font-medium">Resolved</p>
                       <p className="text-xs text-muted-foreground">Issue marked as resolved</p>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
