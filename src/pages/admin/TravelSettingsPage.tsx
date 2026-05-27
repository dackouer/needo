import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DetailGrid } from "../../components/admin/DetailGrid";
import { ModuleShell } from "../../components/admin/ModuleShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Drawer } from "../../components/ui/Drawer";
import { FilterBar } from "../../components/ui/FilterBar";
import { Tabs } from "../../components/ui/Tabs";
import { yen } from "../../lib/utils";

type TravelTab = "交通方式" | "城市车费" | "移动规则";

type TravelMode = {
  id: string;
  name: string;
  type: "打车" | "公共交通" | "步行/骑行";
  scene: string;
  reimbursement: string;
  maxAmount: number;
  enabled: boolean;
};

type CityFareRule = {
  id: string;
  city: string;
  baseFare: number;
  taxiBase: number;
  taxiPerKm: number;
  trainAllowance: number;
  lateNightExtra: number;
  enabled: boolean;
};

const tabs: TravelTab[] = ["交通方式", "城市车费", "移动规则"];

const travelModes: TravelMode[] = [
  {
    id: "travel-taxi",
    name: "出租车 / 网约车",
    type: "打车",
    scene: "深夜、雨天、大件工具、上门距离较远",
    reimbursement: "按实际路线估算，超额需人工确认",
    maxAmount: 6000,
    enabled: true
  },
  {
    id: "travel-train",
    name: "电车 / 地铁",
    type: "公共交通",
    scene: "白天常规上门、门店间移动、低成本派单",
    reimbursement: "按城市固定交通补贴或实际票价",
    maxAmount: 1200,
    enabled: true
  },
  {
    id: "travel-bus",
    name: "公交",
    type: "公共交通",
    scene: "区域内短距离移动、非高峰时段",
    reimbursement: "按固定单程补贴",
    maxAmount: 600,
    enabled: true
  },
  {
    id: "travel-bike",
    name: "步行 / 骑行",
    type: "步行/骑行",
    scene: "1.5km 内短距离上门，适合轻工具服务",
    reimbursement: "不报销交通费，可计入移动时间",
    maxAmount: 0,
    enabled: false
  }
];

const cityFareRules: CityFareRule[] = [
  { id: "city-tokyo", city: "东京", baseFare: 500, taxiBase: 500, taxiPerKm: 420, trainAllowance: 900, lateNightExtra: 1200, enabled: true },
  { id: "city-osaka", city: "大阪", baseFare: 420, taxiBase: 500, taxiPerKm: 380, trainAllowance: 760, lateNightExtra: 1000, enabled: true },
  { id: "city-yokohama", city: "横滨", baseFare: 450, taxiBase: 500, taxiPerKm: 390, trainAllowance: 820, lateNightExtra: 1000, enabled: true },
  { id: "city-nagoya", city: "名古屋", baseFare: 400, taxiBase: 480, taxiPerKm: 360, trainAllowance: 720, lateNightExtra: 900, enabled: false }
];

const movementRules = [
  ["派单缓冲", "上一单结束后默认预留 30 分钟移动时间"],
  ["深夜规则", "22:00 后优先允许打车，超出上限需运营确认"],
  ["工具规则", "携带大型清洗设备时自动禁用步行 / 骑行"],
  ["跨区规则", "跨区移动超过 45 分钟时提示客服确认用户时间"],
  ["费用展示", "用户下单页仅展示预计交通费，后台保留详细计算记录"]
];

