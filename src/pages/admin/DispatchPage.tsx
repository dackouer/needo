import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DetailGrid } from "../../components/admin/DetailGrid";
import { GoogleScheduleCalendar } from "../../components/admin/GoogleScheduleCalendar";
import { ModuleShell } from "../../components/admin/ModuleShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Drawer } from "../../components/ui/Drawer";
import { fieldJobs, schedules, technicians } from "../../data/mock";
import { statusLabel } from "../../lib/utils";
import type { Schedule, Technician } from "../../types/domain";

export function DispatchPage() {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const selectedTechnician = selectedSchedule ? technicians.find((tech) => tech.id === selectedSchedule.staffId) : undefined;

  return (
    <AdminLayout>
      <ModuleShell
        title="调度中心"
        description="支持日视图、周视图、月视图、员工排班、技师排班、工单调度、时间冲突、空闲时段、移动时间预估和区域派单。"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">智能排班</Button>
            <Button>智能派单</Button>
          </div>
        }
      >
        <GoogleScheduleCalendar schedules={schedules} technicians={technicians} onScheduleClick={setSelectedSchedule} />

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <section>
            <h2 className="mb-3 text-lg font-bold">员工排班</h2>
            <DataTable<Schedule>
              columns={[
                { key: "staff", title: "员工", render: (row) => technicians.find((tech) => tech.id === row.staffId)?.name ?? row.staffId },
                { key: "date", title: "日期", render: (row) => row.date },
                { key: "time", title: "时间", render: (row) => `${row.startTime}-${row.endTime}` },
                { key: "status", title: "状态", render: (row) => <Badge tone={row.status === "free" ? "green" : "yellow"}>{row.status}</Badge> }
              ]}
              rows={schedules}
            />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">区域派单池</h2>
            <DataTable
              columns={[
                { key: "content", title: "服务内容", render: (row) => row.serviceContent },
                { key: "address", title: "地址", render: (row) => row.address },
                { key: "tech", title: "技师", render: (row) => row.technicianName ?? "待分配" },
                { key: "status", title: "状态", render: (row) => <Badge tone="yellow">{statusLabel(row.status)}</Badge> }
              ]}
              rows={fieldJobs}
            />
          </section>
        </div>

        <section className="mt-5">
          <h2 className="mb-3 text-lg font-bold">技师实时状态</h2>
          <DataTable<Technician>
            columns={[
              { key: "name", title: "技师", render: (row) => row.name },
              { key: "status", title: "状态", render: (row) => <Badge tone={row.status === "available" ? "green" : "yellow"}>{row.status}</Badge> },
              { key: "areas", title: "服务范围", render: (row) => row.serviceAreas.join("、") },
              { key: "accept", title: "接单率", render: (row) => `${row.acceptRate}%` },
              { key: "move", title: "移动预估", render: () => "18-35 分钟" }
            ]}
            rows={technicians}
          />
        </section>
      </ModuleShell>

      <Drawer open={Boolean(selectedSchedule)} title="排班详情" onClose={() => setSelectedSchedule(null)}>
        {selectedSchedule ? (
          <div className="space-y-5">
            <DetailGrid
              items={[
                { label: "技师", value: selectedTechnician?.name ?? selectedSchedule.staffId },
                { label: "日期", value: selectedSchedule.date },
                { label: "时间", value: `${selectedSchedule.startTime}-${selectedSchedule.endTime}` },
                { label: "状态", value: selectedSchedule.status === "free" ? "空闲" : selectedSchedule.status === "booked" ? "已预约" : "锁定" },
                { label: "订单", value: selectedSchedule.orderId ?? "未绑定订单" },
                { label: "服务区域", value: selectedTechnician?.serviceAreas.join("、") ?? "-" }
              ]}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Button>调整时间</Button>
              <Button variant="secondary">分配订单</Button>
              <Button variant="secondary">锁定时段</Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </AdminLayout>
  );
}
