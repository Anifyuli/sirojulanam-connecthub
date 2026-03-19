
import { cn } from "@/lib/utils";
import { PackageOpen } from "lucide-react";

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md skeleton-shimmer",
        className
      )}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 px-4 py-4 border-b border-border/50">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              className={cn("h-4 flex-1", col === 0 && "flex-[2]")}
            />
          ))}
          <div className="flex gap-2 w-20">
            <Skeleton className="h-7 w-8 rounded-md" />
            <Skeleton className="h-7 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4">
        {icon ?? <PackageOpen className="w-6 h-6 text-accent-foreground" />}
      </div>
      <p className="text-base font-semibold text-foreground mb-1 text-balance">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-5 text-pretty">{description}</p>
      )}
      {action}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const badgeVariants: Record<string, string> = {
  active:         "bg-green-100 text-green-700",
  upcoming:       "bg-accent text-accent-foreground",
  published:      "bg-green-100 text-green-700",
  draft:          "bg-muted text-muted-foreground",
  cancelled:      "bg-destructive/10 text-destructive",
  video:          "bg-accent text-accent-foreground",
  youtube:        "bg-red-50 text-red-600",
  youtube_shorts: "bg-red-50 text-red-600",
  tiktok:         "bg-pink-50 text-pink-600",
};

export function Badge({ variant, children, className }: { variant?: string; children: React.ReactNode; className?: string }) {
  const cls = variant ? (badgeVariants[variant] ?? "bg-muted text-muted-foreground") : "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", cls, className)}>
      {children}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
}

export function StatCard({ title, value, icon, subtext }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-semibold text-foreground tracking-tight">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
}

// ─── Table Wrapper ────────────────────────────────────────────────────────────

export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40 whitespace-nowrap align-middle", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 text-left text-sm text-foreground border-t border-border/60 align-middle whitespace-nowrap", className)}>
      {children}
    </td>
  );
}
