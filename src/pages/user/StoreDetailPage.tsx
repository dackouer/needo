import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { AvailabilityCalendar } from "../../components/mobile/AvailabilityCalendar";
import { MobileShell } from "../../components/mobile/MobileShell";
import { SectionTitle } from "../../components/mobile/SectionTitle";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { imageBank, reviews, services, stores, technicians } from "../../data/mock";
import { yen } from "../../lib/utils";

const bookingBands = ["11:00", "14:00", "17:30", "20:30"];
const reviewImages = [imageBank.salon, imageBank.restaurant, imageBank.cleaning, imageBank.home];

export function StoreDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = stores.find((item) => item.id === id) ?? stores[0];
  const [selectedDay, setSelectedDay] = useState(14);
  const [selectedPeople, setSelectedPeople] = useState("2名");
  const [selectedTime, setSelectedTime] = useState(bookingBands[3]);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;

  return (
    <MobileShell>
      <div className="pb-24">
        <div className="relative">
          <img alt={store.name} className="h-64 w-full object-cover" src={store.cover} />
          <button
            className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-2 text-sm font-bold text-ink"
            onClick={() => navigate(-1)}
            type="button"
          >
            返回
          </button>
          <button className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-2 text-sm font-bold text-ink" type="button">
            收藏
          </button>
        </div>

        <div className="-mt-5 space-y-5 rounded-t-lg bg-paper px-4 pt-5">
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <Badge tone="yellow">{store.rankLabel}</Badge>
            <h1 className="mt-3 text-2xl font-black">{store.name}</h1>
            <p className="mt-2 text-sm text-coral">★ {store.rating} · {store.reviewCount} 条评价 · {store.priceLabel}</p>
            <p className="mt-2 text-sm leading-6 text-ink/60">{store.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-paper p-3">
                <p className="text-xs text-ink/45">地址</p>
                <strong className="mt-1 block">{store.address}</strong>
              </div>
              <div className="rounded-lg bg-paper p-3">
                <p className="text-xs text-ink/45">营业时间</p>
                <strong className="mt-1 block">{store.businessHours}</strong>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {store.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title="店铺图片" />
            <div className="grid grid-cols-3 gap-2">
              {store.gallery.map((image) => (
                <img alt={store.name} className="h-24 rounded-lg object-cover" key={image} src={image} />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <AvailabilityCalendar
              title="来店日"
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              people={selectedPeople}
              onPeopleChange={setSelectedPeople}
              time={selectedTime}
              onTimeChange={setSelectedTime}
              timeOptions={bookingBands}
            />
            <Button className="mt-4 w-full" to={`/checkout/${services[0].id}?store=${store.id}&date=2026-04-${selectedDay}&time=${selectedTime}&people=${selectedPeople}`}>
              选择这个时间
            </Button>
          </section>

          <section>
            <SectionTitle title="服务项目 / 菜单" />
            <div className="space-y-3">
              {services.slice(0, 4).map((service) => (
                <Link className="grid grid-cols-[104px,1fr] gap-3 rounded-lg border border-line bg-white p-3 shadow-panel" key={service.id} to={`/checkout/${service.id}?store=${store.id}`}>
                  <img alt={service.name} className="h-28 w-[104px] rounded-lg object-cover" src={service.cover} />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-bold">{service.name}</h3>
                      <strong className="shrink-0 text-sm text-coral">{yen(service.priceFrom)}</strong>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/55">{service.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {service.tags.slice(0, 3).map((tag) => <Badge key={tag} tone="yellow">{tag}</Badge>)}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-ink/50">{service.packages[0]?.durationMinutes ?? 60} 分钟起</span>
                      <span className="rounded-lg bg-moss px-3 py-2 font-bold text-white">预约</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title="技师 / 员工" />
            <div className="grid gap-3">
              {technicians.slice(0, 2).map((tech) => (
                <article className="flex gap-3 rounded-lg border border-line bg-white p-3 shadow-panel" key={tech.id}>
                  <img alt={tech.name} className="h-16 w-16 rounded-lg object-cover" src={tech.avatar} />
                  <div>
                    <h3 className="font-bold">{tech.name}</h3>
                    <p className="mt-1 text-xs text-coral">★ {tech.rating} · {tech.skills.join(" / ")}</p>
                    <p className="mt-1 text-xs text-ink/55">语言：{tech.languages.join("、")}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title="评价" />
            <div className="space-y-3">
              {reviews.map((review) => (
                <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={review.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{review.customerName}</strong>
                      <p className="mt-1 text-xs text-ink/45">{review.createdAt} · {store.area} · {services[reviews.indexOf(review) % services.length].name}</p>
                    </div>
                    <span className="text-sm font-bold text-coral">★ {review.rating}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{review.content}</p>
                  <img alt={`${review.customerName} 的评价插图`} className="mt-3 h-36 w-full rounded-lg object-cover" src={reviewImages[reviews.indexOf(review) % reviewImages.length]} />
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="fixed bottom-16 left-1/2 z-20 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-[94px,1fr] gap-2 border-t border-line bg-white p-3">
          <a
            className="focus-ring inline-flex h-12 items-center justify-center rounded-lg border border-line bg-white px-5 text-base font-semibold text-ink transition hover:border-moss"
            href={mapUrl}
            rel="noreferrer"
            target="_blank"
          >
            地图
          </a>
          <Button size="lg" to={`/checkout/${services[0].id}?store=${store.id}`}>
            预约到店
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
