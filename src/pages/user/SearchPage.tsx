import { useMemo, useState } from "react";
import { MobileShell } from "../../components/mobile/MobileShell";
import { ServiceCard } from "../../components/mobile/ServiceCard";
import { StoreCard } from "../../components/mobile/StoreCard";
import { Tabs } from "../../components/ui/Tabs";
import { serviceCategories, services, stores, technicians } from "../../data/mock";

const filters = ["价格区间", "评分", "可预约时间", "可上门", "即刻达", "服务时长", "女性可选", "中文/英文", "当日预约", "优惠券"];
const sorts = ["综合排序", "距离最近", "评分最高", "销量最高", "价格最低", "价格最高"];

export function SearchPage() {
  const [tab, setTab] = useState("服务");
  const [query, setQuery] = useState("");

  const matchedServices = useMemo(
    () => services.filter((service) => `${service.name}${service.tags.join("")}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  const matchedStores = useMemo(
    () => stores.filter((store) => `${store.name}${store.area}${store.tags.join("")}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <MobileShell>
      <div className="space-y-4 px-4 py-4">
        <div className="flex gap-2">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3">
            <span className="text-ink/35">⌕</span>
            <input
              className="min-w-0 flex-1 outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="服务、技师、店铺、区域、标签"
              value={query}
            />
          </label>
          <button className="rounded-lg bg-ink px-4 text-sm font-bold text-white">搜索</button>
        </div>

        <Tabs active={tab} items={["服务", "店铺", "技师"]} onChange={setTab} />

        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button className="h-9 shrink-0 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink/70" key={filter}>
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {sorts.map((sort) => (
            <button className="rounded-lg bg-white px-2 py-2 text-xs font-bold text-ink/65" key={sort}>
              {sort}
            </button>
          ))}
        </div>

        {tab === "服务" && (
          <div className="space-y-3">
            {(query ? matchedServices : services).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
        {tab === "店铺" && (
          <div className="space-y-3">
            {(query ? matchedStores : stores).map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
        {tab === "技师" && (
          <div className="grid gap-3">
            {technicians.map((tech) => (
              <article className="rounded-lg border border-line bg-white p-3 shadow-panel" key={tech.id}>
                <div className="flex gap-3">
                  <img alt={tech.name} className="h-16 w-16 rounded-lg object-cover" src={tech.avatar} />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold">{tech.name}</h2>
                    <p className="mt-1 text-xs text-coral">★ {tech.rating} · 接单率 {tech.acceptRate}%</p>
                    <p className="mt-1 text-xs text-ink/55">{tech.skills.join(" / ")}</p>
                    <p className="mt-1 text-xs text-ink/55">服务区域：{tech.serviceAreas.join("、")}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h2 className="font-bold">热门搜索</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {serviceCategories.slice(0, 8).map((category) => (
              <span className="rounded-lg bg-paper px-3 py-2 text-xs font-semibold" key={category.id}>
                {category.name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
