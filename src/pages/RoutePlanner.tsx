import { useState } from "react";
import {
  Plane,
  Train,
  Bus,
  Car,
  Bike,
  MapPin,
  Calendar,
  Route,
  Clock,
  Wallet,
  Leaf,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TransportMode } from "@/types/trip";
import { cn } from "@/lib/utils";

const transportModes = [
  { mode: "flight" as TransportMode, icon: Plane, label: "Flight", speed: 800, costPerKm: 8 },
  { mode: "train" as TransportMode, icon: Train, label: "Train", speed: 100, costPerKm: 2 },
  { mode: "bus" as TransportMode, icon: Bus, label: "Bus", speed: 60, costPerKm: 1.5 },
  { mode: "car" as TransportMode, icon: Car, label: "Car", speed: 80, costPerKm: 5 },
  { mode: "bike" as TransportMode, icon: Bike, label: "Bike", speed: 40, costPerKm: 2 },
];

export default function RoutePlanner() {
  const { user } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [selectedMode, setSelectedMode] = useState<TransportMode>("flight");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [routeResult, setRouteResult] = useState<{
    distance: number;
    duration: number;
    cost: number;
    co2: number;
  } | null>(null);

  const calculateRoute = async () => {
    if (!from || !to || !departureDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCalculating(true);

    // Simulate API call for route calculation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock distance calculation (in reality, this would use Google Maps API)
    const mockDistance = Math.floor(Math.random() * 2000) + 200;
    const modeConfig = transportModes.find((m) => m.mode === selectedMode)!;
    const duration = Math.round(mockDistance / modeConfig.speed);
    const cost = Math.round(mockDistance * modeConfig.costPerKm);
    const co2Factor = selectedMode === 'flight' ? 0.255 : selectedMode === 'car' ? 0.21 : 0.05;
    const co2 = Math.round(mockDistance * co2Factor);

    setRouteResult({ distance: mockDistance, duration, cost, co2 });
    setIsCalculating(false);
  };

  const saveTrip = async () => {
    if (!routeResult) return;

    if (!user) {
      toast.error("You must be logged in to save a trip");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from('trips').insert({
      user_id: user.id,
      origin: from,
      destination: to,
      departure_date: departureDate,
      return_date: returnDate || null,
      transport_mode: selectedMode,
      distance: routeResult.distance,
      duration: `${routeResult.duration} hours`,
      estimated_cost: routeResult.cost,
      co2_footprint: routeResult.co2,
      status: 'planning'
    });

    setIsSaving(false);

    if (error) {
      console.error('Error saving trip:', error);
      toast.error("Failed to save trip. Please try again.");
    } else {
      toast.success("Trip saved successfully!", {
        action: {
          label: "View Trip",
          onClick: () => window.location.href = "/"
        }
      });

      // Reset form
      setFrom("");
      setTo("");
      setDepartureDate("");
      setReturnDate("");
      setRouteResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container relative py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold">Plan Your Trip</h1>
          <p className="text-muted-foreground mt-1">
            Enter your journey details and let us calculate the best route
          </p>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Route Input Card */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From/To Inputs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="from"
                    placeholder="Starting location"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    id="to"
                    placeholder="Destination"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Date Inputs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure">Departure Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="departure"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="return">Return Date (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="return"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Transport Mode Selection */}
            <div className="space-y-3">
              <Label>Mode of Transport</Label>
              <div className="grid grid-cols-5 gap-2">
                {transportModes.map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                      selectedMode === mode
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className={cn(
                      "h-6 w-6",
                      selectedMode === mode ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      selectedMode === mode ? "text-primary" : "text-muted-foreground"
                    )}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={calculateRoute}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Calculate Route
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Route Results */}
        {routeResult && (
          <Card className="animate-scale-in overflow-hidden">
            <div className="gradient-primary p-4">
              <div className="flex items-center justify-between text-primary-foreground">
                <span className="font-semibold">{from}</span>
                <ArrowRight className="h-5 w-5" />
                <span className="font-semibold">{to}</span>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary rounded-xl">
                  <Route className="h-6 w-6 mx-auto text-primary" />
                  <p className="text-2xl font-bold mt-2">{routeResult.distance}</p>
                  <p className="text-sm text-muted-foreground">km</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-xl">
                  <Clock className="h-6 w-6 mx-auto text-info" />
                  <p className="text-2xl font-bold mt-2">{routeResult.duration}</p>
                  <p className="text-sm text-muted-foreground">hours</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-xl">
                  <Wallet className="h-6 w-6 mx-auto text-warning" />
                  <p className="text-2xl font-bold mt-2">₹{routeResult.cost.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">estimated</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-xl">
                  <Leaf className="h-6 w-6 mx-auto text-success" />
                  <p className="text-2xl font-bold mt-2">{routeResult.co2}</p>
                  <p className="text-sm text-muted-foreground">kg CO₂</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="gradient" className="flex-1" onClick={saveTrip} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Trip"}
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/ai">Generate Itinerary</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
