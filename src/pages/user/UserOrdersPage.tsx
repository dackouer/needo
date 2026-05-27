import { Link } from "react-router-dom";
import { useState } from "react";
import { MobileShell } from "../../components/mobile/MobileShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { imageBank, orders, services, stores, technicians } from "../../data/mock";
import { statusLabel, yen } from "../../lib/utils";
import type { Order } from "../../types/domain";

const tabs = ["全部", "待付款", "待服务", "进行中", "已完成", "已取消"];
type OrderProfileType = "customer" | "merchant" | "service";
type SelectedProfile = { order: Order; type: OrderProfileType };

function getOrderService(order: Order) {
  return services.find((service) => order.itemName.includes(service.name) || service.name.includes(order.itemName)) ?? services[0];
}

function getOrderPartner(order: Order) {
  if (order.mode === "store") {
    return stores.find((store) => store.name === order.storeName) ?? stores[0];
  }

  return technicians.find((tech) => tech.name === order.technicianName) ?? technicians[0];
}

function getPaymentCopy(order: Order) {
  if (order.paymentStatus === "paid") {
    return { title: "平台支付", detail: "已通过 NeeDo 平台完成支付，服务完成后自动结算。" };
  }

  if (order.paymentStatus === "depositPaid") {
    return { title: "平台定金 + 线下尾款", detail: "定金已通过平台支付，尾款可到店或服务后确认。" };
  }

  if (order.paymentStatus === "refunded") {
    return { title: "平台原路退款", detail: "款项已由平台按原支付路径处理。" };
  }

  return order.mode === "store"
    ? { title: "线下支付待确认", detail: "到店后可由门店确认现金、刷卡或平台补款。" }
    : { title: "平台待支付", detail: "建议通过 NeeDo 平台支付，便于售后和保障。" };
}

function getBookingTime(order: Order) {
  const date = new Date(order.bookedAt.replace(" ", "T"));
  const service = getOrderService(order);
  const minutes = service.packages[0]?.durationMinutes ?? 60;
  const end = new Date(date.getTime() + minutes * 60 * 1000);
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  return {
    month: `${date.getMonth() + 1}月`,
    day: String(date.getDate()).padStart(2, "0"),
    weekday: weekdays[date.getDay()],
    band: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} - ${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
  };
}

function ProfileModal({ selected, onClose }: { selected: SelectedProfile; onClose: () => void }) {
  const { order, type } = selected;
  const service = getOrderService(order);
  const partner = getOrderPartner(order);
  const isStore = order.mode === "store";
  const title = type === "customer" ? order.customerName : type === "merchant" ? (isStore ? order.storeName ?? "预约门店" : order.technicianName ?? "服务技师") : service.name;
  const image = type === "customer" ? imageBank.home : type === "merchant" ? ("cover" in partner ? partner.cover : partner.avatar) : service.cover;
  const payment = getPaymentCopy(order);

  return (
    <section className="fixed inset-y-0 left-1/2 z-50 flex h-[100dvh] w-full max-w-[480px] -translate-x-1/2 flex-col overflow-hidden bg-paper text-ink shadow-soft">
      <header className="relative min-h-64 overflow-hidden bg-ink text-white">
        <img alt={title} className="absolute inset-0 h-full w-full object-cover opacity-45" src={image} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
        <button className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-2 text-sm font-black text-ink" onClick={onClose} type="button">
          返回
        </button>
        <div className="relative flex min-h-64 items-end p-4">
          <div>
            <Badge tone="yellow">{type === "customer" ? "用户资料" : type === "merchant" ? (isStore ? "商户资料" : "技师资料") : "服务资料"}</Badge>
            <h2 className="mt-3 text-2xl font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">{order.orderNo} · {order.area}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h3 className="font-black">预约与支付</h3>
          <div className="mt-3 grid grid-cols-[86px,1fr] gap-3">
            <BookingCalendar order={order} />
            <div className="rounded-lg bg-paper p-3">
              <p className="text-xs font-bold text-ink/45">金额与支付方式</p>
              <strong className="mt-1 block text-xl text-coral">{yen(order.amount)}</strong>
              <p className="mt-2 text-sm font-black text-moss">{payment.title}</p>
              <p className="mt-1 text-xs leading-5 text-ink/55">{payment.detail}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h3 className="font-black">关键信息</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["服务项目", order.itemName],
              [isStore ? "预约商户" : "服务技师", isStore ? order.storeName ?? "-" : order.technicianName ?? "-"],
              ["服务区域", `${order.city} · ${order.area}`],
              ["订单状态", statusLabel(order.status)]
            ].map(([label, value]) => (
              <div className="rounded-lg bg-paper p-3" key={label}>
                <p className="text-[11px] font-bold text-ink/45">{label}</p>
                <strong className="mt-1 block text-sm">{value}</strong>
              </div>
            ))}
          </div>
          {type === "service" && (
            <div className="mt-3 rounded-lg bg-paper p-3">
              <p className="text-xs leading-6 text-ink/60">{service.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {service.tags.slice(0, 4).map((tag) => <Badge key={tag} tone="yellow">{tag}</Badge>)}
              </div>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" to={`/messages?chat=user-${type}`}>
            发信息
          </Button>
          <Button size="lg">
            平台内通话
          </Button>
          <Button variant="secondary" size="lg" to="/moments">
            查看动态
          </Button>
          <Button variant="secondary" size="lg" to={type === "service" ? `/services/${service.id}` : isStore ? `/stores/${stores[0].id}` : `/services/${service.id}`}>
            查看详情
          </Button>
        </section>
      </div>
    </section>
  );
}

function BookingCalendar({ order }: { order: Order }) {
  const time = getBookingTime(order);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white text-center shadow-panel">
      <div className="bg-ink px-2 py-2 text-xs font-black text-lemon">{time.month}</div>
      <div className="px-2 py-3">
        <strong className="block text-3xl leading-none">{time.day}</strong>
        <span className="mt-1 block text-xs font-bold text-ink/45">{time.weekday}</span>
      </div>
      <div className="border-t border-line bg-lemon/25 px-2 py-2 text-[11px] font-black text-[#3a2c00]">{time.band}</div>
    </div>
  );
}

