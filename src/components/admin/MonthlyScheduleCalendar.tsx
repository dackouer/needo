import { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Drawer } from "../ui/Drawer";
import type { Schedule, Technician } from "../../types/domain";

type MonthlyScheduleCalendarProps = {
  schedules: Schedule[];
  technicians: Technician[];
  initialMonth?: string;
  compact?: boolean;
  onScheduleClick?: (schedule: Schedule) => void;
};

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

const statusCopy: Record<Schedule["status"], string> = {
  free: "空闲",
  booked: "已预约",
  blocked: "锁定"
};

const statusClassName: Record<Schedule["status"], string> = {
  free: "border-mint/60 bg-mint/25 text-moss",
  booked: "border-lemon/70 bg-lemon/35 text-[#725900]",
  blocked: "border-coral/45 bg-coral/20 text-[#9a3d32]"
};

const statusDotClassName: Record<Schedule["status"], string> = {
  free: "bg-mint",
  booked: "bg-lemon",
  blocked: "bg-coral"
};

function formatDate(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);

  return `${year}年 ${month}月`;
}

function formatDayLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return `${year}年${month}月${day}日（${weekdayLabels[date.getDay()]}）`;
}

function moveMonth(monthValue: string, diff: number) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(year, month - 1 + diff, 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getCalendarDays(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const monthIndex = month - 1;
  const firstDay = new Date(year, monthIndex, 1);
  const start = new Date(year, monthIndex, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date,
      dateKey: formatDate(date.getFullYear(), date.getMonth(), date.getDate()),
      inMonth: date.getMonth() === monthIndex
    };
  });
}

