import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

type AnalyticsData = {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  byCategory: Record<string, number>;
};

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: [api.analytics.get.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.get.path);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });
}
