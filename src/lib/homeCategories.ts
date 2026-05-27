export type HomeCategoryId = "cleaning" | "massage" | "recycle" | "pet" | "business" | "store";

export interface HomeCategoryOption {
  id: HomeCategoryId;
  label: string;
  iconId: string;
  to: string;
  caption: string;
}

const storageKey = "needo.home.categories";

export const homeCategoryOptions: HomeCategoryOption[] = [
  { id: "cleaning", label: "家政保洁", iconId: "cleaning", to: "/services?category=cleaning", caption: "日常、深度、厨卫" },
  { id: "massage", label: "上门按摩", iconId: "massage", to: "/services?category=massage", caption: "肩颈、全身、深夜" },
  { id: "recycle", label: "上门回收", iconId: "recycle", to: "/services?category=recycle", caption: "家电、家具、搬家杂物" },
  { id: "pet", label: "宠物相关", iconId: "pet", to: "/services?category=pet", caption: "喂养、遛狗、清洁陪伴" },
  { id: "business", label: "商务", iconId: "business", to: "/services?category=business", caption: "办公室、商旅、团建预约" },
  { id: "store", label: "门店预约", iconId: "dining", to: "/stores", caption: "美容、餐饮、护理到店" }
];

export const defaultHomeCategoryIds: HomeCategoryId[] = ["cleaning", "massage", "recycle", "pet", "business", "store"];

function normalizeHomeCategoryIds(value: unknown): HomeCategoryId[] {
  if (!Array.isArray(value)) {
    return defaultHomeCategoryIds;
  }

  const validIds = new Set(homeCategoryOptions.map((item) => item.id));
  const migrated = value.map((item) => (item === "other" ? "business" : item));
  const next = migrated.filter((item): item is HomeCategoryId => typeof item === "string" && validIds.has(item as HomeCategoryId));
  const unique = Array.from(new Set(next));

  return unique.length ? unique : defaultHomeCategoryIds;
}

export function getStoredHomeCategoryIds() {
  if (typeof window === "undefined") {
    return defaultHomeCategoryIds;
  }

  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return defaultHomeCategoryIds;
  }

  try {
    return normalizeHomeCategoryIds(JSON.parse(stored));
  } catch {
    return defaultHomeCategoryIds;
  }
}

export function saveHomeCategoryIds(ids: HomeCategoryId[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(normalizeHomeCategoryIds(ids)));
}
