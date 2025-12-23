import type { FC, PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";

interface CardOptions {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

type CardProps = PropsWithChildren<CardOptions>;

const Card: FC<CardProps> = ({ title, description, action, className, children }: CardProps) => {
  return (
    <div className={clsx("space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      {(title || description || action) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div className="space-y-4 text-sm text-slate-600">{children}</div>
    </div>
  );
};

export default Card;
