import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DetailGrid } from "../../components/admin/DetailGrid";
import { ModuleShell } from "../../components/admin/ModuleShell";
import { MonthlyScheduleCalendar } from "../../components/admin/MonthlyScheduleCalendar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Drawer } from "../../components/ui/Drawer";
import { FilterBar } from "../../components/ui/FilterBar";
import { Tabs } from "../../components/ui/Tabs";
import { schedules, stores, technicianMoments, technicians } from "../../data/mock";
import { cn, yen } from "../../lib/utils";
import type { Technician } from "../../types/domain";

type TechnicianModule = "技师列表" | "虚拟技师" | "技师榜单";
type AdminScope = "platform" | "store";
type VirtualTechnician = Technician & {
  virtual: true;
  scenario: string;
  createdAt: string;
  enabled: boolean;
};

const moduleToQuery: Record<TechnicianModule, string> = {
  技师列表: "list",
  虚拟技师: "virtual",
  技师榜单: "ranking"
};

const queryToModule: Record<string, TechnicianModule> = {
  list: "技师列表",
  virtual: "虚拟技师",
  ranking: "技师榜单"
};

const virtualSeeds: VirtualTechnician[] = [
  {
    id: "virtual-tech-1",
    name: "Virtual Mika",
    storeId: "store-1",
    role: "therapist",
    status: "available",
    rating: 4.82,
    orderCount: 42,
    income: 286000,
    skills: ["肩颈调理", "深夜可测", "中文 OK"],
    serviceAreas: ["银座", "六本木", "新宿"],
    acceptRate: 94,
    cancelRate: 1.1,
    languages: ["日本語", "中文"],
    avatar: "https://images.unsplash.com/photo-1619946794135-5bc917a27793?auto=format&fit=crop&w=400&q=80",
    virtual: true,
    scenario: "东京深夜按摩冷启动",
    createdAt: "2026-04-02 11:30",
    enabled: true
  },
  {
    id: "virtual-tech-2",
    name: "Virtual Haru",
    storeId: "store-4",
    role: "cleaner",
    status: "available",
    rating: 4.76,
    orderCount: 35,
    income: 198000,
    skills: ["家庭保洁", "水回り", "宠物家庭"],
    serviceAreas: ["目黑", "品川", "涩谷"],
    acceptRate: 91,
    cancelRate: 1.8,
    languages: ["日本語", "English"],
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    virtual: true,
    scenario: "保洁服务初期供给测试",
    createdAt: "2026-04-05 16:20",
    enabled: true
  }
];

const generatedAvatars = [
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80"
];

const statusText: Record<Technician["status"], string> = {
  available: "空闲",
  busy: "服务中",
  off: "休息"
};

const momentStatusText = {
  visible: "展示中",
  reviewing: "审核中",
  hidden: "已隐藏"
};

const moduleItems: TechnicianModule[] = ["技师列表", "虚拟技师", "技师榜单"];

function getStoreName(storeId: string) {
  return stores.find((store) => store.id === storeId)?.name ?? "未绑定门店";
}

function getTechnicianScore(technician: Technician) {
  return Math.round(technician.income / 10000 + technician.orderCount * 0.8 + technician.acceptRate * 4 + technician.rating * 30);
}

function createVirtualTechnician(index: number, storeId = stores[index % stores.length]?.id ?? "store-1"): VirtualTechnician {
  const skills = [
    ["肩颈调理", "深夜可约", "女性可选"],
    ["家庭保洁", "水回り", "当日预约"],
    ["宠物陪伴", "喂养", "照片回传"],
    ["上门回收", "家电搬运", "报价测试"],
    ["商务预约", "酒店服务", "中文 OK"]
  ][index % 5];

  return {
    id: `virtual-tech-${Date.now()}-${index}`,
    name: `冷启动技师 ${index + 1}`,
    storeId,
    role: index % 2 === 0 ? "therapist" : "cleaner",
    status: "available",
    rating: 4.65 + index * 0.03,
    orderCount: 8 + index * 5,
    income: 62000 + index * 42000,
    skills,
    serviceAreas: ["新宿", "涩谷", "银座"].slice(0, 2 + (index % 2)),
    acceptRate: 88 + index,
    cancelRate: 1.5 + index * 0.2,
    languages: index % 2 === 0 ? ["日本語", "中文"] : ["日本語", "English"],
    avatar: generatedAvatars[index % generatedAvatars.length],
    virtual: true,
    scenario: index % 2 === 0 ? "新城市冷启动供给" : "高峰时段测试账号",
    createdAt: "2026-04-14 09:30",
    enabled: true
  };
}

