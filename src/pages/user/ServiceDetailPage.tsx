import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { AvailabilityCalendar } from "../../components/mobile/AvailabilityCalendar";
import { MobileShell } from "../../components/mobile/MobileShell";
import { SectionTitle } from "../../components/mobile/SectionTitle";
import { ServiceCard } from "../../components/mobile/ServiceCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { imageBank, reviews, services, technicians } from "../../data/mock";
import { yen } from "../../lib/utils";

const bookingBands = ["10:00", "13:30", "17:00", "21:00"];
const reviewImages = [imageBank.cleaning, imageBank.massage, imageBank.pet, imageBank.home];

export function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = services.find((item) => item.id === id) ?? services[0];
  const [selectedDay, setSelectedDay] = useState(14);
  const [selectedPeople, setSelectedPeople] = useState("2名");
  const [selectedTime, setSelectedTime] = useState(bookingBands[3]);

  return (
    <MobileShell>
      <div className="pb-24">
        <div className="relative">
          <img alt={service.name} className="h-64 w-full object-cover" src={service.cover} />
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black">{service.name}</h1>
                <p className="mt-2 text-sm leading-6 text-ink/60">{service.summary}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-coral">★ {service.rating}</p>
                <p className="mt-1 text-xs text-ink/45">{service.sales} 单</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <Badge key={tag} tone="green">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-paper p-3">
                <p className="text-xs text-ink/45">最快上门</p>
                <strong className="mt-1 block text-sm">{service.fastestArrival}</strong>
              </div>
              <div className="rounded-lg bg-paper p-3">
                <p className="text-xs text-ink/45">技师数</p>
                <strong className="mt-1 block text-sm">{service.technicianCount}</strong>
              </div>
              <div className="rounded-lg bg-paper p-3">
                <p className="text-xs text-ink/45">价格起</p>
                <strong className="mt-1 block text-sm text-coral">{yen(service.priceFrom)}</strong>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle title="套餐与时长" />
            <div className="space-y-3">
              {service.packages.map((pkg) => (
                <Link
                  className="block rounded-lg border border-line bg-white p-4 shadow-panel"
                  key={pkg.id}
                  to={`/checkout/${service.id}?package=${pkg.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold">{pkg.name}</h2>
                      <p className="mt-1 text-xs text-ink/55">{pkg.durationMinutes} 分钟 · {pkg.description}</p>
                    </div>
                    <strong className="text-lg text-coral">{yen(pkg.price)}</strong>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pkg.includes.map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <SectionTitle title="可预约时间" caption="按月历选择日期，再选择可服务时间带" />
            <AvailabilityCalendar
              title="服务日"
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              people={selectedPeople}
              onPeopleChange={setSelectedPeople}
              time={selectedTime}
              onTimeChange={setSelectedTime}
              timeOptions={bookingBands}
            />
            <Button className="mt-4 w-full" to={`/checkout/${service.id}?date=2026-04-${selectedDay}&time=${selectedTime}&people=${selectedPeople}`}>
              选择这个时间
            </Button>
          </section>

          <section>
            <SectionTitle title="可选技师" caption="评分、标签、语言和排班综合展示" />
            <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
              {technicians.map((tech) => (
                <article className="w-44 shrink-0 rounded-lg border border-line bg-white p-3 shadow-panel" key={tech.id}>
                  <img alt={tech.name} className="h-24 w-full rounded-lg object-cover" src={tech.avatar} />
                  <h3 className="mt-3 font-bold">{tech.name}</h3>
                  <p className="mt-1 text-xs text-coral">★ {tech.rating}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/55">{tech.skills.join(" / ")}</p>
                  <Button className="mt-3 w-full" size="sm" to={`/checkout/${service.id}?technician=${tech.id}`}>
                    选择
                  </Button>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <SectionTitle title="服务流程" />
            <div className="grid gap-3">
              {service.flow.map((step, index) => (
                <div className="flex items-center gap-3" key={step}>
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-moss text-sm font-bold text-white">{index + 1}</span>
                  <span className="text-sm font-semibold">{step}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <SectionTitle title="服务须知" />
            <ul className="space-y-2 text-sm leading-6 text-ink/65">
              {service.notice.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle title="用户评价" />
            <div className="space-y-3">
              {reviews.map((review) => (
                <article className="rounded-lg border border-line bg-white p-4 shadow-panel" key={review.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{review.customerName}</strong>
                      <p className="mt-1 text-xs text-ink/45">{review.createdAt} · {service.serviceAreas[reviews.indexOf(review) % service.serviceAreas.length] ?? "东京"} · {service.name}</p>
                    </div>
                    <span className="text-sm font-bold text-coral">★ {review.rating}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{review.content}</p>
                  <img alt={`${review.customerName} 的服务评价插图`} className="mt-3 h-36 w-full rounded-lg object-cover" src={reviewImages[reviews.indexOf(review) % reviewImages.length]} />
                </article>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title="相关推荐" />
            <div className="space-y-3">
              {services
                .filter((item) => item.id !== service.id)
                .slice(0, 2)
                .map((item) => (
                  <ServiceCard key={item.id} service={item} />
                ))}
            </div>
          </section>
        </div>

        <div className="fixed bottom-16 left-1/2 z-20 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-[86px,86px,1fr] gap-2 border-t border-line bg-white p-3">
          <Button variant="secondary" size="lg">
            客服
          </Button>
          <Button variant="secondary" size="lg">
            收藏
          </Button>
          <Button size="lg" to={`/checkout/${service.id}`}>
            立即预约
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
