import type {
  Campaign,
  City,
  Coupon,
  CpsReferral,
  Customer,
  FieldJob,
  InventoryItem,
  Merchant,
  Metric,
  Order,
  Review,
  Schedule,
  ServiceCategory,
  ServiceItem,
  Settlement,
  Store,
  Technician
} from "../types/domain";

export type TechnicianMomentComment = {
  id: string;
  userName: string;
  content: string;
  at: string;
};

export type TechnicianMomentPost = {
  id: string;
  technicianId: string;
  technicianName: string;
  role: string;
  postedAt: string;
  location: string;
  visibility: "公开" | "仅关注者" | "仅预约客户";
  content: string;
  images: string[];
  serviceTitle: string;
  servicePrice: number;
  likes: number;
  likedUsers: string[];
  comments: TechnicianMomentComment[];
  status: "visible" | "reviewing" | "hidden";
};

export const imageBank = {
  cleaning:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=85",
  massage:
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=85",
  nail:
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=85",
  restaurant:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85",
  cafe:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=85",
  repair:
    "https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?auto=format&fit=crop&w=1600&q=85",
  appliance: "/images/ac-cleaning.svg",
  moving:
    "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1600&q=85",
  pet:
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=85",
  care:
    "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&w=1600&q=85",
  salon:
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=85",
  home:
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85"
};

export const cities: City[] = [
  { id: "tokyo", name: "东京", prefecture: "東京都", activeStores: 328, activeTechnicians: 1240 },
  { id: "osaka", name: "大阪", prefecture: "大阪府", activeStores: 188, activeTechnicians: 690 },
  { id: "yokohama", name: "横滨", prefecture: "神奈川県", activeStores: 96, activeTechnicians: 315 },
  { id: "nagoya", name: "名古屋", prefecture: "愛知県", activeStores: 74, activeTechnicians: 221 }
];

export const serviceCategories: ServiceCategory[] = [
  { id: "cleaning", name: "家庭保洁", icon: "清", mode: "home", hot: true },
  { id: "repair", name: "上门维修", icon: "修", mode: "home", hot: true },
  { id: "massage", name: "上门按摩", icon: "按", mode: "home", hot: true },
  { id: "laundry", name: "衣物洗护", icon: "洗", mode: "home", hot: false },
  { id: "moving", name: "搬家拉货", icon: "搬", mode: "home", hot: false },
  { id: "appliance", name: "家电清洗", icon: "电", mode: "home", hot: true },
  { id: "install", name: "上门安装", icon: "装", mode: "home", hot: false },
  { id: "beauty", name: "上门美业", icon: "美", mode: "both", hot: true },
  { id: "nanny", name: "保姆月嫂", icon: "育", mode: "home", hot: false },
  { id: "care", name: "康养护理", icon: "护", mode: "home", hot: false },
  { id: "deep", name: "深度保洁", icon: "深", mode: "home", hot: true },
  { id: "glass", name: "擦玻璃", icon: "窗", mode: "home", hot: false },
  { id: "storage", name: "收纳整理", icon: "纳", mode: "home", hot: false },
  { id: "homecare", name: "家居养护", icon: "养", mode: "home", hot: false },
  { id: "recycle", name: "上门回收", icon: "收", mode: "home", hot: false },
  { id: "pet", name: "宠物相关", icon: "宠", mode: "home", hot: true },
  { id: "business", name: "商务", icon: "商", mode: "both", hot: true },
  { id: "dining", name: "餐饮预约", icon: "食", mode: "store", hot: true }
];

export const technicians: Technician[] = [
  {
    id: "tech-1",
    name: "佐藤 美咲",
    storeId: "store-1",
    role: "therapist",
    status: "available",
    rating: 4.96,
    orderCount: 1280,
    income: 684000,
    skills: ["肩颈调理", "女性可选", "中文 OK"],
    serviceAreas: ["新宿", "涩谷", "中野"],
    acceptRate: 96,
    cancelRate: 1.8,
    languages: ["日本語", "中文"],
    avatar:
      "https://images.unsplash.com/photo-1619946794135-5bc917a27793?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "tech-2",
    name: "田中 翔太",
    storeId: "store-2",
    role: "cleaner",
    status: "busy",
    rating: 4.88,
    orderCount: 932,
    income: 512000,
    skills: ["空调清洗", "水回り", "当日预约"],
    serviceAreas: ["品川", "目黑", "港区"],
    acceptRate: 93,
    cancelRate: 2.4,
    languages: ["日本語", "English"],
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "tech-3",
    name: "王 静",
    storeId: "store-3",
    role: "staff",
    status: "available",
    rating: 4.91,
    orderCount: 760,
    income: 438000,
    skills: ["美甲", "美睫", "上门美业"],
    serviceAreas: ["池袋", "上野", "文京"],
    acceptRate: 98,
    cancelRate: 1.2,
    languages: ["中文", "日本語"],
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
  }
];

const technicianExpansionSeeds: Array<
  Pick<Technician, "name" | "storeId" | "role" | "status" | "skills" | "serviceAreas" | "languages" | "avatar">
