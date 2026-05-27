import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import type { Store } from "../../types/domain";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link className="block rounded-lg border border-line bg-white p-3 text-ink shadow-panel" to={`/stores/${store.id}`}>
      <div className="grid grid-cols-[132px,1fr] gap-3">
        <img alt={store.name} className="h-32 w-[132px] rounded-lg object-cover" src={store.cover} />
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-bold">{store.name}</h3>
            <Badge tone={store.openStatus === "open" ? "green" : "yellow"}>
              {store.openStatus === "open" ? "营业中" : "可预约"}
            </Badge>
          </div>
          <p className="mt-1 text-xs font-semibold text-coral">★ {store.rating} · {store.reviewCount} 条评价</p>
          <p className="mt-1 text-xs text-ink/55">{store.area} · {store.priceLabel}</p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/60">{store.description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex flex-wrap gap-1">
          {store.tags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <span className="text-xs font-bold text-moss">{store.nextSlot}</span>
      </div>
    </Link>
  );
}
