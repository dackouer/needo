import type { ReactNode } from "react";
import { Button } from "./Button";

export function PageHeader({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase text-moss">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/60">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {children ?? (
          <>
            <Button variant="secondary">导出</Button>
            <Button>新建</Button>
          </>
        )}
      </div>
    </div>
  );
}
