import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { ContactGroupIcon } from "../../components/mobile/ContactGroupIcon";
import { MobileShell } from "../../components/mobile/MobileShell";
import { getMerchantCustomerConversationId, getMerchantTechnicianConversationId, MobileMessageCenter } from "../../components/mobile/MobileMessageCenter";
import { MobilePreferencePanel } from "../../components/mobile/MobilePreferencePanel";
import { merchantNavItems } from "../../components/mobile/navItems";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { customers, imageBank, orders, schedules, stores, technicians } from "../../data/mock";
import { cn, yen } from "../../lib/utils";
import type { Order } from "../../types/domain";

type MerchantView = "dashboard" | "orders" | "messages" | "schedule" | "contacts" | "moments" | "me";
type StaffStatus = "出勤" | "休息" | "服务中" | "可指派";
type MerchantSettingKey = "storeOnline" | "autoConfirm" | "instantBooking" | "reviewReminder";
type MerchantContactModal = { type: "staff"; id: string } | { type: "customer"; id: string } | null;
type DirectoryContact = {
  id: string;
  type: "staff" | "customer";
  name: string;
  username: string;
  remark: string;
  avatar: string;
  title: string;
  tags: string[];
  meta: string;
  followed: boolean;
};

const timeSlots = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00", "20:30"];
const staffStatusSeeds: StaffStatus[] = ["可指派", "服务中", "出勤"];
const merchantSettingLabels: Record<MerchantSettingKey, string> = {
  storeOnline: "店铺上线",
  autoConfirm: "自动确认订单",
  instantBooking: "即时预约",
  reviewReminder: "评价提醒"
};

function getMerchantView(view?: string): MerchantView {
  if (view === "staff" || view === "customers" || view === "contacts") {
    return "contacts";
  }

  if (view === "orders" || view === "messages" || view === "schedule" || view === "moments" || view === "me") {
    return view;
  }

  return "dashboard";
}

