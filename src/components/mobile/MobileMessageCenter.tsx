import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { imageBank, orders, stores, technicians } from "../../data/mock";
import { cn, yen } from "../../lib/utils";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ContactGroupIcon } from "./ContactGroupIcon";
import type { Order } from "../../types/domain";

export type MessageCenterContext = "user" | "merchant" | "technician";

type ChatMessage = {
  id: string;
  from: "me" | "them" | "system";
  type: "text" | "image" | "call" | "card" | "location";
  content: string;
  at: string;
};

type ForwardedMessage = {
  id: string;
  conversationId: string;
  content: string;
  at: string;
};

type Conversation = {
  id: string;
  name: string;
  role: string;
  kind: "customer" | "technician" | "store" | "staff" | "support";
  phone: string;
  avatar: string;
  order: typeof orders[number];
  unread: number;
  customerId?: string;
};

type ConversationGroup = {
  id: string;
  name: string;
  conversationIds: string[];
  locked?: boolean;
};

type MomentPost = {
  id: string;
  badge: string;
  title: string;
  content: string;
  at: string;
  images: string[];
  stats: Array<[string, string]>;
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

const store = stores[0];
const allGroupId = "all";

const avatars = {
  customer: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  customerAlt: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  colleague: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  support: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=240&q=80",
  store: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=240&q=80"
};

export function getMerchantCustomerConversationId(customerId: string) {
  return `merchant-customer-${customerId}`;
}

export function getMerchantTechnicianConversationId(technicianId: string) {
  return `merchant-tech-${technicianId}`;
}

function sortOrdersByBookedAt(items: Order[], direction: "asc" | "desc" = "desc") {
  return [...items].sort((left, right) => {
    const result = left.bookedAt.localeCompare(right.bookedAt);

    return direction === "asc" ? result : -result;
  });
}

function getNearestOrder(items: Order[]) {
  const baseTime = new Date("2026-04-13T00:00:00").getTime();

  return [...items].sort((left, right) => {
    const leftDistance = Math.abs(new Date(left.bookedAt.replace(" ", "T")).getTime() - baseTime);
    const rightDistance = Math.abs(new Date(right.bookedAt.replace(" ", "T")).getTime() - baseTime);

    return leftDistance - rightDistance;
  })[0];
}

function getConversations(context: MessageCenterContext): Conversation[] {
  const shared: Conversation[] = [
    {
      id: `${context}-support`,
      name: "NeeDo 客服",
      role: "平台客服",
      kind: "support",
      phone: "+81 03-0000-NEED",
      avatar: avatars.support,
      order: orders[2],
      unread: 0
    }
  ];

  if (context === "merchant") {
    const customerConversations = Array.from(
      orders.reduce((map, order) => {
        const current = map.get(order.customerId) ?? [];
        map.set(order.customerId, [...current, order]);

        return map;
      }, new Map<string, Order[]>())
    ).slice(0, 18).map<Conversation>(([customerId, customerOrders], index) => {
      const recentOrder = getNearestOrder(customerOrders) ?? customerOrders[0];

      return {
        id: getMerchantCustomerConversationId(customerId),
        name: recentOrder.customerName,
        role: recentOrder.mode === "store" ? "到店预约客户" : "预约客户",
        kind: "customer",
        phone: index % 2 === 0 ? "+81 80-4412-8821" : "+81 80-1122-7712",
        avatar: index % 2 === 0 ? avatars.customer : avatars.customerAlt,
        order: recentOrder,
        unread: index % 3,
        customerId
      };
    });

    const technicianConversations = technicians.map<Conversation>((technician, index) => ({
      id: getMerchantTechnicianConversationId(technician.id),
      name: technician.name,
      role: "门店技师",
      kind: "technician",
      phone: index % 2 === 0 ? "+81 80-3344-1200" : "+81 80-5521-8830",
      avatar: technician.avatar,
      order: orders[index % orders.length],
      unread: index === 0 ? 2 : 0
    }));

    return [
      ...customerConversations,
      ...technicianConversations,
      {
        id: "merchant-colleague",
        name: "门店排班员",
        role: "同事",
        kind: "staff",
        phone: "+81 80-2211-7700",
        avatar: avatars.colleague,
        order: orders[3],
        unread: 0
      },
      ...shared
    ];
  }

  if (context === "technician") {
    return [
      {
        id: "technician-customer-1",
        name: orders[0].customerName,
        role: "当前服务用户",
        kind: "customer",
        phone: "+81 80-4412-8821",
        avatar: avatars.customer,
        order: orders[0],
        unread: 2
      },
      {
        id: "technician-store",
        name: store.name,
        role: "在职门店",
        kind: "store",
        phone: "+81 03-7788-9910",
        avatar: store.cover,
        order: orders[0],
        unread: 1
      },
      {
        id: "technician-manager",
        name: "店长 / 排班员",
        role: "同事",
        kind: "staff",
        phone: "+81 80-2211-7700",
        avatar: avatars.colleague,
        order: orders[3],
        unread: 0
      },
      {
        id: "technician-personal",
        name: "固定客户 Nao",
        role: "个人工作客户",
        kind: "customer",
        phone: "+81 80-7722-1930",
        avatar: avatars.customerAlt,
        order: orders[0],
        unread: 1
      },
      ...shared
    ];
  }

  return [
    {
      id: "user-customer",
      name: orders[0].customerName,
      role: "本人订单",
      kind: "customer",
      phone: "+81 80-4412-8821",
      avatar: avatars.customer,
      order: orders[0],
      unread: 1
    },
    {
      id: "user-tech",
      name: technicians[0].name,
      role: "担当技师",
      kind: "technician",
      phone: "+81 80-3344-1200",
      avatar: technicians[0].avatar,
      order: orders[0],
      unread: 2
    },
    {
      id: "user-store",
      name: "GINZA Calm Body Lab",
      role: "预约门店",
      kind: "store",
      phone: "+81 03-7788-9910",
      avatar: avatars.store,
      order: orders[1],
      unread: 0
    },
    {
      id: "user-colleague",
      name: "门店排班员",
      role: "同事",
      kind: "staff",
      phone: "+81 80-2211-7700",
      avatar: avatars.colleague,
      order: orders[3],
      unread: 0
    },
    ...shared
  ];
}

function getDefaultGroups(context: MessageCenterContext, conversations: Conversation[]): ConversationGroup[] {
  const ids = conversations.map((conversation) => conversation.id);
  const findIds = (pattern: string) => conversations.filter((conversation) => conversation.id.includes(pattern)).map((conversation) => conversation.id);

  if (context === "merchant") {
    return [
      { id: allGroupId, name: "全部", conversationIds: ids, locked: true },
      { id: "customers", name: "客人组", conversationIds: findIds("customer") },
      { id: "staff", name: "同事组", conversationIds: findIds("tech").concat(findIds("colleague")) },
      { id: "platform", name: "平台组", conversationIds: findIds("support") },
      { id: "blacklist", name: "黑名单", conversationIds: [] }
    ];
  }

  if (context === "technician") {
    return [
      { id: allGroupId, name: "全部", conversationIds: ids, locked: true },
      { id: "customers", name: "客人组", conversationIds: findIds("customer").concat(findIds("personal")) },
      { id: "stores", name: "店铺组", conversationIds: findIds("store").concat(findIds("manager")) },
      { id: "platform", name: "平台组", conversationIds: findIds("support") },
      { id: "blacklist", name: "黑名单", conversationIds: [] }
    ];
  }

  return [
    { id: allGroupId, name: "全部", conversationIds: ids, locked: true },
    { id: "stores", name: "店铺组", conversationIds: findIds("store") },
    { id: "customers", name: "客人组", conversationIds: findIds("customer") },
    { id: "coworkers", name: "同事组", conversationIds: findIds("tech").concat(findIds("colleague")) },
    { id: "blacklist", name: "黑名单", conversationIds: [] }
  ];
}

function getStorageKey(context: MessageCenterContext) {
  return `needo.message.groups.v3.${context}`;
}

function getForwardStorageKey(context: MessageCenterContext) {
  return `needo.message.forwarded.v1.${context}`;
}

function getStoredForwardedMessages(context: MessageCenterContext) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(getForwardStorageKey(context));
    const parsed = stored ? JSON.parse(stored) as ForwardedMessage[] : [];

    return Array.isArray(parsed) ? parsed.filter((item) => item.id && item.conversationId && item.content) : [];
  } catch {
    return [];
  }
}

