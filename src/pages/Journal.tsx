import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Calendar,
  MapPin,
  Smile,
  Trash2,
  Edit2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  location: string | null;
  date: string;
  created_at: string;
}

const moods = [
  { value: "happy", label: "😊 Happy", color: "bg-success/10 text-success" },
  { value: "excited", label: "🎉 Excited", color: "bg-warning/10 text-warning" },
  { value: "relaxed", label: "😌 Relaxed", color: "bg-info/10 text-info" },
  { value: "adventurous", label: "🏔️ Adventurous", color: "bg-primary/10 text-primary" },
  { value: "tired", label: "😴 Tired", color: "bg-muted text-muted-foreground" },
  { value: "neutral", label: "😐 Neutral", color: "bg-secondary text-secondary-foreground" },
];

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("happy");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) setEntries(data);
  };

  const handleAddEntry = async () => {
    if (!title || !content || !user) {
      toast.error("Please fill in title and content");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      title,
      content,
      mood,
      location: location || null,
      date: new Date().toISOString().split('T')[0],
    });

    setIsLoading(false);

    if (error) {
      toast.error("Failed to add entry");
    } else {
      setTitle("");
      setContent("");
      setMood("happy");
      setLocation("");
      setDialogOpen(false);
      toast.success("Journal entry added!");
      fetchEntries();
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
      fetchEntries();
    }
  };

  const getMoodInfo = (moodValue: string | null) => {
    return moods.find(m => m.value === moodValue) || moods[5];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 gradient-accent opacity-5" />
        <div className="container relative py-6 md:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Travel Journal</h1>
                <p className="text-muted-foreground">Document your adventures</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>New Journal Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="A memorable day in..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location (optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Paris, France"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>How are you feeling?</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {moods.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Your Story</Label>
                    <Textarea
                      placeholder="Write about your experience..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <Button 
                    variant="gradient" 
                    className="w-full" 
                    onClick={handleAddEntry}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {entries.length === 0 ? (
          <Card className="animate-slide-up">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full gradient-accent mx-auto flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No journal entries yet</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                Start documenting your travel memories!
              </p>
              <Button variant="gradient" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Write Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry, index) => {
              const moodInfo = getMoodInfo(entry.mood);
              return (
                <Card 
                  key={entry.id} 
                  className="animate-slide-up overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${moodInfo.color}`}>
                            {moodInfo.label}
                          </span>
                          {entry.location && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {entry.location}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">{entry.title}</h3>
                        <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                          {entry.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
