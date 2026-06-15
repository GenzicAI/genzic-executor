import type { StatDef } from "@/lib/niches/types";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatCompact } from "@/lib/utils";

interface StatCardProps {
  stat: StatDef;
  value: number;
}

export function StatCard({ stat, value }: StatCardProps) {
  const Icon = stat.icon;
  const display =
    stat.format === "currency" ? formatCurrency(value) : formatCompact(value);

  return (
    <Card className="relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{display}</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-niche/15 text-niche">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-niche/10 blur-xl" />
    </Card>
  );
}
