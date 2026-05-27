import { Link, useSearchParams } from "react-router-dom";
import { MobileShell } from "../../components/mobile/MobileShell";
import { ServiceCard } from "../../components/mobile/ServiceCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { serviceCategories, services } from "../../data/mock";

const filterChips = ["价格", "评分 4.8+", "今日可约", "可上门", "最快到达", "女性可选", "中文/英文", "有优惠券"];

export function ServiceListPage() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const activeCategory = serviceCategories.find((item) => item.id === categoryId);
  const filtered = categoryId ? services.filter((service) => service.categoryId === categoryId) : services;

  return (
    <MobileShell>
      <div className="space-y-4 px-4 py-4">
        <header className="rounded-lg bg-ink p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-mint">上门服务</p>
              <h1 className="mt-1 text-2xl font-black">{activeCategory?.name ?? "全部服务"}</h1>
            </div>
            <Button variant="secondary" size="sm" to="/search">
              搜索
            </Button>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/70">价格、评分、可预约时间、语言能力和服务区域可以组合筛选。</p>
        </header>

        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {filterChips.map((chip) => (
            <button className="h-9 shrink-0 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink/70" key={chip}>
              {chip}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["综合", "距离", "销量", "价格"].map((sort) => (
            <button className="rounded-lg bg-white px-2 py-2 text-xs font-bold text-ink/65" key={sort}>
              {sort}
            </button>
          ))}
        </div>

        <section className="space-y-3">
          {filtered.length ? (
            filtered.map((service) => <ServiceCard key={service.id} service={service} />)
          ) : (
            <div className="rounded-lg border border-line bg-white p-5 text-center shadow-panel">
              <Badge tone="yellow">暂无完全匹配</Badge>
              <p className="mt-3 text-sm text-ink/60">先展示东京可约热门服务。</p>
              <div className="mt-4 space-y-3">
                {services.slice(0, 2).map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          )}
        </section>

        <Link className="block rounded-lg bg-coral p-4 text-white shadow-panel" to="/checkout/svc-clean-1">
          <p className="text-xs font-bold text-white/75">企业与家庭周期服务</p>
          <h2 className="mt-1 text-xl font-black">固定保洁排班可托管</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">适合 Airbnb、办公室、长期护理家庭。</p>
        </Link>
      </div>
    </MobileShell>
  );
}
