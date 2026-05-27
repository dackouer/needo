import { Link } from "react-router-dom";
import { useState } from "react";
import { MobileShell } from "../../components/mobile/MobileShell";
import { merchantNavItems, technicianNavItems, userNavItems } from "../../components/mobile/navItems";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { customers, imageBank, orders, stores, technicians } from "../../data/mock";
import { yen } from "../../lib/utils";
import type { MessageCenterContext } from "../../components/mobile/MobileMessageCenter";

type ExchangePost = {
  id: string;
  type: "demand" | "reverse";
  author: string;
  role: string;
  title: string;
  time: string;
  area: string;
  budget: number;
  detail: string;
  tags: string[];
  offers: number;
  image: string;
};

type DemandDetail = {
  paymentLabel: string;
  paymentStatus: string;
  prepaidAmount: number;
  cashAmount: number;
  customer: {
    name: string;
    avatar: string;
    memberLevel: string;
    rating: number;
    reviewCount: number;
    completedOrders: number;
    noShowRate: string;
    languages: string;
    tags: string[];
    note: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    service: string;
    content: string;
    date: string;
  }>;
  moments: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
  }>;
};

type ForwardContact = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  conversationId: string;
};

const contextCopy: Record<MessageCenterContext, { title: string; subtitle: string; primaryTab: "demand" | "reverse"; author: string; role: string }> = {
  user: {
    title: "NeeDo",
    subtitle: "发布今晚、明天或指定地点的需求，等待个人、技师或店铺抢单。",
    primaryTab: "demand",
    author: "林 小雨",
    role: "客户"
  },
  merchant: {
    title: "NeeDo",
    subtitle: "发布店铺空档、折扣席位和可立即承接的反需求。",
    primaryTab: "reverse",
    author: stores[0].name,
    role: "店铺"
  },
  technician: {
    title: "NeeDo",
    subtitle: "发布个人空闲时段、可移动区域和临时折扣，让客户主动预约。",
    primaryTab: "reverse",
    author: technicians[0].name,
    role: "个人技师"
  }
};

const seedPosts: ExchangePost[] = [
  {
    id: "demand-1",
    type: "demand",
    author: "匿名客人 A",
    role: "需求",
    title: "今晚六本木王子酒店需要 2 位技师",
    time: "22:00 - 24:00",
    area: "六本木 · 王子酒店",
    budget: 42000,
    detail: "需要肩颈和腿部放松，偏好会中文或英文，身高 160cm 以上，外形清爽，酒店前台可登记。",
    tags: ["2 位技师", "酒店", "中文 OK", "预算明确"],
    offers: 12,
    image: imageBank.massage
  },
  {
    id: "reverse-1",
    type: "reverse",
    author: technicians[0].name,
    role: "个人反需求",
    title: "今晚新宿到六本木可移动，临时 8 折",
    time: "22:00 - 01:00",
    area: "新宿 / 六本木 / 涩谷",
    budget: 12800,
    detail: "肩颈调理、睡眠放松可接，女性技师，可中文沟通，平台内通话确认后出发。",
    tags: ["8 折", "女性可选", "可移动", "中文"],
    offers: 38,
    image: technicians[0].avatar
  },
  {
    id: "demand-2",
    type: "demand",
    author: "Mia Chen",
    role: "需求",
    title: "明天银座门店护理，希望有双人房",
    time: "明天 19:30",
    area: "银座",
    budget: 36000,
    detail: "两人到店，想要 90 分钟肩颈和睡眠护理，希望环境安静，可以英文沟通。",
    tags: ["到店", "双人", "英文", "安静环境"],
    offers: 7,
    image: imageBank.salon
  },
  {
    id: "reverse-2",
    type: "reverse",
    author: stores[0].name,
    role: "店铺反需求",
    title: "20:30 后还有 3 个空档，会员 8 折",
    time: "20:30 - 23:00",
    area: "银座",
    budget: 9800,
    detail: "肩颈、足部、睡眠护理都可以约，支持双人房，店内有中文员工。",
    tags: ["店铺空档", "8 折", "双人房", "中文员工"],
    offers: 26,
    image: stores[0].cover
  }
];

