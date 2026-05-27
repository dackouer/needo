import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function SectionTitle({
  title,
  caption,
  to,
  children
}: {
  title: string;
  caption?: string;
  to?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {caption && <p className="mt-1 text-xs text-current/60">{caption}</p>}
      </div>
      {children}
      {to && (
        <Link className="text-sm font-bold text-moss" to={to}>
          查看全部
        </Link>
      )}
    </div>
  );
}
