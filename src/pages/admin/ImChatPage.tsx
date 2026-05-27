import { useMemo, useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { ModuleShell } from "../../components/admin/ModuleShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import { customers, orders, stores, technicians } from "../../data/mock";
import { cn, statusLabel, yen } from "../../lib/utils";

type ParticipantType = "user" | "technician" | "store";
type RiskLevel = "normal" | "watch" | "risk";

type ChatParticipant = {
  id: string;
  type: ParticipantType;
  name: string;
  avatar: string;
  caption: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderType: ParticipantType | "system" | "operator";
  text: string;
  at: string;
};

type AdminConversation = {
  id: string;
  title: string;
  participants: ChatParticipant[];
  latestAt: string;
  unread: number;
  risk: RiskLevel;
  status: "open" | "handled" | "monitoring";
  tags: string[];
  relatedOrderIds: string[];
  messages: ChatMessage[];
};

const customerAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80"
];

const tabs = ["全部", "用户", "技师", "店铺", "需关注"] as const;

const riskCopy: Record<RiskLevel, string> = {
  normal: "正常",
  watch: "关注",
  risk: "风险"
};

function customerAvatar(index: number) {
  return customerAvatars[index % customerAvatars.length];
}

const userParticipants: ChatParticipant[] = customers.slice(0, 18).map((customer, index) => ({
  id: customer.id,
  type: "user",
  name: customer.name,
  avatar: customerAvatar(index),
  caption: `${customer.memberLevel} · ${customer.orderCount} 单 · ${customer.tags.slice(0, 2).join("、")}`
}));

const technicianParticipants: ChatParticipant[] = technicians.slice(0, 16).map((technician) => ({
  id: technician.id,
  type: "technician",
  name: technician.name,
  avatar: technician.avatar,
  caption: `${technician.skills.slice(0, 2).join("、")} · 接单率 ${technician.acceptRate}%`
}));

const storeParticipants: ChatParticipant[] = stores.map((store) => ({
  id: store.id,
  type: "store",
  name: store.name,
  avatar: store.cover,
  caption: `${store.area} · ${store.rating}分 · ${store.openStatus === "open" ? "营业中" : "休息中"}`
}));

function participantTypeLabel(type: ParticipantType) {
  if (type === "user") {
    return "用户";
  }

  if (type === "technician") {
    return "技师";
  }

  return "店铺";
}

function buildMessages(participants: ChatParticipant[], index: number): ChatMessage[] {
  const first = participants[0];
  const second = participants[1];
  const templates = [
    "您好，我想确认一下今天的预约时间和地址。",
    "已经收到，服务前会提前 15 分钟在平台内联系您。",
    "付款方式是平台预付还是线下支付？",
    "这单显示为平台担保，现场如有追加会先确认报价。",
    "如果需要变更时间，请在这里回复，我会同步给调度。",
    "好的，已经确认。谢谢。"
  ];

  return templates.map((text, messageIndex) => {
    const sender = messageIndex % 2 === 0 ? first : second;

    return {
      id: `msg-${index}-${messageIndex}`,
      senderId: sender.id,
      senderName: sender.name,
      senderType: sender.type,
      text,
      at: `2026-04-14 ${String(9 + index + messageIndex).padStart(2, "0")}:${messageIndex % 2 === 0 ? "10" : "35"}`
    };
  });
}

function buildConversations(): AdminConversation[] {
  const userTechnician = Array.from({ length: 18 }, (_, index): AdminConversation => {
    const user = userParticipants[index % userParticipants.length];
    const technician = technicianParticipants[index % technicianParticipants.length];
    const relatedOrder = orders[index % orders.length];
    const risk: RiskLevel = index % 9 === 0 ? "risk" : index % 4 === 0 ? "watch" : "normal";

    return {
      id: `im-user-tech-${index + 1}`,
      title: `${user.name} / ${technician.name}`,
      participants: [user, technician],
      latestAt: `今天 ${String(18 - (index % 8)).padStart(2, "0")}:2${index % 10}`,
      unread: index % 5 === 0 ? 3 + (index % 4) : index % 3 === 0 ? 1 : 0,
      risk,
      status: risk === "risk" ? "monitoring" : index % 6 === 0 ? "handled" : "open",
      tags: ["预约确认", index % 2 === 0 ? "平台支付" : "线下支付", index % 4 === 0 ? "投诉风险" : "普通咨询"],
      relatedOrderIds: [relatedOrder.id],
      messages: buildMessages([user, technician], index)
    };
  });

  const userStore = Array.from({ length: 12 }, (_, index): AdminConversation => {
    const user = userParticipants[(index + 4) % userParticipants.length];
    const store = storeParticipants[index % storeParticipants.length];
    const relatedOrder = orders[(index + 12) % orders.length];

    return {
      id: `im-user-store-${index + 1}`,
      title: `${user.name} / ${store.name}`,
      participants: [user, store],
      latestAt: `${index + 1}小时前`,
      unread: index % 4 === 0 ? 2 : 0,
      risk: index % 5 === 0 ? "watch" : "normal",
      status: index % 5 === 0 ? "monitoring" : "open",
      tags: ["到店预约", "改期咨询", index % 3 === 0 ? "定金确认" : "席位确认"],
      relatedOrderIds: [relatedOrder.id],
      messages: buildMessages([user, store], index + 20)
    };
  });

  const storeTechnician = Array.from({ length: 8 }, (_, index): AdminConversation => {
    const store = storeParticipants[index % storeParticipants.length];
    const technician = technicianParticipants[(index + 6) % technicianParticipants.length];

    return {
      id: `im-store-tech-${index + 1}`,
      title: `${store.name} / ${technician.name}`,
      participants: [store, technician],
      latestAt: `${index + 2}小时前`,
      unread: index % 2,
      risk: "normal",
      status: "open",
      tags: ["店铺派单", "排班确认", "移动时间"],
      relatedOrderIds: [orders[(index + 30) % orders.length].id],
      messages: buildMessages([store, technician], index + 40)
    };
  });

  return [...userTechnician, ...userStore, ...storeTechnician];
}

