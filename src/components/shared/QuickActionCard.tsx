import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  variant?: "default" | "gradient" | "gradient-accent" | "gradient-warm" | "gradient-cool";
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  to,
  variant = "default",
}: QuickActionCardProps) {
  const variants = {
    default: "bg-card hover:bg-secondary/50",
    gradient: "gradient-primary text-primary-foreground",
    "gradient-accent": "gradient-accent text-accent-foreground",
    "gradient-warm": "gradient-warm text-warning-foreground",
    "gradient-cool": "gradient-cool text-info-foreground",
  };

  const isGradient = variant !== "default";

  return (
    <Link to={to}>
      <Card
        className={cn(
          "p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover",
          variants[variant]
        )}
      >
        <div
          className={cn(
            "p-2.5 rounded-xl w-fit",
            isGradient ? "bg-background/20" : "gradient-primary"
          )}
        >
          <Icon className={cn("h-5 w-5", isGradient ? "" : "text-primary-foreground")} />
        </div>
        <h3 className={cn("font-semibold mt-3", !isGradient && "text-foreground")}>
          {title}
        </h3>
        <p
          className={cn(
            "text-sm mt-1",
            isGradient ? "opacity-90" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      </Card>
    </Link>
  );
}
