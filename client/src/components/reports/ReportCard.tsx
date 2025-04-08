import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { ReactNode } from "react";

interface ReportCardProps {
  title: string;
  value: string;
  trend: string;
  trendType: "up" | "down" | "neutral";
  description: string;
  icon: ReactNode;
}

export default function ReportCard({
  title,
  value,
  trend,
  trendType,
  description,
  icon
}: ReportCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="rounded-full bg-slate-100 p-1.5 text-slate-600">
            {icon}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-semibold">{value}</p>
          <div className="mt-1 flex items-center text-xs">
            {trendType === "up" && (
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-600" />
            )}
            {trendType === "down" && (
              <ArrowDownIcon className="mr-1 h-3 w-3 text-red-600" />
            )}
            <span
              className={
                trendType === "up"
                  ? "text-green-600"
                  : trendType === "down"
                  ? "text-red-600"
                  : "text-slate-600"
              }
            >
              {trend}
            </span>
            <span className="ml-1 text-slate-500">{description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
