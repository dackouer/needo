import { Link } from "react-router-dom";
import { useState } from "react";
import { CategoryIcon } from "../../components/mobile/CategoryIcon";
import { MobileShell } from "../../components/mobile/MobileShell";
import { MobilePreferencePanel } from "../../components/mobile/MobilePreferencePanel";
import { SectionTitle } from "../../components/mobile/SectionTitle";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { coupons, orders, reviews, serviceGuarantees, stores, userStories } from "../../data/mock";
import { defaultHomeCategoryIds, getStoredHomeCategoryIds, homeCategoryOptions, saveHomeCategoryIds, type HomeCategoryId } from "../../lib/homeCategories";
import { cn, yen } from "../../lib/utils";

const orderShortcuts = [
  { label: "待付款", count: 1, to: "/orders" },
  { label: "待服务", count: 3, to: "/orders" },
  { label: "进行中", count: 2, to: "/orders" },
  { label: "已完成", count: 18, to: "/orders" },
  { label: "已取消", count: 1, to: "/orders" }
];

const serviceTools = [
  { label: "我的收藏", caption: "店铺、技师、服务", value: stores.length, to: "/stores" },
  { label: "我的优惠券", caption: "新人券、回流券、会员券", value: coupons.length, to: "/me" },
  { label: "我的地址", caption: "家庭、公司、常用地址", value: 4, to: "/checkout/svc-clean-1" },
  { label: "我的评价", caption: "已评价与待回复", value: reviews.length, to: "/me" },
  { label: "周期预约", caption: "保洁、护理、家电维护", value: 2, to: "/services" },
  { label: "家庭成员", caption: "老人、儿童、共同居住人", value: 3, to: "/me" }
];

const accountSettings = [
  { label: "账号设置", caption: "手机号、邮箱、登录密码", to: "/me" },
  { label: "支付方式", caption: "银行卡、PayPay、现金", to: "/me" },
  { label: "发票记录", caption: "企业抬头与历史发票", to: "/me" },
  { label: "通知设置", caption: "订单、营销、客服提醒", to: "/me" },
  { label: "隐私与安全", caption: "登录设备、数据授权", to: "/me" },
  { label: "联系客服", caption: "退款、改期、投诉风控", to: "/support" }
];