function getStoredGroups(context: MessageCenterContext, conversations: Conversation[]) {
  const defaults = getDefaultGroups(context, conversations);

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const stored = window.localStorage.getItem(getStorageKey(context));

    if (!stored) {
      return defaults;
    }

    const parsed = JSON.parse(stored) as ConversationGroup[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaults;
    }

    const validIds = new Set(conversations.map((conversation) => conversation.id));
    const cleaned = parsed
      .filter((group) => group.id && group.name)
      .map((group) => ({
        ...group,
        conversationIds: group.id === allGroupId
          ? conversations.map((conversation) => conversation.id)
          : (group.conversationIds ?? []).filter((id) => validIds.has(id)),
        locked: group.id === allGroupId
      }));

    return cleaned.some((group) => group.id === allGroupId) ? cleaned : [defaults[0], ...cleaned];
  } catch {
    return defaults;
  }
}

function getInitialMessages(context: MessageCenterContext, conversations: Conversation[]) {
  return Object.fromEntries(
    conversations.map((conversation, index) => [
      conversation.id,
      [
        {
          id: `${conversation.id}-hello`,
          from: "them",
          type: "text",
          content: index % 2 === 0 ? "您好，这边已同步订单信息，有变化我会马上联系您。" : "刚刚看到了预约信息，我会按时处理。",
          at: index % 2 === 0 ? "09:20" : "14:05"
        },
        {
          id: `${conversation.id}-system`,
          from: "system",
          type: "card",
          content: `${conversation.order.orderNo} · ${conversation.order.itemName}`,
          at: "09:21"
        }
      ] satisfies ChatMessage[]
    ])
  );
}

