import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertLostFound, LostFound } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useLostFound() {
  return useQuery<LostFound[]>({
    queryKey: [api.lostFound.list.path],
    queryFn: async () => {
      const res = await fetch(api.lostFound.list.path);
      if (!res.ok) throw new Error("Failed to fetch lost & found items");
      return res.json();
    },
  });
}

export function useCreateLostFound() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertLostFound) => {
      const res = await apiRequest(api.lostFound.create.method, api.lostFound.create.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lostFound.list.path] });
      toast({ title: "Item reported", description: "The item has been added to the list." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to report", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateLostFound() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertLostFound>) => {
      const url = buildUrl(api.lostFound.update.path, { id });
      const res = await apiRequest(api.lostFound.update.method, url, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lostFound.list.path] });
      toast({ title: "Item updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });
}
