import { Link } from "react-router-dom";
import { useState } from "react";
import { CategoryIcon } from "../../components/mobile/CategoryIcon";
import { MobileShell } from "../../components/mobile/MobileShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { serviceCategories, services, stores, technicians } from "../../data/mock";
import { cn, yen } from "../../lib/utils";

const categoryDescriptions: Record<string, string> = {
  cleaning: "日常保洁、深度保洁、厨卫清洁、退房清扫",
  massage: "肩颈、腰背、全身、深夜到家",
  recycle: "旧家电、家具、纸箱、搬家杂物",
  pet: "喂养、遛狗、猫砂清理、洗护接送",
  business: "办公室保洁、商旅按摩、接待预约、企业月结",
  appliance: "空调、洗衣机、油烟机、浴室干燥机",
  repair: "水电、门锁、家具、墙面小修",
  beauty: "美甲、美睫、妆发、上门护理"
};

export function CategoryPage() {
  const [activeCategoryId, setActiveCategoryId] = useState(serviceCategories[0]?.id ?? "cleaning");
  const [categoryGridExpanded, setCategoryGridExpanded] = useState(false);
  const [bookingTab, setBookingTab] = useState<"all" | "stores" | "technicians">("all");
  const activeCategory = serviceCategories.find((category) => category.id === activeCategoryId) ?? serviceCategories[0];
  const collapsedCategories = serviceCategories.filter((category) => category.hot).slice(0, 8);
  const categoryGridItems = categoryGridExpanded
    ? serviceCategories
    : collapsedCategories.some((category) => category.id === activeCategoryId)
      ? collapsedCategories
      : [...collapsedCategories.slice(0, 9), activeCategory];
  const relatedServices = services
    .filter((service) => service.categoryId === activeCategoryId)
    .concat(services.filter((service) => service.categoryId !== activeCategoryId).slice(0, 4))
    .slice(0, 8);
  const relatedStores = stores.slice(0, 4);
  const relatedTechnicians = technicians.slice(0, 4);

  return (
    <MobileShell>
      <div className="space-y-5 px-4 py-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-moss">NeeDo Services</p>
            <h1 className="mt-1 text-2xl font-black">分类</h1>
            <p className="mt-1 text-xs text-ink/50">每个分类里同时展示个人、店铺和可预约服务。</p>
          </div>
          <Link className="rounded-lg bg-ink px-3 py-2 text-sm font-bold text-white" to="/search">
            搜索
          </Link>
        </header>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black">所有服务类别</h2>
              <p className="mt-1 text-xs text-ink/50">默认显示最火的 8 个类别，展开后可查看全部。</p>
            </div>
            <button className="rounded-lg bg-paper px-3 py-2 text-xs font-black text-moss" onClick={() => setCategoryGridExpanded((current) => !current)} type="button">
              {categoryGridExpanded ? "收起分类" : "展开全部"}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {categoryGridItems.map((category) => (
              <button
                className={cn(
                  "min-h-[104px] rounded-lg border p-2 text-center transition",
                  activeCategoryId === category.id ? "border-moss bg-moss text-white shadow-soft" : "border-line bg-paper text-ink"
                )}
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                type="button"
              >
                <CategoryIcon className="mx-auto" id={category.id} label={category.name} size="lg" />
                <span className="mt-2 block text-[11px] font-black leading-4">{category.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-xs font-bold text-ink/40">
            {categoryGridExpanded ? (
              <>
                <span>已显示全部</span> {serviceCategories.length} <span>个类别</span>
              </>
            ) : (
              <>
                <span>已收起，显示</span> {categoryGridItems.length} <span>个常用类别</span>
              </>
            )}
          </p>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge tone={activeCategory.hot ? "red" : "green"}>{activeCategory.hot ? "热门分类" : activeCategory.mode}</Badge>
              <h2 className="mt-2 text-xl font-black">{activeCategory.name}</h2>
              <p className="mt-1 text-sm leading-6 text-ink/55">{categoryDescriptions[activeCategory.id] ?? "预约、上门、门店服务"}</p>
            </div>
            <Button size="sm" to={`/services?category=${activeCategory.id}`}>
              全部服务
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black">可预约服务</h2>
              <p className="mt-1 text-xs text-ink/50">和首页附近可预约一致，可以按全部、店铺、个人切换。</p>
            </div>
            <Link className="text-xs font-black text-moss" to={`/services?category=${activeCategory.id}`}>更多</Link>
          </div>
          <div className="mt-3 grid grid-cols-3 rounded-lg bg-paper p-1 text-xs font-black">
            {[
              ["all", "全部"],
              ["stores", "店铺"],
              ["technicians", "个人"]
            ].map(([key, label]) => (
              <button
                className={cn("rounded-md px-3 py-2", bookingTab === key ? "bg-moss text-white" : "text-ink/55")}
                key={key}
                onClick={() => setBookingTab(key as "all" | "stores" | "technicians")}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-3">
            {bookingTab === "all" && relatedServices.slice(0, 4).map((service) => (
              <Link className="flex items-center justify-between rounded-lg bg-paper px-3 py-3" key={service.id} to={`/services/${service.id}`}>
                <span className="min-w-0">
                  <strong className="block truncate text-sm">{service.name}</strong>
                  <span className="mt-1 block text-xs text-ink/45">个人与店铺均可承接 · {service.fastestArrival}</span>
                </span>
                <span className="shrink-0 text-sm font-bold text-coral">{yen(service.priceFrom)} 起</span>
              </Link>
            ))}

            {bookingTab !== "technicians" && relatedStores.slice(0, bookingTab === "all" ? 2 : 4).map((store) => (
              <Link className="flex gap-3 rounded-lg bg-paper p-3" key={store.id} to={`/stores/${store.id}`}>
                <img alt={store.name} className="h-20 w-20 rounded-lg object-cover" src={store.cover} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-black">{store.name}</h3>
                    <Badge tone={store.openStatus === "open" ? "green" : "yellow"}>店铺</Badge>
                  </div>
                  <p className="mt-1 text-xs text-coral">★ {store.rating} · {store.reviewCount} 评论</p>
                  <p className="mt-1 truncate text-xs text-ink/50">{store.area} · {store.priceLabel} · {store.nextSlot}</p>
                </div>
              </Link>
            ))}

            {bookingTab !== "stores" && relatedTechnicians.slice(0, bookingTab === "all" ? 2 : 4).map((tech) => (
              <Link className="flex gap-3 rounded-lg bg-paper p-3" key={tech.id} to={`/services/${relatedServices[0]?.id ?? "svc-clean-1"}?technician=${tech.id}`}>
                <img alt={tech.name} className="h-20 w-20 rounded-lg object-cover" src={tech.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black">{tech.name}</h3>
                    <Badge tone={tech.status === "available" ? "green" : "yellow"}>个人</Badge>
                  </div>
                  <p className="mt-1 text-xs text-coral">★ {tech.rating} · 已服务 {tech.orderCount} 单</p>
                  <p className="mt-1 truncate text-xs text-ink/50">{tech.skills.join(" / ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