function getContextCopy(context: MessageCenterContext) {
  if (context === "merchant") {
    return {
      eyebrow: "Merchant IM",
      title: "信息",
      subtitle: "客户、员工、平台消息统一处理，像微信一样先看会话，再进入聊天。",
      empty: "当前分组没有会话，可以在管理里把联系人加入分组。"
    };
  }

  if (context === "technician") {
    return {
      eyebrow: "Technician IM",
      title: "信息",
      subtitle: "用户、门店、平台消息统一处理，服务中可以快速发图片、电话和订单卡片。",
      empty: "当前分组没有会话，可以在管理里把联系人加入分组。"
    };
  }

  return {
    eyebrow: "NeeDo IM",
    title: "信息",
    subtitle: "按店铺、客人、同事或黑名单整理沟通对象。",
    empty: "当前分组没有会话，可以在管理里把联系人加入分组。"
  };
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

function canDisplayPhone(conversation: Conversation) {
  return conversation.kind === "store";
}

function getMomentPosts(conversation: Conversation, appointment: Order): MomentPost[] {
  if (conversation.kind === "store") {
    return [
      {
        id: `${conversation.id}-store-1`,
        badge: "店铺动态",
        title: "本周新增夜间预约席位",
        content: `${conversation.name} 本周开放 20:30 后预约，护理、按摩和美甲项目都可以提前锁定担当者。`,
        at: "今天 10:20",
        images: [stores[0].cover, imageBank.salon],
        stats: [["可约时段", "18"], ["收藏", "426"], ["电话", conversation.phone]]
      },
      {
        id: `${conversation.id}-store-2`,
        badge: "照片",
        title: "店内环境与担当者更新",
        content: "新拍摄了接待区、护理房和消毒台照片，预约前可以先确认环境和动线。",
        at: "昨天 18:40",
        images: [imageBank.home, imageBank.cafe, imageBank.massage],
        stats: [["浏览", "3.2k"], ["评论", "48"], ["预约", "76"]]
      }
    ];
  }

  if (conversation.kind === "technician") {
    return [
      {
        id: `${conversation.id}-tech-1`,
        badge: "服务动态",
        title: "今日完成 4 单，准时率 100%",
        content: `${conversation.name} 分享了近期服务记录，重点是肩颈放松、深层清洁和宠物家庭友好流程。`,
        at: "今天 16:15",
        images: [conversation.avatar, imageBank.massage],
        stats: [["评分", "4.9"], ["复约", "68%"], ["照片", "12"]]
      },
      {
        id: `${conversation.id}-tech-2`,
        badge: "推文",
        title: "上门前的小提醒",
        content: "如果家里有宠物或需要女性技师同行，可以提前在备注里写清楚，我会按流程确认。",
        at: "4月12日 21:10",
        images: [imageBank.pet],
        stats: [["点赞", "188"], ["收藏", "54"], ["分享", "19"]]
      }
    ];
  }

  if (conversation.kind === "staff" || conversation.kind === "support") {
    return [
      {
        id: `${conversation.id}-work-1`,
        badge: conversation.kind === "support" ? "平台公告" : "工作动态",
        title: conversation.kind === "support" ? "售后处理和补偿规则更新" : "门店排班与协作记录",
        content: `${conversation.name} 更新了 ${appointment.itemName} 相关沟通记录，方便团队统一服务口径。`,
        at: "今天 11:30",
        images: [conversation.avatar, imageBank.cafe],
        stats: [["待办", "3"], ["已读", "28"], ["跟进", "6"]]
      }
    ];
  }

  return [
    {
      id: `${conversation.id}-customer-1`,
      badge: "动态",
      title: "授权可见的服务偏好",
      content: `${conversation.name} 最近常预约 ${appointment.itemName}，偏好 ${appointment.area} 区域和准时提醒。`,
      at: "今天 09:05",
      images: [conversation.avatar, imageBank.cleaning],
      stats: [["历史订单", "8"], ["最近预约", appointment.bookedAt.slice(5, 16)], ["隐私", "授权"]]
    },
    {
      id: `${conversation.id}-customer-2`,
      badge: "照片",
      title: "服务现场照片",
      content: "用户授权展示服务前后对比照片，方便商家和技师理解户型、动线和注意事项。",
      at: "4月11日 13:30",
      images: [imageBank.home, imageBank.cleaning, imageBank.pet],
      stats: [["照片", "6"], ["备注", "2"], ["回访", "已完成"]]
    }
  ];
}

export function MobileMessageCenter({ context = "user" }: { context?: MessageCenterContext }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const conversations = useMemo(() => getConversations(context), [context]);
  const copy = getContextCopy(context);
  const [groups, setGroups] = useState<ConversationGroup[]>(() => getStoredGroups(context, conversations));
  const [activeGroupId, setActiveGroupId] = useState(allGroupId);
  const [activeId, setActiveId] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [showComposerActions, setShowComposerActions] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showGroupEditor, setShowGroupEditor] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [momentReplies, setMomentReplies] = useState<Record<string, string[]>>({});
  const [momentActionPostId, setMomentActionPostId] = useState("");
  const [draft, setDraft] = useState("");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [mutedIds, setMutedIds] = useState<string[]>([]);
  const [followUpIds, setFollowUpIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => getInitialMessages(context, conversations));
  const sendPressTimer = useRef<number | null>(null);
  const momentPressTimer = useRef<number | null>(null);
  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? groups[0];
  const activeGroupIds = activeGroup.id === allGroupId ? conversations.map((conversation) => conversation.id) : activeGroup.conversationIds;
  const visibleConversations = conversations
    .filter((conversation) => activeGroupIds.includes(conversation.id))
    .sort((left, right) => Number(pinnedIds.includes(right.id)) - Number(pinnedIds.includes(left.id)));
  const active = conversations.find((conversation) => conversation.id === activeId) ?? visibleConversations[0] ?? conversations[0];
  const activeMessages = messages[active.id] ?? [];
  const customerAppointments = context === "merchant" && active.customerId
    ? sortOrdersByBookedAt(orders.filter((order) => order.customerId === active.customerId))
    : [active.order];
  const recentAppointment = getNearestOrder(customerAppointments) ?? active.order;
  const previousAppointments = sortOrdersByBookedAt(customerAppointments.filter((order) => order.bookedAt < "2026-04-13 00:00")).slice(0, 3);
  const futureAppointments = sortOrdersByBookedAt(customerAppointments.filter((order) => order.bookedAt >= "2026-04-13 00:00"), "asc").slice(0, 3);
  const canShowPhone = canDisplayPhone(active);
  const activeMoments = getMomentPosts(active, recentAppointment);
  const getGroupUnreadCount = (group: ConversationGroup) => {
    const ids = group.id === allGroupId ? conversations.map((conversation) => conversation.id) : group.conversationIds;

    return conversations
      .filter((conversation) => ids.includes(conversation.id) && !readIds.includes(conversation.id))
      .reduce((sum, conversation) => sum + conversation.unread, 0);
  };

  useEffect(() => {
    window.localStorage.setItem(getStorageKey(context), JSON.stringify(groups));
  }, [context, groups]);

  useEffect(() => {
    const forwardedMessages = getStoredForwardedMessages(context);

    if (forwardedMessages.length === 0) {
      return;
    }

    const validConversationIds = new Set(conversations.map((conversation) => conversation.id));
    const validMessages = forwardedMessages.filter((message) => validConversationIds.has(message.conversationId));

    if (validMessages.length === 0) {
      window.localStorage.removeItem(getForwardStorageKey(context));
      return;
    }

    setMessages((current) => {
      const next = { ...current };

      validMessages.forEach((message) => {
        const exists = next[message.conversationId]?.some((item) => item.id === message.id);

        if (exists) {
          return;
        }

        next[message.conversationId] = [
          ...(next[message.conversationId] ?? []),
          {
            id: message.id,
            from: "me",
            type: "card",
            content: message.content,
            at: message.at || getCurrentTime()
          }
        ];
      });

      return next;
    });

    const firstMessage = validMessages[0];
    setActiveId(firstMessage.conversationId);
    setActiveGroupId(allGroupId);
    setReadIds((current) => (current.includes(firstMessage.conversationId) ? current : [...current, firstMessage.conversationId]));
    setIsChatOpen(true);
    window.localStorage.removeItem(getForwardStorageKey(context));
  }, [context, conversations]);

  useEffect(() => () => {
    if (sendPressTimer.current) {
      window.clearTimeout(sendPressTimer.current);
    }

    if (momentPressTimer.current) {
      window.clearTimeout(momentPressTimer.current);
    }
  }, []);

  useEffect(() => {
    const targetId = searchParams.get("chat");

    if (!targetId || !conversations.some((conversation) => conversation.id === targetId)) {
      return;
    }

    setActiveId(targetId);
    setActiveGroupId(allGroupId);
    setReadIds((current) => (current.includes(targetId) ? current : [...current, targetId]));
    setIsChatOpen(true);
    setShowGroupEditor(false);
    setShowTools(false);
    setShowMoments(false);
    setIsProfileExpanded(false);
    setShowComposerActions(false);
    setShowQuickReplies(false);
  }, [conversations, searchParams]);

  const selectGroup = (group: ConversationGroup) => {
    setActiveGroupId(group.id);
    setIsChatOpen(false);
    setIsProfileExpanded(false);
    setShowMoments(false);
    setShowComposerActions(false);
    setShowQuickReplies(false);
    setShowGroupEditor(false);
  };

  const addGroup = () => {
    const id = `group-${Date.now()}`;
    setGroups((current) => [...current, { id, name: "新分组", conversationIds: [] }]);
    setActiveGroupId(id);
    setIsChatOpen(false);
    setIsProfileExpanded(false);
    setShowMoments(false);
    setShowComposerActions(false);
    setShowQuickReplies(false);
    setShowGroupEditor(true);
  };

  const renameActiveGroup = (name: string) => {
    if (activeGroup.locked) {
      return;
    }

    setGroups((current) => current.map((group) => (group.id === activeGroup.id ? { ...group, name } : group)));
  };

  const toggleConversationInGroup = (conversationId: string) => {
    if (activeGroup.locked) {
      return;
    }

    setGroups((current) =>
      current.map((group) => {
        if (group.id !== activeGroup.id) {
          return group;
        }

        const exists = group.conversationIds.includes(conversationId);

        return {
          ...group,
          conversationIds: exists
            ? group.conversationIds.filter((id) => id !== conversationId)
            : [...group.conversationIds, conversationId]
        };
      })
    );
  };

  const openConversation = (conversationId: string) => {
    setActiveId(conversationId);
    setReadIds((current) => (current.includes(conversationId) ? current : [...current, conversationId]));
    setIsChatOpen(true);
    setIsProfileExpanded(false);
    setShowMoments(false);
    setShowComposerActions(false);
    setShowQuickReplies(false);
    setShowTools(false);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("chat", conversationId);
    setSearchParams(nextParams, { replace: true });
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setIsProfileExpanded(false);
    setShowMoments(false);
    setShowComposerActions(false);
    setShowQuickReplies(false);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("chat");
    setSearchParams(nextParams, { replace: true });
  };

  const addMessage = (message: Omit<ChatMessage, "id" | "at">) => {
    setMessages((current) => ({
      ...current,
      [active.id]: [
        ...(current[active.id] ?? []),
        {
          ...message,
          id: `${active.id}-${Date.now()}`,
          at: getCurrentTime()
        }
      ]
    }));
  };

  const sendText = () => {
    if (!draft.trim()) {
      return;
    }

    addMessage({ from: "me", type: "text", content: draft.trim() });
    setDraft("");
  };

  const sendQuickReply = (content: string) => {
    addMessage({ from: "me", type: "text", content });
  };

  const uploadImage = (fileName?: string) => {
    addMessage({ from: "me", type: "image", content: fileName ? `已上传图片：${fileName}` : "已上传现场图片" });
  };

  const callContact = () => {
    addMessage({
      from: "system",
      type: "call",
      content: canShowPhone ? `已发起门店电话联系：${active.phone}` : `已通过平台内通话联系：${active.name}`
    });
  };

  const sendOrderCard = () => {
    addMessage({
      from: "me",
      type: "card",
      content: `${active.order.orderNo} · ${active.order.itemName} · ${active.order.bookedAt} · ${yen(active.order.amount)}`
    });
  };

  const sendLocation = () => {
    addMessage({ from: "me", type: "location", content: `${active.order.city}${active.order.area} · 已发送定位` });
  };

  const moveToBlacklist = () => {
    setGroups((current) =>
      current.map((group) => {
        if (group.id === allGroupId) {
          return group;
        }

        if (group.id === "blacklist") {
          return {
            ...group,
            conversationIds: group.conversationIds.includes(active.id) ? group.conversationIds : [...group.conversationIds, active.id]
          };
        }

        return { ...group, conversationIds: group.conversationIds.filter((id) => id !== active.id) };
      })
    );
    addMessage({ from: "system", type: "text", content: "已加入黑名单分组，可在分组管理中恢复。" });
  };

  const toggleId = (id: string, setter: (value: (current: string[]) => string[]) => void) => {
    setter((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const clearSendPressTimer = () => {
    if (sendPressTimer.current) {
      window.clearTimeout(sendPressTimer.current);
      sendPressTimer.current = null;
    }
  };

  const startSendPressTimer = () => {
    clearSendPressTimer();
    sendPressTimer.current = window.setTimeout(() => {
      setShowQuickReplies(true);
      setShowComposerActions(false);
      sendPressTimer.current = null;
    }, 520);
  };

  const handleSendRelease = () => {
    const shouldSend = Boolean(sendPressTimer.current);
    clearSendPressTimer();

    if (shouldSend) {
      sendText();
    }
  };

  const openMomentActions = (postId: string) => {
    setMomentActionPostId(postId);
  };

  const clearMomentPressTimer = () => {
    if (momentPressTimer.current) {
      window.clearTimeout(momentPressTimer.current);
      momentPressTimer.current = null;
    }
  };

  const startMomentPressTimer = (postId: string) => {
    clearMomentPressTimer();
    momentPressTimer.current = window.setTimeout(() => {
      openMomentActions(postId);
      momentPressTimer.current = null;
    }, 560);
  };

  const toggleMomentLike = (postId: string) => {
    setLikedPostIds((current) => (current.includes(postId) ? current.filter((id) => id !== postId) : [...current, postId]));
  };

  const replyMoment = (postId: string) => {
    setMomentReplies((current) => ({
      ...current,
      [postId]: [...(current[postId] ?? []), "已收到，我会进一步确认。"]
    }));
  };

  return (
    <div className="space-y-4">
      <header className="rounded-lg bg-ink p-4 text-white shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-mint">{copy.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-black">{copy.title}</h1>
            <p className="mt-2 text-xs leading-5 text-white/60">{copy.subtitle}</p>
          </div>
          <button
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/15 text-xl font-black"
            onClick={() => setShowGroupEditor((current) => !current)}
            type="button"
            aria-label="管理分组"
          >
            +
          </button>
        </div>
      </header>

      <section className="rounded-lg border border-line bg-white p-3 shadow-panel">
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {groups.map((group) => (
            <button
              className={cn(
                "relative flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left shadow-panel",
                activeGroupId === group.id ? "border-moss bg-moss text-white" : "border-line bg-paper text-ink"
              )}
              key={group.id}
              onClick={() => selectGroup(group)}
              type="button"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#171717] text-lemon">
                <ContactGroupIcon id={group.id} label={group.name} />
              </span>
              <span>
                <strong className="block text-sm">{group.name}</strong>
                <span className={cn("text-xs", activeGroupId === group.id ? "text-white/70" : "text-ink/45")}>
                  {(group.id === allGroupId ? conversations.length : group.conversationIds.length)} 个会话
                </span>
              </span>
              {getGroupUnreadCount(group) > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] font-black text-white">
                  {getGroupUnreadCount(group)}
                </span>
              )}
            </button>
          ))}
          <button
            className="shrink-0 rounded-lg border border-dashed border-moss bg-mint/20 px-3 py-2 text-left text-moss shadow-panel"
            onClick={addGroup}
            type="button"
          >
            <strong className="block text-sm">+ 添加分组</strong>
            <span className="text-xs text-moss/70">自定义名称</span>
          </button>
        </div>
      </section>

      {!isChatOpen && (
        <section className="rounded-lg border border-line bg-white p-3 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black">会话列表</h2>
              <p className="mt-1 text-xs text-ink/45">{activeGroup.name} · 点击会话进入聊天窗口</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setShowGroupEditor((current) => !current)}>
              管理
            </Button>
          </div>

          {showGroupEditor && (
            <div className="mt-3 rounded-lg bg-paper p-3">
              <div className="grid gap-2">
                <label>
                  <span className="mb-1 block text-xs font-bold text-ink/45">分组名称</span>
                  <input
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold outline-none disabled:opacity-60"
                    disabled={activeGroup.locked}
                    onChange={(event) => renameActiveGroup(event.target.value)}
                    value={activeGroup.name}
                  />
                </label>
                {!activeGroup.locked && (
                  <div>
                    <p className="mb-2 text-xs font-bold text-ink/45">加入会话</p>
                    <div className="grid grid-cols-2 gap-2">
                      {conversations.map((conversation) => {
                        const checked = activeGroup.conversationIds.includes(conversation.id);

                        return (
                          <button
                            className={cn(
                              "rounded-lg border px-2 py-2 text-left text-xs font-bold",
                              checked ? "border-moss bg-moss text-white" : "border-line bg-white text-ink/60"
                            )}
                            key={conversation.id}
                            onClick={() => toggleConversationInGroup(conversation.id)}
                            type="button"
                          >
                            {checked ? "✓ " : "+ "}{conversation.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {visibleConversations.length > 0 ? (
            <div className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line">
              {visibleConversations.map((conversation) => {
                const lastMessage = messages[conversation.id]?.at(-1);
                const unread = readIds.includes(conversation.id) ? 0 : conversation.unread;

                return (
                  <button
                    className="flex w-full items-center gap-3 bg-white p-3 text-left transition hover:bg-paper"
                    key={conversation.id}
                    onClick={() => openConversation(conversation.id)}
                    type="button"
                  >
                    <div className="relative shrink-0">
                      <img alt={conversation.name} className="h-12 w-12 rounded-lg object-cover" src={conversation.avatar} />
                      {unread > 0 && (
                        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] font-black text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="truncate text-sm">{conversation.name}</strong>
                        <span className="shrink-0 text-[11px] text-ink/40">{lastMessage?.at}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-ink/50">
                        {pinnedIds.includes(conversation.id) ? "置顶 · " : ""}
                        {followUpIds.includes(conversation.id) ? "待跟进 · " : ""}
                        {mutedIds.includes(conversation.id) ? "免打扰 · " : ""}
                        {conversation.role} · {conversation.order.itemName}
                      </p>
                      <p className="mt-1 truncate text-xs text-ink/40">{lastMessage?.content ?? "暂无信息"}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-paper p-4 text-sm leading-6 text-ink/55">
              <strong className="block text-ink">暂无会话</strong>
              {copy.empty}
            </div>
          )}
        </section>
      )}

      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/45">
        <section className="fixed inset-y-0 left-1/2 flex h-[100dvh] w-full max-w-[480px] -translate-x-1/2 flex-col overflow-hidden bg-white shadow-soft">
          <header className="border-b border-line bg-paper p-3">
            <div className="flex items-center justify-between gap-3">
              <button className="text-sm font-black text-moss" onClick={closeChat} type="button">
                返回
              </button>
              <div className="min-w-0 flex-1 text-center">
                <h2 className="truncate font-black">{active.name}</h2>
                <p className="truncate text-xs text-ink/45">{active.role} · {active.order.bookedAt}</p>
              </div>
              <button className="text-sm font-black text-moss" onClick={() => setShowTools((current) => !current)} type="button">
                更多
              </button>
            </div>
            {showTools && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                <Button size="sm" variant="secondary" onClick={callContact}>{canShowPhone ? "电话" : "通话"}</Button>
                <Button size="sm" variant="secondary" onClick={() => toggleId(active.id, setPinnedIds)}>置顶</Button>
                <Button size="sm" variant="secondary" onClick={() => toggleId(active.id, setMutedIds)}>免打扰</Button>
                <Button size="sm" variant="danger" onClick={moveToBlacklist}>拉黑</Button>
              </div>
            )}
          </header>

          <section className="shrink-0 border-b border-line bg-white p-3">
            <div className="flex items-start gap-3 rounded-lg bg-paper p-3">
              <button className="group shrink-0 text-left" onClick={() => setShowMoments(true)} type="button">
                <img alt={active.name} className="h-16 w-16 rounded-lg object-cover" src={active.avatar} />
                <span className="mt-1 block rounded-full bg-moss px-2 py-1 text-center text-[10px] font-black text-white group-hover:bg-ink">
                  动态
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-black">{active.name}</h3>
                    <p className="mt-1 text-xs text-ink/50">{active.role}</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <button className="text-xs font-black text-moss" onClick={() => setShowMoments(true)} type="button">
                        查看动态
                      </button>
                      <button className="text-xs font-black text-moss" onClick={() => setIsProfileExpanded((current) => !current)} type="button">
                        {isProfileExpanded ? "收起信息" : "展开信息"}
                      </button>
                    </div>
                  </div>
                  <Badge tone={followUpIds.includes(active.id) ? "yellow" : "green"}>
                    {followUpIds.includes(active.id) ? "待跟进" : "可联系"}
                  </Badge>
                </div>
                {isProfileExpanded && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      [canShowPhone ? "电话" : "通话", canShowPhone ? active.phone : "平台内通话"],
                      ["地区", active.order.area],
                      ["订单", active.order.orderNo.slice(-6)]
                    ].map(([label, value]) => (
                      <div className="rounded-lg bg-white p-2" key={label}>
                        <p className="text-[10px] font-bold text-ink/40">{label}</p>
                        <strong className="mt-1 block truncate text-xs">{value}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isProfileExpanded && (
              <div className="mt-3 rounded-lg border border-line bg-paper p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-moss">预约情况</p>
                    <h3 className="mt-1 truncate font-black">{recentAppointment.itemName}</h3>
                    <p className="mt-1 text-xs leading-5 text-ink/55">
                      {recentAppointment.bookedAt} · {recentAppointment.area} · {yen(recentAppointment.amount)}
                    </p>
                  </div>
                  <Badge tone={recentAppointment.status === "completed" ? "green" : recentAppointment.status === "refunding" ? "red" : "yellow"}>
                    {recentAppointment.status}
                  </Badge>
                </div>
              </div>
            )}
          </section>

          {isProfileExpanded && context === "merchant" && active.customerId && (
            <section className="shrink-0 border-b border-line bg-white p-3">
              <div className="rounded-lg border border-line bg-paper p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-moss">最近预约</p>
                    <h3 className="mt-1 truncate font-black">{recentAppointment.itemName}</h3>
                    <p className="mt-1 text-xs leading-5 text-ink/55">
                      {recentAppointment.bookedAt} · {recentAppointment.area} · {recentAppointment.orderNo}
                    </p>
                  </div>
                  <Badge tone={recentAppointment.status === "completed" ? "green" : recentAppointment.status === "refunding" ? "red" : "yellow"}>
                    {recentAppointment.status}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    ["累计预约", customerAppointments.length],
                    ["历史预约", previousAppointments.length],
                    ["未来预约", futureAppointments.length]
                  ].map(([label, value]) => (
                    <div className="rounded-lg bg-white p-2" key={label}>
                      <p className="text-[11px] text-ink/45">{label}</p>
                      <strong className="mt-1 block text-sm">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black">预约时间线</h3>
                  <span className="text-xs font-bold text-ink/40">以前 / 以后</span>
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {[...previousAppointments.map((order) => ({ order, label: "历史" })), ...futureAppointments.map((order) => ({ order, label: "未来" }))].map(({ order, label }) => (
                    <button
                      className="w-56 shrink-0 rounded-lg border border-line bg-paper p-3 text-left"
                      key={`${label}-${order.id}`}
                      onClick={() => addMessage({ from: "system", type: "card", content: `已打开预约记录：${order.orderNo} · ${order.itemName}` })}
                      type="button"
                    >
                      <Badge tone={label === "历史" ? "neutral" : "green"}>{label}</Badge>
                      <strong className="mt-2 block truncate text-sm">{order.itemName}</strong>
                      <p className="mt-1 truncate text-xs text-ink/50">{order.bookedAt} · {yen(order.amount)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-paper/60 p-3">
            <div className="mx-auto max-w-[82%] rounded-lg bg-lemon/25 px-3 py-2 text-center text-xs leading-5 text-ink/55">
              {active.order.orderNo} · {active.order.itemName} · {yen(active.order.amount)}
            </div>
            {activeMessages.map((message) => (
              <div className={cn("flex", message.from === "me" ? "justify-end" : message.from === "system" ? "justify-center" : "justify-start")} key={message.id}>
                <div
                  className={cn(
                    "max-w-[78%] rounded-lg px-3 py-2 text-sm shadow-panel",
                    message.from === "me" ? "bg-moss text-white" : message.from === "system" ? "bg-lemon/25 text-ink/65" : "bg-white text-ink"
                  )}
                >
                  <p>{message.content}</p>
                  <span className={cn("mt-1 block text-[10px]", message.from === "me" ? "text-white/65" : "text-ink/40")}>{message.at}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            aria-label={canShowPhone ? "拨打门店电话" : "平台内通话"}
            className="absolute bottom-40 right-4 z-20 grid h-14 w-14 place-items-center rounded-full bg-moss text-white shadow-soft transition hover:bg-ink"
            onClick={callContact}
            type="button"
          >
            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path
                d="M7.2 4.8 9.3 4c.7-.3 1.5 0 1.8.7l1 2.4c.2.6.1 1.2-.4 1.6l-1.1 1c.8 1.7 2 3 3.7 3.8l1.1-1c.5-.4 1.1-.5 1.7-.2l2.3 1.1c.7.3 1 1.1.7 1.8l-.9 2.1c-.3.7-1 1.1-1.7 1-7-.9-12.4-6.3-13.3-13.2-.1-.8.3-1.5 1-1.8Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>

          <footer className="shrink-0 border-t border-line bg-white p-3">
            {showComposerActions && (
              <div className="mb-3 rounded-lg border border-line bg-paper p-3 shadow-panel">
                <p className="text-xs font-bold text-ink/45">发送内容</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <label className="focus-ring grid h-11 cursor-pointer place-items-center rounded-lg border border-line bg-white text-xs font-black">
                    图片
                    <input
                      accept="image/*"
                      className="hidden"
                      type="file"
                      onChange={(event) => {
                        uploadImage(event.target.files?.[0]?.name);
                        setShowComposerActions(false);
                      }}
                    />
                  </label>
                  <button
                    className="rounded-lg border border-line bg-white text-xs font-black"
                    onClick={() => {
                      sendOrderCard();
                      setShowComposerActions(false);
                    }}
                    type="button"
                  >
                    订单
                  </button>
                  <button
                    className="rounded-lg border border-line bg-white text-xs font-black"
                    onClick={() => {
                      sendLocation();
                      setShowComposerActions(false);
                    }}
                    type="button"
                  >
                    位置
                  </button>
                </div>
              </div>
            )}

            {showQuickReplies && (
              <div className="mb-3 rounded-lg border border-line bg-paper p-3 shadow-panel">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-ink/45">快捷回复</p>
                  <button className="text-xs font-black text-moss" onClick={() => setShowQuickReplies(false)} type="button">关闭</button>
                </div>
                <div className="mt-2 space-y-2">
                  {["收到，我马上处理。", "请稍等，我确认一下。", "可以发一张现场照片吗？", "已为您同步到订单。"].map((text) => (
                    <button
                      className="block w-full rounded-lg bg-white px-3 py-2 text-left text-xs font-bold text-ink/65"
                      key={text}
                      onClick={() => {
                        sendQuickReply(text);
                        setShowQuickReplies(false);
                      }}
                      type="button"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-paper text-sm font-black"
                onClick={() => {
                  setShowComposerActions((current) => !current);
                  setShowQuickReplies(false);
                }}
                type="button"
              >
                +
              </button>
              <input
                className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-sm outline-none"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendText();
                  }
                }}
                placeholder="输入信息，支持发送图片"
                value={draft}
              />
              <Button
                size="sm"
                onPointerCancel={clearSendPressTimer}
                onPointerDown={startSendPressTimer}
                onPointerLeave={clearSendPressTimer}
                onPointerUp={handleSendRelease}
              >
                发送
              </Button>
            </div>
          </footer>
        </section>

        {showMoments && (
          <div className="fixed inset-0 z-[60] bg-black/55">
            <section className="fixed inset-y-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 overflow-y-auto bg-white shadow-soft">
              <header className="relative min-h-48 overflow-hidden bg-ink text-white">
                <img alt={active.name} className="absolute inset-0 h-full w-full object-cover opacity-45" src={active.avatar} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
                <button
                  className="absolute left-3 top-3 z-10 rounded-full bg-white/15 px-3 py-2 text-sm font-black backdrop-blur"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowMoments(false);
                    setMomentActionPostId("");
                  }}
                  type="button"
                >
                  返回
                </button>
                <div className="relative flex min-h-48 items-end gap-3 p-4">
                  <img alt={active.name} className="h-16 w-16 rounded-lg border-2 border-white object-cover" src={active.avatar} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-mint">动态</p>
                    <h2 className="truncate text-2xl font-black">{active.name}</h2>
                    <p className="mt-1 text-xs text-white/70">{active.role} · 推文、照片与服务记录</p>
                  </div>
                </div>
              </header>

              <div className="space-y-3 bg-paper p-3">
                <section className="rounded-lg border border-line bg-white p-3 shadow-panel">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-ink/45">联系方式</p>
                      <strong className="mt-1 block text-sm">
                        {canShowPhone ? active.phone : "平台内通话"}
                      </strong>
                    </div>
                    <Button size="sm" onClick={callContact}>
                      通话
                    </Button>
                  </div>
                  {!canShowPhone && (
                    <p className="mt-2 text-xs leading-5 text-ink/50">用户和技师号码已隐藏，只能通过 NeeDo 平台内通话联系。</p>
                  )}
                </section>

                {activeMoments.map((post) => (
                  <article className="rounded-lg border border-line bg-white p-3 shadow-panel" key={post.id}>
                    <div className="flex items-start gap-3">
                      <img alt={active.name} className="h-10 w-10 rounded-lg object-cover" src={active.avatar} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Badge tone={post.badge === "照片" ? "blue" : "green"}>{post.badge}</Badge>
                            <h3 className="mt-2 font-black">{post.title}</h3>
                          </div>
                          <span className="shrink-0 text-[11px] text-ink/40">{post.at}</span>
                        </div>
                        <p
                          className="mt-2 text-sm leading-6 text-ink/65"
                          onContextMenu={(event) => {
                            event.preventDefault();
                            openMomentActions(post.id);
                          }}
                          onMouseDown={() => startMomentPressTimer(post.id)}
                          onMouseLeave={clearMomentPressTimer}
                          onMouseUp={clearMomentPressTimer}
                          onTouchCancel={clearMomentPressTimer}
                          onTouchEnd={clearMomentPressTimer}
                          onTouchStart={() => startMomentPressTimer(post.id)}
                        >
                          {post.content}
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {post.images.map((image) => (
                            <img alt={post.title} className="aspect-square rounded-lg object-cover" key={image} src={image} />
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex gap-2">
                            <button className="inline-flex items-center gap-1 rounded-full bg-paper px-3 py-2 text-xs font-black text-ink/65" onClick={() => toggleMomentLike(post.id)} type="button">
                              <MomentActionIcon name="like" />
                              {likedPostIds.includes(post.id) ? "取消赞" : "点赞"}
                            </button>
                            <button className="inline-flex items-center gap-1 rounded-full bg-paper px-3 py-2 text-xs font-black text-ink/65" onClick={() => replyMoment(post.id)} type="button">
                              <MomentActionIcon name="reply" />
                              回复
                            </button>
                          </div>
                          <button className="inline-flex items-center gap-1 rounded-full bg-paper px-3 py-2 text-xs font-black text-ink/65" onClick={() => openMomentActions(post.id)} type="button">
                            <MomentActionIcon name="more" />
                            更多
                          </button>
                        </div>
                        {(likedPostIds.includes(post.id) || (momentReplies[post.id]?.length ?? 0) > 0) && (
                          <div className="mt-3 rounded-lg bg-paper p-2 text-xs leading-5 text-ink/60">
                            {likedPostIds.includes(post.id) && <p><strong className="text-moss">我</strong> 觉得很有用</p>}
                            {(momentReplies[post.id] ?? []).map((reply, index) => (
                              <p key={`${post.id}-reply-${index}`}><strong className="text-moss">我：</strong>{reply}</p>
                            ))}
                          </div>
                        )}
                        {momentActionPostId === post.id && (
                          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-line bg-paper p-2">
                            <button className="rounded-lg bg-white px-3 py-2 text-xs font-black" onClick={() => setMomentActionPostId("")} type="button">翻译文字</button>
                            <button className="rounded-lg bg-white px-3 py-2 text-xs font-black" onClick={() => setMomentActionPostId("")} type="button">转发</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
