export type FulfillmentMode = "home" | "store";
export type OrderStatus =
  | "pending"
  | "unpaid"
  | "confirmed"
  | "scheduled"
  | "inService"
  | "completed"
  | "cancelled"
  | "refunding"
  | "refunded";

export type ReviewTone = "positive" | "neutral" | "negative" | "sensitive";
export type RoleKey =
  | "platformAdmin"
  | "operations"
  | "finance"
  | "support"
  | "merchantAdmin"
  | "storeManager"
  | "technician";

export interface City {
  id: string;
  name: string;
  prefecture: string;
  activeStores: number;
  activeTechnicians: number;
}

export interface Area {
  id: string;
  cityId: string;
  name: string;
  deliveryMinutes: number;
}

export interface Address {
  id: string;
  customerId: string;
  city: string;
  area: string;
  line1: string;
  line2?: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: RoleKey;
  avatar: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  memberLevel: string;
  tags: string[];
  ltv: number;
  orderCount: number;
  lastOrderAt: string;
  nextBookingAt?: string;
  activeScore: number;
  churnRisk: "low" | "medium" | "high";
}

export interface CpsReferral {
  id: string;
  referrerName: string;
  referrerType: "user" | "technician" | "merchant" | "partner";
  introducedType: "customer" | "business" | "technician" | "store";
  introducedName: string;
  introducedAt: string;
  assignedTo: string;
  commissionRule: string;
  payoutAmount: number;
  payoutDuration: string;
  condition: string;
  status: "active" | "pending" | "paused" | "ended";
}

export interface Merchant {
  id: string;
  name: string;
  status: "pending" | "active" | "rejected" | "suspended";
  categories: string[];
  city: string;
  commissionRate: number;
  settlementCycle: string;
  documents: string[];
}

export interface Store {
  id: string;
  merchantId: string;
  name: string;
  area: string;
  address: string;
  rating: number;
  reviewCount: number;
  priceLabel: string;
  tags: string[];
  openStatus: "open" | "resting" | "closed";
  nextSlot: string;
  cover: string;
  gallery: string[];
  description: string;
  rankLabel: string;
  businessHours: string;
  mode: FulfillmentMode;
}

export interface Staff {
  id: string;
  name: string;
  storeId: string;
  role: "storeManager" | "staff" | "therapist" | "driver" | "cleaner";
  status: "available" | "busy" | "off";
  rating: number;
  orderCount: number;
  income: number;
}

export interface Technician extends Staff {
  skills: string[];
  serviceAreas: string[];
  acceptRate: number;
  cancelRate: number;
  languages: string[];
  avatar: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  mode: FulfillmentMode | "both";
  hot: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  includes: string[];
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  name: string;
  mode: FulfillmentMode;
  priceFrom: number;
  rating: number;
  sales: number;
  summary: string;
  tags: string[];
  fastestArrival: string;
  serviceAreas: string[];
  technicianCount: number;
  cover: string;
  packages: ServicePackage[];
  notice: string[];
  flow: string[];
}

export interface Schedule {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "free" | "booked" | "blocked";
  orderId?: string;
}

export interface OrderTimeline {
  id: string;
  orderId: string;
  label: string;
  at: string;
  operator: string;
}

export interface Order {
  id: string;
  orderNo: string;
  mode: FulfillmentMode;
  status: OrderStatus;
  customerId: string;
  customerName: string;
  itemName: string;
  storeName?: string;
  technicianName?: string;
  city: string;
  area: string;
  amount: number;
  paymentStatus: "paid" | "unpaid" | "depositPaid" | "refunded";
  bookedAt: string;
  createdAt: string;
  source: "app" | "web" | "line" | "partner";
  remark?: string;
}

export interface FieldJob {
  id: string;
  orderId: string;
  status: "pendingDispatch" | "dispatched" | "inService" | "completed" | "exception";
  address: string;
  serviceTime: string;
  serviceContent: string;
  technicianName?: string;
  phone: string;
  quote: number;
  exceptionNote?: string;
}

export interface Coupon {
  id: string;
  name: string;
  type: "newUser" | "return" | "limited" | "threshold";
  value: string;
  issued: number;
  claimed: number;
  redeemed: number;
  gmv: number;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  roi: number;
  attribution: string;
  status: "draft" | "active" | "paused" | "finished";
}

export interface Review {
  id: string;
  customerName: string;
  targetName: string;
  rating: number;
  tone: ReviewTone;
  content: string;
  createdAt: string;
  replied: boolean;
}

export interface InventoryItem {
  id: string;
  storeName: string;
  name: string;
  category: string;
  image: string;
  stock: number;
  warningLine: number;
  unit: string;
  lastChangedAt: string;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  type: "purchase" | "transfer" | "inbound" | "outbound" | "consume";
  quantity: number;
  operator: string;
  at: string;
}

export interface Settlement {
  id: string;
  merchantName: string;
  period: string;
  grossAmount: number;
  platformFee: number;
  refundAmount: number;
  payableAmount: number;
  status: "pending" | "reviewing" | "paid";
}

export interface Refund {
  id: string;
  orderNo: string;
  customerName: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "paid";
}

export interface Payment {
  id: string;
  orderNo: string;
  channel: "card" | "paypay" | "konbini" | "cash";
  amount: number;
  fee: number;
  paidAt: string;
}

export interface Permission {
  id: string;
  module: string;
  view: boolean;
  edit: boolean;
  export: boolean;
  approve: boolean;
  refund: boolean;
  settle: boolean;
}

export interface Role {
  id: RoleKey;
  name: string;
  permissions: Permission[];
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  tone: "good" | "warn" | "bad" | "neutral";
}