export function MerchantPortalPage() {
  const { view } = useParams();
  const activeView = getMerchantView(view);
  const store = stores[0];
  const [staffStatuses, setStaffStatuses] = useState<Record<string, StaffStatus>>(
    Object.fromEntries(technicians.map((tech, index) => [tech.id, staffStatusSeeds[index % staffStatusSeeds.length]]))
  );
  const [selectedStaffId, setSelectedStaffId] = useState(technicians[0].id);
  const [selectedContact, setSelectedContact] = useState<MerchantContactModal>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [followedStaffIds, setFollowedStaffIds] = useState<string[]>(["tech-1"]);
  const [followedCustomerIds, setFollowedCustomerIds] = useState<string[]>(["cus-1", "cus-3"]);
  const [contactLog, setContactLog] = useState("暂无联系记录");
  const [merchantSettings, setMerchantSettings] = useState<Record<MerchantSettingKey, boolean>>({
    storeOnline: true,
    autoConfirm: false,
    instantBooking: true,
    reviewReminder: true
  });
  const selectedStaff = technicians.find((tech) => tech.id === selectedStaffId) ?? technicians[0];
  const pendingOrders = orders.filter((order) => ["pending", "confirmed", "scheduled"].includes(order.status)).slice(0, 8);
  const storeOrders = orders.slice(0, 10);
  const conflictCount = useMemo(
    () => schedules.filter((schedule) => schedule.status === "booked").length + technicians.filter((tech) => tech.status === "busy").length,
    []
  );
  const selectedContactStaff = selectedContact?.type === "staff" ? technicians.find((tech) => tech.id === selectedContact.id) : undefined;
  const selectedContactCustomer = selectedContact?.type === "customer" ? customers.find((customer) => customer.id === selectedContact.id) : undefined;
  const selectedCustomerOrder = selectedContactCustomer
    ? orders.find((order) => order.customerId === selectedContactCustomer.id) ?? orders[0]
    : orders[0];
  const directoryContacts: DirectoryContact[] = [
    ...technicians.map((tech, index) => ({
      id: tech.id,
      type: "staff" as const,
      name: tech.name,
      username: `tech_${tech.id.replace("tech-", "").padStart(3, "0")}`,
      remark: ["主力夜间担当", "空调清洗负责人", "美业复购担当"][index] ?? "门店员工",
      avatar: tech.avatar,
      title: "员工 / 技师",
      tags: ["员工", staffStatuses[tech.id], ...tech.skills.slice(0, 2)],
      meta: `★ ${tech.rating} · ${tech.serviceAreas.join(" / ")}`,
      followed: followedStaffIds.includes(tech.id)
    })),
    ...customers.map((customer, index) => ({
      id: customer.id,
      type: "customer" as const,
      name: customer.name,
      username: `cus_${customer.id.replace("cus-", "").padStart(3, "0")}`,
      remark: ["高频夜间客户", "周末到店客", "英文美业复购"][index] ?? "普通顾客",
      avatar: index % 2 === 0
        ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80"
        : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
      title: "顾客",
      tags: ["顾客", customer.memberLevel, ...customer.tags.slice(0, 2)],
      meta: `${customer.orderCount} 单 · 活跃分 ${customer.activeScore}`,
      followed: followedCustomerIds.includes(customer.id)
    }))
  ];
  const followedDirectoryContacts = directoryContacts.filter((contactItem) => contactItem.followed);
  const regularDirectoryContacts = directoryContacts.filter((contactItem) => !contactItem.followed);
  const directoryShortcuts = [
    { title: "新朋友", caption: "8 个申请", icon: "new", tone: "bg-[#171717] text-lemon" },
    { title: "群聊", caption: "12 个群", icon: "group", tone: "bg-[#171717] text-lemon" },
    { title: "标签", caption: "18 个标签", icon: "tag", tone: "bg-[#171717] text-lemon" },
    { title: "公众号", caption: "4 个关注", icon: "official", tone: "bg-[#171717] text-lemon" },
    { title: "服务号", caption: "6 个通知", icon: "service", tone: "bg-[#171717] text-lemon" }
  ];

  const renderDirectoryContact = (contactItem: DirectoryContact) => (
    <article className="rounded-lg bg-paper p-3" key={`${contactItem.type}-${contactItem.id}`}>
      <button
        className="w-full text-left"
        onClick={() => setSelectedContact({ type: contactItem.type, id: contactItem.id })}
        type="button"
      >
        <div className="flex gap-3">
          <img alt={contactItem.name} className="h-14 w-14 rounded-lg object-cover" src={contactItem.avatar} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-black">{contactItem.name}</h3>
                <p className="mt-1 text-xs text-ink/50">用户名：{contactItem.username}</p>
                <p className="mt-1 text-xs text-ink/45">备注名：{contactItem.remark}</p>
              </div>
              <Badge tone={contactItem.type === "staff" ? "green" : "yellow"}>{contactItem.title}</Badge>
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
      </button>
      <button
        className={cn(
          "mt-3 w-full rounded-lg px-3 py-2 text-xs font-black",
          contactItem.followed ? "bg-white text-ink/55" : "bg-moss text-white"
        )}
        onClick={() => toggleFollow(contactItem.type, contactItem.id)}
        type="button"
      >
        {contactItem.followed ? "取消关注" : "关注"}
      </button>
    </article>
  );

  const contact = (name: string, mode: "chat" | "phone") => {
    setContactLog(`${mode === "chat" ? "已打开 IM" : "已发起电话"}：${name}`);
  };

  const toggleFollow = (type: "staff" | "customer", id: string) => {
    const update = (current: string[]) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

    if (type === "staff") {
      setFollowedStaffIds(update);
      return;
    }

    setFollowedCustomerIds(update);
  };

  const autoArrange = () => {
    setStaffStatuses((current) =>
      Object.fromEntries(
        technicians.map((tech, index) => [
          tech.id,
          index % 4 === 0 ? "服务中" : current[tech.id] === "休息" ? "休息" : "可指派"
        ])
      )
    );
    setContactLog("智能排班已根据评分、语言、区域和冲突状态重新推荐。");
  };

  const assignOrderToTechnician = (order: Order, technicianName: string) => {
    setSelectedStaffId(technicians.find((tech) => tech.name === technicianName)?.id ?? selectedStaffId);
    setDispatchOrder(null);
    setContactLog(`${order.orderNo} 已分配给 ${technicianName}，系统会同步日程和通知用户。`);
  };

  const toggleMerchantSetting = (key: MerchantSettingKey) => {
    const nextValue = !merchantSettings[key];
    setMerchantSettings((current) => ({ ...current, [key]: nextValue }));
    setContactLog(`${merchantSettingLabels[key]} ${nextValue ? "已开启" : "已关闭"}`);
  };

  return (
    <MobileShell navItems={merchantNavItems}>
      <div className="space-y-5 px-4 py-4">
        <section className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
          <div className="relative min-h-[220px]">
            <img alt={store.name} className="absolute inset-0 h-full w-full object-cover opacity-55" src={imageBank.salon} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/80" />
            <div className="relative flex min-h-[220px] flex-col justify-between p-4">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white/65">Merchant App</p>
                  <h1 className="mt-1 text-2xl font-black">门店工作台</h1>
                </div>
                <Link className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 text-sm font-black" to="/admin">
                  PC
                </Link>
              </header>
              <div>
                <Badge tone="yellow">{store.area} · {store.openStatus}</Badge>
                <h2 className="mt-3 text-xl font-black">{store.name}</h2>
                <p className="mt-2 text-sm leading-6 text-white/70">预约、排班、员工、客户与 IM 联系集中处理。</p>
              </div>
            </div>
          </div>
        </section>

        {activeView === "dashboard" && (
          <>
            <section className="grid grid-cols-2 gap-3">
              {[
                ["今日预约", "28", "+12%"],
                ["待确认", "6", "需处理"],
                ["今日营收", "¥428K", "+18%"],
                ["排班冲突", `${conflictCount}`, "需关注"]
              ].map(([label, value, hint]) => (
                <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={label}>
                  <p className="text-xs font-bold text-ink/50">{label}</p>
                  <strong className="mt-2 block text-2xl">{value}</strong>
                  <span className="mt-2 inline-flex rounded-md bg-mint/20 px-2 py-1 text-xs font-bold text-moss">{hint}</span>
                </article>
              ))}
            </section>
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">今日运营图表</h2>
                  <p className="mt-1 text-xs text-ink/50">订单、流水和人员利用率的简易实时走势。</p>
                </div>
                <Badge tone="green">Live</Badge>
              </div>
              <div className="mt-4 grid grid-cols-[46px,1fr] items-end gap-2">
                <div className="space-y-3 text-[10px] font-bold text-ink/35">
                  <p>高</p>
                  <p>中</p>
                  <p>低</p>
                </div>
                <div className="flex h-28 items-end gap-2 rounded-lg bg-paper p-3">
                  {[48, 64, 42, 76, 58, 92, 70, 84].map((height, index) => (
                    <div className="flex flex-1 flex-col items-center gap-1" key={height + index}>
                      <span className="w-full rounded-t-full bg-moss" style={{ height: `${height}%` }} />
                      <span className="text-[9px] font-bold text-ink/35">{10 + index * 2}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ["客流", "146"],
                  ["流水", "¥428K"],
                  ["利用率", "82%"]
                ].map(([label, value]) => (
                  <div className="rounded-lg bg-paper p-3" key={label}>
                    <p className="text-[11px] text-ink/45">{label}</p>
                    <strong className="mt-1 block">{value}</strong>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">今日订单内容</h2>
                  <p className="mt-1 text-xs text-ink/50">工作台直接展示可处理订单，减少来回跳转。</p>
                </div>
                <Button size="sm" onClick={() => setDispatchOrder(pendingOrders[0] ?? orders[0])}>
                  自动派单
                </Button>
              </div>
              <div className="mt-3 space-y-3">
                {pendingOrders.slice(0, 4).map((order, index) => (
                  <article className="rounded-lg bg-paper p-3" key={order.id}>
                    <button className="w-full text-left" onClick={() => setSelectedOrder(order)} type="button">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={index === 0 ? "red" : "yellow"}>{index === 0 ? "优先处理" : order.status}</Badge>
                          <Badge tone="green">{order.area}</Badge>
                        </div>
                        <h3 className="mt-2 truncate font-bold">{order.itemName}</h3>
                        <p className="mt-1 text-xs text-ink/55">{order.bookedAt} · {order.customerName}</p>
                      </div>
                      <strong className="shrink-0 text-sm text-coral">{yen(order.amount)}</strong>
                    </div>
                    </button>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setDispatchOrder(order)}>派单</Button>
                      <Button size="sm" variant="secondary" onClick={() => setSelectedOrder(order)}>详情</Button>
                      <Button size="sm" to={`/merchant/messages?chat=${getMerchantCustomerConversationId(order.customerId)}`}>IM</Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === "messages" && (
          <MobileMessageCenter context="merchant" />
        )}

        {activeView === "orders" && (
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="font-black">订单处理</h2>
            <div className="mt-3 space-y-3">
              {storeOrders.map((order) => (
                <article className="rounded-lg bg-paper p-3" key={order.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{order.itemName}</h3>
                      <p className="mt-1 text-xs text-ink/55">{order.bookedAt} · {order.customerName}</p>
                    </div>
                    <strong className="text-sm text-coral">{yen(order.amount)}</strong>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Button size="sm" variant="secondary">确认</Button>
                    <Button size="sm" variant="secondary">改期</Button>
                    <Button size="sm" to={`/merchant/messages?chat=${getMerchantCustomerConversationId(order.customerId)}`}>联系</Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeView === "schedule" && (
          <>
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">智能员工排班</h2>
                  <p className="mt-1 text-xs text-ink/50">按技能、语言、区域、冲突和客单价推荐。</p>
                </div>
                <Button size="sm" onClick={autoArrange}>
                  一键排班
                </Button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[720px] rounded-lg border border-line bg-paper p-3">
                  <div className="grid grid-cols-[92px_repeat(8,1fr)] gap-2 text-xs font-black text-ink/50">
                    <span>人员</span>
                    {timeSlots.map((slot) => <span key={slot}>{slot}</span>)}
                  </div>
                  <div className="mt-3 space-y-2">
                    {technicians.map((tech, staffIndex) => (
                      <div className="grid grid-cols-[92px_repeat(8,1fr)] gap-2" key={tech.id}>
                        <button className="rounded-lg bg-white p-2 text-left text-xs font-bold" onClick={() => setSelectedStaffId(tech.id)} type="button">
                          {tech.name}
                          <span className="mt-1 block text-[10px] text-ink/45">{staffStatuses[tech.id]}</span>
                        </button>
                        {timeSlots.map((slot, slotIndex) => {
                          const busy = (staffIndex + slotIndex) % 4 === 0;
                          const conflict = busy && slotIndex > 4;
                          return (
                            <button
                              className={cn("min-h-12 rounded-lg p-2 text-[11px] font-bold", conflict ? "bg-coral/15 text-coral" : busy ? "bg-moss text-white" : "bg-white text-ink/50")}
                              key={`${tech.id}-${slot}`}
                              onClick={() => setSelectedStaffId(tech.id)}
                              type="button"
                            >
                              {conflict ? "冲突" : busy ? "已排" : "空闲"}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <h2 className="font-black">待分配预约</h2>
              <div className="mt-3 space-y-2">
                {pendingOrders.slice(0, 4).map((order, index) => (
                  <article className="rounded-lg bg-paper p-3" key={order.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{order.itemName}</h3>
                        <p className="mt-1 text-xs text-ink/55">{order.bookedAt} · {order.area}</p>
                      </div>
                      <Badge tone={index === 0 ? "red" : "green"}>{index === 0 ? "建议优先" : "可自动排"}</Badge>
                    </div>
                    <Button className="mt-3 w-full" size="sm" onClick={() => setContactLog(`已建议将 ${order.itemName} 分配给 ${selectedStaff.name}`)}>
                      分配给 {selectedStaff.name}
                    </Button>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === "contacts" && (
          <>
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-moss">Merchant Contacts</p>
                  <h2 className="mt-1 text-2xl font-black">通讯录</h2>
                  <p className="mt-1 text-xs text-ink/50">
                    人员、顾客、群聊和平台服务统一管理，点击信息卡后选择聊天、电话、预约或动态。
                  </p>
                </div>
                <Badge tone="green">{directoryContacts.length} 人</Badge>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {directoryShortcuts.map((shortcut) => (
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
                  <h2 className="font-black">关注列表</h2>
                  <p className="mt-1 text-xs text-ink/50">常用员工和高价值顾客会固定在这里。</p>
                </div>
                <Badge tone="yellow">{followedDirectoryContacts.length} 人</Badge>
              </div>
              <div className="mt-3 space-y-3">
                {followedDirectoryContacts.map(renderDirectoryContact)}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">一般通讯录</h2>
                  <p className="mt-1 text-xs text-ink/50">员工、顾客和运营联系人按卡片统一展示。</p>
                </div>
                <Badge tone="neutral">{regularDirectoryContacts.length} 人</Badge>
              </div>
              <div className="mt-3 space-y-3">
                {regularDirectoryContacts.map(renderDirectoryContact)}
              </div>
            </section>
          </>
        )}

        {activeView === "me" && (
          <>
            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-start gap-3">
                <img alt={store.name} className="h-20 w-20 rounded-lg object-cover" src={store.cover} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-moss">Merchant Account</p>
                  <h2 className="mt-1 text-xl font-black">{store.name}</h2>
                  <p className="mt-1 text-xs text-ink/50">{store.address}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="green">已认证</Badge>
                    <Badge tone="yellow">评分 {store.rating}</Badge>
                  </div>
                </div>
              </div>
            </section>

            <MobilePreferencePanel caption="商户端也保留客户端基础设置，UI 风格和语言会同步到全端。" currentPortal="merchant" />

            <section className="grid grid-cols-2 gap-3">
              {[
                ["门店资料", "营业时间、地址、图片", "/admin/merchants"],
                ["资质文件", "营业执照、保险、合同", "/admin/merchants"],
                ["结算账户", "分账、发票、提现", "/admin/finance"],
                ["通知设置", "预约、评价、库存提醒", "/merchant/me"]
              ].map(([title, caption, to]) => (
                <Link className="rounded-lg border border-line bg-white p-4 shadow-panel" key={title} to={to}>
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-ink/50">{caption}</p>
                </Link>
              ))}
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">运营开关</h2>
                  <p className="mt-1 text-xs text-ink/50">高频设置可以在手机端直接切换。</p>
                </div>
                <Badge tone={merchantSettings.storeOnline ? "green" : "neutral"}>{merchantSettings.storeOnline ? "营业中" : "已暂停"}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  ["storeOnline", "店铺上线", "控制门店是否接受新预约"],
                  ["autoConfirm", "自动确认订单", "低风险预约自动进入待服务"],
                  ["instantBooking", "即时预约", "允许用户预约最近可用时段"],
                  ["reviewReminder", "评价提醒", "服务完成后自动提醒用户评价"]
                ].map(([key, title, caption]) => {
                  const settingKey = key as MerchantSettingKey;

                  return (
                    <button
                      className="flex w-full items-center justify-between gap-3 rounded-lg bg-paper px-3 py-3 text-left"
                      key={key}
                      onClick={() => toggleMerchantSetting(settingKey)}
                      type="button"
                    >
                      <span>
                        <strong className="block text-sm">{title}</strong>
                        <span className="mt-1 block text-xs text-ink/50">{caption}</span>
                      </span>
                      <Badge tone={merchantSettings[settingKey] ? "green" : "neutral"}>
                        {merchantSettings[settingKey] ? "开启" : "已关闭"}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <h2 className="font-black">安全与资料</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ["修改营业时间", "已打开营业时间编辑"],
                  ["上传资质", "已打开资质上传"],
                  ["绑定收款账户", "已打开结算账户绑定"],
                  ["添加管理员", "已打开成员邀请"]
                ].map(([label, log]) => (
                  <Button key={label} size="sm" variant="secondary" onClick={() => setContactLog(log)}>
                    {label}
                  </Button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
              <h2 className="font-black">账号与权限</h2>
              <div className="mt-3 space-y-3">
                {[
                  ["当前角色", "店长 / 商家管理员"],
                  ["可管理门店", "4 家"],
                  ["可联系人员", `${technicians.length} 人`],
                  ["客服工单", "2 个处理中"]
                ].map(([label, value]) => (
                  <div className="flex items-center justify-between rounded-lg bg-paper px-3 py-3" key={label}>
                    <span className="text-sm text-ink/55">{label}</span>
                    <strong className="text-sm">{value}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => contact("平台客服", "chat")}>联系平台</Button>
                <Button to="/admin">进入 PC 后台</Button>
              </div>
            </section>
          </>
        )}

        {selectedContact && (
          <div className="fixed inset-0 z-50 bg-black/45 px-4 py-8">
            <section className="mx-auto mt-20 w-full max-w-[440px] rounded-lg bg-white p-4 text-ink shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-moss">{selectedContact.type === "staff" ? "员工信息卡" : "顾客信息卡"}</p>
                  <h2 className="mt-1 truncate text-xl font-black">
                    {selectedContactStaff?.name ?? selectedContactCustomer?.name}
                  </h2>
                  <p className="mt-1 text-xs text-ink/50">
                    {selectedContactStaff
                      ? `${staffStatuses[selectedContactStaff.id]} · ★ ${selectedContactStaff.rating} · ${selectedContactStaff.skills.join(" / ")}`
                      : `${selectedContactCustomer?.memberLevel} · ${selectedContactCustomer?.orderCount} 单 · 活跃分 ${selectedContactCustomer?.activeScore}`}
                  </p>
                </div>
                <button className="rounded-full bg-paper px-3 py-2 text-xs font-black" onClick={() => setSelectedContact(null)} type="button">
                  关闭
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  to={selectedContactStaff
                    ? `/merchant/messages?chat=${getMerchantTechnicianConversationId(selectedContactStaff.id)}`
                    : `/merchant/messages?chat=${getMerchantCustomerConversationId(selectedContactCustomer?.id ?? customers[0].id)}`}
                >
                  聊天
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    contact(selectedContactStaff?.name ?? selectedContactCustomer?.name ?? "联系人", "phone");
                    setSelectedContact(null);
                  }}
                >
                  电话
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  to={selectedContactStaff ? "/merchant/schedule" : `/merchant/messages?chat=${getMerchantCustomerConversationId(selectedContactCustomer?.id ?? customers[0].id)}`}
                >
                  {selectedContactStaff ? "排班详细" : "预约详细"}
                </Button>
                <Button size="sm" variant="secondary" to="/merchant/moments">
                  查看动态
                </Button>
              </div>

              <div className="mt-4 rounded-lg bg-paper p-3 text-xs leading-5 text-ink/55">
                {selectedContactStaff
                  ? `排班提醒：今日还有 ${Math.max(1, technicians.findIndex((tech) => tech.id === selectedContactStaff.id) + 2)} 个可调整时段，建议优先检查冲突。`
                  : `预约提醒：最近订单 ${selectedCustomerOrder.itemName}，时间 ${selectedCustomerOrder.bookedAt}。`}
              </div>
            </section>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-paper text-ink">
            <div className="mx-auto flex h-full w-full max-w-[480px] flex-col bg-paper shadow-soft">
              <header className="grid h-14 grid-cols-[64px,1fr,64px] items-center border-b border-line bg-white px-2">
                <button className="rounded-full bg-paper px-3 py-2 text-xs font-black" onClick={() => setSelectedOrder(null)} type="button">
                  关闭
                </button>
                <h2 className="truncate text-center font-black">预约订单详情</h2>
                <button className="rounded-full bg-paper px-3 py-2 text-xs font-black" onClick={() => setDispatchOrder(selectedOrder)} type="button">
                  派单
                </button>
              </header>
              <main className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
                <section className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
                  <div className="p-4">
                    <Badge tone="yellow">{selectedOrder.status}</Badge>
                    <h1 className="mt-3 text-2xl font-black">{selectedOrder.itemName}</h1>
                    <p className="mt-2 text-sm text-white/70">{selectedOrder.bookedAt} · {selectedOrder.area}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ["金额", yen(selectedOrder.amount)],
                        ["支付", selectedOrder.paymentStatus],
                        ["来源", selectedOrder.source]
                      ].map(([label, value]) => (
                        <div className="rounded-lg bg-white/10 p-3" key={label}>
                          <p className="text-[11px] text-white/55">{label}</p>
                          <strong className="mt-1 block text-sm">{value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <button
                  className="w-full rounded-lg bg-white p-4 text-left shadow-panel"
                  onClick={() => {
                    setSelectedContact({ type: "customer", id: selectedOrder.customerId });
                    setSelectedOrder(null);
                  }}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-lemon text-lg font-black text-black">{selectedOrder.customerName.slice(0, 1)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-moss">用户信息卡</p>
                      <h3 className="truncate text-lg font-black">{selectedOrder.customerName}</h3>
                      <p className="mt-1 text-xs text-ink/50">
                        {(customers.find((customer) => customer.id === selectedOrder.customerId)?.memberLevel ?? "Gold")} · {(customers.find((customer) => customer.id === selectedOrder.customerId)?.orderCount ?? 12)} 单
                      </p>
                    </div>
                    <span className="text-lg font-black text-ink/35">›</span>
                  </div>
                </button>

                <section className="rounded-lg bg-white p-4 shadow-panel">
                  <h3 className="font-black">预约情报</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    {[
                      ["订单编号", selectedOrder.orderNo],
                      ["服务方式", selectedOrder.mode === "home" ? "上门服务" : "到店预约"],
                      ["门店/技师", selectedOrder.storeName ?? selectedOrder.technicianName ?? store.name],
                      ["备注", selectedOrder.remark ?? "无特别备注"],
                      ["操作建议", "点击派单选择旗下技师，或进入 IM 与客人确认细节。"]
                    ].map(([label, value]) => (
                      <div className="grid grid-cols-[86px,1fr] gap-3 rounded-lg bg-paper px-3 py-3" key={label}>
                        <span className="font-black text-ink/45">{label}</span>
                        <strong className="min-w-0 text-ink">{value}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </main>
              <footer className="grid grid-cols-2 gap-2 border-t border-line bg-white p-3">
                <Button variant="secondary" to={`/merchant/messages?chat=${getMerchantCustomerConversationId(selectedOrder.customerId)}`}>联系客人</Button>
                <Button onClick={() => setDispatchOrder(selectedOrder)}>派单给技师</Button>
              </footer>
            </div>
          </div>
        )}

        {dispatchOrder && (
          <div className="fixed inset-0 z-[60] bg-paper text-ink">
            <div className="mx-auto flex h-full w-full max-w-[480px] flex-col bg-paper shadow-soft">
              <header className="grid h-14 grid-cols-[64px,1fr,64px] items-center border-b border-line bg-white px-2">
                <button className="rounded-full bg-paper px-3 py-2 text-xs font-black" onClick={() => setDispatchOrder(null)} type="button">
                  关闭
                </button>
                <h2 className="truncate text-center font-black">选择派单技师</h2>
                <span />
              </header>
              <main className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                <section className="rounded-lg bg-white p-4 shadow-panel">
                  <p className="text-xs font-bold text-moss">待分配订单</p>
                  <h3 className="mt-1 text-lg font-black">{dispatchOrder.itemName}</h3>
                  <p className="mt-1 text-xs text-ink/50">{dispatchOrder.bookedAt} · {dispatchOrder.area} · {yen(dispatchOrder.amount)}</p>
                </section>
                {technicians.map((tech, index) => {
                  const available = staffStatuses[tech.id] !== "休息" && staffStatuses[tech.id] !== "服务中";

                  return (
                    <button
                      className="flex w-full gap-3 rounded-lg bg-white p-3 text-left shadow-panel"
                      disabled={!available}
                      key={tech.id}
                      onClick={() => assignOrderToTechnician(dispatchOrder, tech.name)}
                      type="button"
                    >
                      <img alt={tech.name} className="h-16 w-16 rounded-lg object-cover" src={tech.avatar} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <strong className="truncate">{tech.name}</strong>
                          <Badge tone={available ? "green" : "neutral"}>{available ? "可指派" : staffStatuses[tech.id]}</Badge>
                        </span>
                        <span className="mt-1 block text-xs text-ink/50">★ {tech.rating} · 接单率 {tech.acceptRate}% · 距离约 {8 + index * 4} 分钟</span>
                        <span className="mt-2 block text-xs font-bold text-moss">{tech.skills.join(" / ")}</span>
                      </span>
                    </button>
                  );
                })}
              </main>
            </div>
          </div>
        )}

        <section className="rounded-lg border border-line bg-white p-3 shadow-panel">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold">联系状态</span>
            <span className="text-right text-xs text-ink/55">{contactLog}</span>
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