const extraPosts = Array.from({ length: 24 }, (_, index): ExchangePost => {
  const demand = index % 2 === 0;
  const area = ["新宿", "涩谷", "银座", "池袋", "品川", "六本木"][index % 6];

  return {
    id: `operated-${index + 1}`,
    type: demand ? "demand" : "reverse",
    author: demand ? `客人 ${String.fromCharCode(65 + (index % 8))}` : index % 3 === 0 ? stores[index % stores.length].name : technicians[index % technicians.length].name,
    role: demand ? "需求" : index % 3 === 0 ? "店铺反需求" : "个人反需求",
    title: demand ? `${area} 临时预约 ${index % 3 === 0 ? "双人按摩" : "深度保洁"}` : `${area} 今晚有空档，可随时预约`,
    time: `${18 + (index % 5)}:00 - ${20 + (index % 4)}:30`,
    area,
    budget: demand ? 18000 + index * 900 : 7800 + index * 350,
    detail: demand
      ? "希望响应快、评价高，能提前确认交通和到达时间。接受平台担保和加急费用。"
      : "当前有空闲时段，可接近距离订单，支持平台内通话确认后快速锁定。",
    tags: demand ? ["急单", "评价优先", "平台担保"] : ["空闲", "限时价", "可沟通"],
    offers: 3 + (index % 18),
    image: demand ? imageBank.home : index % 3 === 0 ? stores[index % stores.length].cover : technicians[index % technicians.length].avatar
  };
});

const customerAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80"
];

const reviewTemplates = [
  {
    service: "上门按摩",
    content: "预约前沟通很清楚，地址和时间确认及时，服务完成后付款也很顺利。",
    date: "2026-04-09"
  },
  {
    service: "家庭保洁",
    content: "客人提前整理了动线，现场配合度高，特殊要求写得很具体。",
    date: "2026-04-02"
  },
  {
    service: "到店护理",
    content: "按时到店，备注里的语言偏好和房型要求都提前说明了。",
    date: "2026-03-26"
  }
];

const momentTemplates = [
  {
    title: "最近收藏了夜间护理",
    content: "晚上 22 点后更方便预约，希望能提前确认交通和担当者。",
    date: "4 月 11 日"
  },
  {
    title: "服务偏好更新",
    content: "偏好中文或英文沟通，酒店上门需要先确认前台登记方式。",
    date: "4 月 7 日"
  },
  {
    title: "给服务人员的提醒",
    content: "到达前 10 分钟用平台内通话联系即可，不方便接私人电话。",
    date: "3 月 29 日"
  }
];

