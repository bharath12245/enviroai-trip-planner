import { useState } from "react";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Search,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeatherDay {
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  description: string;
  icon: string;
}

interface WeatherData {
  current: CurrentWeather;
  daily: WeatherDay[];
  alerts: any[];
}

const getWeatherIcon = (icon: string) => {
  if (icon.includes('01') || icon.includes('02')) return Sun;
  if (icon.includes('03') || icon.includes('04')) return Cloud;
  if (icon.includes('09') || icon.includes('10') || icon.includes('11')) return CloudRain;
  if (icon.includes('13')) return CloudSnow;
  return Cloud;
};

const getWeatherGradient = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes('clear') || c.includes('sun')) return 'gradient-warm';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) return 'gradient-cool';
  if (c.includes('snow')) return 'bg-info';
  return 'bg-muted';
};

export default function Weather() {
  const [location, setLocation] = useState("Mumbai");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { location }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setWeather(data);
      setSelectedDay(0);
      toast.success(`Weather loaded for ${location}`);
    } catch (error) {
      console.error('Weather fetch error:', error);
      toast.error('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAlertLevel = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('storm') || c.includes('thunder')) {
      return "caution";
    }
    if (c.includes('snow') || c.includes('extreme') || c.includes('hurricane')) {
      return "high-risk";
    }
    return "safe";
  };

  const currentWeather = weather?.current;
  const dailyForecast = weather?.daily || [];
  const selectedDayData = dailyForecast[selectedDay];
  const alertLevel = selectedDayData ? getAlertLevel(selectedDayData.condition) : "safe";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className={cn(
          "absolute inset-0 opacity-20",
          currentWeather ? getWeatherGradient(currentWeather.condition) : "gradient-warm"
        )} />
        <div className="container relative py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Weather & Alerts</h1>
              <p className="text-muted-foreground mt-1">
                Real-time weather conditions for your journey
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
                  className="pl-10"
                />
              </div>
              <Button variant="gradient" onClick={fetchWeather} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {!weather && !loading && (
          <Card className="p-8 text-center animate-slide-up">
            <Sun className="h-16 w-16 mx-auto text-warning mb-4" />
            <h3 className="font-semibold text-lg">Search for Weather</h3>
            <p className="text-muted-foreground mt-2">
              Enter a city name to get real-time weather data
            </p>
            <Button variant="gradient" className="mt-4" onClick={fetchWeather}>
              Get Weather for {location}
            </Button>
          </Card>
        )}

        {loading && (
          <Card className="p-8 text-center animate-slide-up">
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
            <h3 className="font-semibold text-lg">Loading Weather Data...</h3>
            <p className="text-muted-foreground mt-2">
              Fetching real-time data from OpenWeather
            </p>
          </Card>
        )}

        {weather && currentWeather && (
          <>
            {/* Current Weather Card */}
            <Card className="overflow-hidden animate-slide-up">
              <div className={cn("p-6 md:p-8", getWeatherGradient(currentWeather.condition))}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    {(() => {
                      const Icon = getWeatherIcon(currentWeather.icon);
                      return <Icon className="h-20 w-20 text-card-foreground" />;
                    })()}
                    <div>
                      <p className="text-5xl font-bold text-card-foreground">
                        {currentWeather.temp}°C
                      </p>
                      <p className="text-lg text-card-foreground/80 capitalize">
                        {currentWeather.description}
                      </p>
                      <p className="text-card-foreground/70">
                        {location} • Now
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <Thermometer className="h-6 w-6 mx-auto text-card-foreground/80" />
                      <p className="text-lg font-semibold text-card-foreground mt-1">
                        {currentWeather.feels_like}°
                      </p>
                      <p className="text-sm text-card-foreground/70">Feels Like</p>
                    </div>
                    <div className="text-center">
                      <Droplets className="h-6 w-6 mx-auto text-card-foreground/80" />
                      <p className="text-lg font-semibold text-card-foreground mt-1">
                        {currentWeather.humidity}%
                      </p>
                      <p className="text-sm text-card-foreground/70">Humidity</p>
                    </div>
                    <div className="text-center">
                      <Wind className="h-6 w-6 mx-auto text-card-foreground/80" />
                      <p className="text-lg font-semibold text-card-foreground mt-1">
                        {currentWeather.wind_speed} km/h
                      </p>
                      <p className="text-sm text-card-foreground/70">Wind</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Badge */}
              <CardContent className="p-4">
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl",
                  alertLevel === "safe" && "bg-success/10",
                  alertLevel === "caution" && "bg-warning/10",
                  alertLevel === "high-risk" && "bg-destructive/10"
                )}>
                  {alertLevel === "safe" ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertTriangle className={cn(
                      "h-5 w-5",
                      alertLevel === "caution" ? "text-warning" : "text-destructive"
                    )} />
                  )}
                  <div>
                    <p className={cn(
                      "font-semibold",
                      alertLevel === "safe" && "text-success",
                      alertLevel === "caution" && "text-warning",
                      alertLevel === "high-risk" && "text-destructive"
                    )}>
                      {alertLevel === "safe" && "Safe to Travel"}
                      {alertLevel === "caution" && "Travel with Caution"}
                      {alertLevel === "high-risk" && "High Risk - Consider Postponing"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {alertLevel === "safe" && "Weather conditions are favorable for your journey."}
                      {alertLevel === "caution" && "Expect some rain. Carry an umbrella and drive carefully."}
                      {alertLevel === "high-risk" && "Severe weather expected. Consider alternative dates."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7-Day Forecast */}
            <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle>7-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {dailyForecast.map((day, index) => {
                    const Icon = getWeatherIcon(day.icon);
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(index)}
                        className={cn(
                          "p-3 rounded-xl text-center transition-all duration-200",
                          selectedDay === index
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        )}
                      >
                        <p className="text-xs font-medium opacity-80">{day.date}</p>
                        <Icon className={cn(
                          "h-6 w-6 mx-auto my-2",
                          selectedDay === index ? "text-primary-foreground" : "text-muted-foreground"
                        )} />
                        <p className="font-bold">{day.temp}°</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected Day Details */}
            {selectedDayData && (
              <Card className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
                <CardHeader>
                  <CardTitle>{selectedDayData.date} Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-secondary rounded-xl text-center">
                      <Thermometer className="h-6 w-6 mx-auto text-primary" />
                      <p className="font-semibold mt-2">{selectedDayData.tempMin}° / {selectedDayData.tempMax}°</p>
                      <p className="text-sm text-muted-foreground">Min / Max</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-xl text-center">
                      <Droplets className="h-6 w-6 mx-auto text-info" />
                      <p className="font-semibold mt-2">{selectedDayData.humidity}%</p>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-xl text-center">
                      <Wind className="h-6 w-6 mx-auto text-accent" />
                      <p className="font-semibold mt-2">{selectedDayData.windSpeed} km/h</p>
                      <p className="text-sm text-muted-foreground">Wind Speed</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-xl text-center">
                      {(() => {
                        const Icon = getWeatherIcon(selectedDayData.icon);
                        return <Icon className="h-6 w-6 mx-auto text-warning" />;
                      })()}
                      <p className="font-semibold mt-2 capitalize">{selectedDayData.description}</p>
                      <p className="text-sm text-muted-foreground">Condition</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weather Alerts */}
            {weather.alerts && weather.alerts.length > 0 && (
              <Card className="animate-slide-up border-destructive" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Weather Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weather.alerts.map((alert: any, index: number) => (
                    <div key={index} className="p-4 bg-destructive/10 rounded-xl mb-2 last:mb-0">
                      <p className="font-semibold">{alert.event}</p>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
