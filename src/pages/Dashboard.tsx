import { useMemo, useEffect, useState } from "react";
import {
  Plane,
  MapPin,
  Leaf,
  Wallet,
  Route,
  Shield,
  Gift,
  Sparkles,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/shared/StatCard";
import { QuickActionCard } from "@/components/shared/QuickActionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  transport_mode: string;
  status: string;
  distance: number | null;
  estimated_cost: number | null;
  co2_footprint: number | null;
}

interface BudgetItem {
  id: string;
  amount: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  const userName = profile?.name || 'Traveler';

  useEffect(() => {
    if (user) {
      fetchTrips();
      fetchBudgetItems();
    }
  }, [user]);

  const fetchTrips = async () => {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setTrips(data);
  };

  const fetchBudgetItems = async () => {
    const { data } = await supabase
      .from('budget_items')
      .select('id, amount');

    if (data) setBudgetItems(data);
  };

  const stats = useMemo(() => {
    const upcoming = trips.filter((t) => t.status === "upcoming" || t.status === "planning").length;
    const completed = trips.filter((t) => t.status === "completed").length;
    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalSpend = budgetItems.reduce((sum, b) => sum + b.amount, 0);

    const co2 = trips.reduce((sum, t) => {
      const distance = t.distance || 0;
      const factor = t.transport_mode === 'flight' ? 0.255 : t.transport_mode === 'car' ? 0.21 : 0.05;
      return sum + (distance * factor);
    }, 0);

    return { upcoming, completed, totalDistance, totalSpend, co2 };
  }, [trips, budgetItems]);

  const markAsCompleted = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    const { error } = await supabase
      .from('trips')
      .update({ status: 'completed' })
      .eq('id', tripId);

    if (error) {
      console.error('Error updating trip:', error);
      return;
    }

    fetchTrips();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container relative py-8 md:py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {getGreeting()}, <span className="text-gradient">{userName}</span>! 👋
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Ready to plan your next adventure?
              </p>
            </div>
            <div className="hidden md:block">
              <Link to="/plan">
                <Button variant="gradient" size="lg">
                  <Plane className="mr-2 h-5 w-5" />
                  Plan New Trip
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-8 space-y-8">
        {/* Stats Grid */}
        <section className="animate-slide-up">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Travel Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={Plane}
              label="Upcoming Trips"
              value={stats.upcoming}
              variant="primary"
            />
            <StatCard
              icon={MapPin}
              label="Completed"
              value={stats.completed}
              variant="success"
            />
            <StatCard
              icon={Route}
              label="Total Distance"
              value={`${stats.totalDistance.toLocaleString()} km`}
              variant="accent"
            />
            <StatCard
              icon={Wallet}
              label="Total Spend"
              value={`₹${stats.totalSpend.toLocaleString()}`}
              variant="warning"
            />
            <StatCard
              icon={Leaf}
              label="CO₂ Footprint"
              value={`${stats.co2.toFixed(0)} kg`}
              variant="default"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              icon={Plane}
              title="Plan New Trip"
              description="Create your perfect journey"
              to="/plan"
              variant="gradient"
            />
            <QuickActionCard
              icon={Shield}
              title="Emergency SOS"
              description="Quick access to help"
              to="/sos"
              variant="gradient-warm"
            />
            <QuickActionCard
              icon={Gift}
              title="Travel Deals"
              description="Exclusive offers for you"
              to="/deals"
              variant="gradient-accent"
            />
            <QuickActionCard
              icon={Sparkles}
              title="AI Itinerary"
              description="Let AI plan for you"
              to="/ai"
              variant="gradient-cool"
            />
          </div>
        </section>

        {/* Recent Trips */}
        <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Trips</h2>
            <Link to="/analytics">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {trips.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No trips yet</h3>
              <p className="text-muted-foreground mt-2">
                Start planning your first adventure!
              </p>
              <Link to="/plan">
                <Button variant="gradient" className="mt-4">
                  Plan Your First Trip
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4">
              {trips.slice(0, 3).map((trip) => (
                <Card key={trip.id} className="p-4 hover:shadow-card-hover transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                        <Plane className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {trip.origin} → {trip.destination}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trip.departure_date).toLocaleDateString()}
                          {trip.return_date && ` - ${new Date(trip.return_date).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {trip.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={(e) => markAsCompleted(trip.id, e)}
                        >
                          Mark as Completed
                        </Button>
                      )}
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${trip.status === 'completed'
                          ? 'bg-success/10 text-success'
                          : trip.status === 'upcoming'
                            ? 'bg-info/10 text-info'
                            : 'bg-warning/10 text-warning'
                        }`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Explore Banner */}
        <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Card className="overflow-hidden">
            <div className="gradient-accent p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-accent-foreground">
                    Explore Real-Time Data ✨
                  </h3>
                  <p className="text-accent-foreground/90 mt-1">
                    Live weather, places from Google Maps, and AI-powered deals
                  </p>
                </div>
                <Link to="/deals">
                  <Button variant="glass" size="lg">
                    Find Deals
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