const conversations = buildConversations();

function getOrderById(orderId: string) {
  return orders.find((order) => order.id === orderId);
}

function conversationMatchesTab(conversation: AdminConversation, tab: (typeof tabs)[number]) {
  if (tab === "全部") {
    return true;
  }

  if (tab === "需关注") {
    return conversation.risk !== "normal" || conversation.unread > 0;
  }

  const targetType: ParticipantType = tab === "用户" ? "user" : tab === "技师" ? "technician" : "store";

  return conversation.participants.some((participant) => participant.type === targetType);
}

export function ImChatPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("全部");
  const [query, setQuery] = useState("");
  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const tabMatched = conversationMatchesTab(conversation, activeTab);
      const queryMatched =
        !normalized ||
        [
          conversation.title,
          conversation.tags.join(" "),
          conversation.participants.map((participant) => `${participant.name} ${participant.caption}`).join(" "),
          conversation.messages.map((message) => message.text).join(" ")
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);

      return tabMatched && queryMatched;
    });
  }, [activeTab, query]);
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const selectedConversation = filteredConversations.find((conversation) => conversation.id === selectedId) ?? filteredConversations[0] ?? conversations[0];
  const totalUnread = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);
  const riskCount = conversations.filter((conversation) => conversation.risk !== "normal").length;

  return (
    <AdminLayout>
      <ModuleShell
        title="IM 聊天"
        description="集中查看所有用户、技师和店铺之间的聊天记录，支持客服质检、风控关注、订单追溯和运营处理。"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">导出聊天记录</Button>
            <Button>新建客服会话</Button>
          </div>
        }
      >
        <section className="grid gap-3 md:grid-cols-4">
          {[
            ["总会话", conversations.length, "用户 / 技师 / 店铺全量"],
            ["未读消息", totalUnread, "需要客服跟进"],
            ["风控关注", riskCount, "投诉、线下交易、敏感词"],
            ["今日质检", "96.8%", "抽检通过率"]
          ].map(([label, value, caption]) => (
            <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={label}>
              <p className="text-sm text-ink/55">{label}</p>
              <strong className="mt-2 block text-2xl">{value}</strong>
              <p className="mt-2 text-xs text-ink/55">{caption}</p>
            </article>
          ))}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs active={activeTab} items={[...tabs]} onChange={(item) => setActiveTab(item as (typeof tabs)[number])} />
          <label className="relative w-full max-w-md">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35">⌕</span>
            <input
              className="h-10 w-full rounded-full border border-line bg-white pl-10 pr-4 text-sm font-bold outline-none focus:border-moss"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索姓名、聊天内容、订单标签"
              value={query}
            />
          </label>
        </div>

        <section className="grid min-h-[720px] overflow-hidden rounded-lg border border-line bg-white shadow-panel xl:grid-cols-[390px,1fr,320px]">
          <aside className="border-b border-line bg-paper/70 xl:border-b-0 xl:border-r">
            <div className="border-b border-line px-4 py-3">
              <h2 className="font-black">会话列表</h2>
              <p className="mt-1 text-xs text-ink/50">共 {filteredConversations.length} 条，点击切换聊天窗口。</p>
            </div>
            <div className="max-h-[660px] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <button
                  className={cn(
                    "focus-ring w-full border-b border-line px-4 py-3 text-left transition hover:bg-white",
                    selectedConversation?.id === conversation.id ? "bg-white" : "bg-transparent"
                  )}
                  key={conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex -space-x-3">
                      {conversation.participants.slice(0, 3).map((participant) => (
                        <img alt={participant.name} className="h-11 w-11 rounded-full border-2 border-white object-cover" key={participant.id} src={participant.avatar} />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <strong className="truncate text-sm">{conversation.title}</strong>
                        <span className="shrink-0 text-xs font-bold text-ink/40">{conversation.latestAt}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-ink/50">{conversation.messages[conversation.messages.length - 1]?.text}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {conversation.participants.map((participant) => (
                          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-black text-ink/50" key={`${conversation.id}-${participant.id}`}>
                            {participantTypeLabel(participant.type)}
                          </span>
                        ))}
                        {conversation.unread > 0 ? <span className="rounded-full bg-coral px-2 py-1 text-[11px] font-black text-white">{conversation.unread}</span> : null}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="flex min-w-0 flex-col border-b border-line xl:border-b-0 xl:border-r">
            {selectedConversation ? (
              <>
                <header className="border-b border-line px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">{selectedConversation.title}</h2>
                      <p className="mt-1 text-sm text-ink/50">{selectedConversation.participants.map((participant) => `${participantTypeLabel(participant.type)}：${participant.name}`).join(" / ")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={selectedConversation.risk === "risk" ? "red" : selectedConversation.risk === "watch" ? "yellow" : "green"}>
                        {riskCopy[selectedConversation.risk]}
                      </Badge>
                      <Badge tone={selectedConversation.status === "handled" ? "green" : selectedConversation.status === "monitoring" ? "yellow" : "blue"}>
                        {selectedConversation.status === "handled" ? "已处理" : selectedConversation.status === "monitoring" ? "监控中" : "处理中"}
                      </Badge>
                    </div>
                  </div>
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto bg-paper/50 p-5">
                  {selectedConversation.messages.map((message) => {
                    const sender = selectedConversation.participants.find((participant) => participant.id === message.senderId);
                    const alignRight = message.senderType === "technician" || message.senderType === "store";

                    return (
                      <article className={`flex gap-3 ${alignRight ? "justify-end" : "justify-start"}`} key={message.id}>
                        {!alignRight ? <img alt={message.senderName} className="h-9 w-9 rounded-full object-cover" src={sender?.avatar ?? selectedConversation.participants[0].avatar} /> : null}
                        <div className={`max-w-[72%] ${alignRight ? "text-right" : "text-left"}`}>
                          <div className="mb-1 flex items-center gap-2 text-xs text-ink/45">
                            {!alignRight ? <span>{message.senderName}</span> : null}
                            <span>{message.at}</span>
                            {alignRight ? <span>{message.senderName}</span> : null}
                          </div>
                          <p className={`rounded-lg px-4 py-3 text-sm leading-6 shadow-soft ${alignRight ? "bg-ink text-white" : "bg-white text-ink/75"}`}>
                            {message.text}
                          </p>
                        </div>
                        {alignRight ? <img alt={message.senderName} className="h-9 w-9 rounded-full object-cover" src={sender?.avatar ?? selectedConversation.participants[0].avatar} /> : null}
                      </article>
                    );
                  })}
                </div>

                <footer className="border-t border-line bg-white p-4">
                  <textarea className="min-h-20 w-full rounded-lg border border-line bg-paper p-3 text-sm outline-none focus:border-moss" placeholder="输入客服备注或向会话发送平台消息..." />
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button variant="secondary" size="sm">添加客服备注</Button>
                    <Button variant="secondary" size="sm">标记已处理</Button>
                    <Button size="sm">发送平台消息</Button>
                  </div>
                </footer>
              </>
            ) : null}
          </main>

          <aside className="bg-white p-4">
            {selectedConversation ? (
              <div className="space-y-5">
                <section>
                  <h3 className="font-black">参与者资料</h3>
                  <div className="mt-3 space-y-3">
                    {selectedConversation.participants.map((participant) => (
                      <article className="rounded-lg border border-line bg-paper p-3" key={participant.id}>
                        <div className="flex items-center gap-3">
                          <img alt={participant.name} className="h-12 w-12 rounded-full object-cover" src={participant.avatar} />
                          <div className="min-w-0">
                            <strong className="block truncate">{participant.name}</strong>
                            <p className="mt-1 truncate text-xs text-ink/50">{participant.caption}</p>
                          </div>
                        </div>
                        <Badge className="mt-3" tone={participant.type === "user" ? "yellow" : participant.type === "technician" ? "blue" : "green"}>
                          {participantTypeLabel(participant.type)}
                        </Badge>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-black">关联订单</h3>
                  <div className="mt-3 space-y-3">
                    {selectedConversation.relatedOrderIds.map((orderId) => {
                      const order = getOrderById(orderId);

                      if (!order) {
                        return null;
                      }

                      return (
                        <article className="rounded-lg border border-line bg-paper p-3" key={order.id}>
                          <div className="flex items-center justify-between gap-2">
                            <strong className="truncate text-sm">{order.orderNo}</strong>
                            <Badge tone={order.status === "completed" ? "green" : order.status === "cancelled" || order.status === "refunded" ? "red" : "yellow"}>
                              {statusLabel(order.status)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm font-bold text-ink/70">{order.itemName}</p>
                          <p className="mt-1 text-xs text-ink/50">{order.bookedAt} · {order.area}</p>
                          <p className="mt-2 text-sm font-black text-moss">{yen(order.amount)}</p>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-lg border border-line bg-paper p-3">
                  <h3 className="font-black">处理动作</h3>
                  <div className="mt-3 grid gap-2">
                    {["查看完整资料", "加入风控观察", "转交客服", "导出本会话", "屏蔽敏感内容"].map((action) => (
                      <Button key={action} variant="secondary" size="sm">
                        {action}
                      </Button>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </aside>
        </section>
      </ModuleShell>
    </AdminLayout>
  );
}
