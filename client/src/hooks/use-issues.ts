import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertIssue, Issue, Comment, InsertComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type IssueWithDetails = Issue & { 
  reporter?: { username: string; name: string; hostel: string; room: string };
  comments?: (Comment & { user?: { username: string; name: string } })[];
};

export function useIssues() {
  return useQuery<IssueWithDetails[]>({
    queryKey: [api.issues.list.path],
    queryFn: async () => {
      const res = await fetch(api.issues.list.path);
      if (!res.ok) throw new Error("Failed to fetch issues");
      return res.json();
    },
  });
}

export function useIssue(id: number) {
  return useQuery<IssueWithDetails>({
    queryKey: [api.issues.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.issues.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch issue details");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertIssue) => {
      const res = await apiRequest(api.issues.create.method, api.issues.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.issues.list.path] });
      toast({ title: "Issue Reported", description: "Your issue has been submitted successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to report issue", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertIssue>) => {
      const url = buildUrl(api.issues.update.path, { id });
      const res = await apiRequest(api.issues.update.method, url, data);
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.issues.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.issues.get.path, id] });
      toast({ title: "Issue Updated", description: "The issue status has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertComment) => {
      const res = await apiRequest(api.comments.create.method, api.comments.create.path, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.issues.get.path, variables.issueId] });
      toast({ title: "Comment added" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to comment", description: error.message, variant: "destructive" });
    },
  });
}
