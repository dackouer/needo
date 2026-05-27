import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { ContactGroupIcon } from "../../components/mobile/ContactGroupIcon";
import { MobileShell } from "../../components/mobile/MobileShell";
import { MobileMessageCenter } from "../../components/mobile/MobileMessageCenter";
import { MobilePreferencePanel } from "../../components/mobile/MobilePreferencePanel";
import { technicianNavItems } from "../../components/mobile/navItems";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { customers, fieldJobs, orders, schedules, stores, technicians } from "../../data/mock";
import { cn, yen } from "../../lib/utils";

type TechnicianView = "tasks" | "schedule" | "moments" | "contacts" | "messages" | "me";
type WorkStatus = "出勤" | "退勤" | "移动中" | "服务中" | "空闲";
type TechSettingKey = "autoAccept" | "shareLocation" | "breakReminder" | "nightService";
type ScheduleScope = "day" | "week" | "month";
type TechWorkMode = "store" | "personal";
type LongTermStatus = "free" | "locked";
type TechnicianContact = {
  id: string;
  name: string;
  username: string;
  remark: string;
  avatar: string;
  typeLabel: string;
  tags: string[];
  meta: string;
};

type TechnicianScheduleEvent = {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "free" | "booked" | "blocked";
  orderId?: string;
  workMode: TechWorkMode;
  title: string;
  place: string;
  customer: string;
  amount: number;
  note: string;
};

const statusButtons: WorkStatus[] = ["出勤", "移动中", "服务中", "空闲", "退勤"];
const statusButtonMeta: Record<WorkStatus, { icon: string; caption: string; className: string }> = {
  出勤: { icon: "●", caption: "开始接收门店派单", className: "bg-[#dff5e8] text-[#145c34]" },
  移动中: { icon: "↗", caption: "同步路线和预计到达", className: "bg-[#e6f0ff] text-[#2056a8]" },
  服务中: { icon: "▶", caption: "需输入客人验证码", className: "bg-[#ffe1dd] text-[#a73427]" },
  空闲: { icon: "○", caption: "可被门店安排工作", className: "bg-[#fff2c7] text-[#7a5600]" },
  退勤: { icon: "■", caption: "下班后订单记为个人工单", className: "bg-[#ecebea] text-[#45433f]" }
};
const todayDate = "2026-04-13";
const scheduleScopeOptions: Array<{ label: string; value: ScheduleScope }> = [
  { label: "日", value: "day" },
  { label: "周", value: "week" },
  { label: "月", value: "month" }
];
const workModeLabels: Record<TechWorkMode, string> = {
  store: "店铺工作",
  personal: "个人工作"
};
const techSettingLabels: Record<TechSettingKey, string> = {
  autoAccept: "自动接单",
  shareLocation: "共享位置",
  breakReminder: "休息提醒",
  nightService: "夜间服务"
};

const extraScheduleEvents: TechnicianScheduleEvent[] = [
  {
    id: "tech-hist-1",
    staffId: "tech-1",
    date: "2026-04-08",
    startTime: "10:00",
    endTime: "12:00",
    status: "booked",
    workMode: "store",
    title: "银座门店肩颈护理",
    place: "GINZA Calm Body Lab",
    customer: "老客 Aki",
    amount: 14800,
    note: "已完成，客户复购意向高"
  },
  {
    id: "tech-hist-2",
    staffId: "tech-1",
    date: "2026-04-10",
    startTime: "20:30",
    endTime: "22:00",
    status: "booked",
    workMode: "personal",
    title: "个人接单 · 产后肩颈舒缓",
    place: "新宿区住友公寓",
    customer: "林 小雨",
    amount: 16800,
    note: "下班后个人接单，已结算"
  },
  {
    id: "tech-today-1",
    staffId: "tech-1",
    date: "2026-04-13",
    startTime: "09:30",
    endTime: "12:00",
    status: "booked",
    workMode: "store",
    title: "门店预约 · 全身放松 120 分钟",
    place: "GINZA Calm Body Lab",
    customer: "佐藤 健",
    amount: 22800,
    note: "主业排班，需准备热石"
  },
  {
    id: "tech-today-2",
    staffId: "tech-1",
    date: "2026-04-13",
    startTime: "14:00",
    endTime: "16:00",
    status: "free",
    workMode: "store",
    title: "门店可接单空档",
    place: "GINZA Calm Body Lab",
    customer: "待分配",
    amount: 0,
    note: "系统建议开放给高评分会员"
  },
  {
    id: "tech-today-3",
    staffId: "tech-1",
    date: "2026-04-13",
    startTime: "19:30",
    endTime: "21:00",
    status: "booked",
    workMode: "personal",
    title: "个人接单 · 上门肩颈按摩",
    place: "涩谷区神南",
    customer: "Mia Chen",
    amount: 13800,
    note: "下班后工作，用户要求中文沟通"
  },
  {
    id: "tech-future-1",
    staffId: "tech-1",
    date: "2026-04-14",
    startTime: "11:00",
    endTime: "13:00",
    status: "booked",
    workMode: "store",
    title: "门店 VIP 复购护理",
    place: "GINZA Calm Body Lab",
    customer: "山田 真理",
    amount: 26000,
    note: "未来安排，需提前 30 分钟到店"
  },
  {
    id: "tech-future-2",
    staffId: "tech-1",
    date: "2026-04-16",
    startTime: "20:00",
    endTime: "21:30",
    status: "booked",
    workMode: "personal",
    title: "个人接单 · 睡眠放松护理",
    place: "中野区中央",
    customer: "王 静",
    amount: 15800,
    note: "下班后工作，已收定金"
  },
  {
    id: "tech-future-3",
    staffId: "tech-1",
    date: "2026-04-23",
    startTime: "13:30",
    endTime: "15:00",
    status: "blocked",
    workMode: "store",
    title: "门店培训与手法复盘",
    place: "GINZA Calm Body Lab",
    customer: "门店团队",
    amount: 0,
    note: "不可接单，店长已锁定"
  },
  {
    id: "tech-future-4",
    staffId: "tech-1",
    date: "2026-05-02",
    startTime: "18:30",
    endTime: "20:00",
    status: "booked",
    workMode: "personal",
    title: "个人固定客户月度护理",
    place: "目黑区青叶台",
    customer: "固定客户 Nao",
    amount: 18800,
    note: "未来个人工作，客户已收藏"
  }
];

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: string, amount: number) {
  const next = parseDate(date);
  next.setDate(next.getDate() + amount);

  return formatInputDate(next);
}

