import { AdminLayout } from "../../components/admin/AdminLayout";
import { ModuleShell } from "../../components/admin/ModuleShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { permissionModules } from "../../data/mock";

const roles = ["平台管理员", "运营", "财务", "客服", "商家管理员", "店长", "技师/员工"];
const permissions = ["菜单权限", "查看权限", "编辑权限", "导出权限", "审核权限", "退款权限", "结算权限"];
const permissionModuleLabels: Record<string, string> = {
  Dashboard: "数据大盘",
  Analytics: "分析中心",
  Orders: "订单中心",
  Dispatch: "调度中心",
  "Field Jobs": "工单中心",
  CRM: "用户管理",
  Marketing: "营销中心",
  Finance: "财务结算",
  Reviews: "评价中心",
  Merchants: "商家门店",
  Inventory: "库存管理",
  Floorplan: "场控布局"
};

export function RolesPage() {
  return (
    <AdminLayout>
      <ModuleShell
        title="角色权限管理"
        description="按平台、运营、财务、客服、商家、店长和技师角色配置菜单、查看、编辑、导出、审核、退款与结算权限。"
        actions={<Button>新增角色</Button>}
      >
        <section className="grid gap-3 md:grid-cols-7">
          {roles.map((role, index) => (
            <article className={`rounded-lg border p-4 shadow-panel ${index === 0 ? "border-moss bg-mint/20" : "border-line bg-white"}`} key={role}>
              <h2 className="font-bold">{role}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/55">{index === 0 ? "全平台权限" : "按模块授权"}</p>
              <Badge className="mt-3" tone={index === 0 ? "green" : "neutral"}>{index === 0 ? "系统" : "可编辑"}</Badge>
            </article>
          ))}
        </section>

        <section className="mt-5 overflow-hidden rounded-lg border border-line bg-white shadow-panel">
          <div className="border-b border-line p-4">
            <h2 className="font-bold">权限矩阵</h2>
            <p className="mt-1 text-sm text-ink/55">后端接入后可映射 Role、Permission、MenuPolicy 与审批流。</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] border-collapse text-sm">
              <thead className="bg-paper text-left text-xs font-bold uppercase text-ink/50">
                <tr>
                  <th className="border-b border-line px-4 py-3">模块</th>
                  {permissions.map((permission) => (
                    <th className="border-b border-line px-4 py-3" key={permission}>{permission}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionModules.map((module, rowIndex) => (
                  <tr className="border-b border-line last:border-b-0" key={module}>
                    <td className="px-4 py-3 font-bold">{permissionModuleLabels[module] ?? module}</td>
                    {permissions.map((permission, index) => {
                      const enabled = rowIndex < 3 || index < 4 || module === "Finance";
                      return (
                        <td className="px-4 py-3" key={`${module}-${permission}`}>
                          <button
                            className={`h-7 w-12 rounded-md text-xs font-bold ${enabled ? "bg-moss text-white" : "bg-paper text-ink/35"}`}
                            type="button"
                          >
                            {enabled ? "开" : "关"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </ModuleShell>
    </AdminLayout>
  );
}
