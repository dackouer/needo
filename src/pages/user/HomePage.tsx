import { Link } from "react-router-dom";
import { useRef, useState, type ReactNode } from "react";
import { AvailabilityCalendar } from "../../components/mobile/AvailabilityCalendar";
import { CategoryIcon } from "../../components/mobile/CategoryIcon";
import { MobileShell } from "../../components/mobile/MobileShell";
import { SectionTitle } from "../../components/mobile/SectionTitle";
import { ServiceCard } from "../../components/mobile/ServiceCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { imageBank, reviews, services, stores, technicians } from "../../data/mock";
import { getStoredHomeCategoryIds, homeCategoryOptions } from "../../lib/homeCategories";
import { cn, yen } from "../../lib/utils";
import { useClientTheme } from "../../theme/ClientThemeProvider";
import type { ServiceItem, Store, Technician } from "../../types/domain";

const promotedFeatures = [
  {
    badge: "即时上门",
    title: "最短 45 分钟到达",
    caption: "保洁、按摩、回收、宠物服务已覆盖东京主要区域。",
    image: imageBank.cleaning,
    target: { type: "store", index: 3 } as const
  },
  {
    badge: "宠物到家",
    title: "猫狗照护与回传",
    caption: "喂养、遛狗、猫砂清理、短时陪伴，服务后自动回传照片。",
    image: imageBank.pet,
    target: { type: "technician", index: 0 } as const
  },
  {
    badge: "上门回收",
    title: "搬家前一键清空",
    caption: "旧家电、家具、纸箱和杂物可拍照预估，支持当日预约。",
    image: imageBank.moving,
    target: { type: "store", index: 3 } as const
  }
];

type NearbySelection = { type: "store"; item: Store } | { type: "technician"; item: Technician };

const detailTimeOptions = ["11:00", "14:00", "17:30", "20:30", "22:00"];
const weekLabels = ["日", "月", "火", "水", "木", "金", "土"];
const twoWeekSlots = Array.from({ length: 14 }, (_, index) => {
  const day = index + 14;
  const week = weekLabels[new Date(2026, 3, day).getDay()];
  const marks = ["◎", "○", "○", "△", "○", "○", "TEL", "○", "◎", "△", "○", "○", "○", "△"];

  return {
    day,
    week,
    mark: marks[index],
    left: index % 4 === 0 ? "余裕あり" : index % 4 === 1 ? "残り 4 枠" : index % 4 === 2 ? "残り 2 枠" : "要確認"
  };
});

const communityPhotoImages = [imageBank.cleaning, imageBank.massage, imageBank.restaurant, imageBank.pet, imageBank.home, imageBank.salon];

type DetailInfoSection = {
  title?: string;
  rows: Array<{ label: string; value: ReactNode }>;
};

type NearbyDetailPayload = {
  kind: string;
  name: string;
  area: string;
  address: string;
  cover: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  favoriteCount: number;
  priceLabel: string;
  holiday: string;
  todayStatus: string;
  intro: string;
  tags: string[];
  mapUrl: string;
  bookingHref: string;
  callLabel: string;
  requiresPrepay: boolean;
  depositAmount: number;
  paymentNote: string;
  infoSections: DetailInfoSection[];
  ownerPhotoTitle: string;
  menuTitle: string;
};

function googleMapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function formatBookingDate(date: Date) {
  const week = weekLabels[date.getDay()];

  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日（${week}）`;
}

function formatQueryDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPaymentPolicy(selection: NearbySelection, service: ServiceItem) {
  const needsDeposit = selection.type === "store" && (selection.item.tags.includes("包间") || service.tags.includes("团体预约"));

  return {
    requiresPrepay: needsDeposit,
    depositAmount: needsDeposit ? 2000 : 0,
    paymentNote: needsDeposit ? "该店家要求平台预付定金，余款到店或服务后结算。" : "默认无需平台预付，服务完成后可线下支付或按商家要求结算。"
  };
}

function MapPreview({ address, mapUrl }: { address: string; mapUrl: string }) {
  return (
    <div>
      <p>{address}</p>
      <a
        className="focus-ring relative mt-2 block h-28 overflow-hidden rounded-lg border border-line bg-[#eef2ee]"
        href={mapUrl}
        rel="noreferrer"
        target="_blank"
      >
        <div className="absolute inset-0 opacity-70">
          <span className="absolute left-2 top-7 h-px w-full rotate-6 bg-ink/10" />
          <span className="absolute left-0 top-16 h-px w-full -rotate-3 bg-ink/10" />
          <span className="absolute left-14 top-0 h-full w-px rotate-12 bg-ink/10" />
          <span className="absolute right-20 top-0 h-full w-px -rotate-12 bg-ink/10" />
        </div>
        <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral shadow-soft">
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </span>
        <span className="absolute bottom-2 right-3 rounded-full bg-white px-3 py-1 text-xs font-black text-ink shadow-panel">Google Map で見る</span>
      </a>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-paper px-3 py-3">
      <p className="text-[11px] font-bold text-ink/45">{label}</p>
      <strong className="mt-1 block text-sm text-ink">{value}</strong>
    </div>
  );
}

function TwoWeekBooking({
  selectedDay,
  onSelectDay,
  onOpenMonth
}: {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onOpenMonth: () => void;
}) {
  const selectedSlot = twoWeekSlots.find((slot) => slot.day === selectedDay);

  return (
    <section className="rounded-lg bg-[#11110f] p-5 text-white shadow-soft">
      <div>
        <h3 className="text-2xl font-black">最近两周预约</h3>
        <p className="mt-3 text-sm font-semibold text-[#b9b2a2]">◎ 余裕あり · ○ 可预约 · △ 少量空位 · TEL 请咨询</p>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {twoWeekSlots.map((slot) => (
          <button
            className={cn(
              "focus-ring flex min-h-[82px] flex-col items-center justify-center rounded-lg border px-1 py-2 text-center transition",
              selectedDay === slot.day ? "border-lemon bg-lemon/25 text-lemon" : "border-[#2d2819] bg-black text-white"
            )}
            key={slot.day}
            onClick={() => onSelectDay(slot.day)}
            type="button"
          >
            <span className={cn("text-xs font-black", slot.week === "日" && "text-coral", slot.week === "土" && "text-[#3a91df]")}>{slot.week}</span>
            <strong className="mt-1 text-lg">{slot.day}</strong>
            <span className={cn("mt-1 text-sm font-black", slot.mark === "TEL" ? "text-[#b9b2a2]" : "text-[#f08a00]")}>{slot.mark}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-black px-4 py-4">
        <p className="text-sm font-black text-[#b9b2a2]">
          4 月 {selectedDay} 日：<span className="text-white">{selectedSlot?.left ?? "可预约"}</span>
        </p>
        <button className="rounded-full bg-[#17130b] px-4 py-3 text-sm font-black text-lemon shadow-panel" onClick={onOpenMonth} type="button">
          更多预约情况
        </button>
      </div>
    </section>
  );
}

function BookingControls({
  people,
  onPeopleChange,
  time,
  onTimeChange
}: {
  people: string;
  onPeopleChange: (people: string) => void;
  time: string;
  onTimeChange: (time: string) => void;
}) {
  return (
    <section className="rounded-lg bg-[#11110f] p-5 text-white shadow-soft">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-black text-[#b9b2a2]">预约人数</span>
          <select
            className="mt-3 h-14 w-full rounded-full border border-[#352c12] bg-black px-5 text-lg font-black text-white outline-none"
            onChange={(event) => onPeopleChange(event.target.value)}
            value={people}
          >
            {["1名", "2名", "3名", "4名"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-black text-[#b9b2a2]">具体时间</span>
          <select
            className="mt-3 h-14 w-full rounded-full border border-[#352c12] bg-black px-5 text-lg font-black text-white outline-none"
            onChange={(event) => onTimeChange(event.target.value)}
            value={time}
          >
            {detailTimeOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function PhotoGrid({ images, title }: { images: string[]; title: string }) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <h3 className="text-lg font-black">{title}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {images.slice(0, 6).map((image, index) => (
          <img alt={`${title}-${index + 1}`} className="aspect-square rounded-lg object-cover" key={`${image}-${index}`} src={image} />
        ))}
      </div>
    </section>
  );
}

function ServiceMenu({
  highlight,
  onSelectService,
  selectedServiceId,
  title
}: {
  highlight?: boolean;
  onSelectService: (serviceId: string) => void;
  selectedServiceId?: string;
  title: string;
}) {
  return (
    <section className={cn("rounded-lg border bg-white p-4 shadow-panel transition", highlight ? "border-lemon ring-2 ring-lemon/35" : "border-line")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">{title}</h3>
          {highlight ? <p className="mt-1 text-xs font-black text-[#8a6400]">请先选择一个服务套餐，然后再继续预约。</p> : null}
        </div>
        {!selectedServiceId ? <Badge tone="yellow">未选择</Badge> : null}
      </div>
      <div className="mt-3 space-y-3">
        {services.slice(0, 5).map((service) => (
          <button
            className={cn(
              "focus-ring grid w-full grid-cols-[92px,1fr] gap-3 rounded-lg border p-2 text-left transition",
              selectedServiceId === service.id ? "border-lemon bg-lemon/20" : "border-transparent bg-paper"
            )}
            key={service.id}
            onClick={() => onSelectService(service.id)}
            type="button"
          >
            <img alt={service.name} className="h-24 w-[92px] rounded-lg object-cover" src={service.cover} />
            <div className="min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-1 text-sm font-black">{service.name}</p>
                {selectedServiceId === service.id ? <span className="shrink-0 rounded-full bg-ink px-2 py-1 text-[10px] font-black text-lemon">已选择</span> : null}
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/55">{service.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {service.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} tone="yellow">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="mt-2 text-xs font-black text-coral">
                {yen(service.priceFrom)} 起 · {service.packages[0]?.durationMinutes ?? 60} 分钟
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ReviewSection() {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <h3 className="text-lg font-black">网友评价</h3>
      <div className="mt-3 space-y-3">
        {reviews.map((review, index) => (
          <article className="rounded-lg bg-paper p-3" key={review.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black">{review.customerName}</p>
                <p className="mt-1 text-[11px] text-ink/45">{review.createdAt} · 东京 · 使用服务项目</p>
              </div>
              <span className="text-sm font-black text-coral">{"★".repeat(review.rating)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/65">{review.content}</p>
            <img alt={`${review.customerName} 上传照片`} className="mt-3 h-32 w-full rounded-lg object-cover" src={communityPhotoImages[index]} />
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoTable({ sections }: { sections: DetailInfoSection[] }) {
  return (
    <section className="rounded-lg border border-line bg-white shadow-panel">
      {sections.map((section, sectionIndex) => (
        <div key={section.title ?? `section-${sectionIndex}`}>
          {section.title ? <h3 className="border-b border-line px-4 py-3 text-base font-black">{section.title}</h3> : null}
          {section.rows.map((row) => (
            <div className="grid grid-cols-[104px,1fr] border-b border-line last:border-b-0" key={row.label}>
              <div className="bg-paper px-3 py-3 text-xs font-black text-ink/65">{row.label}</div>
              <div className="min-w-0 px-3 py-3 text-xs leading-6 text-ink/72">{row.value}</div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

function MonthBookingSheet({
  title,
  selectedDay,
  onSelectDay,
  selectedDate,
  onSelectDate,
  people,
  onPeopleChange,
  time,
  onTimeChange,
  onClose
}: {
  title: string;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  people: string;
  onPeopleChange: (people: string) => void;
  time: string;
  onTimeChange: (time: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55">
      <button className="absolute inset-0 cursor-default" onClick={onClose} type="button" aria-label="关闭月历" />
      <div className="relative max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-paper p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black">本月全部预约情况</h3>
          <button className="rounded-full bg-white px-4 py-2 text-xs font-black shadow-panel" onClick={onClose} type="button">
            完成
          </button>
        </div>
        <AvailabilityCalendar
          onPeopleChange={onPeopleChange}
          onSelectDate={onSelectDate}
          onSelectDay={onSelectDay}
          onTimeChange={onTimeChange}
          people={people}
          selectedDate={selectedDate}
          selectedDay={selectedDay}
          time={time}
          timeOptions={detailTimeOptions}
          title={title}
        />
      </div>
    </div>
  );
}

function NearbyDetailOverlay({
  selection,
  onClose,
  selectedDay,
  onSelectDay,
  selectedDate,
  onSelectDate,
  people,
  onPeopleChange,
  time,
  onTimeChange,
  selectedService,
  onSelectService,
  confirmOpen,
  submitted,
  onOpenConfirm,
  onCloseConfirm,
  onConfirmBooking,
  monthOpen,
  onOpenMonth,
  onCloseMonth
}: {
  selection: NearbySelection;
  onClose: () => void;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  people: string;
  onPeopleChange: (people: string) => void;
  time: string;
  onTimeChange: (time: string) => void;
  selectedService: ServiceItem | null;
  onSelectService: (serviceId: string) => void;
  confirmOpen: boolean;
  submitted: boolean;
  onOpenConfirm: () => void;
  onCloseConfirm: () => void;
  onConfirmBooking: () => void;
  monthOpen: boolean;
  onOpenMonth: () => void;
  onCloseMonth: () => void;
}) {
  const [needsServicePrompt, setNeedsServicePrompt] = useState(false);
  const serviceMenuRef = useRef<HTMLDivElement | null>(null);
  const payload = buildNearbyDetailPayload(selection, selectedService ?? services[0], selectedDate, time);
  const handleContinue = () => {
    if (!selectedService) {
      setNeedsServicePrompt(true);
      serviceMenuRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    onOpenConfirm();
  };
  const handleSelectService = (serviceId: string) => {
    setNeedsServicePrompt(false);
    onSelectService(serviceId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-paper text-ink">
      <div className="mx-auto flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-paper shadow-soft">
        <header className="grid h-14 shrink-0 grid-cols-[56px,1fr,72px] items-center border-b border-line bg-white px-2">
          <button className="focus-ring grid h-10 w-10 place-items-center rounded-full text-2xl font-black text-ink/70" onClick={onClose} type="button" aria-label="关闭">
            ‹
          </button>
          <h1 className="truncate text-center text-base font-black">{payload.name}</h1>
          <a
            className="focus-ring rounded-full bg-paper px-3 py-2 text-center text-xs font-black text-moss"
            href={payload.mapUrl}
            rel="noreferrer"
            target="_blank"
          >
            地图
          </a>
        </header>

        <main className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-24 pt-4">
          <section className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
            <div className="relative h-72">
              <img alt={payload.name} className="absolute inset-0 h-full w-full object-cover opacity-75" src={payload.cover} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <Badge tone="yellow">{payload.kind}</Badge>
                <h2 className="mt-3 text-3xl font-black leading-tight">{payload.name}</h2>
                <p className="mt-2 text-sm text-white/78">{payload.area} · {payload.todayStatus}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-px bg-white/10 p-3">
              <DetailMetric label="评分" value={`★ ${payload.rating}`} />
              <DetailMetric label="评价" value={`${payload.reviewCount} 人`} />
              <DetailMetric label="收藏" value={`${payload.favoriteCount} 人`} />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="grid grid-cols-3 gap-2">
              <DetailMetric label="价格区间" value={payload.priceLabel} />
              <DetailMetric label="定休日" value={payload.holiday} />
              <DetailMetric label="今日预约" value={<span className="text-moss">{payload.todayStatus}</span>} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {payload.tags.map((tag) => (
                <Badge key={tag} tone="yellow">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>

          <TwoWeekBooking onOpenMonth={onOpenMonth} onSelectDay={onSelectDay} selectedDay={selectedDay} />
          <BookingControls onPeopleChange={onPeopleChange} onTimeChange={onTimeChange} people={people} time={time} />

          <div ref={serviceMenuRef}>
            <ServiceMenu highlight={needsServicePrompt} onSelectService={handleSelectService} selectedServiceId={selectedService?.id} title={payload.menuTitle} />
          </div>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h3 className="text-lg font-black">详细介绍</h3>
            <p className="mt-3 text-sm leading-7 text-ink/68">{payload.intro}</p>
          </section>

          <PhotoGrid images={payload.gallery} title={payload.ownerPhotoTitle} />
          <PhotoGrid images={communityPhotoImages} title="网友上传的照片" />
          <ReviewSection />
          <InfoTable sections={payload.infoSections} />
        </main>

        <footer className="grid shrink-0 grid-cols-[1fr,1fr] gap-2 border-t border-line bg-white p-3">
          <a className="focus-ring grid h-12 place-items-center rounded-full border border-line text-sm font-black text-ink" href={payload.mapUrl} rel="noreferrer" target="_blank">
            打开 Google Map
          </a>
          <button className="focus-ring h-12 rounded-full bg-lemon px-5 text-sm font-black text-black shadow-soft" onClick={handleContinue} type="button">
            继续预约
          </button>
        </footer>
      </div>

      {confirmOpen && selectedService ? (
        <BookingConfirmOverlay
          onBack={onCloseConfirm}
          onClose={onClose}
          onConfirm={onConfirmBooking}
          payload={payload}
          people={people}
          selectedDate={selectedDate}
          selectedService={selectedService}
          selection={selection}
          submitted={submitted}
          time={time}
        />
      ) : null}

      {monthOpen ? (
        <MonthBookingSheet
          onClose={onCloseMonth}
          onPeopleChange={onPeopleChange}
          onSelectDate={onSelectDate}
          onSelectDay={onSelectDay}
          onTimeChange={onTimeChange}
          people={people}
          selectedDate={selectedDate}
          selectedDay={selectedDay}
          time={time}
          title={selection.type === "store" ? "来店日" : "服务日"}
        />
      ) : null}
    </div>
  );
}

function BookingConfirmOverlay({
  payload,
  selectedService,
  selection,
  selectedDate,
  people,
  time,
  submitted,
  onBack,
  onClose,
  onConfirm
}: {
  payload: NearbyDetailPayload;
  selectedService: ServiceItem;
  selection: NearbySelection;
  selectedDate: Date;
  people: string;
  time: string;
  submitted: boolean;
  onBack: () => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const paymentLabel = payload.requiresPrepay ? `平台预付定金 ${yen(payload.depositAmount)}` : "线下支付 / 无需平台预付";

  return (
    <div className="fixed inset-0 z-[80] bg-paper text-ink">
      <div className="mx-auto flex h-full w-full max-w-[480px] flex-col bg-paper shadow-soft">
        <header className="grid h-14 shrink-0 grid-cols-[56px,1fr,64px] items-center border-b border-line bg-white px-2">
          <button className="focus-ring grid h-10 w-10 place-items-center rounded-full text-2xl font-black text-ink/70" onClick={onBack} type="button" aria-label="返回修改">
            ‹
          </button>
          <h2 className="truncate text-center text-base font-black">{submitted ? "预约已提交" : "最终确认"}</h2>
          <button className="rounded-full bg-paper px-3 py-2 text-xs font-black text-ink/60" onClick={onClose} type="button">
            关闭
          </button>
        </header>

        {submitted ? (
          <main className="grid min-h-0 flex-1 place-items-center px-5 py-8">
            <section className="w-full rounded-lg bg-white p-6 text-center shadow-panel">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lemon text-3xl font-black text-black">✓</div>
              <h3 className="mt-5 text-2xl font-black">预约申请已送达</h3>
              <p className="mt-3 text-sm leading-6 text-ink/60">
                {payload.name} 会收到你的预约信息。无需平台预付的订单，请按店家或个人要求在线下结算；需要沟通时可以从信息页继续联系。
              </p>
              <div className="mt-5 rounded-lg bg-paper p-4 text-left text-sm leading-7">
                <p><strong>预约对象：</strong>{payload.name}</p>
                <p><strong>预约时间：</strong>{formatBookingDate(selectedDate)} {time}</p>
                <p><strong>服务项目：</strong>{selectedService.name}</p>
              </div>
              <button className="focus-ring mt-6 h-12 w-full rounded-full bg-ink text-sm font-black text-white" onClick={onClose} type="button">
                返回详情
              </button>
            </section>
          </main>
        ) : (
          <>
            <main className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <section className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
                <div className="grid grid-cols-[116px,1fr] gap-3 p-3">
                  <img alt={payload.name} className="h-28 w-[116px] rounded-lg object-cover" src={payload.cover} />
                  <div className="min-w-0 py-1">
                    <Badge tone="yellow">{payload.kind}</Badge>
                    <h3 className="mt-2 line-clamp-2 text-xl font-black">{payload.name}</h3>
                    <p className="mt-2 text-xs text-white/65">{payload.area}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <h3 className="text-lg font-black">预约内容</h3>
                <div className="mt-3 space-y-3 text-sm">
                  {[
                    ["服务项目", selectedService.name],
                    ["预约日期", formatBookingDate(selectedDate)],
                    ["具体时间", time],
                    ["预约人数", people],
                    ["预约地点", payload.address],
                    ["预计价格", `${yen(selectedService.priceFrom)} 起`],
                    ["支付方式", paymentLabel],
                    ["联系信息", selection.type === "store" ? payload.callLabel : "平台内通话，保护双方隐私"]
                  ].map(([label, value]) => (
                    <div className="grid grid-cols-[84px,1fr] gap-3 border-b border-line pb-3 last:border-b-0 last:pb-0" key={label}>
                      <span className="font-black text-ink/45">{label}</span>
                      <strong className="min-w-0 text-ink">{value}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className={cn("rounded-lg p-4", payload.requiresPrepay ? "bg-lemon text-black" : "bg-white text-ink shadow-panel")}>
                <h3 className="text-base font-black">支付说明</h3>
                <p className={cn("mt-2 text-sm leading-6", payload.requiresPrepay ? "text-black/70" : "text-ink/60")}>{payload.paymentNote}</p>
              </section>

              <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
                <h3 className="text-base font-black">最终确认前请检查</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/62">
                  <li>· 时间、人数、地点和服务项目是否正确。</li>
                  <li>· 如需指定性别、语言、酒店房号或特殊要求，请在提交后通过信息页补充。</li>
                  <li>· 订单确认前可继续返回修改预约时间。</li>
                </ul>
              </section>
            </main>

            <footer className="grid shrink-0 grid-cols-[112px,1fr] gap-2 border-t border-line bg-white p-3">
              <button className="focus-ring h-12 rounded-full border border-line text-sm font-black text-ink" onClick={onBack} type="button">
                修改时间
              </button>
              <button className="focus-ring h-12 rounded-full bg-lemon text-sm font-black text-black shadow-soft" onClick={onConfirm} type="button">
                确认预约
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function buildNearbyDetailPayload(selection: NearbySelection, selectedService: ServiceItem, selectedDate: Date, time: string): NearbyDetailPayload {
  const paymentPolicy = getPaymentPolicy(selection, selectedService);

  if (selection.type === "store") {
    const store = selection.item;
    const mapUrl = googleMapUrl(`${store.name} ${store.address}`);
    const bookingHref = `/checkout/${selectedService.id}?store=${store.id}&day=${formatQueryDate(selectedDate)}&time=${time}`;

    return {
      kind: "门店详情",
      name: store.name,
      area: store.area,
      address: store.address,
      cover: store.cover,
      gallery: store.gallery,
      rating: store.rating,
      reviewCount: store.reviewCount,
      favoriteCount: Math.round(store.reviewCount * 1.8 + 320),
      priceLabel: store.priceLabel,
      holiday: store.openStatus === "resting" ? "周一" : "年末年始",
      todayStatus: store.nextSlot.includes("今日") ? `今天可预约 ${store.nextSlot.replace("今日 ", "")}` : "今天可候补预约",
      intro: `${store.description} 预约前可以查看实际空位、服务套餐、店铺照片和网友评价。NeeDo 会保留历史沟通记录与预约记录，方便再次复购或指定同一位担当者。`,
      tags: store.tags,
      mapUrl,
      bookingHref,
      callLabel: "03-6721-0117",
      ...paymentPolicy,
      ownerPhotoTitle: "店铺上传的照片",
      menuTitle: "服务套餐菜单",
      infoSections: [
        {
          rows: [
            { label: "住所", value: <MapPreview address={store.address} mapUrl={mapUrl} /> },
            { label: "交通手段", value: `${store.area} 站步行 3-6 分钟，附近有出租车上下车点。` },
            {
              label: "営業時間",
              value: (
                <div>
                  <p>月・火・水・木・金・祝前日・祝日</p>
                  <p>{store.businessHours} L.O. 服务开始前 30 分钟</p>
                  <p className="mt-1">土・日・祝日 10:00-22:00</p>
                  <p className="mt-1">定休日：{store.openStatus === "resting" ? "周一" : "不定休"}</p>
                </div>
              )
            },
            { label: "予算", value: `${store.priceLabel} / 套餐、人数和指名担当者不同会有浮动。` },
            { label: "支払い方法", value: "平台支付、信用卡、电子钱包、QR 支付、到店现金支付可选。" },
            { label: "領収書", value: "支持平台电子收据、商家发票申请和公司报销备注。" },
            { label: "サービス料", value: "预约服务费已包含平台保障。深夜、远距离或特殊耗材会在下单前确认。" }
          ]
        },
        {
          title: "席・設備",
          rows: [
            { label: "最大予約人数", value: "到店 1-6 名，团体预约请提前咨询。" },
            { label: "個室", value: "部分项目支持独立房间，需要提前预约。" },
            { label: "貸切", value: "可。适合商务、团队护理、包场活动。" },
            { label: "禁煙・喫煙", value: "全席禁烟。" },
            { label: "駐車場", value: "无专属停车位，附近有投币停车场。" },
            { label: "空間・設備", value: "安静空间、电源、免费 Wi-Fi、女性友好、中文/英文预约支持。" }
          ]
        },
        {
          title: "メニュー",
          rows: [
            { label: "コース", value: "基础套餐、深度套餐、指名套餐、双人预约套餐。" },
            { label: "ドリンク", value: "到店服务提供水和茶。餐饮门店以实际菜单为准。" },
            { label: "料理", value: "餐饮预约门店支持套餐、单点和团体菜单。" }
          ]
        },
        {
          title: "特徴・関連情報",
          rows: [
            { label: "利用シーン", value: "下班后放松、女子会、商务预约、家庭服务、酒店附近预约。" },
            { label: "サービス", value: "可线上预约、可收藏、可查看担当者、支持平台内 IM 沟通。" },
            { label: "ホームページ", value: <a className="text-moss underline" href="https://brave-food.net/" rel="noreferrer" target="_blank">https://brave-food.net/</a> },
            { label: "電話番号", value: "03-6721-0117" },
            { label: "備考", value: "如遇迟到、改期、退款或投诉，可在 NeeDo 订单详情中直接发起处理。" }
          ]
        }
      ]
    };
  }

  const tech = selection.item;
  const mapUrl = googleMapUrl(`${tech.name} ${tech.serviceAreas[0] ?? "東京都"}`);
  const bookingHref = `/checkout/${selectedService.id}?technician=${tech.id}&day=${formatQueryDate(selectedDate)}&time=${time}`;

  return {
    kind: "个人技师详情",
    name: tech.name,
    area: tech.serviceAreas.join("、"),
    address: `${tech.serviceAreas[0] ?? "东京"} 周边可上门`,
    cover: tech.avatar,
    gallery: [tech.avatar, imageBank.massage, imageBank.cleaning, imageBank.home, imageBank.salon, imageBank.pet],
    rating: tech.rating,
    reviewCount: tech.orderCount,
    favoriteCount: Math.round(tech.orderCount * 0.64 + 180),
    priceLabel: "¥8,000-¥18,000",
    holiday: tech.status === "off" ? "今日休息" : "不定休",
    todayStatus: tech.status === "available" ? "今天可预约" : tech.status === "busy" ? "今天可候补" : "今天休息",
    intro: `${tech.name} 擅长 ${tech.skills.join("、")}。可查看两周内空位、服务区域、语言能力和用户评价。预约后可通过平台内 IM 联系，电话会通过 NeeDo 保护隐私。`,
    tags: tech.skills,
    mapUrl,
    bookingHref,
    callLabel: "平台内通话",
    ...paymentPolicy,
    ownerPhotoTitle: "技师上传的照片",
    menuTitle: "可预约服务套餐",
    infoSections: [
      {
        rows: [
          { label: "対応エリア", value: <MapPreview address={tech.serviceAreas.join("、")} mapUrl={mapUrl} /> },
          { label: "移動手段", value: "电车、出租车或平台派车。远距离交通费会在下单前确认。" },
          { label: "受付時間", value: tech.status === "available" ? "今日可预约，通常 11:00-23:00 可接单。" : "当前服务中，可选择候补时段。" },
          { label: "予算", value: "¥8,000-¥18,000，按服务项目、时长和上门距离计算。" },
          { label: "支払い方法", value: "平台预付、线下现金支付、信用卡和电子钱包可选。" },
          { label: "サービス料", value: "含平台保障。深夜、远距离、酒店入馆等费用会提前展示。" }
        ]
      },
      {
        title: "対応情報",
        rows: [
          { label: "言語", value: tech.languages.join("、") },
          { label: "担当可能", value: tech.skills.join("、") },
          { label: "接单率", value: `${tech.acceptRate}%` },
          { label: "取消率", value: `${tech.cancelRate}%` },
          { label: "電話番号", value: "隐私保护中，仅支持平台内通话。" },
          { label: "備考", value: "点击预约后可在聊天中确认地址、酒店房号、性别偏好、服务注意事项。" }
        ]
      }
    ]
  };
}

export function HomePage() {
  const { isNight } = useClientTheme();
  const [homeCategoryIds] = useState(getStoredHomeCategoryIds);
  const [nearbyTab, setNearbyTab] = useState<"all" | "stores" | "technicians">("all");
  const [selectedNearby, setSelectedNearby] = useState<NearbySelection | null>(null);
  const [detailDate, setDetailDate] = useState(() => new Date(2026, 3, 14));
  const [detailPeople, setDetailPeople] = useState("2名");
  const [detailTime, setDetailTime] = useState("20:30");
  const [detailServiceId, setDetailServiceId] = useState("");
  const [monthOpen, setMonthOpen] = useState(false);
  const [bookingConfirmOpen, setBookingConfirmOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const visibleCategories = homeCategoryOptions.filter((category) => homeCategoryIds.includes(category.id));
  const selectedService = services.find((service) => service.id === detailServiceId) ?? null;
  const selectAprilDay = (day: number) => setDetailDate(new Date(2026, 3, day));
  const openNearbyDetail = (selection: NearbySelection) => {
    setSelectedNearby(selection);
    setMonthOpen(false);
    setBookingConfirmOpen(false);
    setBookingSubmitted(false);
    setDetailServiceId("");
  };
  const openPromotedFeature = (target: typeof promotedFeatures[number]["target"]) => {
    if (target.type === "store") {
      openNearbyDetail({ type: "store", item: stores[target.index] ?? stores[0] });
      return;
    }

    openNearbyDetail({ type: "technician", item: technicians[target.index] ?? technicians[0] });
  };

  return (
    <MobileShell dark>
      <div className={cn("relative overflow-hidden px-4 pb-6 pt-4", isNight ? "bg-ink text-white" : "bg-[#eff0ed] text-ink")}>
        <div className="relative z-10">
          <header className="flex items-center justify-between gap-3">
            <button className={cn("focus-ring rounded-full px-4 py-3 text-left backdrop-blur", isNight ? "bg-white/10" : "bg-white shadow-panel")}>
              <p className={cn("text-xs", isNight ? "text-white/55" : "text-ink/45")}>当前位置</p>
              <strong className="text-sm">东京 · 新宿区</strong>
            </button>
          </header>

          <div className="mt-4 flex gap-2">
            <Link
              className="client-search-pill flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-ink shadow-soft"
              to="/search"
            >
              <span className="text-ink/35">⌕</span>
              <span className="truncate">搜索保洁、按摩、回收、宠物服务</span>
            </Link>
            <Link
              className={cn(
                "focus-ring flex h-12 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-black backdrop-blur",
                isNight ? "bg-white/15 text-white" : "bg-white text-ink shadow-panel"
              )}
              to="/categories"
            >
              <CategoryIcon id="cleaning" label="分类" size="sm" />
              分类
            </Link>
          </div>

          <section className="mt-5 grid grid-cols-6 gap-2">
            {visibleCategories.map((category) => (
              <Link
                className="focus-ring flex min-h-[86px] flex-col items-center justify-center rounded-lg bg-transparent p-0 text-center"
                key={category.id}
                to={category.to}
              >
                <CategoryIcon id={category.iconId} label={category.label} size="md" />
                <span className={cn("mt-2 text-[11px] font-semibold leading-4", isNight ? "text-white/75" : "text-ink/70")}>{category.label}</span>
              </Link>
            ))}
          </section>

          <section className="scrollbar-none mt-5 flex gap-3 overflow-x-auto pb-1">
            {promotedFeatures.map((item) => (
              <button
                className="focus-ring grid min-w-[92%] overflow-hidden rounded-lg bg-white text-left text-ink shadow-soft sm:min-w-[440px]"
                key={item.title}
                onClick={() => openPromotedFeature(item.target)}
                type="button"
              >
                <div className="grid grid-cols-[1fr,46%]">
                  <div className="p-5">
                    <Badge tone="red">{item.badge}</Badge>
                    <h2 className="mt-3 text-2xl font-black leading-tight">{item.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/60">{item.caption}</p>
                    <span className="mt-5 inline-grid h-10 place-items-center rounded-full bg-moss px-5 text-sm font-black text-white shadow-soft">
                      查看详情并预约
                    </span>
                  </div>
                  <img alt={item.title} className="h-full min-h-[230px] object-cover" src={item.image} />
                </div>
              </button>
            ))}
          </section>
        </div>
      </div>

      <div className="space-y-6 bg-paper px-4 py-5 text-ink">
        <section>
          <SectionTitle title="附近可预约" caption="全部、门店、个人技师都可以快速查看">
            <div className="grid grid-cols-3 rounded-lg bg-white p-1 text-xs font-black shadow-panel">
              {[
                ["all", "全部"],
                ["stores", "门店"],
                ["technicians", "个人技师"]
              ].map(([key, label]) => (
                <button
                  className={cn("rounded-md px-3 py-2", nearbyTab === key ? "bg-moss text-white" : "text-ink/55")}
                  key={key}
                  onClick={() => setNearbyTab(key as "all" | "stores" | "technicians")}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </SectionTitle>
          <div className="mt-3 space-y-3">
            {nearbyTab !== "technicians" && stores.slice(0, nearbyTab === "all" ? 2 : 3).map((store) => (
              <button
                className="focus-ring block w-full rounded-lg border border-line bg-white p-3 text-left text-ink shadow-panel"
                key={store.id}
                onClick={() => openNearbyDetail({ type: "store", item: store })}
                type="button"
              >
                <div className="grid grid-cols-[132px,1fr] gap-3">
                  <img alt={store.name} className="h-32 w-[132px] rounded-lg object-cover" src={store.cover} />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-bold">{store.name}</h3>
                      <Badge tone={store.openStatus === "open" ? "green" : "yellow"}>
                        {store.openStatus === "open" ? "营业中" : "可预约"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-coral">★ {store.rating} · {store.reviewCount} 条评价</p>
                    <p className="mt-1 text-xs text-ink/55">{store.area} · {store.priceLabel}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink/60">{store.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <div className="flex flex-wrap gap-1">
                    {store.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-moss">{store.nextSlot}</span>
                </div>
              </button>
            ))}
            {nearbyTab !== "stores" && technicians.map((tech) => (
              <button
                className="focus-ring flex w-full gap-3 rounded-lg border border-line bg-white p-3 text-left shadow-panel"
                key={tech.id}
                onClick={() => openNearbyDetail({ type: "technician", item: tech })}
                type="button"
              >
                <img alt={tech.name} className="h-20 w-20 rounded-lg object-cover" src={tech.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black">{tech.name}</h3>
                    <Badge tone="yellow">个人技师</Badge>
                  </div>
                  <p className="mt-1 text-xs font-bold text-coral">★ {tech.rating} · {tech.orderCount} 单</p>
                  <p className="mt-2 line-clamp-1 text-xs text-ink/55">{tech.skills.join(" / ")}</p>
                  <p className="mt-1 text-xs text-ink/45">{tech.serviceAreas.join("、")}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="热门服务" caption="东京今日订单增长最快" to="/services" />
          <div className="space-y-3">
            {services.slice(0, 3).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold">本周会员券包</p>
              <p className="mt-1 text-xs text-ink/55">上门服务满 {yen(6000)} 减 {yen(1000)}</p>
            </div>
            <Button size="sm" to="/me">
              领取
            </Button>
          </div>
        </section>
      </div>

      {selectedNearby && (
        <NearbyDetailOverlay
          confirmOpen={bookingConfirmOpen}
          monthOpen={monthOpen}
          onClose={() => {
            setMonthOpen(false);
            setBookingConfirmOpen(false);
            setBookingSubmitted(false);
            setSelectedNearby(null);
          }}
          onCloseConfirm={() => {
            setBookingConfirmOpen(false);
            setBookingSubmitted(false);
          }}
          onCloseMonth={() => setMonthOpen(false)}
          onConfirmBooking={() => setBookingSubmitted(true)}
          onOpenConfirm={() => {
            setBookingSubmitted(false);
            setBookingConfirmOpen(true);
          }}
          onOpenMonth={() => setMonthOpen(true)}
          onPeopleChange={setDetailPeople}
          onSelectDate={setDetailDate}
          onSelectDay={selectAprilDay}
          onSelectService={setDetailServiceId}
          onTimeChange={setDetailTime}
          people={detailPeople}
          selectedDate={detailDate}
          selectedDay={detailDate.getDate()}
          selectedService={selectedService}
          selection={selectedNearby}
          submitted={bookingSubmitted}
          time={detailTime}
        />
      )}
    </MobileShell>
  );
}
