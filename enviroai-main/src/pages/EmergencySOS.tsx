import { useState, useEffect } from "react";
import { 
  Phone, 
  Shield, 
  MapPin, 
  Hospital, 
  Building2,
  Flame,
  Plus,
  Trash2,
  Navigation,
  AlertTriangle,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const emergencyNumbers = [
  { name: "Police", number: "100", icon: Shield, color: "bg-info" },
  { name: "Ambulance", number: "108", icon: Hospital, color: "bg-destructive" },
  { name: "Fire", number: "101", icon: Flame, color: "bg-warning" },
  { name: "Emergency", number: "112", icon: Phone, color: "bg-success" },
];

const nearbyServices = [
  { name: "City Hospital", type: "Hospital", distance: "1.2 km", phone: "+91 98765 43210" },
  { name: "Central Police Station", type: "Police", distance: "0.8 km", phone: "100" },
  { name: "Fire Station #3", type: "Fire", distance: "2.1 km", phone: "101" },
  { name: "24/7 Medical Store", type: "Pharmacy", distance: "0.5 km", phone: "+91 98765 12345" },
];

export default function EmergencySOS() {
  const { user } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState("Fetching location...");
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRelationship, setNewContactRelationship] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEmergencyContacts();
    }
  }, [user]);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationAddress(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        () => {
          setLocationAddress("Location access denied");
        }
      );
    }
  }, []);

  const fetchEmergencyContacts = async () => {
    const { data } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setEmergencyContacts(data);
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const addContact = async () => {
    if (!newContactName || !newContactPhone || !user) {
      toast.error("Please fill in all fields");
      return;
    }

    const { error } = await supabase.from('emergency_contacts').insert({
      user_id: user.id,
      name: newContactName,
      phone: newContactPhone,
      relationship: newContactRelationship || "Other",
    });

    if (error) {
      toast.error("Failed to add contact");
    } else {
      setNewContactName("");
      setNewContactPhone("");
      setNewContactRelationship("");
      setDialogOpen(false);
      toast.success("Emergency contact added");
      fetchEmergencyContacts();
    }
  };

  const removeContact = async (id: string) => {
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
    
    if (error) {
      toast.error("Failed to remove contact");
    } else {
      toast.success("Contact removed");
      fetchEmergencyContacts();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-destructive">
        <div className="container py-6 md:py-8">
          <div className="flex items-center gap-3 text-destructive-foreground">
            <div className="h-12 w-12 rounded-xl bg-destructive-foreground/20 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Emergency SOS</h1>
              <p className="opacity-90">Quick access to emergency services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* SOS Button */}
        <Card className="animate-slide-up overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Button 
                variant="destructive" 
                className="h-32 w-32 rounded-full text-2xl font-bold shadow-lg"
                onClick={() => handleCall("112")}
              >
                SOS
              </Button>
              <p className="mt-4 text-lg font-semibold">Press for Emergency</p>
              <p className="text-muted-foreground text-sm">
                This will call the universal emergency number (112)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Location */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Your Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{locationAddress}</p>
                  {location && (
                    <p className="text-sm text-muted-foreground">
                      Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  if (location) {
                    window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank');
                  }
                }}
              >
                Open in Maps
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Numbers */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle>Emergency Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {emergencyNumbers.map((service) => (
                <button
                  key={service.number}
                  onClick={() => handleCall(service.number)}
                  className={`${service.color} p-4 rounded-xl text-center transition-all duration-200 hover:scale-105 active:scale-95`}
                >
                  <service.icon className="h-8 w-8 mx-auto text-card" />
                  <p className="font-bold text-lg text-card mt-2">{service.number}</p>
                  <p className="text-sm text-card/80">{service.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Emergency Contacts */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Contacts</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Contact name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input
                      placeholder="e.g., Parent, Spouse, Friend"
                      value={newContactRelationship}
                      onChange={(e) => setNewContactRelationship(e.target.value)}
                    />
                  </div>
                  <Button variant="gradient" className="w-full" onClick={addContact}>
                    Add Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {emergencyContacts.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No emergency contacts added</p>
                <p className="text-sm text-muted-foreground">
                  Add trusted contacts for quick access
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="icon"
                        className="h-8 w-8 bg-success hover:bg-success/90"
                        onClick={() => handleCall(contact.phone)}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nearby Services */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle>Nearby Emergency Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
                      {service.type === "Hospital" && <Hospital className="h-5 w-5 text-destructive" />}
                      {service.type === "Police" && <Shield className="h-5 w-5 text-info" />}
                      {service.type === "Fire" && <Flame className="h-5 w-5 text-warning" />}
                      {service.type === "Pharmacy" && <Building2 className="h-5 w-5 text-success" />}
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.type} • {service.distance}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall(service.phone)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="animate-slide-up border-warning/50" style={{ animationDelay: "0.25s" }}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning">Safety Reminder</p>
                <p className="text-sm text-muted-foreground mt-1">
                  In case of emergency, stay calm, call for help, and share your location. 
                  Keep this app accessible for quick emergency response.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
