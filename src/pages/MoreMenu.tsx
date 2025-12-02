import { useEffect, useState } from "react";
import { 
  Shield, 
  Wallet, 
  Gift, 
  Plane,
  BookOpen,
  BarChart3,
  CloudSun,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const menuSections = [
  {
    title: "Trip Tools",
    items: [
      { icon: CloudSun, label: "Weather & Alerts", to: "/weather", color: "text-info" },
      { icon: Shield, label: "Emergency SOS", to: "/sos", color: "text-destructive" },
      { icon: Wallet, label: "Budget Tracker", to: "/budget", color: "text-warning" },
      { icon: Gift, label: "Travel Deals", to: "/deals", color: "text-accent" },
    ],
  },
  {
    title: "Planning",
    items: [
      { icon: Plane, label: "Visa Info", to: "/visa", color: "text-primary" },
      { icon: BookOpen, label: "Travel Journal", to: "/journal", color: "text-success" },
      { icon: BarChart3, label: "Trip Analytics", to: "/analytics", color: "text-info" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Settings, label: "Settings", to: "/settings", color: "text-muted-foreground" },
      { icon: HelpCircle, label: "Help & Support", to: "/help", color: "text-muted-foreground" },
    ],
  },
];

export default function MoreMenu() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [completedTrips, setCompletedTrips] = useState(0);

  const userName = profile?.name || 'Traveler';

  useEffect(() => {
    if (user) {
      fetchCompletedTrips();
    }
  }, [user]);

  const fetchCompletedTrips = async () => {
    const { count } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');
    
    setCompletedTrips(count || 0);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container relative py-6 md:py-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{userName}</h1>
              <p className="text-muted-foreground">
                {completedTrips} trips completed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title} className="animate-slide-up">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
              {section.title}
            </h2>
            <Card className="divide-y divide-border">
              {section.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl bg-secondary flex items-center justify-center")}>
                      <item.icon className={cn("h-5 w-5", item.color)} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Card className="animate-slide-up">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full p-4 text-destructive hover:bg-destructive/5 transition-colors rounded-2xl"
          >
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">Sign Out</span>
          </button>
        </Card>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">EnviroAI v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your Smart Travel Companion
          </p>
        </div>
      </div>
    </div>
  );
}
