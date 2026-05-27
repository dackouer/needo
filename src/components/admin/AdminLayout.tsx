import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

type AdminTheme = "dark" | "light";

const themeStorageKey = "needo.admin.theme";

type AdminNavItem = {
  label: string;
  to: string;
  icon: string;
  children?: string[];
};

type AdminNavSection = {
  key: string;
  title: string;
  items: AdminNavItem[];
};

type AdminUtilityLink = {
  label: string;
  to: string;
  tone: "screen" | "sos";
};

const navSections: AdminNavSection[] = [
  {
    key: "platform",
    title: "平台运营",
    items: [
      { label: "数据大盘", to: "/admin", icon: "◆" },
      { label: "分析中心", to: "/admin/analytics", icon: "◔" },
      { label: "数据中心", to: "/admin/data", icon: "▥" },
      { label: "动态管理", to: "/admin/data?module=moments", icon: "◎" },
      { label: "IM 聊天", to: "/admin/im", icon: "聊", children: ["聊天记录", "聊天设置"] }
    ]
  },
  {
    key: "technicians",
    title: "技师",
    items: [
      { label: "技师列表", to: "/admin/technicians", icon: "技", children: ["平台全量", "店铺旗下", "信息卡"] },
      { label: "虚拟技师", to: "/admin/technicians?module=virtual", icon: "虚", children: ["测试账号", "冷启动", "可启停"] },
      { label: "技师榜单", to: "/admin/technicians?module=ranking", icon: "榜", children: ["业绩排行", "订单量", "接单率"] },
      { label: "资料审核", to: "/admin/merchants?module=technician-review", icon: "审", children: ["基本资料", "实名信息", "资质证书", "动态信息"] },
      { label: "挂件设置", to: "/admin/badges", icon: "框", children: ["头像框", "特殊标签", "发放记录"] }
    ]
  },
  {
    key: "orders",
    title: "订单",
    items: [
      { label: "订单管理", to: "/admin/orders", icon: "单", children: ["服务订单", "拒单管理", "加钟订单"] },
      { label: "退款管理", to: "/admin/finance?module=refunds", icon: "退" },
      { label: "评价管理", to: "/admin/reviews", icon: "评", children: ["评价列表", "评价标签"] },
      { label: "订单设置", to: "/admin/orders?module=settings", icon: "设" },
      { label: "上门工单", to: "/admin/field-jobs", icon: "工" }
    ]
  },
  {
    key: "finance",
    title: "财务",
    items: [
      { label: "财务结算", to: "/admin/finance", icon: "¥", children: ["今日营收", "待结算", "渠道手续费"] },
      { label: "退款审核", to: "/admin/finance?module=refund-review", icon: "审" },
      { label: "分账规则", to: "/admin/finance?module=commission", icon: "％" },
      { label: "发票记录", to: "/admin/finance?module=invoices", icon: "票" }
    ]
  },
  {
    key: "marketing",
    title: "营销",
    items: [
      { label: "优惠券", to: "/admin/marketing", icon: "券", children: ["优惠券列表", "优惠券统计", "发放记录", "会员优惠券"] },
      { label: "礼品卡", to: "/admin/marketing?module=gift-cards", icon: "礼", children: ["礼品卡列表"] },
      { label: "文章管理", to: "/admin/marketing?module=articles", icon: "文", children: ["文章列表", "文章分类"] }
    ]
  },
  {
    key: "cps",
    title: "推广CPS",
    items: [
      { label: "分销员管理", to: "/admin/cps", icon: "分", children: ["分销员列表", "分销员设置"] },
      { label: "经纪人管理", to: "/admin/cps?module=brokers", icon: "纪", children: ["经纪人列表", "经纪人等级", "经纪人设置"] },
      { label: "业务员管理", to: "/admin/cps?module=sales", icon: "业", children: ["业务员列表", "业务员设置"] },
      { label: "渠道管理", to: "/admin/cps?module=channels", icon: "渠", children: ["CPS增长", "渠道商列表", "渠道码统计", "渠道商设置"] }
    ]
  },
  {
    key: "users",
    title: "用户管理",
    items: [
      { label: "用户管理", to: "/admin/crm", icon: "用", children: ["用户列表", "会员等级", "标签系统", "流失预警"] },
      { label: "用户数据", to: "/admin/data?module=users", icon: "用", children: ["订单次数", "LTV", "最近消费", "下次预约"] }
    ]
  },
  {
    key: "stores",
    title: "店铺",
    items: [
      { label: "店铺列表", to: "/admin/merchants", icon: "店", children: ["店铺信息卡", "营业状态", "预约能力"] },
      { label: "店铺分类", to: "/admin/merchants?module=categories", icon: "类", children: ["分类图标", "启用状态", "排序"] },
      { label: "调度中心", to: "/admin/dispatch", icon: "排", children: ["月历排班", "员工调度", "智能派单"] },
      { label: "场控布局", to: "/admin/floorplan", icon: "场" },
      { label: "库存管理", to: "/admin/inventory", icon: "库" }
    ]
  },
  {
    key: "agents",
    title: "代理",
    items: [
      { label: "代理商管理", to: "/admin/cps?module=agents", icon: "代", children: ["代理商列表", "代理商申请", "代理商设置"] }
    ]
  },
  {
    key: "design",
    title: "设计",
    items: [
      { label: "装修中心", to: "/admin/decoration", icon: "装", children: ["启动页", "会员中心", "技师管理页", "技师列表页"] },
      { label: "主题设置", to: "/admin/decoration?module=theme", icon: "色", children: ["主题设置", "底部导航", "模板管理", "其他设置"] }
    ]
  },
  {
    key: "settings",
    title: "设置",
    items: [
      { label: "系统设置", to: "/admin/roles?module=system", icon: "系", children: ["储存设置", "支付设置"] },
      { label: "城市设置", to: "/admin/data?module=cities", icon: "城", children: ["城市管理", "城市投票"] },
      { label: "权限管理", to: "/admin/roles", icon: "权", children: ["角色管理", "管理员列表"] },
      { label: "出行设置", to: "/admin/travel-settings", icon: "行", children: ["打车设置", "公共交通", "城市车费"] }
    ]
  }
];

