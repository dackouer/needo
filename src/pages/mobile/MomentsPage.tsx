import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MobileShell } from "../../components/mobile/MobileShell";
import { merchantNavItems, technicianNavItems, userNavItems } from "../../components/mobile/navItems";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { customers, imageBank, orders, services, stores, technicians } from "../../data/mock";
import type { MessageCenterContext } from "../../components/mobile/MobileMessageCenter";

type MomentVideo = {
  label: string;
  preview: string;
};

type MomentServiceCard = {
  title: string;
  price: string;
  slot: string;
  caption: string;
  image: string;
};

type MomentPost = {
  id: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  at: string;
  images: string[];
  videos?: MomentVideo[];
  serviceCard?: MomentServiceCard;
  location?: string;
  mentions?: string[];
  visibility?: string;
};

type ComposerAttachment = {
  id: string;
  type: "image" | "video";
  label: string;
  preview: string;
};

type ForwardContact = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  group: string;
  caption: string;
};

type ForwardedMessage = {
  id: string;
  conversationId: string;
  content: string;
  at: string;
};

function MomentActionIcon({ name }: { name: "like" | "reply" | "more" }) {
  if (name === "like") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path d="M7.5 20H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.5M7.5 20V9.2L11.3 3c1.4.2 2.3 1.5 2 2.9L12.8 9H18a3 3 0 0 1 2.9 3.6l-1.1 5.2A3 3 0 0 1 16.9 20H7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "reply") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path d="M5 6.5h14v9.5H9l-4 3V6.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M8.5 10h7M8.5 13h4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M6 12h.01M12 12h.01M18 12h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}

const contextCopy: Record<MessageCenterContext, { title: string; subtitle: string; author: string; role: string; avatar: string }> = {
  user: {
    title: "动态",
    subtitle: "像朋友圈一样记录服务体验、收藏店铺和生活片段。",
    author: "林 小雨",
    role: "NeeDo 用户",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80"
  },
  merchant: {
    title: "门店动态",
    subtitle: "发布店铺公告、空位、员工照片和本周主推项目。",
    author: stores[0].name,
    role: "认证门店",
    avatar: stores[0].cover
  },
  technician: {
    title: "技师动态",
    subtitle: "发布服务记录、可预约时段、现场照片和专业提醒。",
    author: technicians[0].name,
    role: "认证技师",
    avatar: technicians[0].avatar
  }
};

const seedPosts: Record<MessageCenterContext, MomentPost[]> = {
  user: [
    {
      id: "user-moment-1",
      author: "林 小雨",
      role: "Gold Member",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
      content: "今天预约的上门保洁很准时，浴室水垢处理得很干净。下次想试试宠物照护。",
      at: "今天 12:40",
      images: [imageBank.cleaning, imageBank.home]
    },
    {
      id: "user-moment-2",
      author: "Mia Chen",
      role: "Platinum Member",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
      content: "银座门店的护理房很安静，预约前看动态里的照片很有帮助。",
      at: "昨天 20:10",
      images: [imageBank.salon, imageBank.massage]
    }
  ],
  merchant: [
    {
      id: "merchant-moment-1",
      author: stores[0].name,
      role: "认证门店",
      avatar: stores[0].cover,
      content: "本周新增 20:30 后夜间预约席位，肩颈护理和睡眠放松项目可以提前锁定担当者。",
      at: "今天 10:20",
      images: [stores[0].cover, imageBank.massage, imageBank.salon]
    },
    {
      id: "merchant-moment-2",
      author: "NeeDo 平台运营",
      role: "平台公告",
      avatar: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=240&q=80",
      content: "东京地区今日雨天，建议门店提前确认用户到店时间，上门技师注意移动时间。",
      at: "今天 08:30",
      images: [imageBank.cafe]
    }
  ],
  technician: [
    {
      id: "technician-moment-1",
      author: technicians[0].name,
      role: "认证技师",
      avatar: technicians[0].avatar,
      content: "今天完成 4 单，肩颈放松的用户比较多。上门前请准备一条干净毛巾，体验会更好。",
      at: "今天 16:15",
      images: [technicians[0].avatar, imageBank.massage]
    },
    {
      id: "technician-moment-2",
      author: technicians[2].name,
      role: "美业技师",
      avatar: technicians[2].avatar,
      content: "春季美甲颜色推荐低饱和粉绿和透明感裸色，适合通勤和婚礼前护理。",
      at: "昨天 18:00",
      images: [imageBank.nail, technicians[2].avatar]
    }
  ]
};

