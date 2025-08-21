import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        "lg:ml-64" // Sidebar width on large screens
      )}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};