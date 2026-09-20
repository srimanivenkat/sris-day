"use client";
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({ icon, label, value, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 text-primary rounded-md">
              {icon}
            </div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center text-sm font-medium",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {trend === "up" && <ArrowUpRight className="w-4 h-4 mr-1" />}
              {trend === "down" && <ArrowDownRight className="w-4 h-4 mr-1" />}
              {trend === "neutral" && <Minus className="w-4 h-4 mr-1" />}
            </div>
          )}
        </div>
        <div className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            {value}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