const operatedTopics = [
  "深夜预约响应很快，平台内通话确认后 18 分钟完成派单。",
  "今天新增一组服务前后照片，客户允许展示局部对比，效果很直观。",
  "雨天订单比较多，店铺提前准备了毛巾和换鞋区域，体验稳定很多。",
  "宠物家庭服务流程更新，进门前会二次确认猫狗位置和清洁工具。",
  "本周回头客比例很高，银座和新宿的夜间时段最容易约满。",
  "客户备注越清楚，技师准备越准确，预算、人数、酒店名都建议提前写。",
  "今天有 6 个订单来自动态页，照片和真实服务记录确实能提高信任。",
  "平台审核了新一批个人技师，语言能力和服务区域都已经更新。",
  "门店空档通过 NeeDo 发布后，20 分钟内被约走 3 个。",
  "上门按摩用户更关注准时、沟通和安全感，服务后照片回传很受欢迎。",
  "保洁订单里厨房和浴室依旧是高频需求，深度清洁复购明显上升。",
  "技师下班后的个人工作需要和主业排班分开记录，收入更清楚。"
];

function buildOperatedMomentPosts(context: MessageCenterContext): MomentPost[] {
  return Array.from({ length: 24 }, (_, index) => {
    const merchant = stores[index % stores.length];
    const technician = technicians[index % technicians.length];
    const imagePool = [imageBank.cleaning, imageBank.massage, imageBank.pet, imageBank.salon, imageBank.home, imageBank.cafe];
    const isMerchant = context === "merchant";
    const isTechnician = context === "technician";

    return {
      id: `${context}-operated-moment-${index + 1}`,
      author: isMerchant ? merchant.name : isTechnician ? technician.name : index % 3 === 0 ? "NeeDo 运营" : `东京用户 ${index + 1}`,
      role: isMerchant ? "认证门店" : isTechnician ? "认证技师" : index % 3 === 0 ? "平台记录" : "真实用户",
      avatar: isMerchant ? merchant.cover : isTechnician ? technician.avatar : index % 3 === 0 ? imageBank.home : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
      content: operatedTopics[index % operatedTopics.length],
      at: index < 6 ? `今天 ${9 + index}:20` : `${Math.max(1, 12 - (index % 12))}天前`,
      images: [
        imagePool[index % imagePool.length],
        imagePool[(index + 2) % imagePool.length],
        imagePool[(index + 4) % imagePool.length]
      ].slice(0, index % 4 === 0 ? 1 : index % 3 === 0 ? 2 : 3)
    };
  });
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
  if (context === "merchant") {
    return `/merchant/messages?chat=${conversationId}`;
  }

  if (context === "technician") {
    return `/technician/messages?chat=${conversationId}`;
  }

  return `/messages?chat=${conversationId}`;
}

