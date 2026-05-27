import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ModuleShell } from "../../components/admin/ModuleShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";

type DecorBlock = {
  id: string;
  name: string;
  area: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  style: "卡片" | "横滑" | "列表" | "图文";
  visible: boolean;
};

const initialBlocks: DecorBlock[] = [
  { id: "hero", name: "首页主推横滑", area: "客户端首页", x: 4, y: 8, w: 58, h: 24, color: "#2f75ff", style: "横滑", visible: true },
  { id: "categories", name: "首页分类入口", area: "客户端首页", x: 4, y: 36, w: 40, h: 18, color: "#22b36b", style: "卡片", visible: true },
  { id: "nearby", name: "附近门店/技师", area: "客户端首页", x: 48, y: 36, w: 38, h: 24, color: "#ff5c72", style: "列表", visible: true },
  { id: "service", name: "热门服务", area: "客户端首页", x: 4, y: 62, w: 42, h: 20, color: "#f4a840", style: "列表", visible: true },
  { id: "coupon", name: "会员券包", area: "客户端首页", x: 50, y: 66, w: 34, h: 16, color: "#8d5a7b", style: "图文", visible: true },
  { id: "ops", name: "运营数据组件", area: "可选模块", x: 4, y: 86, w: 36, h: 10, color: "#63a8d8", style: "卡片", visible: false }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function DecorationPage() {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedId, setSelectedId] = useState(initialBlocks[0].id);
  const selected = blocks.find((block) => block.id === selectedId) ?? blocks[0];
  const visibleCount = blocks.filter((block) => block.visible).length;

  const updateBlock = (id: string, patch: Partial<DecorBlock>) => {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  };

  const moveSelected = (dx: number, dy: number) => {
    updateBlock(selected.id, {
      x: clamp(selected.x + dx, 2, 96 - selected.w),
      y: clamp(selected.y + dy, 2, 96 - selected.h)
    });
  };

  const resizeSelected = (dw: number, dh: number) => {
    const w = clamp(selected.w + dw, 16, 70);
    const h = clamp(selected.h + dh, 8, 34);
    updateBlock(selected.id, {
      w,
      h,
      x: clamp(selected.x, 2, 96 - w),
      y: clamp(selected.y, 2, 96 - h)
    });
  };

  return (
    <AdminLayout>
      <ModuleShell
        title="装修中心"
        description="自由调整客户端、商户端和后台组件的位置、样式、显隐和运营位布局。"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setBlocks(initialBlocks)}>
              恢复推荐布局
            </Button>
            <Button>发布装修</Button>
          </div>
        }
      >
        <section className="grid gap-3 md:grid-cols-4">
          {[
            ["可见组件", `${visibleCount}/${blocks.length}`, "当前会展示在前端"],
            ["装修页面", "客户端首页", "后续可扩展到商户端"],
            ["草稿状态", "未发布", "发布后同步到前台"],
            ["智能检查", "通过", "没有遮挡与越界"]
          ].map(([label, value, caption]) => (
            <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={label}>
              <p className="text-xs font-bold text-ink/50">{label}</p>
              <strong className="mt-2 block text-2xl">{value}</strong>
              <p className="mt-2 text-xs text-ink/55">{caption}</p>
            </article>
          ))}
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr,380px]">
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">页面装修预览</h2>
                <p className="mt-1 text-sm text-ink/55">点击组件后在右侧调整位置、大小、颜色、样式和是否展示。</p>
              </div>
              <Badge tone="green">可视化编辑</Badge>
            </div>
            <div className="relative mt-4 h-[600px] overflow-hidden rounded-lg border border-line bg-paper bg-[linear-gradient(rgba(47,117,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(47,117,255,0.10)_1px,transparent_1px)] bg-[size:24px_24px]">
              {blocks.map((block) => (
                <button
                  className={cn(
                    "absolute rounded-lg border-2 p-3 text-left shadow-panel transition",
                    block.visible ? "bg-white" : "bg-white/35 opacity-60",
                    selected.id === block.id ? "border-moss ring-2 ring-moss/20" : "border-line"
                  )}
                  key={block.id}
                  onClick={() => setSelectedId(block.id)}
                  style={{
                    left: `${block.x}%`,
                    top: `${block.y}%`,
                    width: `${block.w}%`,
                    height: `${block.h}%`,
                    borderColor: selected.id === block.id ? undefined : block.color
                  }}
                  type="button"
                >
                  <span className="text-xs font-black text-ink/50">{block.area}</span>
                  <strong className="mt-1 block text-sm">{block.name}</strong>
                  <span className="mt-2 inline-flex rounded-md px-2 py-1 text-[11px] font-black text-white" style={{ background: block.color }}>
                    {block.style}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">组件设置</h2>
                  <p className="mt-1 text-xs text-ink/50">当前选中：{selected.name}</p>
                </div>
                <Badge tone={selected.visible ? "green" : "neutral"}>{selected.visible ? "显示" : "隐藏"}</Badge>
              </div>
              <div className="mt-3 grid gap-3 text-sm">
                <label className="grid gap-1">
                  <span className="text-xs font-bold text-ink/50">组件名称</span>
                  <input className="h-10 rounded-lg border border-line bg-paper px-3 outline-none" value={selected.name} onChange={(event) => updateBlock(selected.id, { name: event.target.value })} />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-ink/50">样式</span>
                    <select className="h-10 rounded-lg border border-line bg-paper px-3 outline-none" value={selected.style} onChange={(event) => updateBlock(selected.id, { style: event.target.value as DecorBlock["style"] })}>
                      {["卡片", "横滑", "列表", "图文"].map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-ink/50">主题色</span>
                    <input className="h-10 rounded-lg border border-line bg-paper px-2" type="color" value={selected.color} onChange={(event) => updateBlock(selected.id, { color: event.target.value })} />
                  </label>
                </div>
                <Button variant={selected.visible ? "secondary" : "primary"} onClick={() => updateBlock(selected.id, { visible: !selected.visible })}>
                  {selected.visible ? "隐藏组件" : "显示组件"}
                </Button>
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <h2 className="font-bold">位置与尺寸</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button size="sm" variant="secondary" onClick={() => moveSelected(0, -3)}>
                  上移
                </Button>
                <Button size="sm" variant="secondary" onClick={() => moveSelected(-3, 0)}>
                  左移
                </Button>
                <Button size="sm" variant="secondary" onClick={() => moveSelected(3, 0)}>
                  右移
                </Button>
                <Button size="sm" variant="secondary" onClick={() => moveSelected(0, 3)}>
                  下移
                </Button>
                <Button size="sm" variant="secondary" onClick={() => resizeSelected(4, 3)}>
                  放大
                </Button>
                <Button size="sm" variant="secondary" onClick={() => resizeSelected(-4, -3)}>
                  缩小
                </Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink/55">装修中心会限制组件不越界；隐藏组件不会出现在前台，但可保留草稿配置。</p>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <h2 className="font-bold">智能建议</h2>
              <div className="mt-3 space-y-2 text-xs leading-5 text-ink/60">
                <p>1. 主推横滑适合放在首屏，建议保持 50% 以上宽度。</p>
                <p>2. 运营数据组件对普通用户价值低，当前保持隐藏是合理的。</p>
                <p>3. 附近门店/技师模块建议靠前，有利于提升预约转化。</p>
              </div>
            </section>
          </aside>
        </div>
      </ModuleShell>
    </AdminLayout>
  );
}