function getWeekDates(date: string) {
  const current = parseDate(date);
  const day = current.getDay() || 7;
  const monday = addDays(date, 1 - day);

  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function getMonthGridDates(date: string) {
  const current = parseDate(date);
  const first = new Date(current.getFullYear(), current.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7;
  const gridStart = formatInputDate(new Date(current.getFullYear(), current.getMonth(), 1 - startOffset));

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function getRangeDates(date: string, scope: ScheduleScope) {
  if (scope === "week") {
    return getWeekDates(date);
  }

  if (scope === "month") {
    const targetMonth = date.slice(0, 7);
    return getMonthGridDates(date).filter((day) => day.startsWith(targetMonth));
  }

  return [date];
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  }).format(parseDate(date));
}

function googleRouteUrl(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=transit`;
}

function getSchedulePhase(date: string) {
  if (date < todayDate) {
    return "历史";
  }

  if (date > todayDate) {
    return "未来";
  }

  return "今天";
}

function getScheduleStatusLabel(event: TechnicianScheduleEvent) {
  if (event.status === "free") {
    return "可接单";
  }

  if (event.status === "blocked") {
    return "不可排";
  }

  return event.date < todayDate ? "已完成" : "已预约";
}

function getTechnicianView(view?: string): TechnicianView {
  if (view === "jobs") {
    return "me";
  }

  if (view === "schedule" || view === "moments" || view === "contacts" || view === "messages" || view === "me") {
    return view;
  }

  return "tasks";
}

export function TechnicianPortalPage() {
  const { view } = useParams();
  const activeView = getTechnicianView(view);
  const tech = technicians[0];
  const nextJob = fieldJobs[0];
  const store = stores[0];
  const [status, setStatus] = useState<WorkStatus>("空闲");
  const [contactLog, setContactLog] = useState("暂无联系记录");
  const [techSettings, setTechSettings] = useState<Record<TechSettingKey, boolean>>({
    autoAccept: false,
    shareLocation: true,
    breakReminder: true,
    nightService: false
  });
  const [scheduleScope, setScheduleScope] = useState<ScheduleScope>("day");
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [activeWorkMode, setActiveWorkMode] = useState<TechWorkMode>("store");
  const [profileVisibility, setProfileVisibility] = useState<"private" | "public">("private");
  const [profileShareOpen, setProfileShareOpen] = useState(false);
  const [jobShareOpen, setJobShareOpen] = useState(false);
  const [pendingShareTarget, setPendingShareTarget] = useState<TechnicianContact | null>(null);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [longStatusOpen, setLongStatusOpen] = useState(false);
  const [longTermStatus, setLongTermStatus] = useState<LongTermStatus>("free");
  const [serviceCode, setServiceCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const activeOrder = orders[0];
  const activeCustomer = customers.find((customer) => customer.id === activeOrder.customerId) ?? customers[0];
  const baseScheduleEvents: TechnicianScheduleEvent[] = schedules
    .filter((schedule) => schedule.staffId === tech.id)
    .map((schedule, index) => {
      const order = orders.find((item) => item.id === schedule.orderId) ?? orders[index % orders.length];

      return {
        ...schedule,
        workMode: "store",
        title: schedule.status === "free" ? "门店可接单空档" : order.itemName,
        place: store.name,
        customer: schedule.status === "free" ? "待分配" : order.customerName,
        amount: schedule.status === "booked" ? order.amount : 0,
        note: schedule.status === "free" ? "来自门店排班，可被系统派单" : "来自门店正式预约"
      };
    });
  const scheduleEvents = baseScheduleEvents.concat(extraScheduleEvents)
    .filter((event) => event.staffId === tech.id)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  const rangeDates = getRangeDates(selectedDate, scheduleScope);
  const rangeEvents = scheduleEvents.filter((event) => rangeDates.includes(event.date));
  const timelineEvents = scheduleScope === "day" ? scheduleEvents.filter((event) => event.date === selectedDate) : rangeEvents;
  const monthGridDates = getMonthGridDates(selectedDate);
  const selectedMonth = selectedDate.slice(0, 7);
  const completedEvents = scheduleEvents.filter((event) => event.status === "booked" && event.date < todayDate);
  const futureEvents = scheduleEvents.filter((event) => event.date > todayDate);
  const periodRevenue = timelineEvents.reduce((sum, event) => sum + event.amount, 0);
  const modeEvents = scheduleEvents.filter((event) => event.workMode === activeWorkMode);
  const modeCompletedEvents = modeEvents.filter((event) => event.status === "booked" && event.date <= todayDate);
  const modeFutureEvents = modeEvents.filter((event) => event.date >= todayDate);
  const modeIncome = modeCompletedEvents.reduce((sum, event) => sum + event.amount, 0);
  const modeNextEvent = modeFutureEvents.find((event) => event.status !== "blocked");
  const activeWorkModeProfile = {
    store: {
      title: "店铺工作（主业）",
      caption: `${store.name} 的固定排班、培训和门店预约`,
      settlement: "店铺月结 / 含指名奖励",
      income: yen(Math.max(modeIncome, tech.income)),
      completed: modeCompletedEvents.length,
      future: modeFutureEvents.length,
      next: modeNextEvent ? `${modeNextEvent.date} ${modeNextEvent.startTime} · ${modeNextEvent.title}` : "暂无未来安排"
    },
    personal: {
      title: "个人工作（下班后）",
      caption: "个人接单、固定客户和下班后的上门服务",
      settlement: "个人接单 T+3 / 独立结算",
      income: yen(modeIncome),
      completed: modeCompletedEvents.length,
      future: modeFutureEvents.length,
      next: modeNextEvent ? `${modeNextEvent.date} ${modeNextEvent.startTime} · ${modeNextEvent.title}` : "暂无未来安排"
    }
  }[activeWorkMode];
  const technicianDirectoryShortcuts = [
    { title: "新朋友", caption: "3 个申请", icon: "new", tone: "bg-[#171717] text-lemon" },
    { title: "群聊", caption: "5 个群", icon: "group", tone: "bg-[#171717] text-lemon" },
    { title: "标签", caption: "9 个标签", icon: "tag", tone: "bg-[#171717] text-lemon" },
    { title: "公众号", caption: "2 个关注", icon: "official", tone: "bg-[#171717] text-lemon" },
    { title: "服务号", caption: "4 个通知", icon: "service", tone: "bg-[#171717] text-lemon" }
  ];
  const technicianContacts: TechnicianContact[] = [
    {
      id: "store-main",
      name: store.name,
      username: "store_ginza_calm",
      remark: "主业门店",
      avatar: store.cover,
      typeLabel: "店铺",
      tags: ["店铺", "主业", "排班"],
      meta: `${store.area} · 今日 ${timelineEvents.length} 件安排`
    },
    {
      id: "customer-active",
      name: activeOrder.customerName,
      username: "cus_today_001",
      remark: "今日服务客户",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
      typeLabel: "顾客",
      tags: ["顾客", "当日订单", activeOrder.status],
      meta: `${activeOrder.bookedAt} · ${activeOrder.itemName}`
    },
    {
      id: "dispatch",
      name: "平台调度",
      username: "needo_dispatch",
      remark: "异常与派单联系",
      avatar: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=240&q=80",
      typeLabel: "平台",
      tags: ["平台", "派单", "紧急"],
      meta: "24h 在线 · 可处理改期、异常、退款协助"
    },
    ...technicians.filter((item) => item.id !== tech.id).slice(0, 4).map((item, index) => ({
      id: item.id,
      name: item.name,
      username: `tech_peer_${index + 1}`,
      remark: index === 0 ? "同班协作" : "可互相支援",
      avatar: item.avatar,
      typeLabel: "同事",
      tags: ["同事", ...item.skills.slice(0, 2)],
      meta: `★ ${item.rating} · ${item.serviceAreas.join(" / ")}`
    }))
  ];

  const contact = (name: string, mode: "chat" | "phone") => {
    setContactLog(`${mode === "chat" ? "已打开 IM" : "已发起电话"}：${name}`);
  };

  const completeProfileShare = (contactItem: TechnicianContact, scope: "person" | "network" = "person") => {
    setProfileShareOpen(false);
    setPendingShareTarget(null);
    setContactLog(
      profileVisibility === "private"
        ? `已将私密技师资料仅分享给 ${contactItem.name}${scope === "network" ? " 以及其介绍的人" : ""}。`
        : `已通过信息把公开技师资料分享给 ${contactItem.name}。`
    );
  };

  const openProfileShareTarget = (contactItem: TechnicianContact) => {
    if (profileVisibility === "private") {
      setPendingShareTarget(contactItem);
      return;
    }

    completeProfileShare(contactItem);
  };

  const shareNextJob = (contactItem: TechnicianContact) => {
    setJobShareOpen(false);
    setContactLog(`已把下一单服务卡和定位追迹信息分享给 ${contactItem.name}。`);
  };

  const submitServiceCode = () => {
    if (serviceCode.trim() !== "079") {
      setCodeError("验证码不正确，请向用户确认后再开始服务。");
      return;
    }

    setCodeModalOpen(false);
    setCodeError("");
    setServiceCode("");
    setStatus("服务中");
    setContactLog("验证码通过，服务已开始并写入状态记录。");
  };

  const toggleTechSetting = (key: TechSettingKey) => {
    const nextValue = !techSettings[key];
    setTechSettings((current) => ({ ...current, [key]: nextValue }));
    setContactLog(`${techSettingLabels[key]} ${nextValue ? "已开启" : "已关闭"}`);
  };

  return (
    <MobileShell navItems={technicianNavItems}>
      <div className="space-y-5 px-4 py-4">
        {activeView === "tasks" && (
        <section className="rounded-lg bg-ink p-4 text-white shadow-soft">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-white/60">Technician App</p>
                <h1 className="text-2xl font-black">{activeView === "tasks" ? "今日任务" : activeView === "schedule" ? "日程管理" : activeView === "contacts" ? "通讯录" : "技师工作台"}</h1>
                <p className="mt-1 text-xs text-white/60">{status} · {store.name}</p>
              </div>
            </div>
            <button className="rounded-full bg-coral px-4 py-3 text-sm font-black text-white shadow-soft" onClick={() => setContactLog("SOS 已通知门店、平台和紧急联系人，并开始追迹当前位置。")} type="button">
              SOS
            </button>
          </header>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {statusButtons.map((item) => (
              <button
                className={cn(
                  "min-h-[82px] rounded-lg px-2 py-3 text-center text-[11px] font-black shadow-panel transition",
                  status === item ? statusButtonMeta[item].className : "bg-white/10 text-white/75"
                )}
                key={item}
                onClick={() => setStatus(item)}
                type="button"
              >
                <span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-black/10 text-lg">{statusButtonMeta[item].icon}</span>
                <span className="mt-1 block">{item}</span>
                <span className="mt-1 block text-[10px] font-bold opacity-70">{statusButtonMeta[item].caption}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["接单率", `${tech.acceptRate}%`],
              ["取消率", `${tech.cancelRate}%`],
              ["本月收入", yen(tech.income)]
            ].map(([label, value]) => (
              <div className="rounded-lg bg-white/10 p-3" key={label}>
                <p className="text-[11px] text-white/55">{label}</p>
                <strong className="mt-1 block text-sm">{value}</strong>
              </div>
            ))}
          </div>
        </section>
        )}

        {activeView === "tasks" && (
          <>
            <section className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-moss">Next Job</p>
                    <h2 className="mt-1 text-xl font-black">下一单服务</h2>
                  </div>
                  <a
                    className="focus-ring inline-flex h-8 items-center justify-center rounded-full bg-moss px-3 text-xs font-semibold text-white transition hover:brightness-95"
                    href={googleRouteUrl(nextJob.address)}
                    onClick={() => setStatus("移动中")}
                    rel="noreferrer"
                    target="_blank"
                  >
                    开始导航
                  </a>
                </div>
                <div className="mt-4 rounded-lg bg-paper p-3">
                  <h3 className="font-bold">{nextJob.serviceContent}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{nextJob.address}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="yellow">{nextJob.serviceTime}</Badge>
                    <Badge tone="green">{yen(nextJob.quote)}</Badge>
                  </div>
                  <div className="mt-3 rounded-lg bg-white p-3 text-xs leading-5 text-ink/60">
                    <strong className="text-ink">用户备注：</strong>
                    {activeOrder.remark ?? "请提前 10 分钟通过平台内通话联系；酒店前台需要登记，偏好中文沟通。"}
                  </div>
                  <button className="mt-3 w-full rounded-lg bg-white p-3 text-left" onClick={() => contact(activeCustomer.name, "chat")} type="button">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-lemon text-sm font-black text-black">{activeCustomer.name.slice(0, 1)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-moss">用户信息卡</p>
                        <h4 className="truncate font-black">{activeCustomer.name}</h4>
                        <p className="mt-1 text-xs text-ink/50">{activeCustomer.memberLevel} · {activeCustomer.orderCount} 单 · 活跃分 {activeCustomer.activeScore}</p>
                      </div>
                      <span className="text-lg font-black text-ink/35">›</span>
                    </div>
                  </button>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Button size="sm" variant="secondary" onClick={() => contact(activeOrder.customerName, "chat")}>用户 IM</Button>
                    <Button size="sm" variant="secondary" onClick={() => setJobShareOpen(true)}>分享</Button>
                    <Button size="sm" onClick={() => setCodeModalOpen(true)}>开始服务</Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <article className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <p className="text-xs font-bold text-ink/50">今日工单</p>
                <strong className="mt-2 block text-2xl">5</strong>
                <p className="mt-2 text-xs text-ink/55">2 单服务中，3 单待开始</p>
              </article>
              <article className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <p className="text-xs font-bold text-ink/50">预计移动</p>
                <strong className="mt-2 block text-2xl">28m</strong>
                <p className="mt-2 text-xs text-ink/55">含换乘与步行时间</p>
              </article>
            </section>
          </>
        )}

        {activeView === "schedule" && (
          <>
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-black">技师日程</h2>
                  <p className="mt-1 text-xs text-ink/50">历史记录、今天和未来安排都可以按日、周、月查看。</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setLongStatusOpen(true)}>
                  长期状态
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {scheduleScopeOptions.map((item) => (
                  <button
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-black",
                      scheduleScope === item.value ? "border-moss bg-moss text-white" : "border-line bg-paper text-ink/60"
                    )}
                    key={item.value}
                    onClick={() => setScheduleScope(item.value)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-[auto,1fr,auto] gap-2">
                <Button size="sm" variant="secondary" onClick={() => setSelectedDate(addDays(selectedDate, scheduleScope === "month" ? -30 : scheduleScope === "week" ? -7 : -1))}>
                  前一段
                </Button>
                <input
                  className="h-10 min-w-0 rounded-lg border border-line bg-paper px-3 text-center text-sm font-black outline-none"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value || todayDate)}
                />
                <Button size="sm" variant="secondary" onClick={() => setSelectedDate(addDays(selectedDate, scheduleScope === "month" ? 30 : scheduleScope === "week" ? 7 : 1))}>
                  后一段
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ["历史完成", completedEvents.length],
                  ["未来安排", futureEvents.length],
                  ["周期流水", yen(periodRevenue)]
                ].map(([label, value]) => (
                  <div className="rounded-lg bg-paper p-3" key={label}>
                    <p className="text-[11px] font-bold text-ink/45">{label}</p>
                    <strong className="mt-1 block text-sm">{value}</strong>
                  </div>
                ))}
              </div>
            </section>

            {scheduleScope === "week" && (
              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <h2 className="font-black">周视图</h2>
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {getWeekDates(selectedDate).map((day) => {
                    const dayEvents = scheduleEvents.filter((event) => event.date === day);

                    return (
                      <button
                        className={cn(
                          "min-h-20 rounded-lg border px-1 py-2 text-center text-[11px] font-bold",
                          selectedDate === day ? "border-moss bg-moss text-white" : "border-line bg-paper text-ink/60"
                        )}
                        key={day}
                        onClick={() => setSelectedDate(day)}
                        type="button"
                      >
                        <span className="block">{formatDisplayDate(day).replace("/", "/\n")}</span>
                        <strong className="mt-2 block text-sm">{dayEvents.length}</strong>
                        <span className="block text-[10px] opacity-70">件</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {scheduleScope === "month" && (
              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <h2 className="font-black">月视图</h2>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-black text-ink/45">
                  {["一", "二", "三", "四", "五", "六", "日"].map((day) => <span key={day}>{day}</span>)}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1">
                  {monthGridDates.map((day) => {
                    const dayEvents = scheduleEvents.filter((event) => event.date === day);
                    const dayRevenue = dayEvents.reduce((sum, event) => sum + event.amount, 0);
                    const muted = !day.startsWith(selectedMonth);

                    return (
                      <button
                        className={cn(
                          "min-h-16 rounded-lg border p-1 text-left text-[11px]",
                          selectedDate === day ? "border-moss bg-moss text-white" : "border-line bg-paper text-ink",
                          muted && "opacity-35"
                        )}
                        key={day}
                        onClick={() => setSelectedDate(day)}
                        type="button"
                      >
                        <strong>{Number(day.slice(-2))}</strong>
                        {dayEvents.length > 0 && (
                          <span className="mt-1 block rounded-md bg-white/60 px-1 py-0.5 text-[10px] text-ink">
                            {dayEvents.length}件
                            {dayRevenue > 0 ? ` ${yen(dayRevenue)}` : ""}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">{scheduleScope === "day" ? `${formatDisplayDate(selectedDate)} 日程` : "周期日程明细"}</h2>
                  <p className="mt-1 text-xs text-ink/50">店铺工作和个人工作会分别标记，方便核对收入与安排。</p>
                </div>
                <Badge tone="yellow">{timelineEvents.length} 件</Badge>
              </div>

              <div className="mt-4 space-y-3">
                {timelineEvents.length > 0 ? timelineEvents.map((event) => (
                  <article className="grid grid-cols-[76px,1fr] gap-3 rounded-lg bg-paper p-3" key={event.id}>
                    <div className="text-sm font-black">
                      {event.startTime}
                      <span className="block text-xs text-ink/45">{event.endTime}</span>
                    </div>
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <Badge tone={event.workMode === "store" ? "green" : "yellow"}>{workModeLabels[event.workMode]}</Badge>
                            <Badge tone={event.date < todayDate ? "neutral" : event.date === todayDate ? "red" : "green"}>{getSchedulePhase(event.date)}</Badge>
                          </div>
                          <h3 className="mt-2 font-bold">{event.title}</h3>
                          <p className="mt-1 text-xs text-ink/55">{event.date} · {event.place}</p>
                        </div>
                        <Badge tone={event.status === "free" ? "green" : event.status === "blocked" ? "neutral" : "yellow"}>{getScheduleStatusLabel(event)}</Badge>
                      </div>
                      <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-ink/55">
                        <strong className="text-ink">{event.customer}</strong>
                        <span> · {event.amount ? yen(event.amount) : "无收入"}</span>
                        <p>{event.note}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setStatus(event.status === "free" ? "空闲" : "移动中")}>
                          切状态
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => contact(event.workMode === "store" ? store.name : event.customer, "chat")}>
                          IM
                        </Button>
                        <Button size="sm" onClick={() => contact(event.customer, "phone")}>
                          电话
                        </Button>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="rounded-lg bg-paper p-4 text-sm leading-6 text-ink/55">
                    <strong className="block text-ink">暂无安排</strong>
                    当前日期没有日程，可以切换到周视图或月视图查看前后安排。
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activeView === "contacts" && (
          <>
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-moss">Technician Contacts</p>
                  <h2 className="mt-1 text-2xl font-black">通讯录</h2>
                  <p className="mt-1 text-xs text-ink/50">店铺、顾客、同事和平台联系人统一管理。</p>
                </div>
                <Badge tone="green">{technicianContacts.length} 人</Badge>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {technicianDirectoryShortcuts.map((shortcut) => (
                  <button
                    className="rounded-lg bg-paper p-2 text-center"
                    key={shortcut.title}
                    onClick={() => setContactLog(`已打开${shortcut.title}`)}
                    type="button"
                  >
                    <span className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full text-sm font-black", shortcut.tone)}>
                      <ContactGroupIcon id={shortcut.icon} label={shortcut.title} />
                    </span>
                    <strong className="mt-2 block text-[11px] leading-4">{shortcut.title}</strong>
                    <span className="mt-1 block text-[10px] text-ink/45">{shortcut.caption}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">今日联系人</h2>
                  <p className="mt-1 text-xs text-ink/50">门店、顾客、同事和平台调度按通讯录信息卡展示。</p>
                </div>
                <Badge tone="yellow">可联系</Badge>
              </div>
              <div className="mt-3 space-y-3">
                {technicianContacts.map((contactItem) => (
                  <article className="rounded-lg bg-paper p-3" key={contactItem.id}>
                    <div className="flex gap-3">
                      <img alt={contactItem.name} className="h-14 w-14 rounded-lg object-cover" src={contactItem.avatar} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-black">{contactItem.name}</h3>
                            <p className="mt-1 text-xs text-ink/50">用户名：{contactItem.username}</p>
                            <p className="mt-1 text-xs text-ink/45">备注名：{contactItem.remark}</p>
                          </div>
                          <Badge tone={contactItem.typeLabel === "顾客" ? "yellow" : contactItem.typeLabel === "平台" ? "red" : "green"}>
                            {contactItem.typeLabel}
                          </Badge>
                        </div>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.08em] text-ink/35">自定义标签</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {contactItem.tags.map((tag) => (
                            <span className="rounded-md bg-white px-2 py-1 text-[11px] font-bold text-ink/55" key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-ink/45">{contactItem.meta}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="secondary" onClick={() => contact(contactItem.name, "chat")}>聊天</Button>
                      <Button size="sm" onClick={() => contact(contactItem.name, "phone")}>平台内通话</Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === "messages" && (
          <MobileMessageCenter context="technician" />
        )}

        {activeView === "me" && (
          <>
            <section className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
              <div className="bg-moss px-4 pb-16 pt-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <button className="rounded-full bg-white/15 px-3 py-2 text-xs font-black" onClick={() => setContactLog("已打开技师资料编辑。")} type="button">
                    编辑
                  </button>
                  <h2 className="text-lg font-black">技师信息卡</h2>
                  <button className="rounded-full bg-white/15 px-3 py-2 text-xs font-black" onClick={() => setProfileShareOpen(true)} type="button">
                    分享
                  </button>
                </div>
              </div>
              <div className="-mt-12 px-4 pb-4 text-center">
                <img alt={tech.name} className="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover shadow-soft" src={tech.avatar} />
                <h1 className="mt-3 text-2xl font-black">{tech.name}</h1>
                <p className="mt-1 text-xs text-ink/50">{store.name} 所属技师 · 退勤后接单自动记入个人工单</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Badge tone="green">已认证</Badge>
                  <Badge tone="yellow">★ {tech.rating}</Badge>
                  <Badge tone={profileVisibility === "private" ? "neutral" : "green"}>
                    {profileVisibility === "private" ? "资料私密" : "资料公开"}
                  </Badge>
                </div>
                <button
                  className="mt-3 rounded-full bg-paper px-4 py-2 text-xs font-black text-ink"
                  onClick={() => setProfileVisibility(profileVisibility === "private" ? "public" : "private")}
                  type="button"
                >
                  切换为{profileVisibility === "private" ? "公开" : "私密"}
                </button>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[
                    ["身高", "164cm"],
                    ["年龄", "25"],
                    ["属性", "店铺所属"],
                    ["状态", status]
                  ].map(([label, value]) => (
                    <div className="rounded-lg bg-paper p-3" key={label}>
                      <p className="text-[11px] text-ink/45">{label}</p>
                      <strong className="mt-1 block text-sm">{value}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-paper p-3 text-left">
                  <h3 className="font-black">自我介绍</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/60">
                    擅长肩颈调理和睡眠放松，可日本語 / 中文沟通。店铺工作由 {store.name} 管理，退勤后的预约自动进入个人工单清单。
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tech.skills.concat(tech.languages).map((tag) => (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/60" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <MobilePreferencePanel caption="技师端也保留客户端基础设置，UI 风格和语言会同步到全端。" currentPortal="technician" />

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">本人工单中心</h2>
                  <p className="mt-1 text-xs text-ink/50">工单已整合到我的，导航、电话和服务状态都从这里处理。</p>
                </div>
                <Badge tone="yellow">{fieldJobs.slice(0, 6).length} 件</Badge>
              </div>
              <div className="mt-3 space-y-3">
                {fieldJobs.slice(0, 3).map((job) => (
                  <article className="rounded-lg bg-paper p-3" key={job.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{job.serviceContent}</h3>
                        <p className="mt-1 text-xs text-ink/55">{job.serviceTime}</p>
                      </div>
                      <Badge tone={job.status === "completed" ? "green" : job.status === "exception" ? "red" : "yellow"}>{job.status}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-ink/60">{job.address}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setStatus("移动中")}>导航</Button>
                      <Button size="sm" variant="secondary" onClick={() => contact(job.phone, "phone")}>电话</Button>
                      <Button size="sm" onClick={() => setStatus("服务中")}>服务中</Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">工作清单</h2>
                  <p className="mt-1 text-xs text-ink/50">技师不可手动切换模式；退勤状态接单自动记入个人工单，出勤内由店铺工单管理。</p>
                </div>
                <Badge tone="yellow">PDF 30 天</Badge>
              </div>
              <div className="mt-3 grid gap-3">
                {(["store", "personal"] as TechWorkMode[]).map((mode) => {
                  const events = scheduleEvents.filter((event) => event.workMode === mode);
                  const completed = events.filter((event) => event.status === "booked" && event.date <= todayDate);
                  const future = events.filter((event) => event.date >= todayDate);
                  const income = completed.reduce((sum, event) => sum + event.amount, 0);
                  const next = future.find((event) => event.status !== "blocked");

                  return (
                    <article className="rounded-lg bg-paper p-3" key={mode}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black">{workModeLabels[mode]}</h3>
                          <p className="mt-1 text-xs text-ink/50">{mode === "store" ? `${store.name} 自动派单与店铺预约` : "退勤后接到的个人工作自动归档"}</p>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => setContactLog(`${workModeLabels[mode]} PDF 已生成，可下载；系统提示仅保存 30 天。`)}>
                          下载 PDF
                        </Button>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {[
                          ["收入", yen(income)],
                          ["单量", completed.length],
                          ["履约", `${Math.max(96 - (mode === "personal" ? 1 : 0), 0)}%`],
                          ["评价", mode === "store" ? "4.96" : "4.92"]
                        ].map(([label, value]) => (
                          <div className="rounded-lg bg-white p-2" key={label}>
                            <p className="text-[11px] text-ink/45">{label}</p>
                            <strong className="mt-1 block text-sm">{value}</strong>
                          </div>
                        ))}
                      </div>
                      <button
                        className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg bg-white px-3 py-3 text-left"
                        onClick={() => {
                          if (next) {
                            setSelectedDate(next.date);
                            setScheduleScope("day");
                            setContactLog(`已切换到 ${next.date} 的日程`);
                          }
                        }}
                        type="button"
                      >
                        <span className="min-w-0">
                          <strong className="block truncate text-sm">下一项：{next ? next.title : "暂无未来安排"}</strong>
                          <span className="mt-1 block text-xs text-ink/50">{next ? `${next.date} ${next.startTime} · ${next.place}` : "可在日程中添加可预约状态"}</span>
                        </span>
                        <span className="text-sm font-black text-ink/35">›</span>
                      </button>
                    </article>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-5 text-ink/50">下载文件仅保存 30 天，30 天后无法再次下载，请需要报税或对账时及时留档。</p>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <h2 className="font-black">服务能力</h2>
              <div className="mt-3 space-y-3 text-sm">
                {[
                  ["服务范围", tech.serviceAreas.join("、")],
                  ["语言能力", tech.languages.join(" / ")],
                  ["技能标签", tech.skills.join(" / ")],
                  ["接单率", `${tech.acceptRate}%`],
                  ["取消率", `${tech.cancelRate}%`],
                  ["本月收入", yen(tech.income)]
                ].map(([label, value]) => (
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-paper px-3 py-3" key={label}>
                    <span className="text-ink/55">{label}</span>
                    <strong className="text-right">{value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">状态与接单设置</h2>
                  <p className="mt-1 text-xs text-ink/50">接单、定位、休息与夜间服务可独立控制。</p>
                </div>
                <Badge tone={status === "空闲" ? "green" : status === "退勤" ? "neutral" : "yellow"}>{status}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  ["autoAccept", "自动接单", "空闲时自动接受低风险订单"],
                  ["shareLocation", "共享位置", "移动中向用户和门店同步位置"],
                  ["breakReminder", "休息提醒", "连续服务后提醒补休"],
                  ["nightService", "夜间服务", "允许 21:00 后派单"]
                ].map(([key, title, caption]) => {
                  const settingKey = key as TechSettingKey;

                  return (
                    <button
                      className="flex w-full items-center justify-between gap-3 rounded-lg bg-paper px-3 py-3 text-left"
                      key={key}
                      onClick={() => toggleTechSetting(settingKey)}
                      type="button"
                    >
                      <span>
                        <strong className="block text-sm">{title}</strong>
                        <span className="mt-1 block text-xs text-ink/50">{caption}</span>
                      </span>
                      <Badge tone={techSettings[settingKey] ? "green" : "neutral"}>
                        {techSettings[settingKey] ? "开启" : "已关闭"}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <h2 className="font-black">资料与安全</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  ["资料编辑", "头像、简介、语言", "已打开个人资料编辑"],
                  ["修改服务范围", "区域、品类、价格", "已打开服务范围配置"],
                  ["上传证件", "资格证、保险、本人确认", "已打开证件上传"],
                  ["收款账户", "提现、结算、税务", "已打开收款账户"],
                  ["通知设置", "新单、改期、客服", "已打开通知设置"],
                  ["紧急联系人", "门店、家属、平台", "已打开紧急联系人"]
                ].map(([title, caption, log]) => (
                  <button
                    className="rounded-lg border border-line bg-white p-4 text-left shadow-panel"
                    key={title}
                    onClick={() => setContactLog(log)}
                    type="button"
                  >
                    <h3 className="font-black">{title}</h3>
                    <p className="mt-2 text-xs leading-5 text-ink/50">{caption}</p>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {(profileShareOpen || jobShareOpen) && (
          <div className="fixed inset-0 z-50 bg-paper text-ink">
            <div className="mx-auto flex h-full w-full max-w-[480px] flex-col bg-paper shadow-soft">
              <header className="grid h-14 grid-cols-[64px,1fr,64px] items-center border-b border-line bg-white px-2">
                <button className="rounded-full bg-paper px-3 py-2 text-xs font-black" onClick={() => { setProfileShareOpen(false); setJobShareOpen(false); setPendingShareTarget(null); }} type="button">
                  关闭
                </button>
                <h2 className="text-center font-black">{profileShareOpen ? "分享技师信息卡" : "分享下一单服务卡"}</h2>
                <span />
              </header>
              <main className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                <section className="rounded-lg bg-white p-4 shadow-panel">
                  <h3 className="font-black">{profileShareOpen ? tech.name : nextJob.serviceContent}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/60">
                    {profileShareOpen
                      ? `${profileVisibility === "private" ? "私密资料" : "公开资料"} · ${store.name} 所属技师 · ★ ${tech.rating}`
                      : `${nextJob.serviceTime} · ${nextJob.address} · 分享后门店可追迹服务安全状态。`}
                  </p>
                </section>
                <section className="rounded-lg bg-white p-4 shadow-panel">
                  <h3 className="font-black">选择发送给谁</h3>
                  <div className="mt-3 space-y-2">
                    {technicianContacts.map((contactItem) => (
                      <button
                        className="flex w-full items-center gap-3 rounded-lg bg-paper p-3 text-left"
                        key={contactItem.id}
                        onClick={() => profileShareOpen ? openProfileShareTarget(contactItem) : shareNextJob(contactItem)}
                        type="button"
                      >
                        <img alt={contactItem.name} className="h-12 w-12 rounded-full object-cover" src={contactItem.avatar} />
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-sm">{contactItem.name}</strong>
                          <span className="mt-1 block truncate text-xs text-ink/50">{contactItem.typeLabel} · {contactItem.remark}</span>
                        </span>
                        <span className="text-lg font-black text-ink/30">›</span>
                      </button>
                    ))}
                  </div>
                </section>
              </main>
            </div>
          </div>
        )}

        {pendingShareTarget && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-black/55 px-4">
            <section className="w-full max-w-[420px] rounded-lg bg-white p-4 text-ink shadow-soft">
              <h2 className="text-lg font-black">私密资料分享范围</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                你的技师信息卡当前为私密。要分享给 {pendingShareTarget.name} 时，请选择可见范围。
              </p>
              <div className="mt-4 grid gap-2">
                <Button onClick={() => completeProfileShare(pendingShareTarget, "person")}>仅对此人可见</Button>
                <Button variant="secondary" onClick={() => completeProfileShare(pendingShareTarget, "network")}>对此人以及介绍的人可见</Button>
                <Button variant="ghost" onClick={() => setPendingShareTarget(null)}>取消</Button>
              </div>
            </section>
          </div>
        )}

        {codeModalOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4">
            <section className="w-full max-w-[420px] rounded-lg bg-white p-5 text-ink shadow-soft">
              <h2 className="text-xl font-black">输入服务验证码</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">服务开始前必须输入用户提供的验证码，防止误开始或冒领订单。</p>
              <input
                className="mt-4 h-14 w-full rounded-full border border-line bg-paper px-5 text-center text-2xl font-black tracking-[0.4em] outline-none"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => {
                  setServiceCode(event.target.value);
                  setCodeError("");
                }}
                placeholder="079"
                value={serviceCode}
              />
              {codeError ? <p className="mt-2 text-xs font-bold text-coral">{codeError}</p> : <p className="mt-2 text-xs text-ink/45">演示验证码：079</p>}
              <div className="mt-5 grid grid-cols-[112px,1fr] gap-2">
                <Button variant="secondary" onClick={() => setCodeModalOpen(false)}>取消</Button>
                <Button onClick={submitServiceCode}>验证并开始</Button>
              </div>
            </section>
          </div>
        )}

        {longStatusOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4">
            <section className="w-full max-w-[420px] rounded-lg bg-white p-5 text-ink shadow-soft">
              <h2 className="text-xl font-black">长期状态设定</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">像 Google 日历一样设置一段时间的可排状态。空闲时店铺可以安排工作，锁定时店铺无法派单。</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {([
                  ["free", "空闲", "允许店铺派单"],
                  ["locked", "锁定", "禁止店铺安排"]
                ] as Array<[LongTermStatus, string, string]>).map(([key, title, caption]) => (
                  <button
                    className={cn("rounded-lg border px-3 py-4 text-left", longTermStatus === key ? "border-moss bg-moss text-white" : "border-line bg-paper text-ink")}
                    key={key}
                    onClick={() => setLongTermStatus(key)}
                    type="button"
                  >
                    <strong className="block">{title}</strong>
                    <span className={cn("mt-1 block text-xs", longTermStatus === key ? "text-white/70" : "text-ink/50")}>{caption}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <label className="block text-xs font-black text-ink/50">
                  开始日期
                  <input className="mt-1 h-11 w-full rounded-full border border-line bg-paper px-3 text-sm outline-none" defaultValue="2026-04-14" type="date" />
                </label>
                <label className="block text-xs font-black text-ink/50">
                  结束日期
                  <input className="mt-1 h-11 w-full rounded-full border border-line bg-paper px-3 text-sm outline-none" defaultValue="2026-04-30" type="date" />
                </label>
              </div>
              <div className="mt-5 grid grid-cols-[112px,1fr] gap-2">
                <Button variant="secondary" onClick={() => setLongStatusOpen(false)}>取消</Button>
                <Button onClick={() => {
                  setLongStatusOpen(false);
                  setContactLog(`长期状态已设为${longTermStatus === "free" ? "空闲" : "锁定"}，店铺排班权限已同步。`);
                }}>
                  保存状态
                </Button>
              </div>
            </section>
          </div>
        )}

        <section className="rounded-lg border border-line bg-white p-3 shadow-panel">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold">状态记录</span>
            <span className="text-right text-xs text-ink/55">{contactLog}</span>
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
