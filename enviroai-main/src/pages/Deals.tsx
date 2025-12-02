import { useState } from "react";
import { 
  Plane, 
  Hotel, 
  Ticket,
  Tag,
  Star,
  ExternalLink,
  Zap,
  Loader2,
  Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Deal {
  id: string;
  type: "flight" | "hotel" | "activity";
  provider: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  rating: number;
  dealType: "flash-sale" | "early-bird" | "last-minute" | "exclusive";
  imageUrl: string;
}

const dealTypeColors: Record<string, { bg: string; text: string; label: string }> = {
  "flash-sale": { bg: "bg-destructive/10", text: "text-destructive", label: "Flash Sale" },
  "early-bird": { bg: "bg-success/10", text: "text-success", label: "Early Bird" },
  "last-minute": { bg: "bg-warning/10", text: "text-warning", label: "Last Minute" },
  "exclusive": { bg: "bg-accent/10", text: "text-accent", label: "Exclusive" },
};

export default function Deals() {
  const [activeTab, setActiveTab] = useState("all");
  const [destination, setDestination] = useState("Goa");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeals = async (type: string = activeTab) => {
    if (!destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }

    setLoading(true);
    try {
      const dealType = type === 'all' ? 'all' : 
                       type === 'flights' ? 'flight' :
                       type === 'hotels' ? 'hotel' : 'activity';
      
      const { data, error } = await supabase.functions.invoke('deals', {
        body: { destination, type: dealType }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setDeals(data.deals || []);
      toast.success(`Found ${data.deals?.length || 0} deals for ${destination}`);
    } catch (error) {
      console.error('Deals fetch error:', error);
      toast.error('Failed to fetch deals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (destination.trim() && deals.length > 0) {
      // Filter existing deals instead of fetching new ones
    }
  };

  const filteredDeals = deals.filter((deal) => {
    if (activeTab === "all") return true;
    if (activeTab === "flights") return deal.type === "flight";
    if (activeTab === "hotels") return deal.type === "hotel";
    if (activeTab === "activities") return deal.type === "activity";
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 gradient-accent opacity-5" />
        <div className="container relative py-6 md:py-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center">
              <Tag className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Travel Deals</h1>
              <p className="text-muted-foreground">AI-powered offers curated for you</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter destination..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDeals()}
                className="pl-10"
              />
            </div>
            <Button variant="gradient" onClick={() => fetchDeals()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find Deals"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Flash Sale Banner */}
        <Card className="overflow-hidden mb-6 animate-slide-up">
          <div className="gradient-warm p-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-warning-foreground" />
              <div>
                <h2 className="text-xl font-bold text-warning-foreground">AI-Powered Deals</h2>
                <p className="text-warning-foreground/90">Real-time deals generated using OpenAI for {destination || 'your destination'}</p>
              </div>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All Deals</TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Flights
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Activities
            </TabsTrigger>
          </TabsList>

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
              <p className="text-muted-foreground mt-4">Finding the best deals with AI...</p>
            </div>
          )}

          {!loading && deals.length === 0 && (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="font-semibold mt-4">Search for Deals</h3>
              <p className="text-muted-foreground">Enter a destination to find AI-curated travel deals</p>
              <Button variant="gradient" className="mt-4" onClick={() => fetchDeals()}>
                Find Deals for {destination}
              </Button>
            </div>
          )}

          {!loading && filteredDeals.length > 0 && (
            <TabsContent value={activeTab}>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredDeals.map((deal, index) => (
                  <DealCard key={deal.id} deal={deal} index={index} />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const dealStyle = dealTypeColors[deal.dealType] || dealTypeColors['exclusive'];
  const discount = Math.round(((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) * 100);

  const getBookingUrl = (deal: Deal) => {
    if (deal.type === 'flight') return 'https://www.skyscanner.co.in/';
    if (deal.type === 'hotel') return 'https://www.booking.com/';
    return 'https://www.viator.com/';
  };

  return (
    <Card 
      className="overflow-hidden animate-slide-up hover:shadow-card-hover transition-all"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative h-40">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
          }}
        />
        <div className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold",
          dealStyle.bg, dealStyle.text
        )}>
          {dealStyle.label}
        </div>
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          <Star className="h-3 w-3 text-warning fill-warning" />
          <span className="text-xs font-semibold">{deal.rating.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
          {discount}% OFF
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{deal.provider}</p>
            <h3 className="font-semibold text-lg">{deal.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{deal.description}</p>
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-4">
          <div>
            <p className="text-sm text-muted-foreground line-through">₹{deal.originalPrice.toLocaleString()}</p>
            <p className="text-2xl font-bold text-primary">₹{deal.discountedPrice.toLocaleString()}</p>
          </div>
          <Button variant="gradient" size="sm" asChild>
            <a href={getBookingUrl(deal)} target="_blank" rel="noopener noreferrer">
              Book Now
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
