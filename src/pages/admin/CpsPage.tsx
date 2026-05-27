import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ModuleShell } from "../../components/admin/ModuleShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Drawer } from "../../components/ui/Drawer";
import { FilterBar } from "../../components/ui/FilterBar";
import { cpsReferrals } from "../../data/mock";
import { yen } from "../../lib/utils";
import type { CpsReferral } from "../../types/domain";

const statusTone: Record<CpsReferral["status"], "green" | "yellow" | "red" | "neutral"> = {
  active: "green",
  pending: "yellow",
  paused: "neutral",
  ended: "red"
};

const typeLabel: Record<CpsReferral["introducedType"], string> = {
  customer: "客户",
  business: "业务",
  technician: "技师",
  store: "店铺"
};

export function CpsPage() {
  const [rows, setRows] = useState<CpsReferral[]>(cpsReferrals);
  const [showCreator, setShowCreator] = useState(false);
  const [draft, setDraft] = useState({
    referrerName: "新宿用户社群 Partner",
    introducedName: "新介绍客户",
    assignedTo: "东京增长组",
    commissionRule: "1 年内每单 ¥500",
    payoutAmount: "500",
    payoutDuration: "1 年",
    condition: "完成支付订单后自动计算"
  });
  const activeItems = rows.filter((item) => item.status === "active");
  const fixedPayout = rows.reduce((sum, item) => sum + item.payoutAmount, 0);

  const createReferral = () => {
    setRows((current) => [
      {
        id: `cps-created-${Date.now()}`,
        referrerName: draft.referrerName,
        referrerType: "partner",
        introducedType: "customer",
        introducedName: draft.introducedName,
        introducedAt: "2026-04-13 22:00",
        assignedTo: draft.assignedTo,
        commissionRule: draft.commissionRule,
        payoutAmount: Number(draft.payoutAmount) || 0,
        payoutDuration: draft.payoutDuration,
        condition: draft.condition,
        status: "pending"
      },
      ...current
    ]);
    setShowCreator(false);
  };

  return (
    <AdminLayout>
      <ModuleShell
        title="CPS 增长系统"
        description="记录谁在什么时间介绍了客户、业务、技师或店铺，分给谁、怎么分、支付多久、满足什么条件。"
        actions={<Button onClick={() => setShowCreator(true)}>新建 CPS 规则</Button>}
      >
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["有效关系", activeItems.length.toLocaleString("ja-JP"), "正在计佣"],
            ["待审核", rows.filter((item) => item.status === "pending").length.toLocaleString("ja-JP"), "需运营确认"],
            ["固定待支付", yen(fixedPayout), "一次性/每单固定"],
            ["覆盖对象", "客户 / 技师 / 店铺 / 业务", "增长来源"]
          ].map(([label, value, caption]) => (
            <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={label}>
              <p className="text-sm text-ink/55">{label}</p>
              <strong className="mt-2 block text-2xl">{value}</strong>
              <p className="mt-2 text-xs text-ink/50">{caption}</p>
            </article>
          ))}
        </section>

        <div className="mt-5">
          <FilterBar
            searchPlaceholder="搜索介绍人、客户、技师、店铺、业务"
            filters={[
              { label: "对象", options: Object.entries(typeLabel).map(([value, label]) => ({ value, label })) },
              { label: "状态", options: [{ label: "active", value: "active" }, { label: "pending", value: "pending" }, { label: "paused", value: "paused" }] },
              { label: "支付周期", options: [{ label: "1 年", value: "1y" }, { label: "100 年", value: "100y" }, { label: "永久", value: "forever" }] }
            ]}
          />
        </div>

        <section className="mt-4 rounded-lg border border-line bg-white p-4 shadow-panel">
          <h2 className="font-black">增长规则说明</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {[
              ["按订单固定奖励", "例如 1 年内每单支付 ¥500，适合用户拉新。"],
              ["按流水比例分成", "例如百年内 20% 或永久 3%，适合技师、店铺和业务转介绍。"],
              ["按达成条件支付", "例如入驻审核通过、完成首单、首月达到 30 单后才支付。"]
            ].map(([title, caption]) => (
              <article className="rounded-lg bg-paper p-3" key={title}>
                <h3 className="text-sm font-black">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-ink/55">{caption}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-4">
          <DataTable<CpsReferral>
            columns={[
              { key: "referrer", title: "介绍人", render: (row) => row.referrerName },
              { key: "type", title: "介绍对象", render: (row) => <Badge tone="green">{typeLabel[row.introducedType]}</Badge> },
              { key: "target", title: "客户/业务/技师/店铺", render: (row) => row.introducedName },
              { key: "time", title: "介绍时间", render: (row) => row.introducedAt },
              { key: "assigned", title: "给到谁", render: (row) => row.assignedTo },
              { key: "rule", title: "分成规则", render: (row) => row.commissionRule },
              { key: "amount", title: "固定支付", render: (row) => row.payoutAmount ? yen(row.payoutAmount) : "按比例" },
              { key: "duration", title: "支付多久", render: (row) => row.payoutDuration },
              { key: "condition", title: "条件", render: (row) => row.condition },
              { key: "status", title: "状态", render: (row) => <Badge tone={statusTone[row.status]}>{row.status}</Badge> }
            ]}
            rows={rows}
            pageSize={10}
          />
        </div>
      </ModuleShell>

      <Drawer open={showCreator} title="新建 CPS 规则" onClose={() => setShowCreator(false)}>
        <div className="space-y-3">
          {[
            ["referrerName", "介绍人"],
            ["introducedName", "客户/业务/技师/店铺"],
            ["assignedTo", "给到谁"],
            ["commissionRule", "分成规则"],
            ["payoutAmount", "固定支付"],
            ["payoutDuration", "支付多久"],
            ["condition", "条件"]
          ].map(([key, label]) => (
            <label className="block" key={key}>
              <span className="mb-1 block text-xs font-bold text-ink/45">{label}</span>
              <input
                className="h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm font-bold outline-none"
                onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                value={draft[key as keyof typeof draft]}
              />
            </label>
          ))}
          <div className="rounded-lg bg-paper p-3 text-xs leading-5 text-ink/55">
            默认先创建为待审核关系，运营确认介绍对象、支付周期和条件后再启用计佣。
          </div>
          <Button className="w-full" onClick={createReferral}>
            保存 CPS 规则
          </Button>
        </div>
      </Drawer>
    </AdminLayout>
  );
}
