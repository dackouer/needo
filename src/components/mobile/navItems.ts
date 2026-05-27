import type { MobileNavItem } from "./MobileShell";

export const userNavItems: MobileNavItem[] = [
  { label: "首页", to: "/", icon: "home" },
  { label: "动态", to: "/moments", icon: "moments" },
  { label: "预约一览", to: "/orders", icon: "booking" },
  { label: "NeeDo", to: "/needo", icon: "needo", featured: true },
  { label: "通讯录", to: "/contacts", icon: "contacts" },
  { label: "信息", to: "/messages", icon: "message" },
  { label: "我的", to: "/me", icon: "me" }
];

export const merchantNavItems: MobileNavItem[] = [
  { label: "首页", to: "/merchant", icon: "home" },
  { label: "日程", to: "/merchant/schedule", icon: "schedule" },
  { label: "动态", to: "/merchant/moments", icon: "moments" },
  { label: "NeeDo", to: "/merchant/needo", icon: "needo", featured: true },
  { label: "通讯录", to: "/merchant/contacts", icon: "contacts" },
  { label: "信息", to: "/merchant/messages", icon: "message" },
  { label: "我的", to: "/merchant/me", icon: "me" }
];

export const technicianNavItems: MobileNavItem[] = [
  { label: "首页", to: "/technician", icon: "home" },
  { label: "日程", to: "/technician/schedule", icon: "schedule" },
  { label: "动态", to: "/technician/moments", icon: "moments" },
  { label: "NeeDo", to: "/technician/needo", icon: "needo", featured: true },
  { label: "通讯录", to: "/technician/contacts", icon: "contacts" },
  { label: "信息", to: "/technician/messages", icon: "message" },
  { label: "我的", to: "/technician/me", icon: "me" }
];
