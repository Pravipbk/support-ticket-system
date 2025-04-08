import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const getPageTitle = () => {
    if (location === "/" || location === "/dashboard") return "Dashboard";
    if (location === "/tickets") return "All Tickets";
    if (location === "/my-tickets") return "My Tickets";
    if (location.startsWith("/tickets/")) return "Ticket Details";
    if (location === "/team") return "Team Members";
    if (location === "/reports") return "Reports";
    if (location === "/settings") return "Settings";
    if (location.includes("?status=open")) return "Pending Tickets";
    if (location.includes("?status=resolved")) return "Resolved Tickets";
    return "SupportDesk";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tickets?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications at this time.",
    });
  };

  return (
    <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 md:px-6">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-500 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-4 md:ml-0">
          <h2 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h2>
        </div>
      </div>
      <div className="flex items-center">
        <form onSubmit={handleSearch} className="relative mr-4">
          <Input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-4 text-sm bg-slate-100 border-transparent rounded-md focus:border-primary-500 focus:bg-white focus:ring-0"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
        </form>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNotificationClick}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600"
        >
          <Bell className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
