import { Home, Search, User, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: Search, label: "Поиск", path: "/search" },
  { icon: BookOpen, label: "Журнал", path: "/journal" },
  { icon: User, label: "Профиль", path: "/profile" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center py-2 px-4 rounded-lg transition-colors",
              location.pathname === path
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={24} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};