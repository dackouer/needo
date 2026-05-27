import { Link } from "react-router-dom";
import { MobileShell } from "../../components/mobile/MobileShell";
import { Button } from "../../components/ui/Button";

export function SupportPage() {
  return (
    <MobileShell>
      <div className="space-y-4 px-4 py-4">
        <header className="rounded-lg bg-ink p-4 text-white">
          <p className="text-xs font-bold text-mint">Support</p>
          <h1 className="mt-1 text-2xl font-black">客服中心</h1>
          <p className="mt-2 text-sm leading-6 text-white/70">订单改期、退款、商家沟通与紧急工单可以从这里进入。</p>
        </header>
        <section className="grid gap-3">
          {["订单咨询", "退款申请", "改期协助", "商家入驻", "投诉与风控"].map((item) => (
            <button className="rounded-lg border border-line bg-white p-4 text-left font-bold shadow-panel" key={item} type="button">
              {item}
              <p className="mt-1 text-sm font-medium text-ink/55">预计 3 分钟内接入在线客服</p>
            </button>
          ))}
        </section>
        <Button className="w-full" to="/orders">
          查看我的订单
        </Button>
        <Link className="block text-center text-sm font-bold text-moss" to="/">
          返回首页
        </Link>
      </div>
    </MobileShell>
  );
}
