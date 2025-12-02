import { useState, useEffect } from "react";
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  Plane,
  Hotel,
  Utensils,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  Trash2,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";

interface BudgetItem {
  id: string;
  trip_id: string | null;
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
}

interface Trip {
  id: string;
  destination: string;
  estimated_cost: number | null;
}

const categories = [
  { value: "transport", label: "Transport", icon: Plane, color: "text-info" },
  { value: "stay", label: "Stay", icon: Hotel, color: "text-accent" },
  { value: "food", label: "Food", icon: Utensils, color: "text-warning" },
  { value: "activities", label: "Activities", icon: Ticket, color: "text-success" },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: "text-destructive" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "text-muted-foreground" },
];

export default function Budget() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string>("all");
  const [newCategory, setNewCategory] = useState<string>("food");
  const [newAmount, setNewAmount] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    if (user) {
      fetchTrips();
      fetchBudgetItems();
    }
  }, [user]);

  const fetchTrips = async () => {
    const { data } = await supabase
      .from('trips')
      .select('id, destination, estimated_cost')
      .order('created_at', { ascending: false });
    
    if (data) setTrips(data);
  };

  const fetchBudgetItems = async () => {
    const { data } = await supabase
      .from('budget_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBudgetItems(data);
  };

  const estimatedBudget = selectedTrip === "all" 
    ? trips.reduce((sum, t) => sum + (t.estimated_cost || 0), 0) || 25000
    : trips.find((t) => t.id === selectedTrip)?.estimated_cost || 25000;

  const tripBudgetItems = selectedTrip === "all"
    ? budgetItems
    : budgetItems.filter((item) => item.trip_id === selectedTrip);

  const totalSpent = tripBudgetItems.reduce((sum, item) => sum + item.amount, 0);
  const percentage = Math.min((totalSpent / estimatedBudget) * 100, 100);
  const remaining = estimatedBudget - totalSpent;

  const categoryTotals = categories.map((cat) => ({
    ...cat,
    total: tripBudgetItems
      .filter((item) => item.category === cat.value)
      .reduce((sum, item) => sum + item.amount, 0),
  }));

  const handleAddExpense = async () => {
    if (!newAmount || !user) {
      toast.error("Please enter an amount");
      return;
    }

    const { error } = await supabase.from('budget_items').insert({
      user_id: user.id,
      trip_id: selectedTrip === "all" ? null : selectedTrip,
      category: newCategory,
      amount: parseFloat(newAmount),
      currency: "INR",
      description: newDescription,
      date: new Date().toISOString().split('T')[0],
    });

    if (error) {
      toast.error("Failed to add expense");
    } else {
      setNewAmount("");
      setNewDescription("");
      setDialogOpen(false);
      toast.success("Expense added");
      fetchBudgetItems();
    }
  };

  const handleRemoveExpense = async (id: string) => {
    const { error } = await supabase.from('budget_items').delete().eq('id', id);
    
    if (error) {
      toast.error("Failed to remove expense");
    } else {
      toast.success("Expense removed");
      fetchBudgetItems();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 gradient-warm opacity-5" />
        <div className="container relative py-6 md:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-warm flex items-center justify-center">
                <Wallet className="h-6 w-6 text-warning-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Budget Tracker</h1>
                <p className="text-muted-foreground">Track your travel expenses</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className={cn("h-4 w-4", cat.color)} />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Input
                      placeholder="What was this for?"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                  </div>
                  <Button variant="gradient" className="w-full" onClick={handleAddExpense}>
                    Add Expense
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Overview Card */}
        <Card className="animate-slide-up">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-3xl font-bold">₹{estimatedBudget.toLocaleString()}</p>
                <Progress value={percentage} className="mt-3 h-3" />
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-muted-foreground">
                    Spent: ₹{totalSpent.toLocaleString()}
                  </span>
                  <span className={cn(
                    "font-medium",
                    remaining >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {remaining >= 0 ? "Remaining" : "Over budget"}: ₹{Math.abs(remaining).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-xl">
                  <TrendingUp className="h-6 w-6 mx-auto text-success" />
                  <p className="font-semibold mt-2">{Math.round(percentage)}%</p>
                  <p className="text-xs text-muted-foreground">Used</p>
                </div>
                <div className="text-center p-4 bg-info/10 rounded-xl">
                  <PieChart className="h-6 w-6 mx-auto text-info" />
                  <p className="font-semibold mt-2">{tripBudgetItems.length}</p>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {categoryTotals.map((cat) => (
                <div key={cat.value} className="text-center p-3 bg-secondary rounded-xl">
                  <cat.icon className={cn("h-6 w-6 mx-auto", cat.color)} />
                  <p className="font-semibold mt-2">₹{cat.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{cat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {tripBudgetItems.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No expenses recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tripBudgetItems.map((item) => {
                  const cat = categories.find((c) => c.value === item.category) || categories[5];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl bg-card flex items-center justify-center"
                        )}>
                          <cat.icon className={cn("h-5 w-5", cat.color)} />
                        </div>
                        <div>
                          <p className="font-medium">{item.description || cat.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveExpense(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