export function UserOrdersPage() {
  const [selectedProfile, setSelectedProfile] = useState<SelectedProfile | null>(null);

  return (
    <MobileShell>
      <div className="space-y-4 px-4 py-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-moss">Orders</p>
            <h1 className="mt-1 text-2xl font-black">我的订单</h1>
          </div>
          <Button variant="secondary" size="sm" to="/support">
            客服
          </Button>
        </header>

        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button className={`h-9 shrink-0 rounded-lg px-3 text-sm font-bold ${index === 0 ? "bg-ink text-white" : "bg-white text-ink/65"}`} key={tab}>
              {tab}
            </button>
          ))}
        </div>

        <section className="space-y-3">
          {orders.map((order) => (
            <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={order.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink/45">{order.orderNo}</p>
                  <h2 className="mt-1 font-bold">{order.itemName}</h2>
                </div>
                <Badge tone={order.status === "refunding" ? "red" : order.status === "completed" ? "green" : "yellow"}>
                  {statusLabel(order.status)}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-[86px,1fr] gap-3">
                <BookingCalendar order={order} />
                <div className="grid gap-2 text-sm">
                  <span className="rounded-lg bg-paper px-3 py-2 text-ink/65">{order.mode === "home" ? "上门服务" : "到店预约"} · {order.area}</span>
                  <span className="rounded-lg bg-paper px-3 py-2 text-ink/65">{order.technicianName ?? order.storeName}</span>
                  <span className="rounded-lg bg-lemon/25 px-3 py-2 text-[#3a2c00]">
                    支付方式：<strong>{getPaymentCopy(order).title}</strong>
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ["customer", "用户", order.customerName],
                  ["merchant", order.mode === "store" ? "商户" : "技师", order.storeName ?? order.technicianName ?? "-"],
                  ["service", "服务", order.itemName]
                ].map(([type, label, value]) => (
                  <button
                    className="rounded-lg border border-line bg-paper p-2 text-left"
                    key={type}
                    onClick={() => setSelectedProfile({ order, type: type as OrderProfileType })}
                    type="button"
                  >
                    <span className="text-[10px] font-black text-moss">{label}</span>
                    <strong className="mt-1 line-clamp-2 block text-xs leading-4">{value}</strong>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <div>
                  <strong className="block text-coral">{yen(order.amount)}</strong>
                  <span className="mt-0.5 block text-[11px] font-bold text-ink/45">{getPaymentCopy(order).title}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    改期
                  </Button>
                  <Button size="sm" to={order.status === "completed" ? "/me" : "/support"}>
                    {order.status === "completed" ? "评价" : "联系"}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <Link className="block rounded-lg bg-moss p-4 text-white shadow-panel" to="/services">
          <p className="text-xs text-white/70">再次预约</p>
          <h2 className="mt-1 text-lg font-black">查看今日可上门服务</h2>
        </Link>
      </div>
      {selectedProfile && <ProfileModal selected={selectedProfile} onClose={() => setSelectedProfile(null)} />}
    </MobileShell>
  );
}