export function MonthlyScheduleCalendar({
  schedules,
  technicians,
  initialMonth = "2026-04",
  compact = false,
  onScheduleClick
}: MonthlyScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const technicianMap = useMemo(() => new Map(technicians.map((technician) => [technician.id, technician])), [technicians]);
  const schedulesByDate = useMemo(() => {
    return schedules.reduce<Record<string, Schedule[]>>((grouped, schedule) => {
      grouped[schedule.date] = [...(grouped[schedule.date] ?? []), schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));

      return grouped;
    }, {});
  }, [schedules]);
  const days = getCalendarDays(currentMonth);
  const selectedDaySchedules = selectedDayKey ? schedulesByDate[selectedDayKey] ?? [] : [];
  const selectedDayStats = {
    booked: selectedDaySchedules.filter((schedule) => schedule.status === "booked").length,
    free: selectedDaySchedules.filter((schedule) => schedule.status === "free").length,
    blocked: selectedDaySchedules.filter((schedule) => schedule.status === "blocked").length
  };

  return (
    <>
      <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">月历排班</h3>
            <p className="mt-1 text-sm text-ink/55">参考 Google 日历，用月份网格查看空闲、预约、锁定和冲突情况。点击某一天可查看当天明细。</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="focus-ring rounded-full border border-line bg-paper px-3 py-2 text-xs font-black text-ink/65" onClick={() => setCurrentMonth("2026-04")} type="button">
              今天
            </button>
            <button className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-line bg-paper text-lg font-black text-ink/65" onClick={() => setCurrentMonth((month) => moveMonth(month, -1))} type="button">
              ‹
            </button>
            <strong className="min-w-[120px] text-center text-xl font-black">{formatMonthLabel(currentMonth)}</strong>
            <button className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-line bg-paper text-lg font-black text-ink/65" onClick={() => setCurrentMonth((month) => moveMonth(month, 1))} type="button">
              ›
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["free", "booked", "blocked"] as const).map((status) => (
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClassName[status]}`} key={status}>
              {statusCopy[status]}
            </span>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-7 border-b border-l border-line text-center text-xs font-black text-ink/55">
              {weekdayLabels.map((label, index) => (
                <div className={`border-r border-line bg-paper px-3 py-2 ${index === 0 ? "text-coral" : index === 6 ? "text-moss" : ""}`} key={label}>
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-line">
              {days.map((day) => {
                const daySchedules = schedulesByDate[day.dateKey] ?? [];
                const visibleSchedules = daySchedules.slice(0, compact ? 2 : 4);

                return (
                  <div
                    className={`${compact ? "min-h-[112px]" : "min-h-[148px]"} cursor-pointer border-b border-r border-line bg-white p-2 transition hover:bg-paper/55 ${day.inMonth ? "" : "bg-paper/70 text-ink/35"}`}
                    key={day.dateKey}
                    onClick={() => setSelectedDayKey(day.dateKey)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedDayKey(day.dateKey);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className={`grid h-7 w-7 place-items-center rounded-full text-sm font-black ${day.dateKey === "2026-04-14" ? "bg-ink text-white" : "hover:bg-paper"}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedDayKey(day.dateKey);
                        }}
                        type="button"
                      >
                        {day.date.getDate()}
                      </button>
                      {daySchedules.length > 0 ? <span className="text-[11px] font-black text-ink/45">{daySchedules.length} 件</span> : null}
                    </div>
                    <div className="mt-2 space-y-1">
                      {visibleSchedules.map((schedule) => {
                        const technician = technicianMap.get(schedule.staffId);

                        return (
                          <button
                            className={`focus-ring w-full rounded-md border px-2 py-1 text-left text-[11px] font-black leading-4 ${statusClassName[schedule.status]}`}
                            key={schedule.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              onScheduleClick?.(schedule);
                            }}
                            type="button"
                          >
                            <span>{schedule.startTime} {technician?.name ?? schedule.staffId}</span>
                            <span className="block truncate font-bold opacity-75">{statusCopy[schedule.status]}</span>
                          </button>
                        );
                      })}
                      {daySchedules.length > visibleSchedules.length ? (
                        <button
                          className="w-full rounded-md bg-paper px-2 py-1 text-left text-[11px] font-black text-ink/50"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedDayKey(day.dateKey);
                          }}
                          type="button"
                        >
                          +{daySchedules.length - visibleSchedules.length} 更多
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Drawer open={Boolean(selectedDayKey)} title={selectedDayKey ? `${formatDayLabel(selectedDayKey)} 排班详细` : "排班详细"} onClose={() => setSelectedDayKey(null)}>
        {selectedDayKey ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["总时段", selectedDaySchedules.length, "bg-ink text-white"],
                ["已预约", selectedDayStats.booked, "bg-lemon/35 text-[#725900]"],
                ["可排班", selectedDayStats.free, "bg-mint/25 text-moss"],
                ["锁定", selectedDayStats.blocked, "bg-coral/20 text-[#9a3d32]"]
              ].map(([label, value, className]) => (
                <article className={`rounded-lg px-3 py-3 ${className}`} key={label}>
                  <strong className="block text-xl">{value}</strong>
                  <span className="text-xs font-black">{label}</span>
                </article>
              ))}
            </div>
            <section className="rounded-lg border border-line bg-paper p-4">
              <h4 className="font-black">智能建议</h4>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                当天排班会优先检查连续空闲、跨区移动和锁定冲突。若可排班时段不足，系统建议先释放低峰锁定或从相邻门店调入支援人员。
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button size="sm">智能排班</Button>
                <Button size="sm" variant="secondary">智能派单</Button>
              </div>
            </section>
            <section>
              <h4 className="font-black">当天时段</h4>
              <div className="mt-3 space-y-2">
                {selectedDaySchedules.length > 0 ? (
                  selectedDaySchedules.map((schedule) => {
                    const technician = technicianMap.get(schedule.staffId);

                    return (
                      <button
                        className="focus-ring flex w-full items-center gap-3 rounded-lg border border-line bg-white p-3 text-left shadow-panel transition hover:border-moss"
                        key={schedule.id}
                        onClick={() => onScheduleClick?.(schedule)}
                        type="button"
                      >
                        <span className={`h-3 w-3 rounded-full ${statusDotClassName[schedule.status]}`} />
                        <img alt={technician?.name ?? schedule.staffId} className="h-11 w-11 rounded-full object-cover" src={technician?.avatar} />
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate">{schedule.startTime}-{schedule.endTime} · {technician?.name ?? schedule.staffId}</strong>
                          <span className="mt-1 block truncate text-xs font-bold text-ink/50">
                            {statusCopy[schedule.status]}{schedule.orderId ? ` · ${schedule.orderId}` : " · 未绑定订单"}
                          </span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-line bg-paper p-5 text-sm font-bold text-ink/50">
                    当天暂无排班记录。
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