function getForwardContacts(context: MessageCenterContext): ForwardContact[] {
  if (context === "merchant") {
    const customerContacts = customers.slice(0, 8).map((customer, index) => ({
      id: `merchant-customer-${customer.id}`,
      name: customer.name,
      role: "预约客户",
      avatar: index % 2 === 0 ? imageBank.cafe : imageBank.home,
      group: "客人组",
      caption: `${customer.memberLevel} · ${customer.orderCount} 单 · ${customer.tags.slice(0, 2).join("、")}`
    }));
    const staffContacts = technicians.map((technician) => ({
      id: `merchant-tech-${technician.id}`,
      name: technician.name,
      role: "门店技师",
      avatar: technician.avatar,
      group: "同事组",
      caption: `${technician.skills.slice(0, 2).join("、")} · 接单率 ${technician.acceptRate}%`
    }));

    return [
      ...customerContacts,
      ...staffContacts,
      {
        id: "merchant-support",
        name: "NeeDo 客服",
        role: "平台客服",
        avatar: imageBank.home,
        group: "平台组",
        caption: "改期、退款、工单升级"
      }
    ];
  }

  if (context === "technician") {
    return [
      {
        id: "technician-customer-1",
        name: orders[0].customerName,
        role: "当前服务用户",
        avatar: imageBank.cafe,
        group: "客人组",
        caption: `${orders[0].itemName} · ${orders[0].bookedAt}`
      },
      {
        id: "technician-personal",
        name: "固定客户 Nao",
        role: "个人工作客户",
        avatar: imageBank.home,
        group: "客人组",
        caption: "下班后个人预约 · 常用联系人"
      },
      {
        id: "technician-store",
        name: stores[0].name,
        role: "在职门店",
        avatar: stores[0].cover,
        group: "店铺组",
        caption: "排班、订单和门店通知"
      },
      {
        id: "technician-manager",
        name: "店长 / 排班员",
        role: "同事",
        avatar: imageBank.salon,
        group: "店铺组",
        caption: "日程调整和现场支持"
      },
      {
        id: "technician-support",
        name: "NeeDo 客服",
        role: "平台客服",
        avatar: imageBank.home,
        group: "平台组",
        caption: "异常订单、客诉和保障"
      }
    ];
  }

  return [
    {
      id: "user-tech",
      name: technicians[0].name,
      role: "担当技师",
      avatar: technicians[0].avatar,
      group: "个人技师",
      caption: `${technicians[0].skills.slice(0, 2).join("、")} · 最近预约`
    },
    {
      id: "user-store",
      name: stores[0].name,
      role: "预约门店",
      avatar: stores[0].cover,
      group: "店铺组",
      caption: `${stores[0].area} · ${stores[0].businessHours}`
    },
    {
      id: "user-customer",
      name: orders[0].customerName,
      role: "本人订单",
      avatar: imageBank.cafe,
      group: "客人组",
      caption: `${orders[0].itemName} · ${orders[0].bookedAt}`
    },
    {
      id: "user-support",
      name: "NeeDo 客服",
      role: "平台客服",
      avatar: imageBank.home,
      group: "服务号",
      caption: "改期、退款、投诉和保障"
    }
  ];
}

function buildForwardContent(post: MomentPost) {
  const mediaCount = post.images.length + (post.videos?.length ?? 0);
  const serviceText = post.serviceCard ? `\n服务卡片：${post.serviceCard.title} · ${post.serviceCard.price}` : "";
  const locationText = post.location ? `\n位置：${post.location}` : "";
  const mediaText = mediaCount > 0 ? `\n附件：${mediaCount} 个图片/视频` : "";

  return `【动态转发】${post.author}：${post.content}${serviceText}${locationText}${mediaText}`;
}

function storeForwardedMessage(context: MessageCenterContext, message: ForwardedMessage) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const key = getForwardStorageKey(context);
    const current = JSON.parse(window.localStorage.getItem(key) ?? "[]") as ForwardedMessage[];
    window.localStorage.setItem(key, JSON.stringify([...current, message]));
  } catch {
    window.localStorage.setItem(getForwardStorageKey(context), JSON.stringify([message]));
  }
}

function getDefaultServiceCard(context: MessageCenterContext): MomentServiceCard {
  const service = services[context === "merchant" ? 3 : context === "technician" ? 1 : 0] ?? services[0];

  return {
    title: service.name,
    price: `¥${service.priceFrom.toLocaleString()} 起`,
    slot: context === "merchant" ? "今晚 20:30 后可约" : context === "technician" ? "今日 22:00 后可约" : "本周可预约",
    caption: context === "user" ? "我收藏的服务卡，方便朋友直接了解价格、时长和可约时间。" : service.summary,
    image: service.cover
  };
}

