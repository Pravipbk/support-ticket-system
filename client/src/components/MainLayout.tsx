import { useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setSidebarOpen(false); // Close sidebar when location changes
  }, [location]);

  // Don't render the layout for login page
  if (location === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {location !== "/login" && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {location !== "/login" && <TopBar onMenuClick={() => setSidebarOpen(true)} />}
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
