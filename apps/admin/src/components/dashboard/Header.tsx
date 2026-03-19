
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-8 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-foreground text-balance">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 w-56 h-9 bg-muted/60 border-transparent focus-visible:bg-card focus-visible:border-border text-sm"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative w-9 h-9 text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Link to="/dashboard/settings" className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
          <span className="text-sm font-semibold text-primary-foreground">{initials}</span>
        </Link>
      </div>
    </header>
  );
}
