import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "primary" | "accent" | "success" | "warning";
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  variant = "default",
  className,
}: StatCardProps) {
  const iconColors = {
    default: "bg-secondary text-secondary-foreground",
    primary: "gradient-primary text-primary-foreground",
    accent: "gradient-accent text-accent-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
  };

  return (
    <Card className={cn("p-4 hover:shadow-card-hover transition-shadow", className)}>
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-xl", iconColors[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trendUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
