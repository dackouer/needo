import { MobileShell } from "../../components/mobile/MobileShell";
import { StoreCard } from "../../components/mobile/StoreCard";
import { stores } from "../../data/mock";

const filters = ["区域", "评分 4.0+", "营业中", "今日可约", "包间", "人均", "优惠券", "中文菜单"];

export function StoreListPage() {
  return (
    <MobileShell>
      <div className="space-y-4 px-4 py-4">
        <header className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <p className="text-xs font-bold text-moss">Store Booking</p>
          <h1 className="mt-1 text-2xl font-black">附近店铺</h1>
          <label className="mt-4 flex h-11 items-center gap-2 rounded-lg border border-line bg-paper px-3">
            <span className="text-ink/35">⌕</span>
            <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="搜索居酒屋、美甲、护理门店" />
          </label>
        </header>

        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button className="h-9 shrink-0 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink/70" key={filter}>
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["综合", "距离", "评分", "收藏"].map((sort) => (
            <button className="rounded-lg bg-white px-2 py-2 text-xs font-bold text-ink/65" key={sort}>
              {sort}
            </button>
          ))}
        </div>

        <section className="space-y-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </section>
      </div>
    </MobileShell>
  );
}
