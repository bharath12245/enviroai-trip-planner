import { useState } from "react";
import { 
  Sparkles, 
  Brain, 
  Map, 
  Utensils, 
  Hotel,
  Mountain,
  Heart,
  Compass,
  Leaf,
  Camera,
  Palette,
  ChefHat,
  Send,
  Loader2,
  Copy,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTripStore } from "@/store/tripStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Mood, FoodPreference } from "@/types/trip";

const moods = [
  { value: "adventure" as Mood, label: "Adventure", icon: Mountain },
  { value: "relaxation" as Mood, label: "Relaxation", icon: Heart },
  { value: "scenic" as Mood, label: "Scenic", icon: Camera },
  { value: "spiritual" as Mood, label: "Spiritual", icon: Compass },
  { value: "cultural" as Mood, label: "Cultural", icon: Palette },
  { value: "foodie" as Mood, label: "Foodie", icon: ChefHat },
  { value: "balanced" as Mood, label: "Balanced", icon: Leaf },
];

const foodPreferences = [
  { value: "vegetarian" as FoodPreference, label: "Vegetarian" },
  { value: "vegan" as FoodPreference, label: "Vegan" },
  { value: "non-vegetarian" as FoodPreference, label: "Non-Veg" },
  { value: "local" as FoodPreference, label: "Local Cuisine" },
  { value: "any" as FoodPreference, label: "Any" },
];

export default function AIAnalyst() {
  const { trips } = useTripStore();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [selectedMood, setSelectedMood] = useState<Mood>("balanced");
  const [selectedFood, setSelectedFood] = useState<FoodPreference>("any");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateItinerary = async () => {
    if (!destination || !days) {
      toast.error("Please enter destination and number of days");
      return;
    }

    setIsGenerating(true);
    setGeneratedItinerary(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/itinerary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destination,
            days: parseInt(days),
            mood: selectedMood,
            foodPreference: selectedFood,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate itinerary');
      }

      setGeneratedItinerary(data.itinerary);
      toast.success("Itinerary generated successfully!");
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedItinerary) {
      navigator.clipboard.writeText(generatedItinerary);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 gradient-accent opacity-5" />
        <div className="container relative py-6 md:py-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center">
              <Brain className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">AI Travel Analyst</h1>
              <p className="text-muted-foreground">
                Let AI create the perfect itinerary for your trip
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-6">
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <Input
                    placeholder="e.g., Goa, Jaipur, Paris"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Number of Days</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    min="1"
                    max="30"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Trip Mood</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {moods.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedMood(value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
                          selectedMood === value
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5",
                          selectedMood === value ? "text-accent" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          selectedMood === value ? "text-accent" : "text-muted-foreground"
                        )}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Food Preference</Label>
                  <div className="flex flex-wrap gap-2">
                    {foodPreferences.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedFood(value)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200",
                          selectedFood === value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="gradient-accent" 
                  size="lg" 
                  className="w-full"
                  onClick={generateItinerary}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Itinerary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-base">AI Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-secondary rounded-xl">
                    <Map className="h-5 w-5 mx-auto text-primary" />
                    <p className="text-xs font-medium mt-2">Smart Routes</p>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-xl">
                    <Utensils className="h-5 w-5 mx-auto text-warning" />
                    <p className="text-xs font-medium mt-2">Food Spots</p>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-xl">
                    <Hotel className="h-5 w-5 mx-auto text-info" />
                    <p className="text-xs font-medium mt-2">Stay Options</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Panel */}
          <Card className="animate-slide-up lg:h-fit" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated Itinerary</CardTitle>
              {generatedItinerary && (
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-full gradient-accent flex items-center justify-center animate-pulse">
                    <Brain className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    AI is crafting your perfect itinerary...
                  </p>
                </div>
              ) : generatedItinerary ? (
                <div className="prose prose-sm max-w-none dark:prose-invert overflow-auto max-h-[600px]">
                  <pre className="whitespace-pre-wrap font-sans text-sm bg-secondary p-4 rounded-xl">
                    {generatedItinerary}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 font-semibold">No itinerary yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill in the details and click generate to create your AI-powered itinerary
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
