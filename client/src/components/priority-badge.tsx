import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Clock, Info } from "lucide-react";

const priorityConfig = {
  Low: { color: "bg-slate-100 text-slate-700", icon: Clock },
  Medium: { color: "bg-yellow-100 text-yellow-700", icon: Info },
  High: { color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  Emergency: { color: "bg-red-100 text-red-700 font-bold animate-pulse", icon: AlertCircle },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.Medium;
  const Icon = config.icon;
  
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", config.color)}>
      <Icon className="w-3 h-3" />
      {priority}
    </div>
  );
}
