import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Plane, 
  MapPin, 
  Wallet, 
  Leaf,
  Calendar,
  Route,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  departure_date: string;
  transport_mode: string;
  status: string;
  distance: number | null;
}

interface BudgetItem {
  amount: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [tripsRes, budgetRes] = await Promise.all([
      supabase.from('trips').select('*').order('created_at', { ascending: false }),
      supabase.from('budget_items').select('amount')
    ]);
    
    if (tripsRes.data) setTrips(tripsRes.data);
    if (budgetRes.data) setBudgetItems(budgetRes.data);
  };

  const stats = {
    totalTrips: trips.length,
    completedTrips: trips.filter((t) => t.status === "completed").length,
    upcomingTrips: trips.filter((t) => t.status === "upcoming" || t.status === "planning").length,
    totalDistance: trips.reduce((sum, t) => sum + (t.distance || 0), 0),
    totalSpent: budgetItems.reduce((sum, b) => sum + b.amount, 0),
    avgTripCost: trips.length > 0 
      ? Math.round(budgetItems.reduce((sum, b) => sum + b.amount, 0) / Math.max(trips.length, 1))
      : 0,
    uniqueDestinations: new Set(trips.map((t) => t.destination)).size,
    co2Footprint: trips.reduce((sum, t) => {
      const distance = t.distance || 0;
      const factor = t.transport_mode === 'flight' ? 0.255 : t.transport_mode === 'car' ? 0.21 : 0.05;
      return sum + (distance * factor);
    }, 0),
  };

  const transportModes = trips.reduce((acc, trip) => {
    acc[trip.transport_mode] = (acc[trip.transport_mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const modeLabels: Record<string, string> = {
    flight: "Flights", train: "Trains", bus: "Buses", car: "Car/Cab", bike: "Bike",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 gradient-cool opacity-5" />
        <div className="container relative py-6 md:py-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-cool flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-info-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Trip Analytics</h1>
              <p className="text-muted-foreground">Your travel statistics at a glance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Plane className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTrips}</p>
                <p className="text-xs text-muted-foreground">Total Trips</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.uniqueDestinations}</p>
                <p className="text-xs text-muted-foreground">Destinations</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-warm flex items-center justify-center">
                <Route className="h-5 w-5 text-warning-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDistance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">km Traveled</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success flex items-center justify-center">
                <Leaf className="h-5 w-5 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.co2Footprint.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">kg CO₂</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-warning" />
              Spending Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-secondary rounded-2xl">
                <p className="text-3xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Spent</p>
              </div>
              <div className="text-center p-6 bg-secondary rounded-2xl">
                <p className="text-3xl font-bold">₹{stats.avgTripCost.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Avg. per Trip</p>
              </div>
              <div className="text-center p-6 bg-secondary rounded-2xl">
                <p className="text-3xl font-bold">{stats.completedTrips}</p>
                <p className="text-sm text-muted-foreground mt-1">Completed Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <CardHeader>
            <CardTitle>Transport Modes Used</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(transportModes).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No trips recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(transportModes).map(([mode, count]) => {
                  const percentage = (count / stats.totalTrips) * 100;
                  return (
                    <div key={mode}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{modeLabels[mode] || mode}</span>
                        <span className="text-muted-foreground">{count} trips ({percentage.toFixed(0)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle>Trip History</CardTitle>
          </CardHeader>
          <CardContent>
            {trips.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No trips yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                        <Plane className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{trip.origin} → {trip.destination}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trip.departure_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      trip.status === 'completed' ? 'bg-success/10 text-success'
                        : trip.status === 'upcoming' ? 'bg-info/10 text-info'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
