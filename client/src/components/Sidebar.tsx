import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Ticket,
  Settings,
  X,
  LogOut
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();

  const links = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="w-5 h-5 mr-3" />
    },
    {
      title: "Tickets",
      href: "/tickets",
      icon: <Ticket className="w-5 h-5 mr-3" />
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="w-5 h-5 mr-3" />
    }
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        !open && "transform -translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h1 className="text-xl font-bold text-slate-800">SupportDesk</h1>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-slate-500 md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                location === link.href || (link.href.includes('?') && location.startsWith(link.href.split('?')[0]))
                  ? "sidebar-active text-primary-600"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {link.icon}
              {link.title}
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-200">
            <Link
              href="/login"
              className="flex w-full items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-slate-100"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}