const utilityLinks: AdminUtilityLink[] = [
  { label: "数据大屏", to: "/admin/analytics?module=big-screen", tone: "screen" },
  { label: "求救通知", to: "/admin/reviews?module=sos", tone: "sos" }
];

function splitTo(to: string) {
  const [path, query = ""] = to.split("?");

  return { path, search: query ? `?${query}` : "" };
}

function routeMatches(item: AdminNavItem, pathname: string, search: string) {
  const { path, search: itemSearch } = splitTo(item.to);
  const hasExactQueryRoute = Boolean(
    search &&
      navSections.some((section) =>
        section.items.some((candidate) => {
          const candidateRoute = splitTo(candidate.to);

          return candidateRoute.path === pathname && candidateRoute.search === search;
        })
      )
  );

  if (itemSearch) {
    return pathname === path && search === itemSearch;
  }

  if (hasExactQueryRoute) {
    return false;
  }

  return pathname === path || (path !== "/admin" && pathname.startsWith(`${path}/`));
}

function getSectionForRoute(pathname: string, search: string) {
  return navSections.find((section) => section.items.some((item) => routeMatches(item, pathname, search)))?.key ?? "platform";
}

function getInitialAdminTheme(): AdminTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(themeStorageKey);

  return stored === "light" || stored === "dark" ? stored : "dark";
}

