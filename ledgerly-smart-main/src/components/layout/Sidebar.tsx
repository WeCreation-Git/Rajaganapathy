import { 
  Building2, 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  X,
  Home
} 
from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import RajaganapathyLogo from "/rajaganapathy_logo.jpg";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Add Companies", href: "/companies", icon: Building2 },
  { name: "Companies", href: "/listcompanies", icon: Building2 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Bills", href: "/bills", icon: FileText },
  // { name: "Analytics", href: "/analytics", icon: BarChart3 },
  // { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => onOpenChange(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center space-x-2">
              {/* <FileText className="h-8 w-8 text-primary" /> */}
              <img src={RajaganapathyLogo} alt="Rajaganapathy Logo" className="w-12 h-12 object-contain" />
              <span className="text-xl font-bold text-foreground">RajaGanapathy</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                    isActive 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onOpenChange(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              Billing Application v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};