export function TravelSettingsPage() {
  const [activeTab, setActiveTab] = useState<TravelTab>("交通方式");
  const [selectedMode, setSelectedMode] = useState<TravelMode | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityFareRule | null>(null);

  const modeColumns: Array<Column<TravelMode>> = [
    { key: "name", title: "方式", render: (row) => row.name },
    { key: "type", title: "类型", render: (row) => <Badge tone={row.type === "打车" ? "yellow" : row.type === "公共交通" ? "blue" : "neutral"}>{row.type}</Badge> },
    { key: "scene", title: "适用场景", render: (row) => row.scene },
    { key: "reimbursement", title: "报销 / 计费", render: (row) => row.reimbursement },
    { key: "max", title: "单次上限", render: (row) => yen(row.maxAmount) },
    { key: "enabled", title: "状态", render: (row) => <Badge tone={row.enabled ? "green" : "neutral"}>{row.enabled ? "启用" : "停用"}</Badge> }
  ];

  const fareColumns: Array<Column<CityFareRule>> = [
    { key: "city", title: "城市", render: (row) => row.city },
    { key: "base", title: "基础上门费", render: (row) => yen(row.baseFare) },
    { key: "taxiBase", title: "打车起步", render: (row) => yen(row.taxiBase) },
    { key: "taxiKm", title: "每公里", render: (row) => yen(row.taxiPerKm) },
    { key: "train", title: "公共交通补贴", render: (row) => yen(row.trainAllowance) },
    { key: "night", title: "深夜加成", render: (row) => yen(row.lateNightExtra) },
    { key: "enabled", title: "状态", render: (row) => <Badge tone={row.enabled ? "green" : "neutral"}>{row.enabled ? "启用" : "停用"}</Badge> }
  ];

  return (
    <AdminLayout>
      <ModuleShell
        title="出行设置"
        description="设置技师上门移动时可使用的打车、公共交通、步行/骑行方式，以及城市车费、深夜加成和移动时间规则。"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">导入城市车费</Button>
            <Button>保存出行规则</Button>
          </div>
        }
      >
        <section className="grid gap-3 md:grid-cols-4">
          {[
            ["启用交通方式", travelModes.filter((mode) => mode.enabled).length, "打车、公共交通、公交"],
            ["城市规则", cityFareRules.length, "不同城市独立配置"],
            ["平均交通补贴", yen(820), "按近 30 天订单估算"],
            ["深夜打车占比", "18.6%", "22:00 后订单"]
          ].map(([label, value, caption]) => (
            <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={label}>
              <p className="text-xs font-bold text-ink/50">{label}</p>
              <strong className="mt-2 block text-3xl">{value}</strong>
              <p className="mt-2 text-xs text-ink/55">{caption}</p>
            </article>
          ))}
        </section>

        <Tabs active={activeTab} items={tabs} onChange={(item) => setActiveTab(item as TravelTab)} />

        {activeTab === "交通方式" ? (
          <div className="space-y-5">
            <FilterBar
              searchPlaceholder="搜索交通方式、适用场景"
              filters={[
                { label: "类型", options: [{ label: "打车", value: "taxi" }, { label: "公共交通", value: "transit" }, { label: "步行/骑行", value: "walk" }] },
                { label: "状态", options: [{ label: "启用", value: "enabled" }, { label: "停用", value: "disabled" }] }
              ]}
            />
            <DataTable columns={modeColumns} onView={setSelectedMode} pageSize={10} rows={travelModes} />
          </div>
        ) : null}

        {activeTab === "城市车费" ? (
          <div className="space-y-5">
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <h2 className="text-lg font-black">车费计算说明</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                出行设置只负责交通成本和移动规则，不参与排班。调度中心会读取这些规则，给派单、移动时间和上门费做智能提示。
              </p>
            </section>
            <DataTable columns={fareColumns} onView={setSelectedCity} pageSize={10} rows={cityFareRules} />
          </div>
        ) : null}

        {activeTab === "移动规则" ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {movementRules.map(([title, caption], index) => (
              <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={title}>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-sm font-black text-white">{index + 1}</span>
                  <div>
                    <h2 className="font-black">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-ink/60">{caption}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </ModuleShell>

      <Drawer open={Boolean(selectedMode)} title="交通方式详情" onClose={() => setSelectedMode(null)}>
        {selectedMode ? (
          <DetailGrid
            items={[
              { label: "方式", value: selectedMode.name },
              { label: "类型", value: selectedMode.type },
              { label: "适用场景", value: selectedMode.scene },
              { label: "报销 / 计费", value: selectedMode.reimbursement },
              { label: "单次上限", value: yen(selectedMode.maxAmount) },
              { label: "状态", value: selectedMode.enabled ? "启用" : "停用" }
            ]}
          />
        ) : null}
      </Drawer>

      <Drawer open={Boolean(selectedCity)} title="城市车费详情" onClose={() => setSelectedCity(null)}>
        {selectedCity ? (
          <DetailGrid
            items={[
              { label: "城市", value: selectedCity.city },
              { label: "基础上门费", value: yen(selectedCity.baseFare) },
              { label: "打车起步", value: yen(selectedCity.taxiBase) },
              { label: "每公里", value: yen(selectedCity.taxiPerKm) },
              { label: "公共交通补贴", value: yen(selectedCity.trainAllowance) },
              { label: "深夜加成", value: yen(selectedCity.lateNightExtra) },
              { label: "状态", value: selectedCity.enabled ? "启用" : "停用" }
            ]}
          />
        ) : null}
      </Drawer>
    </AdminLayout>
  );
}
