import { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DetailGrid } from "../../components/admin/DetailGrid";
import { ModuleShell } from "../../components/admin/ModuleShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Drawer } from "../../components/ui/Drawer";
import { FilterBar } from "../../components/ui/FilterBar";
import { customers, imageBank, orders } from "../../data/mock";
import { statusLabel, yen } from "../../lib/utils";
import type { Customer, Order } from "../../types/domain";

type CustomerMomentComment = {
  id: string;
  userName: string;
  content: string;
  at: string;
};

type CustomerMomentPost = {
  id: string;
  author: string;
  postedAt: string;
  location: string;
  visibility: "公开" | "仅好友" | "仅自己" | "指定分组";
  content: string;
  images: string[];
  serviceTitle: string;
  likes: number;
  likedUsers: string[];
  comments: CustomerMomentComment[];
};

const customerAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80"
];

function getCustomerAvatar(customer: Customer) {
  const numericSeed = customer.id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return customerAvatars[numericSeed % customerAvatars.length];
}

const customerMomentContentSeeds = [
  "今天预约的服务很准时，提前在平台里确认了门禁和付款方式，体验比打电话轻松很多。",
  "银座附近的门店环境很安静，预约前能看到店铺和技师动态，做决定快了很多。",
  "上门保洁做完后发了前后对比照片，浴室和厨房都处理得很细。",
  "临时需要夜间服务，NeeDo 的需求发布功能很好用，几分钟就有人响应。",
  "带宠物的家庭真的需要提前备注，服务人员准备得更充分，也会回传照片。",
  "这次选择线下支付，平台里能保留预约和沟通记录，后续追踪也方便。"
];

const customerMomentCommentSeeds = [
  ["佐藤 美咲", "谢谢信任，下次可以提前保留同一时间段。"],
  ["GINZA Calm Body Lab", "欢迎再次预约，晚间席位建议提前一天确认。"],
  ["NeeDo 客服", "感谢反馈，服务记录已经同步到账户里。"],
  ["Mia Chen", "这家我也收藏了，照片很有参考价值。"],
  ["田中 翔太", "下次如果是自动清扫机型，可以提前发型号照片。"],
  ["林 小雨", "我也觉得动态里的真实照片很有帮助。"]
] as const;

function getCustomerMoments(customer: Customer): CustomerMomentPost[] {
  const seed = customer.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const imagePool = [imageBank.cleaning, imageBank.massage, imageBank.salon, imageBank.pet, imageBank.home, imageBank.appliance];

  return Array.from({ length: 3 }, (_, index) => {
    const offset = seed + index;
    const comments = Array.from({ length: 2 + (offset % 3) }, (_, commentIndex): CustomerMomentComment => {
      const commentSeed = customerMomentCommentSeeds[(offset + commentIndex) % customerMomentCommentSeeds.length];

      return {
        id: `${customer.id}-moment-${index + 1}-comment-${commentIndex + 1}`,
        userName: commentSeed[0],
        content: commentSeed[1],
        at: commentIndex === 0 ? "今天 18:10" : `${commentIndex + 2}小时前`
      };
    });

    return {
      id: `${customer.id}-moment-${index + 1}`,
      author: customer.name,
      postedAt: index === 0 ? "今天 17:40" : `${index + (seed % 6)}天前`,
      location: customer.tags.includes("银座") ? "银座" : customer.tags.includes("新宿") ? "新宿" : customer.tags.includes("涩谷") ? "涩谷" : "东京",
      visibility: index === 0 ? "公开" : index === 1 ? "指定分组" : "仅好友",
      content: customerMomentContentSeeds[offset % customerMomentContentSeeds.length],
      images: [
        imagePool[offset % imagePool.length],
        imagePool[(offset + 2) % imagePool.length],
        imagePool[(offset + 4) % imagePool.length]
      ].slice(0, index === 2 ? 2 : 3),
      serviceTitle: customer.tags.includes("按摩") ? "上门肩颈按摩" : customer.tags.includes("保洁") ? "家庭保洁" : customer.tags.includes("宠物") ? "宠物照护" : "到店预约",
      likes: 18 + (offset % 30) + customer.orderCount,
      likedUsers: customerMomentCommentSeeds.slice(0, 3 + (offset % 3)).map((item) => item[0]),
      comments
    };
  });
}

function getCustomerOrders(customer: Customer) {
  return orders
    .filter((order) => order.customerId === customer.id || order.customerName === customer.name)
    .sort((a, b) => b.bookedAt.localeCompare(a.bookedAt));
}

function getPaymentLabel(order: Order) {
  if (order.paymentStatus === "paid") {
    return "平台已支付";
  }

  if (order.paymentStatus === "depositPaid") {
    return "平台定金";
  }

  if (order.paymentStatus === "refunded") {
    return "已退款";
  }

  return "待支付 / 可线下确认";
}

