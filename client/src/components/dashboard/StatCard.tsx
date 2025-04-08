import { Link } from "wouter";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  href: string;
  color: "primary" | "yellow" | "green" | "red";
}

export default function StatCard({ title, value, icon: Icon, href, color }: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return {
          bg: "bg-primary-100",
          text: "text-primary-600"
        };
      case "yellow":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-600"
        };
      case "green":
        return {
          bg: "bg-green-100",
          text: "text-green-600"
        };
      case "red":
        return {
          bg: "bg-red-100",
          text: "text-red-600"
        };
      default:
        return {
          bg: "bg-primary-100",
          text: "text-primary-600"
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", colorClasses.bg)}>
            <Icon className={cn("h-6 w-6", colorClasses.text)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-slate-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-3">
        <div className="text-sm">
          <Link href={href} className="font-medium text-primary-600 hover:text-primary-900">
            View all
          </Link>
        </div>
      </div>
    </div>
  );
}
