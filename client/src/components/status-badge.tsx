import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  Open: { color: "bg-red-100 text-red-700 border-red-200", label: "Open" },
  "In Progress": { color: "bg-blue-100 text-blue-700 border-blue-200", label: "In Progress" },
  Resolved: { color: "bg-green-100 text-green-700 border-green-200", label: "Resolved" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Open;
  
  return (
    <Badge variant="outline" className={cn("px-2.5 py-0.5 font-medium border", config.color)}>
      {config.label}
    </Badge>
  );
}