function getPostSeed(post: ExchangePost) {
  return Array.from(post.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getDemandDetail(post: ExchangePost): DemandDetail {
  const seed = getPostSeed(post);
  const prepaid = seed % 3 !== 0;
  const fullyPrepaid = prepaid && seed % 2 === 0;
  const prepaidAmount = prepaid ? (fullyPrepaid ? post.budget : Math.round(post.budget * 0.3)) : 0;
  const cashAmount = Math.max(0, post.budget - prepaidAmount);
  const rating = 4.6 + ((seed % 4) * 0.1);
  const customerName = post.author.startsWith("匿名") ? "已实名客人（昵称隐藏）" : post.author;

  return {
    paymentLabel: prepaid ? fullyPrepaid ? "已全额预付" : "已预付定金" : "现金支付",
    paymentStatus: prepaid
      ? fullyPrepaid
        ? "平台担保已锁定全款，服务完成后自动结算。"
        : "平台担保已锁定定金，尾款可通过平台或现金确认。"
      : "客人选择到场现金支付，平台会保留订单确认和沟通记录。",
    prepaidAmount,
    cashAmount,
    customer: {
      name: customerName,
      avatar: customerAvatars[seed % customerAvatars.length],
      memberLevel: seed % 2 === 0 ? "Gold 会员" : "Silver 会员",
      rating: Number(rating.toFixed(1)),
      reviewCount: 18 + (seed % 42),
      completedOrders: 24 + (seed % 76),
      noShowRate: `${seed % 3}%`,
      languages: seed % 2 === 0 ? "中文 / 日本語" : "English / 日本語",
      tags: ["平台实名", "沟通及时", seed % 2 === 0 ? "预付偏好" : "现金偏好"],
      note: "该客人历史履约稳定，平台建议接单前确认到达方式、服务人数和酒店登记规则。"
    },
    reviews: reviewTemplates.map((review, index) => ({
      ...review,
      id: `${post.id}-review-${index}`,
      rating: Number((4.7 + ((seed + index) % 3) * 0.1).toFixed(1))
    })),
    moments: momentTemplates.map((moment, index) => ({
      ...moment,
      id: `${post.id}-moment-${index}`
    }))
  };
}

function getNavItems(context: MessageCenterContext) {
  if (context === "merchant") {
    return merchantNavItems;
  }

  if (context === "technician") {
    return technicianNavItems;
  }

  return userNavItems;
}

function getForwardStorageKey(context: MessageCenterContext) {
  return `needo.message.forwarded.v1.${context}`;
}

function getMessagePath(context: MessageCenterContext, conversationId: string) {
  const base = context === "merchant" ? "/merchant/messages" : context === "technician" ? "/technician/messages" : "/messages";

  return `${base}?chat=${encodeURIComponent(conversationId)}`;
}

function getForwardContacts(context: MessageCenterContext): ForwardContact[] {
  if (context === "merchant") {
    return [
      ...customers.slice(0, 6).map((customer, index) => ({
        id: customer.id,
        name: customer.name,
        role: "顾客",
        avatar: index % 2 === 0 ? customerAvatars[0] : customerAvatars[1],
        conversationId: `merchant-customer-${customer.id}`
      })),
      ...technicians.map((technician) => ({
        id: technician.id,
        name: technician.name,
        role: "技师",
        avatar: technician.avatar,
        conversationId: `merchant-tech-${technician.id}`
      }))
    ];
  }

  if (context === "technician") {
    return [
      { id: "customer", name: orders[0].customerName, role: "当前用户", avatar: customerAvatars[0], conversationId: "technician-customer-1" },
      { id: "store", name: stores[0].name, role: "在职门店", avatar: stores[0].cover, conversationId: "technician-store" },
      { id: "personal", name: "固定客户 Nao", role: "个人客户", avatar: customerAvatars[1], conversationId: "technician-personal" },
      { id: "manager", name: "店长 / 排班员", role: "同事", avatar: imageBank.cafe, conversationId: "technician-manager" }
    ];
  }

  return [
    { id: "tech", name: technicians[0].name, role: "担当技师", avatar: technicians[0].avatar, conversationId: "user-tech" },
    { id: "store", name: stores[0].name, role: "预约门店", avatar: stores[0].cover, conversationId: "user-store" },
    { id: "support", name: "NeeDo 客服", role: "平台客服", avatar: imageBank.cafe, conversationId: "user-support" },
    { id: "customer", name: orders[0].customerName, role: "本人订单", avatar: customerAvatars[0], conversationId: "user-customer" }
  ];
}

function storeForwardedExchange(context: MessageCenterContext, post: ExchangePost, contact: ForwardContact) {
  if (typeof window === "undefined") {
    return;
  }

  const key = getForwardStorageKey(context);
  const content = `【NeeDo转发】${post.type === "demand" ? "需求" : "反需求"} · ${post.title}\n时间：${post.time}\n地点：${post.area}\n预算：${yen(post.budget)}\n${post.detail}`;

  try {
    const stored = window.localStorage.getItem(key);
    const current = stored ? JSON.parse(stored) as Array<{ id: string; conversationId: string; content: string; at: string }> : [];
    window.localStorage.setItem(key, JSON.stringify([
      ...current,
      {
        id: `exchange-forward-${post.id}-${Date.now()}`,
        conversationId: contact.conversationId,
        content,
        at: "刚刚"
      }
    ]));
  } catch {
    window.localStorage.setItem(key, JSON.stringify([
      {
        id: `exchange-forward-${post.id}-${Date.now()}`,
        conversationId: contact.conversationId,
        content,
        at: "刚刚"
      }
    ]));
  }
}

export function NeedoExchangePage({ context = "user" }: { context?: MessageCenterContext }) {
  const copy = contextCopy[context];
  const [activeType, setActiveType] = useState<"all" | "demand" | "reverse">(copy.primaryTab);
  const [posts, setPosts] = useState<ExchangePost[]>([...seedPosts, ...extraPosts]);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ExchangePost | null>(null);
  const [sharePost, setSharePost] = useState<ExchangePost | null>(null);
  const [sharedContact, setSharedContact] = useState<ForwardContact | null>(null);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [draft, setDraft] = useState({
    title: context === "user" ? "今晚六本木酒店需要 2 位技师" : "今晚 22 点后有空闲，可 8 折预约",
    time: "22:00 - 24:00",
    area: context === "user" ? "六本木 · 王子酒店" : "新宿 / 六本木",
    budget: context === "user" ? "42000" : "12800",
    detail: context === "user" ? "需要 2 位技师，偏好中文沟通，预算可谈。" : "可移动到附近区域，支持平台内通话确认。"
  });
  const visiblePosts = posts.filter((post) => activeType === "all" || post.type === activeType);
  const composerType: "demand" | "reverse" = context === "user" ? "demand" : "reverse";
  const selectedDemandDetail = selectedPost ? getDemandDetail(selectedPost) : null;
  const forwardContacts = getForwardContacts(context);

  const openDemandDetail = (post: ExchangePost) => {
    setSelectedPost(post);
    setShowCustomerProfile(false);
  };

  const closeDemandDetail = () => {
    setSelectedPost(null);
    setShowCustomerProfile(false);
  };

  const publish = () => {
    if (!draft.title.trim()) {
      return;
    }

    setPosts((current) => [
      {
        id: `exchange-${Date.now()}`,
        type: composerType,
        author: copy.author,
        role: copy.role,
        title: draft.title,
        time: draft.time,
        area: draft.area,
        budget: Number(draft.budget) || 0,
        detail: draft.detail,
        tags: composerType === "demand" ? ["新需求", "等待抢单", "平台担保"] : ["反需求", "空档", "可立即约"],
        offers: 0,
        image: context === "merchant" ? stores[0].cover : context === "technician" ? technicians[0].avatar : imageBank.home
      },
      ...current
    ]);
    setShowComposer(false);
  };

  const forwardExchangePost = (contact: ForwardContact) => {
    if (!sharePost) {
      return;
    }

    storeForwardedExchange(context, sharePost, contact);
    setSharedContact(contact);
  };

  return (
    <MobileShell navItems={getNavItems(context)}>
      <div className="space-y-4 px-4 py-4">
        <header className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
          <div className="relative min-h-[260px]">
            <img alt="NeeDo" className="absolute inset-0 h-full w-full object-cover opacity-42" src={imageBank.home} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
            <div className="relative flex min-h-[260px] flex-col justify-between p-4">
              <div>
                <p className="text-xs font-bold text-mint">Demand Exchange</p>
                <h1 className="mt-1 text-3xl font-black">{copy.title}</h1>
                <p className="mt-2 max-w-[320px] text-sm leading-6 text-white/70">{copy.subtitle}</p>
              </div>
              <Button className="self-end" onClick={() => setShowComposer(true)}>
                {composerType === "demand" ? "发送需求" : "发送反需求"}
              </Button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-3 rounded-lg bg-white p-1 shadow-panel">
          {[
            ["all", "全部"],
            ["demand", "需求"],
            ["reverse", "反需求"]
          ].map(([key, label]) => (
            <button
              className={`rounded-md px-3 py-2 text-xs font-black ${activeType === key ? "bg-moss text-white" : "text-ink/55"}`}
              key={key}
              onClick={() => setActiveType(key as "all" | "demand" | "reverse")}
              type="button"
            >
              {label}
            </button>
          ))}
        </section>

        {showComposer && (
          <section className="fixed inset-y-0 left-1/2 z-50 flex h-[100dvh] w-full max-w-[480px] -translate-x-1/2 flex-col overflow-hidden bg-paper text-ink shadow-soft">
            <header className="flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
              <button className="rounded-full px-2 py-1 text-sm font-black text-ink/60" onClick={() => setShowComposer(false)} type="button">
                取消
              </button>
              <div className="text-center">
                <Badge tone={composerType === "demand" ? "yellow" : "green"}>{composerType === "demand" ? "需求" : "反需求"}</Badge>
                <h2 className="mt-1 text-base font-black">{composerType === "demand" ? "发送需求" : "发送反需求"}</h2>
              </div>
              <Button disabled={!draft.title.trim()} size="sm" onClick={publish}>
                发布
              </Button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <h3 className="font-black">{composerType === "demand" ? "告诉平台你想要什么" : "发布你的可预约空档"}</h3>
                <p className="mt-1 text-xs leading-5 text-ink/50">
                  {composerType === "demand" ? "写清楚时间、地点、人数、预算和偏好，个人、技师或店铺就能抢单。" : "写清楚空闲时段、可移动区域和折扣条件，让客户主动预约。"}
                </p>
              </section>

              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <div className="grid gap-3">
                  {[
                    ["title", "标题"],
                    ["time", "时间"],
                    ["area", "地点"],
                    ["budget", "预算 / 价格"]
                  ].map(([key, label]) => (
                    <label className="block text-xs font-black text-ink/55" key={key}>
                      {label}
                      <input
                        className="mt-1 h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm font-bold outline-none"
                        onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                        value={draft[key as keyof typeof draft]}
                      />
                    </label>
                  ))}
                  <label className="block text-xs font-black text-ink/55">
                    详细要求
                    <textarea
                      className="mt-1 min-h-36 w-full resize-none rounded-lg border border-line bg-paper p-3 text-sm leading-6 outline-none"
                      onChange={(event) => setDraft((current) => ({ ...current, detail: event.target.value }))}
                      value={draft.detail}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <h3 className="font-black">发布前确认</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    ["类型", composerType === "demand" ? "需求" : "反需求"],
                    ["地点", draft.area],
                    ["时间", draft.time],
                    ["预算", yen(Number(draft.budget) || 0)]
                  ].map(([label, value]) => (
                    <div className="rounded-lg bg-paper p-3" key={label}>
                      <p className="text-[11px] font-bold text-ink/45">{label}</p>
                      <strong className="mt-1 block truncate text-sm">{value}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className="border-t border-line bg-white/95 px-4 py-3 backdrop-blur">
              <div className="grid grid-cols-[1fr,130px] gap-2">
                <Button variant="secondary" onClick={() => setShowComposer(false)}>取消</Button>
                <Button disabled={!draft.title.trim()} onClick={publish}>发布到 NeeDo</Button>
              </div>
            </footer>
          </section>
        )}

        <section className="space-y-3">
          {visiblePosts.map((post) => (
            <article className="overflow-hidden rounded-lg border border-line bg-white shadow-panel" key={post.id}>
              <div className="grid grid-cols-[118px,1fr]">
                <img alt={post.author} className="h-full min-h-[172px] object-cover" src={post.image} />
                <div className="min-w-0 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone={post.type === "demand" ? "yellow" : "green"}>{post.type === "demand" ? "需求" : "反需求"}</Badge>
                    <span className="text-xs font-black text-coral">{yen(post.budget)}</span>
                  </div>
                  <h2 className="mt-2 line-clamp-2 font-black">{post.title}</h2>
                  <p className="mt-1 text-xs text-ink/45">{post.author} · {post.role}</p>
                  <p className="mt-2 text-xs font-bold text-moss">{post.time} · {post.area}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/55">{post.detail}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <span className="rounded-md bg-paper px-2 py-1 text-[10px] font-bold text-ink/50" key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Button size="sm" variant="secondary">{post.offers} 个响应</Button>
                    <Button size="sm" variant="secondary" onClick={() => {
                      setSharePost(post);
                      setSharedContact(null);
                    }}>
                      转发
                    </Button>
                    <Button size="sm" onClick={() => post.type === "demand" ? openDemandDetail(post) : setShowComposer(true)}>
                      {post.type === "demand" ? "我要抢单" : "立即预约"}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {selectedPost && selectedDemandDetail && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-paper text-ink">
            {!showCustomerProfile ? (
              <div className="mx-auto min-h-screen w-full max-w-[480px] pb-24">
                <section className="relative min-h-[300px] overflow-hidden bg-ink text-white">
                  <img alt={selectedPost.title} className="absolute inset-0 h-full w-full object-cover opacity-50" src={selectedPost.image} />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-ink" />
                  <div className="relative flex min-h-[300px] flex-col justify-between p-4">
                    <div className="flex items-center justify-between gap-3">
                      <button className="rounded-full bg-white/15 px-3 py-2 text-xs font-black backdrop-blur" onClick={closeDemandDetail} type="button">
                        关闭
                      </button>
                      <Badge tone="yellow">需求详情</Badge>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-mint">{selectedPost.time} · {selectedPost.area}</p>
                      <h1 className="mt-2 text-2xl font-black leading-tight">{selectedPost.title}</h1>
                      <p className="mt-3 text-sm leading-6 text-white/72">{selectedPost.detail}</p>
                    </div>
                  </div>
                </section>

                <div className="space-y-4 px-4 py-4">
                  <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-black">支付信息</h2>
                        <p className="mt-1 text-xs leading-5 text-ink/50">{selectedDemandDetail.paymentStatus}</p>
                      </div>
                      <Badge tone={selectedDemandDetail.prepaidAmount > 0 ? "green" : "yellow"}>{selectedDemandDetail.paymentLabel}</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        ["预算", yen(selectedPost.budget)],
                        ["已预付", yen(selectedDemandDetail.prepaidAmount)],
                        ["到场支付", yen(selectedDemandDetail.cashAmount)]
                      ].map(([label, value]) => (
                        <div className="rounded-lg bg-paper p-3" key={label}>
                          <p className="text-[11px] font-bold text-ink/45">{label}</p>
                          <strong className="mt-1 block text-sm">{value}</strong>
                        </div>
                      ))}
                    </div>
                  </section>

                  <button
                    className="w-full rounded-lg border border-line bg-white p-4 text-left shadow-panel"
                    onClick={() => setShowCustomerProfile(true)}
                    type="button"
                  >
                    <div className="flex gap-3">
                      <img alt={selectedDemandDetail.customer.name} className="h-16 w-16 rounded-lg object-cover" src={selectedDemandDetail.customer.avatar} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-moss">客人信息卡</p>
                            <h2 className="mt-1 truncate text-lg font-black">{selectedDemandDetail.customer.name}</h2>
                            <p className="mt-1 text-xs text-ink/50">
                              ★ {selectedDemandDetail.customer.rating} · {selectedDemandDetail.customer.reviewCount} 条评价
                            </p>
                          </div>
                          <Badge tone="green">{selectedDemandDetail.customer.memberLevel}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedDemandDetail.customer.tags.map((tag) => (
                            <span className="rounded-md bg-paper px-2 py-1 text-[10px] font-bold text-ink/50" key={tag}>{tag}</span>
                          ))}
                        </div>
                        <p className="mt-2 text-xs font-bold text-moss">点击查看详细资料和动态</p>
                      </div>
                    </div>
                  </button>

                  <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-black">服务要求</h2>
                      <Badge tone="yellow">{selectedPost.offers} 个响应</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag) => (
                        <span className="rounded-lg bg-paper px-3 py-2 text-xs font-bold text-ink/60" key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-paper p-3 text-xs leading-5 text-ink/55">
                      <strong className="text-ink">安全提示：</strong>
                      抢单前请确认人数、到达方式、酒店登记、现金尾款和特殊要求。平台内沟通会自动归档到订单。
                    </div>
                  </section>

                  <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-black">客人评价</h2>
                      <Badge tone="green">可信记录</Badge>
                    </div>
                    <div className="mt-3 space-y-3">
                      {selectedDemandDetail.reviews.map((review) => (
                        <article className="rounded-lg bg-paper p-3" key={review.id}>
                          <div className="flex items-center justify-between gap-3">
                            <strong className="text-sm">★ {review.rating} · {review.service}</strong>
                            <span className="text-xs text-ink/45">{review.date}</span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-ink/60">{review.content}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-ink/45">预计收入</p>
                      <strong className="text-xl text-coral">{yen(selectedPost.budget)}</strong>
                    </div>
                    <Button className="min-w-[150px]" onClick={closeDemandDetail}>
                      提交抢单
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto min-h-screen w-full max-w-[480px] pb-8">
                <section className="bg-ink p-4 text-white">
                  <button className="rounded-full bg-white/15 px-3 py-2 text-xs font-black" onClick={() => setShowCustomerProfile(false)} type="button">
                    返回需求
                  </button>
                  <div className="mt-5 flex gap-3">
                    <img alt={selectedDemandDetail.customer.name} className="h-20 w-20 rounded-lg object-cover" src={selectedDemandDetail.customer.avatar} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-mint">Customer Profile</p>
                      <h1 className="mt-1 truncate text-2xl font-black">{selectedDemandDetail.customer.name}</h1>
                      <p className="mt-1 text-xs text-white/65">
                        {selectedDemandDetail.customer.memberLevel} · ★ {selectedDemandDetail.customer.rating} · {selectedDemandDetail.customer.completedOrders} 单完成
                      </p>
                    </div>
                  </div>
                </section>

                <div className="space-y-4 px-4 py-4">
                  <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                    <h2 className="font-black">详细资料</h2>
                    <div className="mt-3 space-y-2 text-sm">
                      {[
                        ["历史完成", `${selectedDemandDetail.customer.completedOrders} 单`],
                        ["爽约率", selectedDemandDetail.customer.noShowRate],
                        ["语言偏好", selectedDemandDetail.customer.languages],
                        ["评价数量", `${selectedDemandDetail.customer.reviewCount} 条`]
                      ].map(([label, value]) => (
                        <div className="flex items-center justify-between rounded-lg bg-paper px-3 py-3" key={label}>
                          <span className="text-ink/55">{label}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 rounded-lg bg-paper p-3 text-xs leading-5 text-ink/55">{selectedDemandDetail.customer.note}</p>
                  </section>

                  <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-black">客人动态</h2>
                      <Badge tone="green">可浏览</Badge>
                    </div>
                    <div className="mt-3 space-y-3">
                      {selectedDemandDetail.moments.map((moment) => (
                        <article className="rounded-lg bg-paper p-3" key={moment.id}>
                          <div className="flex items-center justify-between gap-3">
                            <strong className="text-sm">{moment.title}</strong>
                            <span className="text-xs text-ink/45">{moment.date}</span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-ink/60">{moment.content}</p>
                          <div className="mt-2 flex gap-2 text-[11px] font-bold text-moss">
                            <span>点赞 18</span>
                            <span>回复 4</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        )}

        {sharePost && (
          <div className="fixed inset-0 z-[70] bg-paper text-ink">
            <div className="mx-auto flex h-full w-full max-w-[480px] flex-col bg-paper shadow-soft">
              <header className="grid h-14 grid-cols-[64px,1fr,64px] items-center border-b border-line bg-white px-2">
                <button className="rounded-full bg-paper px-3 py-2 text-xs font-black" onClick={() => setSharePost(null)} type="button">
                  关闭
                </button>
                <h2 className="truncate text-center font-black">转发 NeeDo 卡片</h2>
                <span />
              </header>
              <main className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
                <section className="rounded-lg bg-white p-4 shadow-panel">
                  <Badge tone={sharePost.type === "demand" ? "yellow" : "green"}>{sharePost.type === "demand" ? "需求" : "反需求"}</Badge>
                  <h3 className="mt-2 text-lg font-black">{sharePost.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{sharePost.time} · {sharePost.area} · {yen(sharePost.budget)}</p>
                </section>
                <section className="rounded-lg bg-white p-4 shadow-panel">
                  <h3 className="font-black">选择通讯录联系人</h3>
                  <div className="mt-3 space-y-2">
                    {forwardContacts.map((contact) => (
                      <button
                        className="flex w-full items-center gap-3 rounded-lg bg-paper p-3 text-left"
                        key={contact.conversationId}
                        onClick={() => forwardExchangePost(contact)}
                        type="button"
                      >
                        <img alt={contact.name} className="h-12 w-12 rounded-full object-cover" src={contact.avatar} />
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-sm">{contact.name}</strong>
                          <span className="mt-1 block text-xs text-ink/50">{contact.role}</span>
                        </span>
                        <span className="text-lg font-black text-ink/30">›</span>
                      </button>
                    ))}
                  </div>
                </section>
                {sharedContact ? (
                  <section className="rounded-lg bg-lemon p-4 text-black shadow-panel">
                    <h3 className="font-black">已通过信息发送</h3>
                    <p className="mt-2 text-sm leading-6 text-black/70">已发送给 {sharedContact.name}，进入信息页可以查看刚转发的 NeeDo 卡片。</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button variant="secondary" onClick={() => setSharePost(null)}>继续浏览</Button>
                      <Link className="focus-ring inline-flex h-10 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-white" to={getMessagePath(context, sharedContact.conversationId)}>
                        去信息查看
                      </Link>
                    </div>
                  </section>
                ) : null}
              </main>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