function getMemberLevelClass(level: string) {
  const normalized = level.toLowerCase();

  if (normalized.includes("black")) {
    return "border-[#111827] bg-[#111827] text-white";
  }

  if (normalized.includes("platinum")) {
    return "border-[#b9c7d8] bg-[#eef4fb] text-[#3d536d]";
  }

  if (normalized.includes("gold")) {
    return "border-[#d8aa35] bg-[#fff1bd] text-[#7a5400]";
  }

  return "border-[#b8bdc7] bg-[#f3f5f8] text-[#586170]";
}

function getMemberLevelLabel(level: string) {
  const normalized = level.toLowerCase();

  if (normalized.includes("black")) {
    return "黑卡";
  }

  if (normalized.includes("platinum")) {
    return "白金";
  }

  if (normalized.includes("gold")) {
    return "金卡";
  }

  return "银卡";
}

function MemberLevelBadge({ level }: { level: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${getMemberLevelClass(level)}`}>
      {getMemberLevelLabel(level)}
    </span>
  );
}

function CustomerProfile({ customer }: { customer: Customer }) {
  const customerOrders = getCustomerOrders(customer);
  const upcomingOrders = customerOrders.filter((order) => ["pending", "unpaid", "confirmed", "scheduled", "inService"].includes(order.status));
  const moments = getCustomerMoments(customer);
  const momentLikes = moments.reduce((sum, post) => sum + post.likes, 0);
  const momentComments = moments.reduce((sum, post) => sum + post.comments.length, 0);
  const totalOrderAmount = customerOrders.reduce((sum, order) => sum + order.amount, 0);

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-ink p-4 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <img alt={customer.name} className="h-24 w-24 rounded-lg object-cover" src={getCustomerAvatar(customer)} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <MemberLevelBadge level={customer.memberLevel} />
                <Badge tone={customer.churnRisk === "high" ? "red" : customer.churnRisk === "medium" ? "yellow" : "green"}>
                  {customer.churnRisk === "high" ? "高流失风险" : customer.churnRisk === "medium" ? "中流失风险" : "稳定用户"}
                </Badge>
              </div>
              <h3 className="mt-3 truncate text-2xl font-black">{customer.name}</h3>
              <p className="mt-2 text-sm text-white/65">{customer.phone} · 最近消费 {customer.lastOrderAt}</p>
            </div>
          </div>
        </div>
      </section>

      <DetailGrid
        items={[
          { label: "会员等级", value: <MemberLevelBadge level={customer.memberLevel} /> },
          { label: "LTV", value: yen(customer.ltv) },
          { label: "订单次数", value: `${customer.orderCount} 单` },
          { label: "实际订单记录", value: `${customerOrders.length} 条` },
          { label: "累计记录金额", value: yen(totalOrderAmount) },
          { label: "最近消费", value: customer.lastOrderAt },
          { label: "下次预约", value: customer.nextBookingAt ?? "未预约" },
          { label: "活跃评分", value: customer.activeScore },
          { label: "流失预警", value: customer.churnRisk },
          {
            label: "标签",
            value: (
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink/65" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )
          }
        ]}
      />

      <section className="rounded-lg border border-line bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-black">预约情况</h4>
            <p className="mt-1 text-sm text-ink/55">展示用户历史预约、未来安排、支付方式和备注。</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              ["全部", customerOrders.length],
              ["待履约", upcomingOrders.length],
              ["金额", yen(totalOrderAmount)]
            ].map(([label, value]) => (
              <span className="rounded-lg bg-paper px-3 py-2" key={label}>
                <strong className="block text-base text-ink">{value}</strong>
                <span className="text-ink/45">{label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {customerOrders.slice(0, 6).map((order) => (
            <article className="rounded-lg border border-line bg-paper p-3" key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={order.status === "completed" ? "green" : order.status === "cancelled" || order.status === "refunded" ? "red" : "yellow"}>
                      {statusLabel(order.status)}
                    </Badge>
                    <Badge tone={order.paymentStatus === "paid" ? "green" : order.paymentStatus === "depositPaid" ? "blue" : order.paymentStatus === "refunded" ? "neutral" : "yellow"}>
                      {getPaymentLabel(order)}
                    </Badge>
                    <span className="text-xs font-bold text-ink/45">{order.bookedAt} · {order.area}</span>
                  </div>
                  <h5 className="mt-2 font-black">{order.itemName}</h5>
                  <p className="mt-1 text-sm text-ink/55">
                    {order.storeName ? `门店：${order.storeName}` : order.technicianName ? `技师：${order.technicianName}` : "待分配"}
                  </p>
                  {order.remark ? <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-ink/60">备注：{order.remark}</p> : null}
                </div>
                <strong className="text-lg text-moss">{yen(order.amount)}</strong>
              </div>
            </article>
          ))}
          {customerOrders.length === 0 ? <div className="rounded-lg bg-paper p-4 text-sm text-ink/55">暂无预约记录。</div> : null}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-black">动态投稿</h4>
            <p className="mt-1 text-sm text-ink/55">查看用户在动态里发布的内容，以及点赞和留言反馈。</p>
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
          {moments.map((post) => (
            <article className="rounded-lg border border-line bg-paper p-4" key={post.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="green">展示中</Badge>
                    <Badge tone="neutral">{post.visibility}</Badge>
                    <span className="text-xs font-bold text-ink/45">{post.postedAt} · {post.location}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/75">{post.content}</p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-right text-xs shadow-soft">
                  <p className="font-black text-moss">{post.serviceTitle}</p>
                  <p className="mt-1 text-ink/55">关联体验</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {post.images.map((image, index) => (
                  <img alt={`${post.author}动态图片${index + 1}`} className="h-24 w-full rounded-lg object-cover" key={`${post.id}-${image}`} src={image} />
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
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {["打标签", "发优惠券", "发送营销消息", "创建预约", "查看历史订单", "导出用户资料"].map((action) => (
          <Button key={action} size="sm" variant="secondary">
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function CRMPage() {
  const [selected, setSelected] = useState<Customer | null>(null);

  const renderTags = (customer: Customer) => {
    const visibleTags = customer.tags.slice(0, 3);
    const hiddenCount = Math.max(0, customer.tags.length - visibleTags.length);

    return (
      <div className="flex max-w-[260px] flex-wrap items-center gap-1.5">
        {visibleTags.map((tag) => (
          <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-bold text-ink/65" key={tag}>
            {tag}
          </span>
        ))}
        {hiddenCount > 0 && (
          <button
            className="focus-ring inline-grid h-7 w-7 place-items-center rounded-full border border-line bg-white text-xs font-black text-ink/55 hover:border-moss hover:text-moss"
            onClick={() => setSelected(customer)}
            type="button"
            aria-label={`查看 ${customer.name} 的用户详细信息卡`}
          >
            ...
          </button>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <ModuleShell
        title="用户管理"
        description="用户搜索、会员等级、标签、LTV、订单次数、最近消费、下次预约、活跃评分和流失预警统一管理。"
        actions={<Button>创建预约</Button>}
      >
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["用户总数", "248,900", "+9.1%"],
            ["高价值用户", "18,420", "+4.2%"],
            ["流失预警", "2,806", "-3.8%"],
            ["本周触达", "48,100", "+16.3%"]
          ].map(([label, value, change]) => (
            <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={label}>
              <p className="text-sm text-ink/55">{label}</p>
              <strong className="mt-2 block text-2xl">{value}</strong>
              <Badge className="mt-3" tone="green">{change}</Badge>
            </article>
          ))}
        </section>

        <div className="mt-5">
          <FilterBar
            searchPlaceholder="搜索用户姓名、手机号、标签"
            filters={[
              { label: "会员等级", options: [{ label: "Gold", value: "gold" }, { label: "Platinum", value: "platinum" }] },
              { label: "流失风险", options: [{ label: "低", value: "low" }, { label: "中", value: "medium" }, { label: "高", value: "high" }] },
              { label: "活跃评分", options: [{ label: "80+", value: "80" }, { label: "60+", value: "60" }] }
            ]}
          />
        </div>

        <div className="mt-4">
          <DataTable<Customer>
            columns={[
              {
                key: "name",
                title: "用户",
                render: (row) => (
                  <button className="focus-ring flex items-center gap-3 text-left" onClick={() => setSelected(row)} type="button">
                    <img alt={row.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-soft" src={getCustomerAvatar(row)} />
                    <span className="min-w-0">
                      <span className="block truncate font-black text-moss hover:underline">{row.name}</span>
                      <span className="mt-1 block truncate text-xs font-bold text-ink/45">{row.phone}</span>
                    </span>
                  </button>
                )
              },
              { key: "level", title: "等级", render: (row) => <MemberLevelBadge level={row.memberLevel} /> },
              { key: "tags", title: "标签", render: renderTags, width: "280px" },
              { key: "ltv", title: "LTV", render: (row) => yen(row.ltv) },
              { key: "orders", title: "订单次数", render: (row) => row.orderCount },
              { key: "last", title: "最近消费", render: (row) => row.lastOrderAt },
              { key: "score", title: "活跃评分", render: (row) => row.activeScore },
              { key: "risk", title: "流失预警", render: (row) => <Badge tone={row.churnRisk === "high" ? "red" : row.churnRisk === "medium" ? "yellow" : "green"}>{row.churnRisk}</Badge> }
            ]}
            rows={customers}
            onView={setSelected}
          />
        </div>
      </ModuleShell>

      <Drawer open={Boolean(selected)} title="用户详细信息卡" onClose={() => setSelected(null)}>
        {selected ? <CustomerProfile customer={selected} /> : null}
      </Drawer>
    </AdminLayout>
  );
}
