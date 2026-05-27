import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { yen, shortNumber } from "../../lib/utils";
import type { ServiceItem } from "../../types/domain";

export function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <Link
      className="grid grid-cols-[132px,1fr] gap-3 rounded-lg border border-line bg-white p-3 text-ink shadow-panel"
      to={`/services/${service.id}`}
    >
      <img alt={service.name} className="h-32 w-32 rounded-lg object-cover" src={service.cover} />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-bold">{service.name}</h3>
          <span className="shrink-0 text-xs font-bold text-coral">★ {service.rating}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/60">{service.summary}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {service.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} tone="green">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <strong className="text-lg text-coral">{yen(service.priceFrom)}</strong>
            <span className="ml-1 text-xs text-ink/50">起</span>
          </div>
          <span className="text-xs font-semibold text-ink/50">{shortNumber(service.sales)} 单</span>
        </div>
      </div>
    </Link>
  );
}
