import { Link } from "react-router-dom";
import { ContactGroupIcon } from "../../components/mobile/ContactGroupIcon";
import { MobileShell } from "../../components/mobile/MobileShell";
import { Badge } from "../../components/ui/Badge";
import { customers, imageBank, stores, technicians } from "../../data/mock";

const contactGroups = [
  { label: "新朋友", caption: "8 个申请", icon: "new", tone: "bg-[#171717] text-lemon" },
  { label: "店铺组", caption: "12 家已收藏", icon: "stores", tone: "bg-[#171717] text-lemon" },
  { label: "个人技师", caption: "18 位关注", icon: "staff", tone: "bg-[#171717] text-lemon" },
  { label: "服务号", caption: "6 个通知", icon: "service", tone: "bg-[#171717] text-lemon" },
  { label: "黑名单", caption: "2 个联系人", icon: "blacklist", tone: "bg-[#171717] text-lemon" }
];

const followedContacts = [
  ...stores.map((store, index) => ({
    id: `store-${store.id}`,
    name: store.name,
    remark: index % 2 === 0 ? "常用预约门店" : "收藏门店",
    label: "店铺",
    tags: store.tags.slice(0, 3),
    avatar: store.cover,
    to: `/stores/${store.id}`
  })),
  ...technicians.map((technician, index) => ({
    id: `tech-${technician.id}`,
    name: technician.name,
    remark: index % 2 === 0 ? "关注的个人技师" : "最近服务担当",
    label: "个人",
    tags: technician.skills.slice(0, 3),
    avatar: technician.avatar,
    to: `/services/svc-massage-1?technician=${technician.id}`
  })),
  {
    id: "needo-support",
    name: "NeeDo 客服",
    remark: "平台服务号",
    label: "服务号",
    tags: ["退款", "改期", "投诉"],
    avatar: imageBank.home,
    to: "/messages"
  }
];

const regularContacts = customers.slice(0, 10).map((customer, index) => ({
  id: `customer-${customer.id}`,
  name: customer.name,
  remark: index % 3 === 0 ? "最近咨询过" : index % 3 === 1 ? "潜在预约客户" : "普通联系人",
  label: "非关注",
  tags: customer.tags.slice(0, 3),
  avatar: index % 2 === 0 ? imageBank.cafe : imageBank.home,
  to: "/messages?chat=user-customer"
}));

export function ContactsPage() {
  return (
    <MobileShell>
      <div className="space-y-4 px-4 py-4">
        <header className="rounded-lg bg-ink p-4 text-white shadow-soft">
          <p className="text-xs font-bold text-mint">NeeDo Contacts</p>
          <h1 className="mt-1 text-2xl font-black">通讯录</h1>
          <p className="mt-2 text-xs leading-5 text-white/65">店铺、个人技师、服务号和黑名单统一管理，常用联系人更好找。</p>
        </header>

        <section className="rounded-lg border border-line bg-white p-3 shadow-panel">
          <div className="grid grid-cols-5 gap-2">
            {contactGroups.map((group) => (
              <button className="rounded-lg bg-paper px-1 py-3 text-center" key={group.label} type="button">
                <span className={`mx-auto grid h-12 w-12 place-items-center rounded-full text-sm font-black ${group.tone}`}>
                  <ContactGroupIcon id={group.icon} label={group.label} />
                </span>
                <strong className="mt-2 block text-[11px] leading-4">{group.label}</strong>
                <span className="mt-1 block text-[10px] leading-4 text-ink/45">{group.caption}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black">关注列表</h2>
              <p className="mt-1 text-xs text-ink/50">用户名、备注名和自定义标签直接展示。</p>
            </div>
            <Badge tone="yellow">{followedContacts.length} 人</Badge>
          </div>
          <div className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line">
            {followedContacts.map((contact) => (
              <Link className="flex items-center gap-3 bg-white p-3 transition hover:bg-paper" key={contact.id} to={contact.to}>
                <img alt={contact.name} className="h-12 w-12 rounded-lg object-cover" src={contact.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm">{contact.name}</strong>
                    <span className="rounded-md bg-paper px-2 py-1 text-[10px] font-black text-ink/45">{contact.label}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-ink/50">备注名：{contact.remark}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {contact.tags.map((tag) => (
                      <span className="rounded-md bg-mint/20 px-2 py-1 text-[10px] font-bold text-moss" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black">非关注联系人</h2>
              <p className="mt-1 text-xs text-ink/50">最近沟通过但尚未关注的人，会自动沉淀在这里。</p>
            </div>
            <Badge tone="neutral">{regularContacts.length} 人</Badge>
          </div>
          <div className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line">
            {regularContacts.map((contact) => (
              <Link className="flex items-center gap-3 bg-white p-3 transition hover:bg-paper" key={contact.id} to={contact.to}>
                <img alt={contact.name} className="h-12 w-12 rounded-lg object-cover" src={contact.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm">{contact.name}</strong>
                    <span className="rounded-md bg-paper px-2 py-1 text-[10px] font-black text-ink/45">{contact.label}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-ink/50">备注名：{contact.remark}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {contact.tags.map((tag) => (
                      <span className="rounded-md bg-mint/20 px-2 py-1 text-[10px] font-bold text-moss" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
