import { Home, Map, MapPin, Sparkles, CloudSun, Shield, Wallet, Gift, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const mainNavItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Map, label: "Plan Trip", to: "/plan" },
  { icon: MapPin, label: "Places", to: "/places" },
  { icon: Sparkles, label: "AI Analyst", to: "/ai" },
  { icon: CloudSun, label: "Weather", to: "/weather" },
];

const moreNavItems = [
  { icon: Shield, label: "Emergency SOS", to: "/sos" },
  { icon: Wallet, label: "Budget", to: "/budget" },
  { icon: Gift, label: "Deals", to: "/deals" },
];

export function TopNav() {
  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
            <Map className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient">EnviroAI</span>
        </Link>

        <nav className="flex items-center gap-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-secondary"
              activeClassName="text-primary bg-primary/10"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2">
                <Menu className="h-4 w-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {moreNavItems.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link to={item.to} className="flex items-center gap-2 cursor-pointer">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/visa" className="flex items-center gap-2 cursor-pointer">
                  Visa Info
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/journal" className="flex items-center gap-2 cursor-pointer">
                  Travel Journal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/analytics" className="flex items-center gap-2 cursor-pointer">
                  Analytics
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