export function UserCenterPage() {
  const [homeCategoryIds, setHomeCategoryIds] = useState<HomeCategoryId[]>(getStoredHomeCategoryIds);
  const completedOrders = orders.filter((order) => order.status === "completed").length;
  const toggleHomeCategory = (id: HomeCategoryId) => {
    setHomeCategoryIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      const normalized = next.length ? next : current;
      saveHomeCategoryIds(normalized);

      return normalized;
    });
  };
  const restoreHomeCategories = () => {
    setHomeCategoryIds(defaultHomeCategoryIds);
    saveHomeCategoryIds(defaultHomeCategoryIds);
  };

  return (
    <MobileShell>
      <div className="space-y-4 px-4 py-4">
        <header className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
          <div className="relative p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    alt="用户头像"
                    className="h-16 w-16 rounded-lg object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
                  />
                  <div>
                    <p className="text-sm text-white/60">Gold Member</p>
                    <h1 className="text-2xl font-black">林 小雨</h1>
                    <p className="mt-1 text-xs text-white/60">东京 · 新宿 · 中文 / 日本語</p>
                  </div>
                </div>
                <Link className="rounded-lg bg-white/15 px-3 py-2 text-xs font-black" to="/me">
                  编辑
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-white/55">积分</p>
                  <strong>18,420</strong>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-white/55">优惠券</p>
                  <strong>{coupons.length}</strong>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-white/55">已完成</p>
                  <strong>{completedOrders}</strong>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-white/10 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/65">距离 Platinum</span>
                  <strong>72%</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[72%] rounded-full bg-lemon" />
                </div>
                <p className="mt-2 text-xs leading-5 text-white/60">再完成 6 笔上门服务，可升级享受优先派单与专属客服。</p>
              </div>
            </div>
          </div>
        </header>

        <MobilePreferencePanel currentPortal="user" />

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="rounded-lg border border-line bg-paper p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-ink/50">首页分类按钮</p>
                <strong className="mt-1 block">设置首页常用入口</strong>
              </div>
              <Button size="sm" variant="secondary" onClick={restoreHomeCategories}>
                恢复默认
              </Button>
            </div>
            <p className="mt-2 text-xs leading-5 text-ink/55">首页只保留已开启的核心服务；商务入口用于办公室、商旅和团队预约。</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {homeCategoryOptions.map((item) => {
                const enabled = homeCategoryIds.includes(item.id);

                return (
                  <button
                    className={cn(
                      "home-category-toggle focus-ring rounded-lg border px-3 py-3 text-left text-xs font-bold transition",
                      enabled ? "is-enabled border-moss bg-moss text-ink shadow-soft" : "border-line bg-white text-ink"
                    )}
                    key={item.id}
                    onClick={() => toggleHomeCategory(item.id)}
                    type="button"
                  >
                    <span className="flex items-center gap-3">
                      <CategoryIcon id={item.iconId} label={item.label} size="sm" />
                      <span className="min-w-0">
                        <span className="block text-base font-black leading-5">{item.label}</span>
                        <span className={cn("home-category-caption mt-1 block leading-5", enabled ? "text-ink/70" : "text-ink/55")}>{item.caption}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between">
            <h2 className="font-black">我的订单</h2>
            <Link className="text-sm font-bold text-moss" to="/orders">
              全部订单
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {orderShortcuts.map((item) => (
              <Link className="rounded-lg bg-paper px-1 py-3 text-center text-xs font-bold text-ink/70" key={item.label} to={item.to}>
                <strong className="block text-base text-ink">{item.count}</strong>
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {serviceTools.map((entry) => (
            <Link className="rounded-lg border border-line bg-white p-4 shadow-panel" key={entry.label} to={entry.to}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">{entry.label}</h3>
                  <p className="mt-2 text-xs leading-5 text-ink/50">{entry.caption}</p>
                </div>
                <span className="rounded-md bg-mint/20 px-2 py-1 text-xs font-black text-moss">{entry.value}</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between">
            <h2 className="font-black">钱包与会员</h2>
            <Badge tone="green">Gold</Badge>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["余额", yen(12800)],
              ["本月已省", yen(8200)],
              ["可用券", `${coupons.length}`]
            ].map(([label, value]) => (
              <div className="rounded-lg bg-paper p-3" key={label}>
                <p className="text-xs text-ink/50">{label}</p>
                <strong className="mt-1 block text-sm">{value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" to="/services">
              领券中心
            </Button>
            <Button to="/checkout/svc-clean-1">再次预约</Button>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h2 className="font-black">账号与服务</h2>
          <div className="mt-3 grid gap-2">
            {accountSettings.map((entry) => (
              <Link className="flex items-center justify-between rounded-lg bg-paper px-3 py-3" key={entry.label} to={entry.to}>
                <div>
                  <strong className="text-sm">{entry.label}</strong>
                  <p className="mt-1 text-xs text-ink/50">{entry.caption}</p>
                </div>
                <span className="text-sm font-black text-ink/35">›</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h2 className="font-black">会员权益</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">本月已节省 {yen(8200)}，下单上门按摩和家庭保洁可继续享受优先派单。</p>
          <Button className="mt-4 w-full" to="/services">
            去预约
          </Button>
        </section>

        <section>
          <SectionTitle title="服务保障" caption="迟到、售后、资质和保险都可以在这里追踪" />
          <div className="space-y-3">
            {serviceGuarantees.map((item) => (
              <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={item.title}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/60">{item.caption}</p>
                  </div>
                  <Badge tone="green">{item.metric}</Badge>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="近期用户反馈" caption="来自保洁、门店预约与宠物服务的真实使用场景" />
          <div className="space-y-3">
            {userStories.map((story) => (
              <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={story.name}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{story.name}</h3>
                    <p className="mt-1 text-xs text-ink/50">{story.city} · {story.service}</p>
                  </div>
                  <Badge tone="yellow">已省 {yen(story.saved)}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/65">{story.content}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