> = [
  {
    name: "高桥 莉子",
    storeId: "store-1",
    role: "therapist",
    status: "available",
    skills: ["深夜按摩", "肩颈调理", "酒店上门"],
    serviceAreas: ["六本木", "赤坂", "麻布十番"],
    languages: ["日本語", "中文"],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "山本 健太",
    storeId: "store-4",
    role: "cleaner",
    status: "busy",
    skills: ["家庭保洁", "水回り", "退去清扫"],
    serviceAreas: ["目黑", "品川", "大崎"],
    languages: ["日本語"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "林 佳怡",
    storeId: "store-2",
    role: "staff",
    status: "available",
    skills: ["美甲", "美睫", "中文预约"],
    serviceAreas: ["涩谷", "原宿", "表参道"],
    languages: ["中文", "日本語"],
    avatar: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "鈴木 真央",
    storeId: "store-1",
    role: "therapist",
    status: "off",
    skills: ["足底护理", "全身放松", "女性可选"],
    serviceAreas: ["银座", "东京站", "日本桥"],
    languages: ["日本語", "English"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "陈 浩然",
    storeId: "store-4",
    role: "cleaner",
    status: "available",
    skills: ["空调分解清洗", "家电清洗", "维修辅助"],
    serviceAreas: ["新宿", "中野", "杉并"],
    languages: ["中文", "日本語"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "田村 彩花",
    storeId: "store-2",
    role: "staff",
    status: "busy",
    skills: ["美业护理", "妆前护理", "当日预约"],
    serviceAreas: ["惠比寿", "代官山", "广尾"],
    languages: ["日本語"],
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Park Minho",
    storeId: "store-3",
    role: "staff",
    status: "available",
    skills: ["餐饮接待", "包间服务", "韩语 OK"],
    serviceAreas: ["惠比寿", "涩谷", "新大久保"],
    languages: ["한국어", "日本語", "English"],
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "小林 優奈",
    storeId: "store-1",
    role: "therapist",
    status: "available",
    skills: ["产后护理", "睡眠舒缓", "女性可选"],
    serviceAreas: ["池袋", "上野", "文京"],
    languages: ["日本語", "中文"],
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "王 明",
    storeId: "store-4",
    role: "cleaner",
    status: "busy",
    skills: ["搬家清扫", "大件回收", "现场报价"],
    serviceAreas: ["横滨", "川崎", "武藏小杉"],
    languages: ["中文", "日本語"],
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "中村 亮",
    storeId: "store-4",
    role: "driver",
    status: "available",
    skills: ["搬家拉货", "家具搬运", "路线规划"],
    serviceAreas: ["大阪市", "梅田", "难波"],
    languages: ["日本語"],
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Mia Lawson",
    storeId: "store-2",
    role: "staff",
    status: "available",
    skills: ["英文接待", "美睫", "旅游客预约"],
    serviceAreas: ["银座", "有乐町", "筑地"],
    languages: ["English", "日本語"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "森田 春",
    storeId: "store-1",
    role: "therapist",
    status: "busy",
    skills: ["运动放松", "腰背护理", "男性技师"],
    serviceAreas: ["涩谷", "三轩茶屋", "下北泽"],
    languages: ["日本語", "English"],
    avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "刘 欣怡",
    storeId: "store-2",
    role: "staff",
    status: "available",
    skills: ["上门美业", "皮肤管理", "中文 OK"],
    serviceAreas: ["池袋", "高田马场", "早稻田"],
    languages: ["中文", "日本語"],
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "伊藤 直树",
    storeId: "store-4",
    role: "cleaner",
    status: "off",
    skills: ["深度保洁", "窗户清洁", "办公室清扫"],
    serviceAreas: ["东京站", "丸之内", "日本桥"],
    languages: ["日本語"],
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "张 雨菲",
    storeId: "store-1",
    role: "therapist",
    status: "available",
    skills: ["精油护理", "女性可选", "深夜可约"],
    serviceAreas: ["新宿", "歌舞伎町", "四谷"],
    languages: ["中文", "日本語"],
    avatar: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "渡边 莲",
    storeId: "store-3",
    role: "staff",
    status: "available",
    skills: ["餐厅排班", "外语接待", "投诉处理"],
    serviceAreas: ["惠比寿", "目黑", "白金台"],
    languages: ["日本語", "English"],
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Kim Sooah",
    storeId: "store-2",
    role: "staff",
    status: "busy",
    skills: ["美甲设计", "韩式款式", "拍照返图"],
    serviceAreas: ["新大久保", "新宿", "原宿"],
    languages: ["한국어", "日本語"],
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Sofia Chen",
    storeId: "store-1",
    role: "therapist",
    status: "available",
    skills: ["英文服务", "旅行客护理", "芳疗"],
    serviceAreas: ["六本木", "银座", "东京塔"],
    languages: ["English", "中文", "日本語"],
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "松本 大地",
    storeId: "store-4",
    role: "cleaner",
    status: "busy",
    skills: ["宠物家庭保洁", "除味除菌", "定期服务"],
    serviceAreas: ["丰洲", "台场", "月岛"],
    languages: ["日本語"],
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "赵 安琪",
    storeId: "store-4",
    role: "cleaner",
    status: "available",
    skills: ["收纳整理", "衣橱规划", "照片验收"],
    serviceAreas: ["吉祥寺", "三鹰", "荻窪"],
    languages: ["中文", "日本語"],
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80"
  }
];

technicians.push(
  ...technicianExpansionSeeds.map((seed, index): Technician => ({
    id: `tech-grown-${String(index + 1).padStart(2, "0")}`,
    ...seed,
    rating: Number((4.74 + (index % 19) / 100).toFixed(2)),
    orderCount: 320 + index * 67 + (index % 4) * 28,
    income: 248000 + index * 36000 + (index % 5) * 15000,
    acceptRate: 89 + (index % 10),
    cancelRate: Number((1.1 + (index % 6) * 0.35).toFixed(1))
  }))
);

const technicianMomentContentSeeds = [
  "今天的肩颈护理预约很顺利，用户提前写清了酒店名和预算，准备时间少了很多。",
  "保洁前后对比已经上传，厨房油污和浴室水垢处理完以后，客户说下个月还会固定预约。",
  "晚间空档开放中，六本木和银座附近 22:00 后还可以接一单。",
  "宠物家庭服务完成，进门前确认猫咪位置真的很重要，照片已经回传给客户。",
  "新客第一次预约建议先选标准套餐，服务后再根据身体状态追加时间。",
  "今天有客户通过动态里的服务照片预约，真实记录比广告更容易建立信任。",
  "雨天移动时间会变长，已经把今晚的可预约时间往后预留 20 分钟。",
  "上门前会再次确认付款方式和服务内容，平台内沟通记录对双方都更安心。"
];

const technicianMomentServiceSeeds = [
  ["肩颈深层舒缓", 12800],
  ["两小时家庭保洁", 6800],
  ["空调分解清洗", 16800],
  ["宠物喂养陪伴", 5200],
  ["上门美业护理", 9800],
  ["深夜酒店按摩", 15800]
] as const;

const technicianMomentCommentSeeds = [
  ["林 小雨", "上次服务很准时，看到照片以后更放心。"],
  ["Mia Chen", "请问周五晚上还能约同一个担当吗？"],
  ["佐藤 健", "说明写得很清楚，适合第一次预约的人。"],
  ["高桥 由美", "服务前提醒很有帮助，已经收藏了。"],
  ["王 可欣", "照片对比很直观，下次想试深度套餐。"],
  ["Daniel Smith", "English support is very helpful."],
  ["山田 莉奈", "夜间预约信息更新得很及时。"],
  ["陈 明浩", "预算和时间写清楚以后派单确实更快。"]
] as const;

export const technicianMoments: TechnicianMomentPost[] = technicians.flatMap((technician, technicianIndex) =>
  Array.from({ length: 2 }, (_, postIndex): TechnicianMomentPost => {
    const sequence = technicianIndex * 2 + postIndex;
    const service = technicianMomentServiceSeeds[sequence % technicianMomentServiceSeeds.length];
    const commentStart = sequence % technicianMomentCommentSeeds.length;
    const comments = Array.from({ length: 2 + (sequence % 3) }, (_, commentIndex): TechnicianMomentComment => {
      const commentSeed = technicianMomentCommentSeeds[(commentStart + commentIndex) % technicianMomentCommentSeeds.length];

      return {
        id: `${technician.id}-moment-${postIndex + 1}-comment-${commentIndex + 1}`,
        userName: commentSeed[0],
        content: commentSeed[1],
        at: commentIndex === 0 ? "今天 18:20" : `${commentIndex + 1}小时前`
      };
    });
    const imagePool = [imageBank.massage, imageBank.cleaning, imageBank.appliance, imageBank.pet, imageBank.salon, technician.avatar];

    return {
      id: `${technician.id}-moment-${postIndex + 1}`,
      technicianId: technician.id,
      technicianName: technician.name,
      role: technician.role === "therapist" ? "护理技师" : technician.role === "cleaner" ? "清洁技师" : "门店员工",
      postedAt: postIndex === 0 ? "今天 16:30" : `${2 + (technicianIndex % 9)}天前`,
      location: technician.serviceAreas[postIndex % technician.serviceAreas.length] ?? "东京",
      visibility: postIndex === 0 ? "公开" : technicianIndex % 3 === 0 ? "仅预约客户" : "仅关注者",
      content: technicianMomentContentSeeds[sequence % technicianMomentContentSeeds.length],
      images: [
        imagePool[sequence % imagePool.length],
        imagePool[(sequence + 2) % imagePool.length],
        imagePool[(sequence + 4) % imagePool.length]
      ].slice(0, postIndex === 0 ? 3 : 2),
      serviceTitle: service[0],
      servicePrice: service[1],
      likes: 36 + sequence * 7 + (technician.orderCount % 21),
      likedUsers: technicianMomentCommentSeeds
        .slice(0, 4 + (sequence % 3))
        .map((commentSeed) => commentSeed[0]),
      comments,
      status: sequence % 17 === 0 ? "reviewing" : "visible"
    };
  })
);

export const services: ServiceItem[] = [
  {
    id: "svc-clean-1",
    categoryId: "cleaning",
    name: "两小时家庭日常保洁",
    mode: "home",
    priceFrom: 6800,
    rating: 4.86,
    sales: 18420,
    summary: "厨房、浴室、地面、除尘一站式整理，适合公寓日常维护。",
    tags: ["最快 45 分钟", "可中文沟通", "女性技师可选"],
    fastestArrival: "45 分钟",
    serviceAreas: ["东京 23 区", "横滨核心区", "大阪市"],
    technicianCount: 238,
    cover: imageBank.cleaning,
    packages: [
      {
        id: "pkg-clean-2h",
        name: "标准 2 小时",
        price: 6800,
        durationMinutes: 120,
        description: "1 人上门，适合 1LDK-2LDK 日常维护。",
        includes: ["厨房台面", "浴室洗面台", "地面吸尘拖洗", "垃圾分类协助"]
      },
      {
        id: "pkg-clean-3h",
        name: "深度 3 小时",
        price: 9800,
        durationMinutes: 180,
        description: "覆盖水回り重点污渍与收纳归位。",
        includes: ["油污清理", "浴室水垢", "柜面擦拭", "阳台地面"]
      }
    ],
    notice: ["请提前准备停车信息", "不包含高空玻璃外侧", "宠物家庭请备注"],
    flow: ["下单预约", "平台确认", "技师到达", "现场验收", "评价售后"]
  },
  {
    id: "svc-massage-1",
    categoryId: "massage",
    name: "上门肩颈舒缓按摩",
    mode: "home",
    priceFrom: 8800,
    rating: 4.93,
    sales: 12680,
    summary: "专业理疗师携带一次性用品到家服务，支持深夜与女性技师。",
    tags: ["深夜可约", "女性可选", "日中英服务"],
    fastestArrival: "60 分钟",
    serviceAreas: ["新宿", "涩谷", "港区", "中野"],
    technicianCount: 92,
    cover: imageBank.massage,
    packages: [
      {
        id: "pkg-massage-60",
        name: "舒缓 60 分钟",
        price: 8800,
        durationMinutes: 60,
        description: "肩颈背部放松，适合久坐疲劳。",
        includes: ["肩颈调理", "背部放松", "热敷", "一次性床单"]
      },
      {
        id: "pkg-massage-90",
        name: "全身 90 分钟",
        price: 12800,
        durationMinutes: 90,
        description: "覆盖肩颈、腰背、腿部。",
        includes: ["全身经络", "腿部拉伸", "头部放松", "护理建议"]
      }
    ],
    notice: ["孕期、术后请先咨询客服", "服务人员不提供医疗诊断", "请准备安静空间"],
    flow: ["选择技师", "确认时间", "到家准备", "服务中", "完成评价"]
  },
  {
    id: "svc-appliance-1",
    categoryId: "appliance",
    name: "空调分解清洗",
    mode: "home",
    priceFrom: 11800,
    rating: 4.79,
    sales: 8904,
    summary: "壁挂式空调拆盖清洗，包含防霉处理与作业前后拍照。",
    tags: ["拍照验收", "水回り保护", "企业可开票"],
    fastestArrival: "今日 18:00",
    serviceAreas: ["东京 23 区", "川崎", "埼玉南部"],
    technicianCount: 74,
    cover: imageBank.appliance,
    packages: [
      {
        id: "pkg-ac-basic",
        name: "普通壁挂式",
        price: 11800,
        durationMinutes: 90,
        description: "普通壁挂空调分解清洗。",
        includes: ["外壳拆洗", "蒸发器冲洗", "防霉喷涂", "作业保护"]
      },
      {
        id: "pkg-ac-robot",
        name: "自动清扫机型",
        price: 16800,
        durationMinutes: 150,
        description: "带自动清扫功能机型专用。",
        includes: ["控制部保护", "分体拆洗", "排水检查", "完工拍照"]
      }
    ],
    notice: ["高处外机另行报价", "请确认电源可用", "10 年以上机型需现场确认"],
    flow: ["机型确认", "预约上门", "保护施工", "清洗试机", "验收付款"]
  },
  {
    id: "svc-beauty-1",
    categoryId: "beauty",
    name: "上门美甲美睫护理",
    mode: "home",
    priceFrom: 7600,
    rating: 4.9,
    sales: 6420,
    summary: "精选美业老师上门，支持通勤前、下班后与周末预约。",
    tags: ["作品可看", "可选款式", "女性技师"],
    fastestArrival: "明日 10:00",
    serviceAreas: ["池袋", "上野", "文京", "丰岛"],
    technicianCount: 43,
    cover: imageBank.nail,
    packages: [
      {
        id: "pkg-nail",
        name: "单色/跳色美甲",
        price: 7600,
        durationMinutes: 90,
        description: "基础护理与单色设计。",
        includes: ["卸甲", "修型", "甲面护理", "凝胶上色"]
      },
      {
        id: "pkg-eyelash",
        name: "自然款美睫",
        price: 9800,
        durationMinutes: 120,
        description: "自然浓密度设计。",
        includes: ["眼型评估", "材质选择", "嫁接", "护理卡"]
      }
    ],
    notice: ["请确认桌面与照明", "复杂款式需提前发图", "敏感体质请备注"],
    flow: ["选择款式", "技师确认", "上门服务", "护理说明", "晒单评价"]
  }
];

const serviceExpansionSeeds = [
  {
    categoryId: "cleaning",
    name: "家政保洁",
    summary: "覆盖日常保洁、水回り、退房清扫和固定周期维护，适合长期居住家庭。",
    tags: ["可固定阿姨", "水回り重点", "中文沟通"],
    cover: imageBank.cleaning,
    basePrice: 6200,
    duration: 120,
    includes: ["厨房清洁", "浴室洗面台", "地面吸尘拖洗", "垃圾分类协助"]
  },
  {
    categoryId: "massage",
    name: "上门按摩",
    summary: "认证理疗师上门服务，支持肩颈、腰背、全身放松和深夜预约。",
    tags: ["深夜可约", "女性可选", "日中英服务"],
    cover: imageBank.massage,
    basePrice: 8600,
    duration: 60,
    includes: ["肩颈调理", "腰背放松", "热敷护理", "护理建议"]
  },
  {
    categoryId: "recycle",
    name: "上门回收",
    summary: "旧家电、家具、纸箱和搬家杂物预约回收，报价透明，可拍照预估。",
    tags: ["拍照估价", "当日可约", "可开收据"],
    cover: imageBank.moving,
    basePrice: 4800,
    duration: 45,
    includes: ["上门搬出", "分类回收", "楼梯搬运确认", "回收记录"]
  },
  {
    categoryId: "pet",
    name: "宠物相关",
    summary: "宠物喂养、遛狗、猫砂清理、洗护接送和短时陪伴，支持多宠家庭。",
    tags: ["猫狗友好", "到家打卡", "照片回传"],
    cover: imageBank.pet,
    basePrice: 5200,
    duration: 60,
    includes: ["上门喂养", "环境整理", "照片回传", "异常提醒"]
  },
  {
    categoryId: "business",
    name: "商务服务",
    summary: "办公室保洁、商旅按摩、接待预约和团队福利服务，支持企业月结与发票。",
    tags: ["企业可开票", "月结", "团队预约"],
    cover: imageBank.home,
    basePrice: 12800,
    duration: 90,
    includes: ["需求确认", "人员安排", "现场履约", "发票记录"]
  }
];

services.push(
  ...Array.from({ length: 100 }, (_, index): ServiceItem => {
    const seed = serviceExpansionSeeds[index % serviceExpansionSeeds.length];
    const sequence = index + 1;
    const price = seed.basePrice + (index % 9) * 600;
    const duration = seed.duration + (index % 3) * 30;
    const cityAreas = [
      ["东京 23 区", "横滨核心区", "川崎"],
      ["新宿", "涩谷", "中野", "杉并"],
      ["目黑", "品川", "港区"],
      ["池袋", "上野", "文京", "丰岛"]
    ][index % 4];

    return {
      id: `svc-grown-${String(sequence).padStart(3, "0")}`,
      categoryId: seed.categoryId,
      name: `${seed.name} ${sequence} 号套餐`,
      mode: "home",
      priceFrom: price,
      rating: Number((4.62 + (index % 33) / 100).toFixed(2)),
      sales: 820 + index * 137,
      summary: seed.summary,
      tags: [...seed.tags, sequence % 2 === 0 ? "本周热订" : "复购高"],
      fastestArrival: sequence % 3 === 0 ? "今日 18:00" : sequence % 3 === 1 ? "最快 45 分钟" : "明日 10:00",
      serviceAreas: cityAreas,
      technicianCount: 18 + (index % 42),
      cover: seed.cover,
      packages: [
        {
          id: `pkg-grown-${String(sequence).padStart(3, "0")}-basic`,
          name: "安心标准",
          price,
          durationMinutes: duration,
          description: "适合日常预约，平台会按区域和评分自动推荐合适服务人员。",
          includes: seed.includes
        },
        {
          id: `pkg-grown-${String(sequence).padStart(3, "0")}-plus`,
          name: "深度加强",
          price: price + 3200,
          durationMinutes: duration + 45,
          description: "适合重点需求、长期维护或需要更完整验收记录的家庭。",
          includes: [...seed.includes.slice(0, 3), "完工拍照验收"]
        }
      ],
      notice: ["请提前确认地址与门禁", "如需指定性别或语言请备注", "超出标准范围会现场确认报价"],
      flow: ["选择服务", "确认时间", "平台派单", "上门服务", "完成评价"]
    };
  })
);

export const stores: Store[] = [
  {
    id: "store-1",
    merchantId: "merchant-1",
    name: "GINZA Calm Body Lab",
    area: "银座",
    address: "東京都中央区銀座3-4-12",
    rating: 4.72,
    reviewCount: 1286,
    priceLabel: "¥8,000-¥15,000",
    tags: ["肩颈调理", "女性友好", "中文预约"],
    openStatus: "open",
    nextSlot: "今日 19:30",
    cover: imageBank.massage,
    gallery: [imageBank.massage, imageBank.salon, imageBank.home],
    description: "安静私密的身体护理门店，适合下班后放松与长期调理。",
    rankLabel: "银座放松护理 TOP 3",
    businessHours: "11:00-23:00",
    mode: "store"
  },
  {
    id: "store-2",
    merchantId: "merchant-2",
    name: "Shibuya Nail Atelier",
    area: "涩谷",
    address: "東京都渋谷区神南1-18-2",
    rating: 4.65,
    reviewCount: 872,
    priceLabel: "¥6,500-¥12,000",
    tags: ["美甲", "美睫", "当日可约"],
    openStatus: "open",
    nextSlot: "明日 12:00",
    cover: imageBank.nail,
    gallery: [imageBank.nail, imageBank.salon, imageBank.cafe],
    description: "年轻设计师团队，款式更新快，适合通勤与周末约会前护理。",
    rankLabel: "涩谷美甲热门",
    businessHours: "10:00-21:00",
    mode: "store"
  },
  {
    id: "store-3",
    merchantId: "merchant-3",
    name: "恵比寿 炭火と旬菜",
    area: "惠比寿",
    address: "東京都渋谷区恵比寿南2-7-8",
    rating: 4.18,
    reviewCount: 1940,
    priceLabel: "人均 ¥5,000",
    tags: ["居酒屋", "包间", "中文菜单"],
    openStatus: "resting",
    nextSlot: "今日 20:15",
    cover: imageBank.restaurant,
    gallery: [imageBank.restaurant, imageBank.cafe, imageBank.home],
    description: "炭火串烧与季节小菜，支持小型聚会和商务预约。",
    rankLabel: "惠比寿居酒屋收藏榜",
    businessHours: "17:00-24:00",
    mode: "store"
  },
  {
    id: "store-4",
    merchantId: "merchant-4",
    name: "Meguro Home Clean Base",
    area: "目黑",
    address: "東京都目黒区下目黒2-14-5",
    rating: 4.58,
    reviewCount: 622,
    priceLabel: "¥6,800 起",
    tags: ["家庭保洁", "水回り", "企业清扫"],
    openStatus: "open",
    nextSlot: "今日 17:00",
    cover: imageBank.cleaning,
    gallery: [imageBank.cleaning, imageBank.home, imageBank.repair],
    description: "覆盖家庭与小型办公室的清洁团队，支持固定周期服务。",
    rankLabel: "目黑保洁复购榜",
    businessHours: "08:00-20:00",
    mode: "store"
  }
];

export const customers: Customer[] = [
  {
    id: "cus-1",
    name: "林 小雨",
    phone: "+81 80-2345-7812",
    memberLevel: "Gold",
    tags: ["高频", "中文", "夜间服务", "酒店上门", "平台预付", "按摩复购"],
    ltv: 286000,
    orderCount: 38,
    lastOrderAt: "2026-04-11 20:10",
    nextBookingAt: "2026-04-16 19:00",
    activeScore: 92,
    churnRisk: "low"
  },
  {
    id: "cus-2",
    name: "佐藤 健",
    phone: "+81 90-1188-2300",
    memberLevel: "Silver",
    tags: ["居酒屋", "周末", "线下支付", "涩谷", "朋友聚餐"],
    ltv: 98000,
    orderCount: 12,
    lastOrderAt: "2026-04-08 18:40",
    activeScore: 64,
    churnRisk: "medium"
  },
  {
    id: "cus-3",
    name: "Mia Chen",
    phone: "+81 70-8812-4301",
    memberLevel: "Platinum",
    tags: ["英文", "美业", "复购", "银座", "指名技师", "高客单"],
    ltv: 418000,
    orderCount: 54,
    lastOrderAt: "2026-04-12 11:30",
    nextBookingAt: "2026-04-19 13:00",
    activeScore: 96,
    churnRisk: "low"
  }
];

customers.push(
  ...Array.from({ length: 30 }, (_, index): Customer => {
    const names = [
      "高桥 由美", "山田 莉奈", "陈 明浩", "Kim Hana", "鈴木 一郎", "王 可欣",
      "田村 直子", "Lucas Park", "小林 美月", "中村 翔", "Emily Wong", "赵 晨",
      "森田 彩", "伊藤 亮", "周 佳怡", "Daniel Smith", "林 俊介", "加藤 真央",
      "黄 诗语", "渡边 蓮", "Aiko Tan", "石井 優", "刘 佳", "佐々木 凛",
      "Marina Lee", "张 宇", "松本 葵", "Kenta Mori", "许 静", "Noah Chen"
    ];
    const levels = ["Silver", "Gold", "Platinum", "Black"] as const;
    const tagPool = [
      ["保洁", "复购", "白天", "水回り", "家庭客户"],
      ["按摩", "夜间", "中文", "酒店上门", "平台担保", "女性可选"],
      ["宠物", "周末", "新宿", "猫狗照护", "照片回传"],
      ["到店", "美容", "英文", "银座", "指名员工", "高评分"],
      ["企业", "月结", "银座", "发票", "团队预约", "长期客户"],
      ["回收", "搬家", "急单", "现金偏好", "大件处理"]
    ];
    const day = 1 + (index % 12);
    const nextDay = 14 + (index % 12);
    const risk: Customer["churnRisk"] = index % 11 === 0 ? "high" : index % 5 === 0 ? "medium" : "low";

    return {
      id: `cus-grown-${String(index + 1).padStart(2, "0")}`,
      name: names[index],
      phone: `+81 80-${String(3300 + index * 17).padStart(4, "0")}-${String(6100 + index * 23).padStart(4, "0")}`,
      memberLevel: levels[index % levels.length],
      tags: tagPool[index % tagPool.length],
      ltv: 68000 + index * 13800,
      orderCount: 5 + (index % 18) * 3,
      lastOrderAt: `2026-04-${String(day).padStart(2, "0")} ${String(9 + (index % 12)).padStart(2, "0")}:${index % 2 === 0 ? "00" : "30"}`,
      nextBookingAt: index % 4 === 0 ? undefined : `2026-04-${String(nextDay).padStart(2, "0")} ${String(10 + (index % 10)).padStart(2, "0")}:00`,
      activeScore: 58 + (index * 7) % 42,
      churnRisk: risk
    };
  })
);

export const orders: Order[] = [
  {
    id: "ord-1",
    orderNo: "ND202604120001",
    mode: "home",
    status: "scheduled",
    customerId: "cus-1",
    customerName: "林 小雨",
    itemName: "上门肩颈舒缓按摩 90 分钟",
    technicianName: "佐藤 美咲",
    city: "东京",
    area: "新宿",
    amount: 12800,
    paymentStatus: "paid",
    bookedAt: "2026-04-12 21:00",
    createdAt: "2026-04-12 18:35",
    source: "app",
    remark: "需要女性技师，公寓有门禁。"
  },
  {
    id: "ord-2",
    orderNo: "ND202604120002",
    mode: "store",
    status: "confirmed",
    customerId: "cus-2",
    customerName: "佐藤 健",
    itemName: "双人居酒屋席位预约",
    storeName: "恵比寿 炭火と旬菜",
    city: "东京",
    area: "惠比寿",
    amount: 2000,
    paymentStatus: "depositPaid",
    bookedAt: "2026-04-12 20:15",
    createdAt: "2026-04-12 16:08",
    source: "web"
  },
  {
    id: "ord-3",
    orderNo: "ND202604110014",
    mode: "home",
    status: "inService",
    customerId: "cus-3",
    customerName: "Mia Chen",
    itemName: "空调分解清洗",
    technicianName: "田中 翔太",
    city: "东京",
    area: "品川",
    amount: 16800,
    paymentStatus: "paid",
    bookedAt: "2026-04-12 15:30",
    createdAt: "2026-04-11 22:20",
    source: "line",
    remark: "自动清扫机型。"
  },
  {
    id: "ord-4",
    orderNo: "ND202604100023",
    mode: "store",
    status: "refunding",
    customerId: "cus-1",
    customerName: "林 小雨",
    itemName: "美睫自然款",
    storeName: "Shibuya Nail Atelier",
    city: "东京",
    area: "涩谷",
    amount: 9800,
    paymentStatus: "paid",
    bookedAt: "2026-04-13 12:00",
    createdAt: "2026-04-10 09:18",
    source: "app",
    remark: "用户申请改期失败后退款。"
  }
];

const orderStatuses = ["pending", "unpaid", "confirmed", "scheduled", "inService", "completed", "cancelled", "refunding", "refunded"] as const;
const paymentStatuses = ["paid", "unpaid", "depositPaid", "refunded"] as const;
const orderSources = ["app", "web", "line", "partner"] as const;
const orderAreas = ["新宿", "涩谷", "银座", "目黑", "品川", "池袋", "上野", "中野", "横滨", "大阪"];

orders.push(
  ...Array.from({ length: 100 }, (_, index): Order => {
    const sequence = index + 5;
    const customer = customers[index % customers.length];
    const service = services[index % services.length];
    const store = stores[index % stores.length];
    const technician = technicians[index % technicians.length];
    const mode = service.mode;
    const day = 1 + (index % 28);
    const hour = 8 + (index % 14);
    const minute = index % 2 === 0 ? "00" : "30";
    const status = orderStatuses[index % orderStatuses.length];
    const paymentStatus = status === "refunded" ? "refunded" : paymentStatuses[index % paymentStatuses.length];

    return {
      id: `ord-grown-${String(sequence).padStart(3, "0")}`,
      orderNo: `ND202603${String(day).padStart(2, "0")}${String(1000 + sequence)}`,
      mode,
      status,
      customerId: customer.id,
      customerName: customer.name,
      itemName: service.name,
      storeName: mode === "store" ? store.name : undefined,
      technicianName: mode === "home" ? technician.name : undefined,
      city: index % 9 === 0 ? "大阪" : index % 7 === 0 ? "横滨" : "东京",
      area: orderAreas[index % orderAreas.length],
      amount: service.priceFrom + (index % 5) * 1200,
      paymentStatus,
      bookedAt: `2026-03-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${minute}`,
      createdAt: `2026-03-${String(Math.max(1, day - 1)).padStart(2, "0")} ${String(Math.max(7, hour - 2)).padStart(2, "0")}:${minute}`,
      source: orderSources[index % orderSources.length],
      remark: index % 4 === 0 ? "老客复购，偏好同一位服务人员。" : index % 4 === 1 ? "需要提前电话确认门禁。" : undefined
    };
  })
);

export const fieldJobs: FieldJob[] = [
  {
    id: "job-1",
    orderId: "ord-1",
    status: "dispatched",
    address: "東京都新宿区西新宿7-9-12",
    serviceTime: "2026-04-12 21:00",
    serviceContent: "肩颈舒缓按摩 90 分钟",
    technicianName: "佐藤 美咲",
    phone: "+81 80-2345-7812",
    quote: 12800
  },
  {
    id: "job-2",
    orderId: "ord-3",
    status: "inService",
    address: "東京都品川区大崎1-5-1",
    serviceTime: "2026-04-12 15:30",
    serviceContent: "自动清扫空调分解清洗",
    technicianName: "田中 翔太",
    phone: "+81 70-8812-4301",
    quote: 16800
  },
  {
    id: "job-3",
    orderId: "ord-5",
    status: "pendingDispatch",
    address: "大阪府大阪市北区梅田1-2-2",
    serviceTime: "2026-04-13 10:00",
    serviceContent: "搬家拉货 小型货车",
    phone: "+81 90-4412-5511",
    quote: 22000,
    exceptionNote: "需要确认停车位"
  }
];

export const merchants: Merchant[] = [
  {
    id: "merchant-1",
    name: "Calm Wellness 株式会社",
    status: "active",
    categories: ["上门按摩", "门店护理"],
    city: "东京",
    commissionRate: 16,
    settlementCycle: "T+7",
    documents: ["营业执照", "保险证明", "技师资质"]
  },
  {
    id: "merchant-2",
    name: "Urban Beauty Partners",
    status: "active",
    categories: ["美甲美睫"],
    city: "东京",
    commissionRate: 14,
    settlementCycle: "周结",
    documents: ["营业执照", "卫生许可"]
  },
  {
    id: "merchant-3",
    name: "関東 Dining Group",
    status: "pending",
    categories: ["餐饮预约"],
    city: "东京",
    commissionRate: 8,
    settlementCycle: "月结",
    documents: ["营业执照", "食品经营许可"]
  }
];

export const inventoryItems: InventoryItem[] = [
  {
    id: "inv-1",
    storeName: "GINZA Calm Body Lab",
    name: "一次性床单",
    category: "耗材",
    image: "https://images.unsplash.com/photo-1583845112203-454c7845f8ee?auto=format&fit=crop&w=520&q=80",
    stock: 86,
    warningLine: 120,
    unit: "张",
    lastChangedAt: "2026-04-12 09:12"
  },
  {
    id: "inv-2",
    storeName: "Shibuya Nail Atelier",
    name: "凝胶甲油 048",
    category: "美业耗材",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=520&q=80",
    stock: 18,
    warningLine: 10,
    unit: "瓶",
    lastChangedAt: "2026-04-11 20:30"
  },
  {
    id: "inv-3",
    storeName: "Meguro Home Clean Base",
    name: "空调清洗罩",
    category: "清洁工具",
    image: imageBank.appliance,
    stock: 7,
    warningLine: 12,
    unit: "套",
    lastChangedAt: "2026-04-12 13:44"
  }
];

export const coupons: Coupon[] = [
  {
    id: "coupon-1",
    name: "东京新用户 ¥1,000 OFF",
    type: "newUser",
    value: "满 ¥6,000 减 ¥1,000",
    issued: 18000,
    claimed: 9420,
    redeemed: 3180,
    gmv: 42800000
  },
  {
    id: "coupon-2",
    name: "周三回流券",
    type: "return",
    value: "8 折，最高 ¥2,000",
    issued: 6200,
    claimed: 2100,
    redeemed: 680,
    gmv: 9600000
  }
];

export const campaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "LINE 好友裂变预约",
    channel: "LINE",
    roi: 3.8,
    attribution: "邀请码 + 首单券",
    status: "active"
  },
  {
    id: "camp-2",
    name: "东京塔周边深夜按摩",
    channel: "SEO",
    roi: 2.4,
    attribution: "落地页 + 地区词",
    status: "active"
  },
  {
    id: "camp-3",
    name: "大阪家电清洗季",
    channel: "Google Ads",
    roi: 1.7,
    attribution: "关键词组",
    status: "paused"
  }
];

export const cpsReferrals: CpsReferral[] = [
  {
    id: "cps-1",
    referrerName: "林 小雨",
    referrerType: "user",
    introducedType: "customer",
    introducedName: "高桥 由美",
    introducedAt: "2026-04-01 12:20",
    assignedTo: "东京用户增长组",
    commissionRule: "1 年内每单 ¥500",
    payoutAmount: 500,
    payoutDuration: "1 年",
    condition: "被介绍客户完成支付订单后发放",
    status: "active"
  },
  {
    id: "cps-2",
    referrerName: "佐藤 美咲",
    referrerType: "technician",
    introducedType: "technician",
    introducedName: "山口 彩",
    introducedAt: "2026-03-28 18:10",
    assignedTo: "技师运营组",
    commissionRule: "百年内 20%",
    payoutAmount: 0,
    payoutDuration: "100 年",
    condition: "新技师个人订单平台佣金的 20%",
    status: "pending"
  },
  {
    id: "cps-3",
    referrerName: "Calm Wellness 株式会社",
    referrerType: "merchant",
    introducedType: "store",
    introducedName: "Aoyama Aroma Room",
    introducedAt: "2026-03-16 09:45",
    assignedTo: "商家拓展组",
    commissionRule: "永久支付 3%",
    payoutAmount: 0,
    payoutDuration: "永久",
    condition: "被介绍门店实收流水的 3%",
    status: "active"
  },
  {
    id: "cps-4",
    referrerName: "LINE 社群合伙人 Ken",
    referrerType: "partner",
    introducedType: "business",
    introducedName: "六本木酒店合作线索",
    introducedAt: "2026-02-21 22:30",
    assignedTo: "BD 夜间服务组",
    commissionRule: "签约后一次性 ¥80,000",
    payoutAmount: 80000,
    payoutDuration: "一次性",
    condition: "酒店合作完成首月 30 单后支付",
    status: "active"
  }
];

cpsReferrals.push(
  ...Array.from({ length: 24 }, (_, index): CpsReferral => {
    const types: CpsReferral["introducedType"][] = ["customer", "business", "technician", "store"];
    const refTypes: CpsReferral["referrerType"][] = ["user", "technician", "merchant", "partner"];
    const statuses: CpsReferral["status"][] = ["active", "pending", "paused", "ended"];
    const targetType = types[index % types.length];
    const referrer = index % 3 === 0 ? customers[index % customers.length].name : index % 3 === 1 ? technicians[index % technicians.length].name : merchants[index % merchants.length].name;
    const introducedName = targetType === "customer"
      ? customers[(index + 5) % customers.length].name
      : targetType === "technician"
        ? `推荐技师 ${index + 1}`
        : targetType === "store"
          ? `推荐门店 ${index + 1}`
          : `企业合作 ${index + 1}`;

    return {
      id: `cps-grown-${index + 1}`,
      referrerName: referrer,
      referrerType: refTypes[index % refTypes.length],
      introducedType: targetType,
      introducedName,
      introducedAt: `2026-03-${String(1 + (index % 28)).padStart(2, "0")} ${String(9 + (index % 12)).padStart(2, "0")}:00`,
      assignedTo: ["东京增长组", "商家拓展组", "技师运营组", "客服转介绍组"][index % 4],
      commissionRule: index % 4 === 0 ? "1 年内每单 ¥500" : index % 4 === 1 ? "百年内 20%" : index % 4 === 2 ? "永久支付 3%" : "一次性 ¥30,000",
      payoutAmount: index % 4 === 0 ? 500 : index % 4 === 3 ? 30000 : 0,
      payoutDuration: index % 4 === 0 ? "1 年" : index % 4 === 1 ? "100 年" : index % 4 === 2 ? "永久" : "一次性",
      condition: index % 2 === 0 ? "完成支付订单后自动计算" : "通过审核并完成首单后生效",
      status: statuses[index % statuses.length]
    };
  })
);

export const reviews: Review[] = [
  {
    id: "rev-1",
    customerName: "林 小雨",
    targetName: "佐藤 美咲",
    rating: 5,
    tone: "positive",
    content: "沟通很顺畅，肩颈放松效果明显，下次还会约。",
    createdAt: "2026-04-11 22:20",
    replied: true
  },
  {
    id: "rev-2",
    customerName: "佐藤 健",
    targetName: "恵比寿 炭火と旬菜",
    rating: 4,
    tone: "neutral",
    content: "菜品不错，但预约时间仍然等了 10 分钟。",
    createdAt: "2026-04-10 21:18",
    replied: false
  },
  {
    id: "rev-3",
    customerName: "Mia Chen",
    targetName: "空调分解清洗",
    rating: 2,
    tone: "negative",
    content: "师傅迟到，客服补偿处理及时，但体验需要改进。",
    createdAt: "2026-04-09 16:44",
    replied: false
  }
];

export const settlements: Settlement[] = [
  {
    id: "set-1",
    merchantName: "Calm Wellness 株式会社",
    period: "2026-04-01 - 2026-04-07",
    grossAmount: 3284000,
    platformFee: 525440,
    refundAmount: 48000,
    payableAmount: 2710560,
    status: "reviewing"
  },
  {
    id: "set-2",
    merchantName: "Urban Beauty Partners",
    period: "2026-04-01 - 2026-04-07",
    grossAmount: 1128000,
    platformFee: 157920,
    refundAmount: 9800,
    payableAmount: 960280,
    status: "pending"
  }
];

export const schedules: Schedule[] = [
  { id: "sch-1", staffId: "tech-1", date: "2026-04-12", startTime: "18:00", endTime: "20:00", status: "free" },
  { id: "sch-2", staffId: "tech-1", date: "2026-04-12", startTime: "21:00", endTime: "22:30", status: "booked", orderId: "ord-1" },
  { id: "sch-3", staffId: "tech-2", date: "2026-04-12", startTime: "15:30", endTime: "18:00", status: "booked", orderId: "ord-3" },
  { id: "sch-4", staffId: "tech-3", date: "2026-04-13", startTime: "10:00", endTime: "12:00", status: "free" }
];

schedules.push(
  ...technicians.flatMap((technician, technicianIndex) =>
    Array.from({ length: 5 }, (_, slotIndex): Schedule => {
      const month = slotIndex === 0 ? 3 : slotIndex === 4 ? 5 : 4;
      const day = 2 + ((technicianIndex * 3 + slotIndex * 5) % 25);
      const startHour = 9 + ((technicianIndex + slotIndex * 2) % 11);
      const statusPool: Schedule["status"][] = ["free", "booked", "blocked", "free", "booked"];
      const status = statusPool[(technicianIndex + slotIndex) % statusPool.length];

      return {
        id: `sch-grown-${technician.id}-${slotIndex + 1}`,
        staffId: technician.id,
        date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        startTime: `${String(startHour).padStart(2, "0")}:00`,
        endTime: `${String(Math.min(23, startHour + 2)).padStart(2, "0")}:00`,
        status,
        orderId: status === "booked" ? orders[(technicianIndex + slotIndex) % orders.length]?.id : undefined
      };
    })
  )
);

export const dashboardMetrics: Metric[] = [
  { label: "今日营收", value: "¥8,426,000", change: "+18.4%", tone: "good" },
  { label: "订单数", value: "1,284", change: "+9.2%", tone: "good" },
  { label: "新用户数", value: "428", change: "+12.8%", tone: "good" },
  { label: "活跃用户数", value: "18,920", change: "+6.1%", tone: "good" },
  { label: "复购率", value: "41.8%", change: "+3.4%", tone: "good" },
  { label: "取消率", value: "4.6%", change: "-0.8%", tone: "good" },
  { label: "退款率", value: "2.1%", change: "+0.3%", tone: "warn" },
  { label: "客单价", value: "¥6,562", change: "+5.7%", tone: "good" },
  { label: "员工利用率", value: "78.5%", change: "+4.2%", tone: "good" },
  { label: "库存预警数", value: "12", change: "+3", tone: "warn" },
  { label: "待处理工单", value: "36", change: "-8", tone: "neutral" },
  { label: "待审核商家", value: "19", change: "+5", tone: "warn" }
];

export const trendData = [
  { label: "4/6", revenue: 62, orders: 48, users: 35 },
  { label: "4/7", revenue: 76, orders: 55, users: 44 },
  { label: "4/8", revenue: 69, orders: 51, users: 42 },
  { label: "4/9", revenue: 88, orders: 67, users: 54 },
  { label: "4/10", revenue: 96, orders: 72, users: 61 },
  { label: "4/11", revenue: 102, orders: 84, users: 66 },
  { label: "4/12", revenue: 118, orders: 91, users: 73 }
];

export const platformOperatingStats = [
  { label: "累计服务订单", value: "386,420", caption: "上线 18 个月，东京复购占比最高" },
  { label: "认证商家", value: "1,284", caption: "本月新增 86 家，通过率 71%" },
  { label: "认证技师", value: "5,960", caption: "资质、保险、评价三重校验" },
  { label: "覆盖城市", value: "12", caption: "东京、大阪、横滨、名古屋优先运营" }
];

export const serviceGuarantees = [
  { title: "迟到自动补偿", caption: "超过承诺到达时间 15 分钟自动发券", metric: "本月触发 128 次" },
  { title: "资质与保险留档", caption: "商家营业资质、技师身份与保险到期前提醒", metric: "98.6% 已更新" },
  { title: "服务后 24h 售后", caption: "保洁、维修、家电清洗支持图片复核", metric: "平均响应 7m" }
];

export const userStories = [
  {
    name: "林 小雨",
    city: "东京 · 新宿",
    content: "固定保洁已经用了 5 个月，客服会提前提醒节假日排班，换人也能看到评分记录。",
    service: "家庭保洁",
    saved: 8200
  },
  {
    name: "佐藤 健",
    city: "东京 · 惠比寿",
    content: "餐饮预约和到店美容都在一个账号里，临时改期比以前打电话方便很多。",
    service: "到店预约",
    saved: 3600
  },
  {
    name: "Mia Chen",
    city: "品川 · 目黑",
    content: "空调清洗前后照片会留档，企业报销需要发票也能直接从订单里下载。",
    service: "家电清洗",
    saved: 12800
  }
];

export const cityOperatingStats = [
  {
    city: "东京",
    activeOrders: 1284,
    gmv: 8426000,
    repeatRate: "41.8%",
    avgResponse: "6m 40s",
    hotCategory: "上门按摩",
    supplyHealth: "充足"
  },
  {
    city: "大阪",
    activeOrders: 642,
    gmv: 3862000,
    repeatRate: "36.2%",
    avgResponse: "8m 12s",
    hotCategory: "家电清洗",
    supplyHealth: "补技师"
  },
  {
    city: "横滨",
    activeOrders: 328,
    gmv: 1940000,
    repeatRate: "32.9%",
    avgResponse: "7m 58s",
    hotCategory: "家庭保洁",
    supplyHealth: "稳定"
  },
  {
    city: "名古屋",
    activeOrders: 206,
    gmv: 1128000,
    repeatRate: "29.4%",
    avgResponse: "9m 35s",
    hotCategory: "维修安装",
    supplyHealth: "新城冷启"
  }
];

export const operationTimeline = [
  {
    at: "2026-04-12 21:40",
    title: "东京深夜按摩供给扩容",
    owner: "运营 / 东京城市组",
    detail: "新宿、涩谷 21:00 后可接单技师增加 18 人，预计等待时间下降 11 分钟。",
    status: "done"
  },
  {
    at: "2026-04-12 19:15",
    title: "LINE 回流券完成第一轮复盘",
    owner: "增长 / CRM",
    detail: "领取 2,100 张，核销 680 张，复购用户占 46%，ROI 3.8。",
    status: "done"
  },
  {
    at: "2026-04-12 16:30",
    title: "大阪空调清洗季库存预警",
    owner: "供应链 / 库存",
    detail: "清洗罩低于安全库存，已生成 2 张采购单并推送门店确认。",
    status: "processing"
  },
  {
    at: "2026-04-12 12:05",
    title: "餐饮预约候位投诉回访",
    owner: "客服 / 风控",
    detail: "惠比寿商圈 3 起等待超时已完成回访，1 家店铺进入服务质量观察。",
    status: "watching"
  },
  {
    at: "2026-04-11 22:20",
    title: "商家入驻审核批次归档",
    owner: "平台运营",
    detail: "本周通过 42 家，拒绝 9 家，主要拒绝原因是资质照片不完整。",
    status: "done"
  }
];

export const riskTickets = [
  {
    id: "risk-1",
    level: "P1",
    type: "差评预警",
    target: "空调分解清洗",
    city: "东京",
    owner: "客服组",
    sla: "剩余 18m",
    status: "处理中"
  },
  {
    id: "risk-2",
    level: "P2",
    type: "退款审核",
    target: "Shibuya Nail Atelier",
    city: "东京",
    owner: "财务组",
    sla: "剩余 2h",
    status: "待审核"
  },
  {
    id: "risk-3",
    level: "P2",
    type: "迟到补偿",
    target: "上门肩颈舒缓按摩",
    city: "大阪",
    owner: "运营组",
    sla: "剩余 4h",
    status: "待回访"
  },
  {
    id: "risk-4",
    level: "P3",
    type: "资质到期",
    target: "Calm Wellness 株式会社",
    city: "东京",
    owner: "商家运营",
    sla: "3 天",
    status: "已提醒"
  }
];

export const merchantHealthScores = [
  {
    merchant: "Calm Wellness 株式会社",
    score: 92,
    orders30d: 4820,
    replyRate: "98%",
    complaintRate: "1.2%",
    settlementStatus: "正常",
    action: "加大曝光"
  },
  {
    merchant: "Urban Beauty Partners",
    score: 84,
    orders30d: 2186,
    replyRate: "91%",
    complaintRate: "2.4%",
    settlementStatus: "待结算",
    action: "补充排班"
  },
  {
    merchant: "関東 Dining Group",
    score: 68,
    orders30d: 760,
    replyRate: "78%",
    complaintRate: "4.8%",
    settlementStatus: "审核中",
    action: "服务观察"
  }
];

export const permissionModules = [
  "Dashboard",
  "Analytics",
  "Orders",
  "Dispatch",
  "Field Jobs",
  "CRM",
  "Marketing",
  "Finance",
  "Reviews",
  "Merchants",
  "Inventory",
  "Floorplan"
];