function AdminUtilityIcon({ tone }: { tone: AdminUtilityLink["tone"] }) {
  if (tone === "sos") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M12 3.4 3.8 18.2a1.6 1.6 0 0 0 1.4 2.4h13.6a1.6 1.6 0 0 0 1.4-2.4L12 3.4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.1" />
        <path d="M12 8.5v5.2M12 17.2h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.3" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M4 5.6h16v10.8H4z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M9 20h6M12 16.4V20M7.5 13.2V9.8M12 13.2V7.6M16.5 13.2v-2.4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>(getInitialAdminTheme);
  const location = useLocation();
  const routeSectionKey = getSectionForRoute(location.pathname, location.search);
  const [activeSectionKey, setActiveSectionKey] = useState(routeSectionKey);
  const activeSection = navSections.find((section) => section.key === activeSectionKey) ?? navSections[0];

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  useEffect(() => {
    setActiveSectionKey(routeSectionKey);
  }, [routeSectionKey]);

  return (
    <div className={cn("admin-shell min-h-screen bg-paper text-ink", `admin-theme-${theme}`)}>
      <aside className="admin-sidebar fixed left-0 top-0 hidden h-screen w-64 border-r border-line bg-white p-4 lg:block">
        <div className="flex h-full flex-col">
          <NavLink className="admin-brand rounded-lg p-4 text-white" to="/">
            <div className="flex items-center gap-3">
              <span className="admin-logo-mark grid h-10 w-10 place-items-center rounded-lg text-base font-black">N</span>
              <div>
                <p className="text-xs font-bold text-mint">NeeDo OS</p>
                <h1 className="mt-1 text-lg font-black">运营控制台</h1>
              </div>
            </div>
          </NavLink>

          <section className="admin-profile mt-4 rounded-lg border border-line bg-paper p-3">
            <div className="flex items-center gap-3">
              <img
                alt="运营管理员头像"
                className="h-11 w-11 rounded-lg object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=220&q=80"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-black">David Stainberry</p>
                <p className="mt-1 text-xs text-ink/45">平台运营管理员</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-md bg-white px-2 py-2">
                <p className="text-[11px] text-ink/45">待处理</p>
                <strong className="text-sm">36</strong>
              </div>
              <div className="rounded-md bg-white px-2 py-2">
                <p className="text-[11px] text-ink/45">审核</p>
                <strong className="text-sm">19</strong>
              </div>
            </div>
          </section>

          <section className="admin-sidebar-search mt-4 rounded-lg border border-line bg-paper p-3">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-ink/40">全局搜索</p>
            <label className="admin-search flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm">
              <span className="text-ink/45">⌕</span>
              <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="搜索订单、客户、门店、技师" />
            </label>
          </section>

          <nav className="admin-nav mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="mb-4 rounded-lg border border-line bg-paper p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-ink/40">当前插页</p>
              <h2 className="mt-1 text-xl font-black">{activeSection.title}</h2>
            </div>
            <div className="space-y-2">
              {activeSection.items.map((item) => (
                <NavLink
                  className={() =>
                    cn(
                      "focus-ring admin-nav-link flex items-start gap-3 rounded-lg px-3 py-3 text-sm font-bold transition",
                      routeMatches(item, location.pathname, location.search) ? "is-active text-white" : "text-ink/65 hover:bg-paper hover:text-ink"
                    )
                  }
                  end={item.to === "/admin"}
                  key={item.to}
                  to={item.to}
                >
                  <span className="admin-nav-icon mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md text-[11px]">{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block">{item.label}</span>
                    {item.children && (
                      <span className="mt-1 line-clamp-2 block text-[11px] font-semibold leading-4 opacity-70">
                        {item.children.join(" / ")}
                      </span>
                    )}
                  </span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="admin-sidebar-note rounded-lg border border-line bg-paper p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold">东京城市组</p>
              <span className="rounded-md bg-moss px-2 py-1 text-[11px] font-black text-white">实时</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-ink/55">19 个待审核商家，36 个工单需要运营介入。</p>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="admin-topbar sticky top-0 z-20 border-b border-line bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <NavLink className="admin-mobile-brand rounded-lg bg-ink px-3 py-2 text-sm font-bold text-white lg:hidden" to="/">
                NeeDo
              </NavLink>
              <div className="admin-section-tabs scrollbar-none hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-lg border border-line bg-paper p-1 lg:flex">
                {navSections.map((section) => (
                  <button
                    className={cn(
                      "admin-section-tab focus-ring h-8 shrink-0 rounded-md px-3 text-xs font-black transition",
                      activeSectionKey === section.key ? "is-active" : "text-ink/55 hover:bg-white hover:text-ink"
                    )}
                    key={section.key}
                    onClick={() => setActiveSectionKey(section.key)}
                    type="button"
                  >
                    {section.title}
                  </button>
                ))}
              </div>
              <div className="admin-utility-actions hidden shrink-0 items-center gap-2 xl:flex">
                {utilityLinks.map((item) => {
                  const { path, search } = splitTo(item.to);
                  const active = location.pathname === path && location.search === search;

                  return (
                    <NavLink
                      aria-label={item.label}
                      className={cn(
                        "admin-utility-link focus-ring flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-black transition",
                        `is-${item.tone}`,
                        active && "is-active"
                      )}
                      key={item.to}
                      to={item.to}
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-md">
                        <AdminUtilityIcon tone={item.tone} />
                      </span>
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <LanguageSwitcher compact className="shrink-0" />
              <button
                aria-label="切换白天黑夜模式"
                className={cn(
                  "admin-theme-toggle theme-orbit-toggle focus-ring relative grid h-10 w-20 shrink-0 grid-cols-2 overflow-hidden rounded-lg border border-line p-1 transition",
                  theme === "dark" && "is-night"
                )}
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                type="button"
              >
                <span className="theme-orbit-thumb absolute top-1 h-8 w-[calc(50%-4px)] rounded-md transition" />
                <span className="relative z-10 grid place-items-center rounded-md" aria-hidden="true">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="5.5" stroke="currentColor" strokeWidth="2.3" />
                    <path
                      d="M16 3.5v3M16 25.5v3M3.5 16h3M25.5 16h3M7.2 7.2l2.1 2.1M22.7 22.7l2.1 2.1M24.8 7.2l-2.1 2.1M9.3 22.7l-2.1 2.1"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2.2"
                    />
                  </svg>
                </span>
                <span className="relative z-10 grid place-items-center rounded-md" aria-hidden="true">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 32 32">
                    <path
                      d="M22.8 22.3c-7.7.7-13.1-4.7-12.4-12.4.2-2 .9-3.9 2-5.5C7.4 5.8 4 10.2 4 15.5 4 22.4 9.6 28 16.5 28c5.3 0 9.7-3.4 11.1-8.4a12 12 0 0 1-4.8 2.7Z"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="2.3"
                    />
                    <path d="M21.5 6.5h4M23.5 4.5v4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                  </svg>
                </span>
              </button>
              <button className="focus-ring rounded-lg border border-line bg-white px-3 py-2 font-semibold">消息 12</button>
              <button className="focus-ring rounded-lg border border-line bg-white px-3 py-2 font-semibold">客服台</button>
              <div className="admin-operator flex items-center gap-2 rounded-lg bg-paper px-3 py-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-moss text-xs font-bold text-white">OP</span>
                <span className="hidden font-semibold md:inline">运营管理员</span>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-main mx-auto w-full max-w-[1480px] px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
