import { useState } from "react";
import { 
  MapPin, 
  Utensils, 
  Hotel, 
  Camera,
  Star,
  Navigation,
  Search,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PlaceType = "attraction" | "restaurant" | "hotel";

interface Place {
  id: string;
  name: string;
  type: PlaceType;
  rating: number;
  reviews: number;
  image: string;
  location: string;
  description: string;
  priceLevel?: number;
  isOpen?: boolean;
  lat?: number;
  lng?: number;
}

// Geoapify categories for each place type
const categoryMap: Record<PlaceType, string[]> = {
  attraction: ["tourism.attraction", "tourism.sights", "entertainment", "leisure.park"],
  restaurant: ["catering.restaurant", "catering.cafe", "catering.fast_food"],
  hotel: ["accommodation.hotel", "accommodation.guest_house", "accommodation.hostel"],
};

// Placeholder images by category
const getPlaceholderImage = (type: PlaceType, index: number): string => {
  const images: Record<PlaceType, string[]> = {
    attraction: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=400',
    ],
    restaurant: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
    ],
    hotel: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    ],
  };
  return images[type][index % images[type].length];
};

export default function Places() {
  const [searchQuery, setSearchQuery] = useState("Mumbai");
  const [activeTab, setActiveTab] = useState<PlaceType>("attraction");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  // Geocode location using Nominatim
  const geocodeLocation = async (query: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'EnviroAI/1.0' }
      });
      const data = await response.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchPlaces = async (type: PlaceType = activeTab) => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setLoading(true);
    try {
      // First geocode the location
      const coords = await geocodeLocation(searchQuery);
      if (!coords) {
        toast.error(`Could not find location: ${searchQuery}`);
        setLoading(false);
        return;
      }

      // Call Geoapify via edge function
      const { data, error } = await supabase.functions.invoke('places', {
        body: { 
          lat: coords.lat, 
          lon: coords.lon, 
          radius: 5000,
          categories: categoryMap[type]
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Transform Geoapify response to Place format
      const transformedPlaces: Place[] = (Array.isArray(data) ? data : []).map((item: any, index: number) => ({
        id: item.id,
        name: item.name || 'Unknown Place',
        type,
        rating: 3.5 + Math.random() * 1.5, // Geoapify doesn't provide ratings
        reviews: Math.floor(100 + Math.random() * 5000),
        image: getPlaceholderImage(type, index),
        location: item.address || searchQuery,
        description: item.category?.replace(/\./g, ' › ') || type,
        priceLevel: Math.floor(1 + Math.random() * 3),
        isOpen: Math.random() > 0.3,
        lat: item.lat,
        lng: item.lon,
      }));

      setPlaces(transformedPlaces);
      if (transformedPlaces.length === 0) {
        toast.info(`No ${type}s found near ${searchQuery}`);
      } else {
        toast.success(`Found ${transformedPlaces.length} ${type}s near ${searchQuery}`);
      }
    } catch (error) {
      console.error('Places fetch error:', error);
      toast.error('Failed to fetch places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as PlaceType);
    if (searchQuery.trim()) {
      fetchPlaces(value as PlaceType);
    }
  };

  const openInMaps = (place: Place) => {
    const url = place.lat && place.lng 
      ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.location)}`;
    window.open(url, '_blank');
  };

  const getPriceIndicator = (level?: number) => {
    if (!level) return '';
    return '₹'.repeat(level);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 gradient-cool opacity-5" />
        <div className="container relative py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold">Places & Stops</h1>
          <p className="text-muted-foreground mt-1">
            Discover places powered by Geoapify
          </p>

          {/* Search */}
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search city or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPlaces()}
                className="pl-10"
              />
            </div>
            <Button variant="gradient" onClick={() => fetchPlaces()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="attraction" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Attractions
            </TabsTrigger>
            <TabsTrigger value="restaurant" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="hotel" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Hotels
            </TabsTrigger>
          </TabsList>

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
              <p className="text-muted-foreground mt-4">Searching nearby places...</p>
            </div>
          )}

          {!loading && places.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="font-semibold mt-4">Search for Places</h3>
              <p className="text-muted-foreground">Enter a city to find attractions, restaurants, and hotels</p>
              <Button variant="gradient" className="mt-4" onClick={() => fetchPlaces()}>
                Search {searchQuery}
              </Button>
            </div>
          )}

          {!loading && places.length > 0 && (
            <TabsContent value={activeTab} className="space-y-4">
              {places.map((place, index) => (
                <PlaceCard 
                  key={place.id} 
                  place={place} 
                  index={index} 
                  onNavigate={openInMaps}
                  priceIndicator={getPriceIndicator(place.priceLevel)}
                />
              ))}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function PlaceCard({ 
  place, 
  index, 
  onNavigate,
  priceIndicator 
}: { 
  place: Place; 
  index: number;
  onNavigate: (place: Place) => void;
  priceIndicator: string;
}) {
  return (
    <Card 
      className="overflow-hidden animate-slide-up hover:shadow-card-hover transition-shadow"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-40 md:h-auto relative">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
            }}
          />
          <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3 text-warning fill-warning" />
            <span className="text-xs font-semibold">{place.rating.toFixed(1)}</span>
          </div>
          {place.isOpen !== undefined && (
            <div className={cn(
              "absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold",
              place.isOpen ? "bg-success/90 text-success-foreground" : "bg-destructive/90 text-destructive-foreground"
            )}>
              {place.isOpen ? "Open" : "Closed"}
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{place.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {place.location}
              </div>
            </div>
            {priceIndicator && (
              <span className="text-sm font-semibold text-success">{priceIndicator}</span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-2 capitalize">{place.description}</p>
          
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-muted-foreground">
              {place.reviews.toLocaleString()} reviews
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="gradient" size="sm" onClick={() => onNavigate(place)}>
              <Navigation className="h-4 w-4 mr-1" />
              Directions
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.location)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on Maps
              </a>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