export function MomentsPage({ context = "user" }: { context?: MessageCenterContext }) {
  const copy = contextCopy[context];
  const [posts, setPosts] = useState<MomentPost[]>(() => [...seedPosts[context], ...buildOperatedMomentPosts(context)]);
  const [draft, setDraft] = useState("");
  const [draftMedia, setDraftMedia] = useState<ComposerAttachment[]>([]);
  const [includeServiceCard, setIncludeServiceCard] = useState(context !== "user");
  const [serviceCardDraft, setServiceCardDraft] = useState<MomentServiceCard>(() => getDefaultServiceCard(context));
  const [draftLocation, setDraftLocation] = useState(context === "merchant" ? "银座 · 店内" : context === "technician" ? "新宿 / 六本木可移动" : "东京 · 新宿区");
  const [draftMention, setDraftMention] = useState("");
  const [draftVisibility, setDraftVisibility] = useState("对某分组可见");
  const [showComposer, setShowComposer] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [replies, setReplies] = useState<Record<string, string[]>>({});
  const [actionPostId, setActionPostId] = useState("");
  const [forwardPostId, setForwardPostId] = useState("");
  const [forwardedContact, setForwardedContact] = useState<ForwardContact | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const pressTimer = useRef<number | null>(null);
  const canPublish = Boolean(draft.trim()) || draftMedia.length > 0 || includeServiceCard;
  const forwardContacts = getForwardContacts(context);
  const forwardPost = posts.find((post) => post.id === forwardPostId);
  const forwardGroups = Array.from(new Set(forwardContacts.map((contact) => contact.group)));

  const clearPressTimer = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const startPressTimer = (postId: string) => {
    clearPressTimer();
    pressTimer.current = window.setTimeout(() => {
      setActionPostId(postId);
      pressTimer.current = null;
    }, 560);
  };

  const closeComposer = () => {
    draftMedia.forEach((attachment) => {
      if (attachment.preview.startsWith("blob:")) {
        window.URL.revokeObjectURL(attachment.preview);
      }
    });
    setDraft("");
    setDraftMedia([]);
    setIncludeServiceCard(context !== "user");
    setServiceCardDraft(getDefaultServiceCard(context));
    setDraftLocation(context === "merchant" ? "银座 · 店内" : context === "technician" ? "新宿 / 六本木可移动" : "东京 · 新宿区");
    setDraftMention("");
    setDraftVisibility("对某分组可见");
    setShowComposer(false);
  };

  const addComposerMedia = (type: ComposerAttachment["type"], file?: File) => {
    setDraftMedia((current) => {
      if (current.length >= 6) {
        return current;
      }

      const fallbackImages = [imageBank.cleaning, imageBank.massage, imageBank.pet, imageBank.salon, imageBank.home, imageBank.cafe];
      const typeIndex = current.filter((item) => item.type === type).length + 1;
      const preview = file ? window.URL.createObjectURL(file) : type === "image" ? fallbackImages[current.length % fallbackImages.length] : imageBank.home;

      return [
        ...current,
        {
          id: `${type}-${Date.now()}-${typeIndex}`,
          label: file?.name || (type === "image" ? `图片 ${typeIndex}` : `视频 ${typeIndex}`),
          preview,
          type
        }
      ];
    });
  };

  const removeComposerMedia = (attachmentId: string) => {
    setDraftMedia((current) => {
      const target = current.find((item) => item.id === attachmentId);

      if (target?.preview.startsWith("blob:")) {
        window.URL.revokeObjectURL(target.preview);
      }

      return current.filter((item) => item.id !== attachmentId);
    });
  };

  const publish = () => {
    if (!canPublish) {
      return;
    }

    const imageAttachments = draftMedia.filter((item) => item.type === "image").map((item) => item.preview);
    const videoAttachments = draftMedia
      .filter((item) => item.type === "video")
      .map((item) => ({ label: item.label, preview: item.preview }));

    setPosts((current) => [
      {
        id: `moment-${Date.now()}`,
        author: copy.author,
        role: copy.role,
        avatar: copy.avatar,
        content: draft.trim() || "分享了新的服务动态。",
        at: "刚刚",
        images: imageAttachments,
        videos: videoAttachments,
        serviceCard: includeServiceCard ? serviceCardDraft : undefined,
        location: draftLocation.trim() || undefined,
        mentions: draftMention.trim()
          ? draftMention.split(/[、,\s]+/).map((item) => item.trim()).filter(Boolean).slice(0, 5)
          : undefined,
        visibility: draftVisibility
      },
      ...current
    ]);
    setDraft("");
    setDraftMedia([]);
    setIncludeServiceCard(context !== "user");
    setServiceCardDraft(getDefaultServiceCard(context));
    setDraftLocation(context === "merchant" ? "银座 · 店内" : context === "technician" ? "新宿 / 六本木可移动" : "东京 · 新宿区");
    setDraftMention("");
    setDraftVisibility("对某分组可见");
    setShowComposer(false);
  };

  const sendForward = (contact: ForwardContact) => {
    if (!forwardPost) {
      return;
    }

    storeForwardedMessage(context, {
      id: `forward-${forwardPost.id}-${contact.id}-${Date.now()}`,
      conversationId: contact.id,
      content: buildForwardContent(forwardPost),
      at: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
    });
    setForwardedContact(contact);
  };

  return (
    <MobileShell navItems={getNavItems(context)}>
      <div className="space-y-4 px-4 py-4">
        <header className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
          <div className="relative min-h-64">
            <img alt={copy.author} className="absolute inset-0 h-full w-full object-cover opacity-45" src={copy.avatar} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-transparent" />
            <div className="relative flex min-h-64 flex-col justify-between p-4">
              <Button className="self-end" size="sm" onClick={() => setShowComposer(true)}>
                发动态
              </Button>
              <div className="flex items-end gap-3">
                <img alt={copy.author} className="h-16 w-16 rounded-lg border-2 border-white object-cover" src={copy.avatar} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-mint">{copy.role}</p>
                  <h1 className="mt-1 text-2xl font-black">{copy.title}</h1>
                  <p className="mt-1 text-xs leading-5 text-white/70">{copy.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {showComposer && (
          <section className="fixed inset-y-0 left-1/2 z-50 flex h-[100dvh] w-full max-w-[480px] -translate-x-1/2 flex-col overflow-hidden bg-paper text-ink shadow-soft">
            <header className="flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
              <button className="rounded-full px-2 py-1 text-sm font-black text-ink/60" onClick={closeComposer} type="button">
                取消
              </button>
              <div className="text-center">
                <h2 className="text-base font-black">发布动态</h2>
                <p className="text-[11px] font-bold text-ink/45">文字、图片、视频和服务卡片</p>
              </div>
              <Button disabled={!canPublish} size="sm" onClick={publish}>
                发布
              </Button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <div className="flex items-start gap-3">
                  <img alt={copy.author} className="h-12 w-12 rounded-lg object-cover" src={copy.avatar} />
                  <textarea
                    className="min-h-40 flex-1 resize-none rounded-lg border border-line bg-paper p-3 text-sm leading-6 outline-none"
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="分享今天的服务、照片或提醒"
                    value={draft}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <h3 className="text-sm font-black">发布范围</h3>
                <div className="mt-3 grid gap-3">
                  <label className="block text-xs font-black text-ink/55">
                    添加位置
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm font-bold outline-none"
                      onChange={(event) => setDraftLocation(event.target.value)}
                      placeholder="例如：东京 · 六本木"
                      value={draftLocation}
                    />
                  </label>
                  <label className="block text-xs font-black text-ink/55">
                    @谁
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm font-bold outline-none"
                      onChange={(event) => setDraftMention(event.target.value)}
                      placeholder="输入联系人名，可用空格或顿号分隔"
                      value={draftMention}
                    />
                  </label>
                  <div>
                    <p className="text-xs font-black text-ink/55">对谁可见</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {["仅自己可见", "对某分组可见", "对某人可见", "对某人关联可见"].map((option) => (
                        <button
                          className={draftVisibility === option ? "rounded-lg bg-moss px-3 py-2 text-xs font-black text-white" : "rounded-lg border border-line bg-paper px-3 py-2 text-xs font-black text-ink/60"}
                          key={option}
                          onClick={() => setDraftVisibility(option)}
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black">附加内容</h3>
                    <p className="mt-1 text-xs text-ink/50">最多添加 6 个图片或视频</p>
                  </div>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-black text-ink/55">{draftMedia.length}/6</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    className="rounded-lg border border-line bg-paper px-3 py-3 text-left text-sm font-black text-ink"
                    onClick={() => imageInputRef.current?.click()}
                    type="button"
                  >
                    <span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-full bg-mint/20 text-moss">图</span>
                    添加图片
                  </button>
                  <button
                    className="rounded-lg border border-line bg-paper px-3 py-3 text-left text-sm font-black text-ink"
                    onClick={() => videoInputRef.current?.click()}
                    type="button"
                  >
                    <span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-full bg-lemon/40 text-[#795b00]">播</span>
                    添加视频
                  </button>
                </div>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      addComposerMedia("image", file);
                    }

                    event.target.value = "";
                  }}
                  ref={imageInputRef}
                  type="file"
                />
                <input
                  accept="video/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      addComposerMedia("video", file);
                    }

                    event.target.value = "";
                  }}
                  ref={videoInputRef}
                  type="file"
                />
                {draftMedia.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {draftMedia.map((attachment) => (
                      <div className="group relative overflow-hidden rounded-lg border border-line bg-paper" key={attachment.id}>
                        {attachment.type === "image" ? (
                          <img alt={attachment.label} className="aspect-square w-full object-cover" src={attachment.preview} />
                        ) : (
                          <video className="aspect-square w-full object-cover" muted playsInline src={attachment.preview} />
                        )}
                        <span className="absolute left-1 top-1 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-black text-white">
                          {attachment.type === "image" ? "图片" : "视频"}
                        </span>
                        <button
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/95 text-xs font-black text-ink shadow-soft"
                          onClick={() => removeComposerMedia(attachment.id)}
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black">服务项目信息卡</h3>
                    <p className="mt-1 text-xs text-ink/50">把自己的服务项目挂到动态里，别人能一眼看懂。</p>
                  </div>
                  <button
                    className={includeServiceCard ? "rounded-full bg-moss px-3 py-2 text-xs font-black text-white" : "rounded-full border border-line bg-paper px-3 py-2 text-xs font-black text-ink/60"}
                    onClick={() => setIncludeServiceCard((current) => !current)}
                    type="button"
                  >
                    {includeServiceCard ? "已添加" : "添加"}
                  </button>
                </div>

                {includeServiceCard && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs font-black text-ink/55">
                        服务名称
                        <input
                          className="mt-1 h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm font-bold outline-none"
                          onChange={(event) => setServiceCardDraft((current) => ({ ...current, title: event.target.value }))}
                          value={serviceCardDraft.title}
                        />
                      </label>
                      <label className="text-xs font-black text-ink/55">
                        价格
                        <input
                          className="mt-1 h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm font-bold outline-none"
                          onChange={(event) => setServiceCardDraft((current) => ({ ...current, price: event.target.value }))}
                          value={serviceCardDraft.price}
                        />
                      </label>
                    </div>
                    <label className="block text-xs font-black text-ink/55">
                      可约时间
                      <input
                        className="mt-1 h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm font-bold outline-none"
                        onChange={(event) => setServiceCardDraft((current) => ({ ...current, slot: event.target.value }))}
                        value={serviceCardDraft.slot}
                      />
                    </label>
                    <label className="block text-xs font-black text-ink/55">
                      服务说明
                      <textarea
                        className="mt-1 min-h-20 w-full resize-none rounded-lg border border-line bg-paper px-3 py-2 text-sm leading-6 outline-none"
                        onChange={(event) => setServiceCardDraft((current) => ({ ...current, caption: event.target.value }))}
                        value={serviceCardDraft.caption}
                      />
                    </label>
                    <div className="overflow-hidden rounded-lg border border-line bg-paper">
                      <img alt={serviceCardDraft.title} className="h-28 w-full object-cover" src={serviceCardDraft.image} />
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-black text-moss">服务卡片预览</p>
                            <h4 className="mt-1 font-black">{serviceCardDraft.title || "服务名称"}</h4>
                          </div>
                          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-coral">{serviceCardDraft.price || "价格"}</span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-ink/55">{serviceCardDraft.slot || "可约时间"}</p>
                        <p className="mt-2 text-xs leading-5 text-ink/60">{serviceCardDraft.caption || "服务说明"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <footer className="border-t border-line bg-white/95 px-4 py-3 backdrop-blur">
              <div className="grid grid-cols-[1fr,120px] gap-2">
                <Button variant="secondary" onClick={closeComposer}>取消</Button>
                <Button disabled={!canPublish} onClick={publish}>发布</Button>
              </div>
            </footer>
          </section>
        )}

        <section className="space-y-3">
          {posts.map((post) => (
            <article className="rounded-lg border border-line bg-white p-3 shadow-panel" key={post.id}>
              <div className="flex items-start gap-3">
                <img alt={post.author} className="h-11 w-11 rounded-lg object-cover" src={post.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-black">{post.author}</h2>
                      <p className="mt-1 text-xs text-ink/45">{post.role}</p>
                    </div>
                    <span className="text-[11px] text-ink/40">{post.at}</span>
                  </div>
                  <p
                    className="mt-3 text-sm leading-6 text-ink/70"
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setActionPostId(post.id);
                    }}
                    onMouseDown={() => startPressTimer(post.id)}
                    onMouseLeave={clearPressTimer}
                    onMouseUp={clearPressTimer}
                    onTouchCancel={clearPressTimer}
                    onTouchEnd={clearPressTimer}
                    onTouchStart={() => startPressTimer(post.id)}
                  >
                    {post.content}
                  </p>
                  {(post.location || post.mentions?.length || post.visibility) && (
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-ink/50">
                      {post.location && <span className="rounded-full bg-paper px-2 py-1">位置 {post.location}</span>}
                      {post.mentions?.map((mention) => (
                        <span className="rounded-full bg-paper px-2 py-1" key={`${post.id}-${mention}`}>@{mention}</span>
                      ))}
                      {post.visibility && <span className="rounded-full bg-paper px-2 py-1">可见 {post.visibility}</span>}
                    </div>
                  )}
                  {(post.images.length > 0 || (post.videos?.length ?? 0) > 0) && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {post.images.map((image, index) => (
                        <img alt={post.author} className="aspect-square rounded-lg object-cover" key={`${post.id}-image-${index}`} src={image} />
                      ))}
                      {post.videos?.map((video, index) => (
                        <div className="relative overflow-hidden rounded-lg border border-line bg-ink" key={`${post.id}-video-${index}`}>
                          <video className="aspect-square w-full object-cover opacity-80" muted playsInline src={video.preview} />
                          <div className="absolute inset-0 grid place-items-center">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-sm font-black text-ink">▶</span>
                          </div>
                          <span className="absolute bottom-1 left-1 right-1 truncate rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-black text-white">{video.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {post.serviceCard && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-line bg-paper">
                      <div className="grid grid-cols-[94px,1fr]">
                        <img alt={post.serviceCard.title} className="h-full min-h-28 w-full object-cover" src={post.serviceCard.image} />
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-moss">服务项目信息卡</p>
                              <h3 className="mt-1 line-clamp-2 text-sm font-black">{post.serviceCard.title}</h3>
                            </div>
                            <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-black text-coral">{post.serviceCard.price}</span>
                          </div>
                          <p className="mt-2 text-xs font-bold text-ink/55">{post.serviceCard.slot}</p>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/60">{post.serviceCard.caption}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex justify-between gap-2">
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-full bg-paper px-3 py-2 text-xs font-black text-ink/65"
                        onClick={() => setLikedPostIds((current) => (current.includes(post.id) ? current.filter((id) => id !== post.id) : [...current, post.id]))}
                        type="button"
                      >
                        <MomentActionIcon name="like" />
                        {likedPostIds.includes(post.id) ? "取消赞" : "点赞"}
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-full bg-paper px-3 py-2 text-xs font-black text-ink/65"
                        onClick={() => setReplies((current) => ({ ...current, [post.id]: [...(current[post.id] ?? []), "写得很清楚，已收藏。"] }))}
                        type="button"
                      >
                        <MomentActionIcon name="reply" />
                        回复
                      </button>
                    </div>
                    <button className="inline-flex items-center gap-1 rounded-full bg-paper px-3 py-2 text-xs font-black text-ink/65" onClick={() => setActionPostId(post.id)} type="button">
                      <MomentActionIcon name="more" />
                      更多
                    </button>
                  </div>
                  {(likedPostIds.includes(post.id) || (replies[post.id]?.length ?? 0) > 0) && (
                    <div className="mt-3 rounded-lg bg-paper p-2 text-xs leading-5 text-ink/60">
                      {likedPostIds.includes(post.id) && <p><strong className="text-moss">我</strong> 赞了这条动态</p>}
                      {(replies[post.id] ?? []).map((reply, index) => (
                        <p key={`${post.id}-${index}`}><strong className="text-moss">我：</strong>{reply}</p>
                      ))}
                    </div>
                  )}
                  {actionPostId === post.id && (
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-line bg-paper p-2">
                      <button className="rounded-lg bg-white px-3 py-2 text-xs font-black" onClick={() => setActionPostId("")} type="button">翻译文字</button>
                      <button
                        className="rounded-lg bg-white px-3 py-2 text-xs font-black"
                        onClick={() => {
                          setForwardPostId(post.id);
                          setForwardedContact(null);
                          setActionPostId("");
                        }}
                        type="button"
                      >
                        转发
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <Badge tone="yellow">运营建议</Badge>
          <p className="mt-2 text-sm leading-6 text-ink/60">动态会沉淀真实服务记录，未来可以关联店铺详情、技师主页、预约转化和评价体系。</p>
        </section>
      </div>

      {forwardPost && (
        <section className="fixed inset-y-0 left-1/2 z-[70] flex h-[100dvh] w-full max-w-[480px] -translate-x-1/2 flex-col overflow-hidden bg-paper text-ink shadow-soft">
          <header className="flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
            <button
              className="rounded-full px-2 py-1 text-sm font-black text-ink/60"
              onClick={() => {
                setForwardPostId("");
                setForwardedContact(null);
              }}
              type="button"
            >
              取消
            </button>
            <div className="text-center">
              <h2 className="text-base font-black">转发动态</h2>
              <p className="text-[11px] font-bold text-ink/45">选择通讯录联系人，通过信息发送</p>
            </div>
            <span className="w-10" />
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <section className="rounded-lg border border-line bg-white p-3 shadow-panel">
              <p className="text-xs font-black text-moss">将发送</p>
              <div className="mt-2 flex gap-3 rounded-lg bg-paper p-3">
                <img alt={forwardPost.author} className="h-14 w-14 rounded-lg object-cover" src={forwardPost.avatar} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">{forwardPost.author}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/60">{forwardPost.content}</p>
                </div>
              </div>
            </section>

            {forwardGroups.map((group) => (
              <section className="rounded-lg border border-line bg-white p-3 shadow-panel" key={group}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black">{group}</h3>
                  <Badge tone="neutral">{forwardContacts.filter((contact) => contact.group === group).length} 人</Badge>
                </div>
                <div className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line">
                  {forwardContacts.filter((contact) => contact.group === group).map((contact) => (
                    <button className="flex w-full items-center gap-3 bg-white p-3 text-left transition hover:bg-paper" key={contact.id} onClick={() => sendForward(contact)} type="button">
                      <img alt={contact.name} className="h-12 w-12 rounded-lg object-cover" src={contact.avatar} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="truncate text-sm">{contact.name}</strong>
                          <span className="rounded-md bg-paper px-2 py-1 text-[10px] font-black text-ink/45">{contact.role}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-ink/50">{contact.caption}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {forwardedContact && (
            <footer className="border-t border-line bg-white px-4 py-3">
              <div className="rounded-lg bg-paper p-3">
                <p className="text-sm font-black">已通过信息发送给 {forwardedContact.name}</p>
                <p className="mt-1 text-xs text-ink/50">进入信息页可以看到刚刚转发的动态内容。</p>
                <div className="mt-3 grid grid-cols-[1fr,1fr] gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setForwardPostId("");
                      setForwardedContact(null);
                    }}
                  >
                    继续浏览
                  </Button>
                  <Link
                    className="focus-ring inline-flex h-10 items-center justify-center rounded-full bg-moss px-4 text-sm font-semibold text-white transition"
                    to={getMessagePath(context, forwardedContact.id)}
                  >
                    去信息查看
                  </Link>
                </div>
              </div>
            </footer>
          )}
        </section>
      )}
    </MobileShell>
  );
}