function TechnicianNameButton({ technician, onSelect }: { technician: Technician; onSelect: (technician: Technician) => void }) {
  return (
    <button className="focus-ring font-black text-moss hover:underline" onClick={() => onSelect(technician)} type="button">
      {technician.name}
    </button>
  );
}

function TechnicianProfile({ technician }: { technician: Technician | VirtualTechnician }) {
  const isVirtual = "virtual" in technician;
  const moments = isVirtual ? [] : technicianMoments.filter((post) => post.technicianId === technician.id);
  const momentLikes = moments.reduce((sum, post) => sum + post.likes, 0);
  const momentComments = moments.reduce((sum, post) => sum + post.comments.length, 0);

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-ink p-4 text-white">
        <div className="flex gap-4">
          <img alt={technician.name} className="h-24 w-24 rounded-lg object-cover" src={technician.avatar} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isVirtual ? "yellow" : "green"}>{isVirtual ? "虚拟技师" : "认证技师"}</Badge>
              <Badge tone={technician.status === "available" ? "green" : technician.status === "busy" ? "yellow" : "neutral"}>{statusText[technician.status]}</Badge>
            </div>
            <h3 className="mt-3 text-2xl font-black">{technician.name}</h3>
            <p className="mt-2 text-sm text-white/65">{getStoreName(technician.storeId)} · {technician.serviceAreas.join(" / ")}</p>
          </div>
        </div>
      </section>

      <DetailGrid
        items={[
          { label: "评分", value: technician.rating },
          { label: "订单量", value: `${technician.orderCount} 单` },
          { label: "收入", value: yen(technician.income) },
          { label: "接单率", value: `${technician.acceptRate}%` },
          { label: "取消率", value: `${technician.cancelRate}%` },
          { label: "语言", value: technician.languages.join("、") },
          { label: "技能标签", value: technician.skills.join("、") },
          { label: "服务区域", value: technician.serviceAreas.join("、") }
        ]}
      />

      <section className="rounded-lg border border-line bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-black">动态投稿</h4>
            <p className="mt-1 text-sm text-ink/55">查看技师在动态里发布过的内容，以及用户点赞和留言反馈。</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              ["投稿", moments.length],
              ["点赞", momentLikes],
              ["留言", momentComments]
            ].map(([label, value]) => (
              <span className="rounded-lg bg-paper px-3 py-2" key={label}>
                <strong className="block text-base text-ink">{value}</strong>
                <span className="text-ink/45">{label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {moments.length > 0 ? moments.map((post) => (
            <article className="rounded-lg border border-line bg-paper p-4" key={post.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={post.status === "visible" ? "green" : post.status === "reviewing" ? "yellow" : "neutral"}>{momentStatusText[post.status]}</Badge>
                    <Badge tone="neutral">{post.visibility}</Badge>
                    <span className="text-xs font-bold text-ink/45">{post.postedAt} · {post.location}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/75">{post.content}</p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-right text-xs shadow-soft">
                  <p className="font-black text-moss">{post.serviceTitle}</p>
                  <p className="mt-1 text-ink/55">{yen(post.servicePrice)} 起</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {post.images.map((image, index) => (
                  <img alt={`${post.technicianName}动态图片${index + 1}`} className="h-24 w-full rounded-lg object-cover" key={`${post.id}-${image}`} src={image} />
                ))}
              </div>

              <div className="mt-3 rounded-lg bg-white p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-ink">点赞 {post.likes}</p>
                  <p className="text-xs text-ink/50">{post.likedUsers.join("、")}</p>
                </div>
                <div className="mt-3 space-y-2 border-t border-line pt-3">
                  {post.comments.map((comment) => (
                    <div className="rounded-lg bg-paper px-3 py-2" key={comment.id}>
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-sm text-ink">{comment.userName}</strong>
                        <span className="text-xs text-ink/40">{comment.at}</span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-ink/65">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )) : (
            <div className="rounded-lg bg-paper p-4 text-sm text-ink/55">暂无动态投稿记录。</div>
          )}
        </div>
      </section>

      {isVirtual ? (
        <section className="rounded-lg border border-line bg-paper p-4">
          <h4 className="font-black">虚拟账号说明</h4>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            场景：{technician.scenario}。虚拟技师用于测试排班、订单链路、冷启动供给和活动展示，不会真实派单给用户。
          </p>
        </section>
      ) : null}

      <MonthlyScheduleCalendar compact schedules={schedules.filter((schedule) => schedule.staffId === technician.id)} technicians={[technician]} />
    </div>
  );
}

export function TechniciansPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeModule = queryToModule[searchParams.get("module") ?? "list"] ?? "技师列表";
  const [scope, setScope] = useState<AdminScope>("platform");
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "store-1");
  const [virtualTechnicians, setVirtualTechnicians] = useState<VirtualTechnician[]>(virtualSeeds);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | VirtualTechnician | null>(null);
  const visibleTechnicians = useMemo(
    () => (scope === "store" ? technicians.filter((technician) => technician.storeId === storeId) : technicians),
    [scope, storeId]
  );
  const rankingRows = useMemo(
    () =>
      [...technicians]
        .sort((a, b) => getTechnicianScore(b) - getTechnicianScore(a))
        .map((technician, index) => ({ ...technician, rank: index + 1, score: getTechnicianScore(technician) })),
    []
  );

  const technicianColumns: Array<Column<Technician>> = [
    {
      key: "profile",
      title: "技师",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img alt={row.name} className="h-10 w-10 rounded-lg object-cover" src={row.avatar} />
          <div>
            <TechnicianNameButton onSelect={setSelectedTechnician} technician={row} />
            <p className="mt-1 text-xs text-ink/45">{getStoreName(row.storeId)}</p>
          </div>
        </div>
      )
    },
    { key: "status", title: "状态", render: (row) => <Badge tone={row.status === "available" ? "green" : row.status === "busy" ? "yellow" : "neutral"}>{statusText[row.status]}</Badge> },
    { key: "skills", title: "能力标签", render: (row) => row.skills.slice(0, 3).join("、") },
    { key: "areas", title: "服务区域", render: (row) => row.serviceAreas.join("、") },
    { key: "rating", title: "评分", render: (row) => row.rating },
    { key: "orders", title: "订单量", render: (row) => `${row.orderCount} 单` },
    { key: "accept", title: "接单率", render: (row) => `${row.acceptRate}%` }
  ];

  const virtualColumns: Array<Column<VirtualTechnician>> = [
    {
      key: "profile",
      title: "虚拟技师",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img alt={row.name} className="h-10 w-10 rounded-lg object-cover" src={row.avatar} />
          <div>
            <TechnicianNameButton onSelect={setSelectedTechnician} technician={row} />
            <p className="mt-1 text-xs text-ink/45">{row.scenario}</p>
          </div>
        </div>
      )
    },
    { key: "store", title: "绑定门店", render: (row) => getStoreName(row.storeId) },
    { key: "enabled", title: "状态", render: (row) => <Badge tone={row.enabled ? "green" : "neutral"}>{row.enabled ? "启用" : "停用"}</Badge> },
    { key: "skills", title: "测试标签", render: (row) => row.skills.join("、") },
    { key: "orders", title: "模拟订单", render: (row) => `${row.orderCount} 单` },
    { key: "created", title: "创建时间", render: (row) => row.createdAt },
    {
      key: "toggle",
      title: "启停",
      render: (row) => (
        <button
          className="focus-ring rounded-lg border border-line bg-paper px-3 py-2 text-xs font-black text-ink/70 hover:border-moss hover:text-moss"
          onClick={() => setVirtualTechnicians((current) => current.map((item) => (item.id === row.id ? { ...item, enabled: !item.enabled } : item)))}
          type="button"
        >
          {row.enabled ? "停用" : "启用"}
        </button>
      )
    }
  ];

  const rankingColumns: Array<Column<(typeof rankingRows)[number]>> = [
    { key: "rank", title: "排名", render: (row) => <span className="rounded-md bg-ink px-2 py-1 text-xs font-black text-white">#{row.rank}</span> },
    {
      key: "profile",
      title: "技师",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img alt={row.name} className="h-10 w-10 rounded-lg object-cover" src={row.avatar} />
          <TechnicianNameButton onSelect={setSelectedTechnician} technician={row} />
        </div>
      )
    },
    { key: "store", title: "所属门店", render: (row) => getStoreName(row.storeId) },
    { key: "income", title: "收入", render: (row) => yen(row.income) },
    { key: "orders", title: "订单量", render: (row) => `${row.orderCount} 单` },
    { key: "rating", title: "评分", render: (row) => row.rating },
    { key: "score", title: "综合分", render: (row) => row.score }
  ];

  const addOneVirtual = () => setVirtualTechnicians((current) => [createVirtualTechnician(current.length), ...current]);
  const generateColdStart = () => setVirtualTechnicians((current) => [...Array.from({ length: 5 }, (_, index) => createVirtualTechnician(current.length + index)), ...current]);

  return (
    <AdminLayout>
      <ModuleShell
        title="技师管理"
        description="管理真实技师、虚拟技师和业绩排行。平台后台可查看全部技师，店铺后台仅能查看自己旗下的技师。"
        actions={
          activeModule === "虚拟技师" ? (
            <>
              <Button variant="secondary" onClick={generateColdStart}>一键生成冷启动技师</Button>
              <Button onClick={addOneVirtual}>新增虚拟技师</Button>
            </>
          ) : (
            <Button>导出技师数据</Button>
          )
        }
      >
        <Tabs
          active={activeModule}
          items={moduleItems}
          onChange={(item) => {
            const module = item as TechnicianModule;
            setSearchParams(moduleToQuery[module] === "list" ? {} : { module: moduleToQuery[module] });
          }}
        />

        {activeModule === "技师列表" ? (
          <>
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">可见范围</h2>
                  <p className="mt-1 text-sm text-ink/55">切换后可模拟平台后台和店铺后台看到的数据范围。</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["platform", "平台后台"],
                    ["store", "店铺后台"]
                  ].map(([value, label]) => (
                    <button
                      className={cn("focus-ring rounded-lg border px-4 py-2 text-sm font-black", scope === value ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink/60")}
                      key={value}
                      onClick={() => setScope(value as AdminScope)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                  {scope === "store" ? (
                    <select className="h-10 rounded-lg border border-line bg-paper px-3 text-sm font-black outline-none" onChange={(event) => setStoreId(event.target.value)} value={storeId}>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </div>
            </section>

            <FilterBar
              searchPlaceholder="搜索技师姓名、门店、技能、区域"
              filters={[
                { label: "状态", options: [{ label: "空闲", value: "available" }, { label: "服务中", value: "busy" }, { label: "休息", value: "off" }] },
                { label: "语言", options: [{ label: "日本語", value: "ja" }, { label: "中文", value: "zh" }, { label: "English", value: "en" }] },
                { label: "接单率", options: [{ label: "90% 以上", value: "90" }, { label: "95% 以上", value: "95" }] }
              ]}
            />

            <DataTable columns={technicianColumns} onView={setSelectedTechnician} pageSize={10} rows={visibleTechnicians} />
          </>
        ) : null}

        {activeModule === "虚拟技师" ? (
          <div className="space-y-5">
            <section className="grid gap-4 md:grid-cols-3">
              {[
                ["启用虚拟技师", virtualTechnicians.filter((item) => item.enabled).length],
                ["冷启动场景", new Set(virtualTechnicians.map((item) => item.scenario)).size],
                ["模拟订单", virtualTechnicians.reduce((sum, item) => sum + item.orderCount, 0)]
              ].map(([label, value]) => (
                <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={label}>
                  <p className="text-sm font-bold text-ink/50">{label}</p>
                  <strong className="mt-2 block text-3xl font-black">{value}</strong>
                </article>
              ))}
            </section>
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <h2 className="text-lg font-black">用途说明</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                虚拟技师用于测试下单、排班、地图展示、动态冷启动和新城市初期供给。正式上线时可以关闭，不参与真实派单和结算。
              </p>
            </section>
            <DataTable columns={virtualColumns} onView={setSelectedTechnician} pageSize={10} rows={virtualTechnicians} />
          </div>
        ) : null}

        {activeModule === "技师榜单" ? (
          <div className="space-y-5">
            <section className="grid gap-4 xl:grid-cols-3">
              {rankingRows.slice(0, 3).map((technician) => (
                <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={technician.id}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-lg font-black text-white">#{technician.rank}</span>
                    <img alt={technician.name} className="h-14 w-14 rounded-lg object-cover" src={technician.avatar} />
                    <div className="min-w-0">
                      <button className="focus-ring truncate text-left text-lg font-black text-moss hover:underline" onClick={() => setSelectedTechnician(technician)} type="button">
                        {technician.name}
                      </button>
                      <p className="mt-1 text-xs text-ink/45">{getStoreName(technician.storeId)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-paper p-3"><p className="text-xs text-ink/45">收入</p><strong>{yen(technician.income)}</strong></div>
                    <div className="rounded-lg bg-paper p-3"><p className="text-xs text-ink/45">订单</p><strong>{technician.orderCount}</strong></div>
                    <div className="rounded-lg bg-paper p-3"><p className="text-xs text-ink/45">评分</p><strong>{technician.rating}</strong></div>
                  </div>
                </article>
              ))}
            </section>
            <DataTable columns={rankingColumns} onView={setSelectedTechnician} pageSize={10} rows={rankingRows} />
          </div>
        ) : null}
      </ModuleShell>

      <Drawer open={Boolean(selectedTechnician)} title="技师详细信息卡" onClose={() => setSelectedTechnician(null)}>
        {selectedTechnician ? <TechnicianProfile technician={selectedTechnician} /> : null}
      </Drawer>
    </AdminLayout>
  );
}
