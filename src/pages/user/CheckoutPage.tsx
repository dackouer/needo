import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { MobileShell } from "../../components/mobile/MobileShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { services, stores, technicians } from "../../data/mock";
import { yen } from "../../lib/utils";

const steps = ["套餐", "时间", "地址/门店", "技师", "确认"];
const slots = ["今日 19:30", "今日 21:00", "明日 10:00", "明日 13:30", "周二 18:00", "周三 11:00"];

export function CheckoutPage() {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const [activePackage, setActivePackage] = useState(searchParams.get("package") ?? "");
  const [activeSlot, setActiveSlot] = useState("今日 21:00");
  const [activeTech, setActiveTech] = useState(searchParams.get("technician") ?? technicians[0].id);
  const store = stores.find((item) => item.id === searchParams.get("store"));
  const service = services.find((item) => item.id === serviceId) ?? services[0];
  const selectedPackage = useMemo(
    () => service.packages.find((pkg) => pkg.id === activePackage) ?? service.packages[0],
    [activePackage, service.packages]
  );

  return (
    <MobileShell>
      <div className="space-y-4 px-4 py-4">
        <header className="rounded-lg bg-ink p-4 text-white">
          <p className="text-xs font-bold text-mint">{store ? "到店预约" : "上门服务下单"}</p>
          <h1 className="mt-1 text-2xl font-black">{service.name}</h1>
          <div className="mt-4 grid grid-cols-5 gap-1">
            {steps.map((step, index) => (
              <div className="rounded-md bg-white/10 px-1 py-2 text-center text-[11px] font-semibold" key={step}>
                {index + 1}. {step}
              </div>
            ))}
          </div>
        </header>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h2 className="font-bold">选择套餐 / 时长</h2>
          <div className="mt-3 space-y-3">
            {service.packages.map((pkg) => (
              <button
                className={`w-full rounded-lg border p-3 text-left ${
                  selectedPackage.id === pkg.id ? "border-moss bg-mint/15" : "border-line bg-white"
                }`}
                key={pkg.id}
                onClick={() => setActivePackage(pkg.id)}
                type="button"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <strong>{pkg.name}</strong>
                    <p className="mt-1 text-xs text-ink/55">{pkg.durationMinutes} 分钟 · {pkg.description}</p>
                  </div>
                  <span className="font-black text-coral">{yen(pkg.price)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h2 className="font-bold">选择预约时间</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                className={`rounded-lg border px-2 py-3 text-xs font-bold ${
                  activeSlot === slot ? "border-moss bg-moss text-white" : "border-line bg-paper"
                }`}
                key={slot}
                onClick={() => setActiveSlot(slot)}
                type="button"
              >
                {slot}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{store ? "到店信息" : "服务地址"}</h2>
            <button className="text-sm font-bold text-moss" type="button">
              修改
            </button>
          </div>
          {store ? (
            <div className="mt-3 rounded-lg bg-paper p-3">
              <strong>{store.name}</strong>
              <p className="mt-1 text-sm text-ink/60">{store.address}</p>
              <p className="mt-1 text-sm text-ink/60">人数/时长：2 人 · {selectedPackage.durationMinutes} 分钟</p>
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-paper p-3">
              <strong>東京都新宿区西新宿7-9-12</strong>
              <p className="mt-1 text-sm text-ink/60">公寓 1204 · 林 小雨 · +81 80-2345-7812</p>
              <p className="mt-1 text-sm text-ink/60">备注：门禁请电话联系，可停车 15 分钟。</p>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h2 className="font-bold">{store ? "选择员工" : "选择技师"}</h2>
          <div className="mt-3 space-y-2">
            {technicians.map((tech) => (
              <button
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                  activeTech === tech.id ? "border-moss bg-mint/15" : "border-line bg-white"
                }`}
                key={tech.id}
                onClick={() => setActiveTech(tech.id)}
                type="button"
              >
                <img alt={tech.name} className="h-12 w-12 rounded-lg object-cover" src={tech.avatar} />
                <div className="min-w-0 flex-1">
                  <strong>{tech.name}</strong>
                  <p className="mt-1 text-xs text-coral">★ {tech.rating} · 接单率 {tech.acceptRate}%</p>
                </div>
                <Badge tone={tech.status === "available" ? "green" : "yellow"}>
                  {tech.status === "available" ? "可约" : "忙碌"}
                </Badge>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h2 className="font-bold">确认订单</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/55">服务</span>
              <strong>{service.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/55">预约时间</span>
              <strong>{activeSlot}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/55">套餐金额</span>
              <strong>{yen(selectedPackage.price)}</strong>
            </div>
            {!store && (
              <div className="flex justify-between">
                <span className="text-ink/55">上门费</span>
                <strong>{yen(800)}</strong>
              </div>
            )}
            <div className="border-t border-line pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold">应付金额</span>
                <strong className="text-xl text-coral">{yen(selectedPackage.price + (store ? 0 : 800))}</strong>
              </div>
            </div>
          </div>
          <textarea className="mt-4 h-20 w-full resize-none rounded-lg border border-line bg-paper p-3 text-sm outline-none" placeholder="填写备注：宠物、停车、语言偏好、门店座位需求" />
        </section>

        <div className="sticky bottom-20 rounded-lg border border-line bg-white p-3 shadow-soft">
          <div className="grid grid-cols-[1fr,150px] items-center gap-3">
            <div>
              <p className="text-xs text-ink/50">{store ? "支持支付定金或全款" : "支付后等待接单"}</p>
              <strong className="text-lg text-coral">{yen(selectedPackage.price + (store ? 0 : 800))}</strong>
            </div>
            <Button size="lg" to="/orders">
              确认支付
            </Button>
          </div>
        </div>

        <Link className="block text-center text-sm font-bold text-moss" to={store ? `/stores/${store.id}` : `/services/${service.id}`}>
          返回详情页
        </Link>
      </div>
    </MobileShell>
  );
}
