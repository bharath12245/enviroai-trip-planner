import { useState } from "react";
import { 
  Plane, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Shield,
  Syringe,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { VisaInfo } from "@/types/trip";

const nationalities = [
  { value: "IN", label: "🇮🇳 India" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "CA", label: "🇨🇦 Canada" },
];

const destinations = [
  { value: "TH", label: "🇹🇭 Thailand" },
  { value: "SG", label: "🇸🇬 Singapore" },
  { value: "AE", label: "🇦🇪 UAE" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "JP", label: "🇯🇵 Japan" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "NP", label: "🇳🇵 Nepal" },
  { value: "BT", label: "🇧🇹 Bhutan" },
  { value: "LK", label: "🇱🇰 Sri Lanka" },
];

const mockVisaData: Record<string, VisaInfo> = {
  "IN-TH": {
    destinationCountry: "Thailand",
    nationality: "India",
    visaType: "visa-on-arrival",
    requirements: [
      "Passport valid for at least 6 months",
      "Return flight ticket",
      "Hotel booking confirmation",
      "Proof of funds (10,000 THB)",
      "2 passport-size photographs",
    ],
    processingTime: "On arrival",
    fee: "2,000 THB (~₹4,800)",
    officialLink: "https://www.thaiembassy.com/visa",
    healthRequirements: ["COVID-19 vaccination certificate (recommended)"],
  },
  "IN-SG": {
    destinationCountry: "Singapore",
    nationality: "India",
    visaType: "evisa",
    requirements: [
      "Passport valid for at least 6 months",
      "Completed e-visa application",
      "Recent passport photo",
      "Confirmed hotel booking",
      "Return flight tickets",
      "Bank statements (last 3 months)",
    ],
    processingTime: "3-5 business days",
    fee: "~₹1,000 - ₹2,500",
    officialLink: "https://www.ica.gov.sg/visitor/visas",
    healthRequirements: [],
  },
  "IN-AE": {
    destinationCountry: "UAE",
    nationality: "India",
    visaType: "evisa",
    requirements: [
      "Passport valid for at least 6 months",
      "Colored passport photo",
      "Flight booking",
      "Hotel reservation",
      "Travel insurance",
    ],
    processingTime: "2-4 business days",
    fee: "~₹7,000 - ₹10,000",
    officialLink: "https://www.government.ae/en/information-and-services/visa-and-emirates-id",
  },
  "IN-NP": {
    destinationCountry: "Nepal",
    nationality: "India",
    visaType: "visa-free",
    requirements: [
      "Valid Indian passport OR",
      "Voter ID card",
      "No visa required for Indian citizens",
    ],
    processingTime: "N/A",
    fee: "Free",
    officialLink: "https://www.immigration.gov.np",
  },
};

const visaTypeStyles = {
  "visa-free": { bg: "bg-success", label: "Visa Free", icon: CheckCircle },
  "visa-on-arrival": { bg: "bg-info", label: "Visa on Arrival", icon: Plane },
  "evisa": { bg: "bg-accent", label: "e-Visa Required", icon: FileText },
  "visa-required": { bg: "bg-warning", label: "Visa Required", icon: AlertTriangle },
};

export default function Visa() {
  const [nationality, setNationality] = useState("IN");
  const [destination, setDestination] = useState("");
  const [visaInfo, setVisaInfo] = useState<VisaInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const checkVisa = async () => {
    if (!destination) return;
    
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const key = `${nationality}-${destination}`;
    const info = mockVisaData[key] || {
      destinationCountry: destinations.find((d) => d.value === destination)?.label.slice(4) || destination,
      nationality: nationalities.find((n) => n.value === nationality)?.label.slice(4) || nationality,
      visaType: "visa-required" as const,
      requirements: [
        "Valid passport (6+ months validity)",
        "Visa application form",
        "Passport photos",
        "Bank statements",
        "Travel itinerary",
        "Hotel bookings",
        "Return tickets",
      ],
      processingTime: "7-15 business days",
      fee: "Varies",
      officialLink: "https://www.visahq.com",
    };
    
    setVisaInfo(info);
    setLoading(false);
  };

  const style = visaInfo ? visaTypeStyles[visaInfo.visaType] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container relative py-6 md:py-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Visa Information</h1>
              <p className="text-muted-foreground">Check visa requirements for your destination</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Visa Checker */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Check Visa Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Your Nationality</Label>
                <Select value={nationality} onValueChange={setNationality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalities.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destination Country</Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              variant="gradient" 
              className="w-full" 
              onClick={checkVisa}
              disabled={!destination || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Check Visa Requirements
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Visa Results */}
        {visaInfo && style && (
          <>
            {/* Status Banner */}
            <Card className={cn("overflow-hidden animate-scale-in", style.bg)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-primary-foreground">
                  <style.icon className="h-10 w-10" />
                  <div>
                    <h2 className="text-2xl font-bold">{style.label}</h2>
                    <p className="opacity-90">
                      {visaInfo.nationality} passport holders traveling to {visaInfo.destinationCountry}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {visaInfo.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Processing Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Processing Time</p>
                      <p className="font-semibold">{visaInfo.processingTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Visa Fee</p>
                      <p className="font-semibold">{visaInfo.fee}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Requirements */}
            {visaInfo.healthRequirements && visaInfo.healthRequirements.length > 0 && (
              <Card className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-success" />
                    Health Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {visaInfo.healthRequirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Official Link */}
            {visaInfo.officialLink && (
              <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Official Government Website</p>
                      <p className="text-sm text-muted-foreground">
                        Always verify requirements on official sources
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href={visaInfo.officialLink} target="_blank" rel="noopener noreferrer">
                        Visit Site
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
