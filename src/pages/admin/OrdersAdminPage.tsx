import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DetailGrid } from "../../components/admin/DetailGrid";
import { ModuleShell } from "../../components/admin/ModuleShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Drawer } from "../../components/ui/Drawer";
import { FilterBar } from "../../components/ui/FilterBar";
import { Tabs } from "../../components/ui/Tabs";
import { orders } from "../../data/mock";
import { statusLabel, yen } from "../../lib/utils";
import type { Order } from "../../types/domain";

const statusTabs = ["全部订单", "待确认", "待支付", "待服务", "服务中", "待评价", "已完成", "已取消", "退款中", "已退款"];

export function OrdersAdminPage() {
  const [active, setActive] = useState("全部订单");
  const [selected, setSelected] = useState<Order | null>(null);

  return (
    <AdminLayout>
      <ModuleShell
        title="订单中心"
        description="覆盖上门订单与到店预约订单的确认、改期、派单、改价、取消、退款、收款确认与单据打印。"
        actions={<Button>创建预约</Button>}
      >
        <Tabs active={active} items={statusTabs} onChange={setActive} />
        <div className="mt-4">
          <FilterBar
            filters={[
              { label: "城市", options: [{ label: "东京", value: "tokyo" }, { label: "大阪", value: "osaka" }] },
              { label: "来源", options: [{ label: "App", value: "app" }, { label: "LINE", value: "line" }] },
              { label: "支付状态", options: [{ label: "已支付", value: "paid" }, { label: "未支付", value: "unpaid" }] }
            ]}
          />
        </div>
        <div className="mt-4">
          <DataTable<Order>
            columns={[
              { key: "orderNo", title: "订单编号", render: (row) => row.orderNo },
              { key: "customer", title: "用户信息", render: (row) => row.customerName },
              { key: "service", title: "服务信息", render: (row) => row.itemName },
              { key: "provider", title: "门店/技师", render: (row) => row.storeName ?? row.technicianName ?? "待分配" },
              { key: "amount", title: "价格组成", render: (row) => yen(row.amount) },
              { key: "pay", title: "支付状态", render: (row) => <Badge tone="green">{row.paymentStatus}</Badge> },
              { key: "status", title: "状态", render: (row) => <Badge tone={row.status === "refunding" ? "red" : "yellow"}>{statusLabel(row.status)}</Badge> }
            ]}
            rows={orders}
            onView={setSelected}
          />
        </div>
      </ModuleShell>

      <Drawer open={Boolean(selected)} title="订单详情" onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-5">
            <DetailGrid
              items={[
                { label: "订单编号", value: selected.orderNo },
                { label: "用户信息", value: `${selected.customerName} / ${selected.customerId}` },
                { label: "服务信息", value: selected.itemName },
                { label: "门店/技师", value: selected.storeName ?? selected.technicianName ?? "待分配" },
                { label: "价格组成", value: yen(selected.amount) },
                { label: "支付状态", value: selected.paymentStatus },
                { label: "预约时间", value: selected.bookedAt },
                { label: "备注", value: selected.remark ?? "无" }
              ]}
            />
            <section className="rounded-lg border border-line bg-paper p-4">
              <h3 className="font-bold">状态流转记录 / 操作日志</h3>
              <div className="mt-3 space-y-2 text-sm text-ink/65">
                <p>创建订单 · {selected.createdAt} · 用户</p>
                <p>支付确认 · {selected.paymentStatus} · 支付网关</p>
                <p>运营查看 · 当前会话</p>
              </div>
            </section>
            <section className="rounded-lg border border-line bg-paper p-4">
              <h3 className="font-bold">聊天 / 客服记录</h3>
              <p className="mt-2 text-sm leading-6 text-ink/60">用户咨询改期、发票、技师到达时间等消息会归档到订单详情。</p>
            </section>
            <div className="flex flex-wrap gap-2">
              {["确认订单", "改期", "分配技师", "修改价格", "取消订单", "退款", "收款确认", "打印单据"].map((action) => (
                <Button key={action} size="sm" variant={action === "退款" ? "danger" : "secondary"}>
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}
