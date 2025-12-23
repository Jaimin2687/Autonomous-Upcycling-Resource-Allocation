import type { FC, ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  tone?: "neutral" | "positive" | "warning";
  footer?: ReactNode;
}

const toneClassMap: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  neutral: "text-slate-500",
  positive: "text-emerald-600",
  warning: "text-amber-600",
};

const KpiCard: FC<KpiCardProps> = ({
  title,
  value,
  delta,
  icon,
  tone,
  footer,
}: KpiCardProps) => {
  const currentTone: NonNullable<KpiCardProps["tone"]> = tone ?? "neutral";
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        {icon ? <div className="text-primary-500">{icon}</div> : null}
      </div>
  {delta ? <p className={`text-xs font-medium ${toneClassMap[currentTone]}`}>{delta}</p> : null}
      {footer ? <div className="text-xs text-slate-500">{footer}</div> : null}
    </div>
  );
};

export default KpiCard;
