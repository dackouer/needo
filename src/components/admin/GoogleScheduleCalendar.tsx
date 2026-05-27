import { useMemo, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Button } from "../ui/Button";
import { Drawer } from "../ui/Drawer";
import type { Schedule, Technician } from "../../types/domain";

type CalendarView = "day" | "week" | "month";
type DayAssistantMode = "schedule" | "dispatch";
type BlockInteractionMode = "drag" | "resize-start" | "resize-end";
type ScheduleEdit = Partial<Pick<Schedule, "startTime" | "endTime" | "status">>;
type DayHoverCell = {
  technicianName: string;
  dateKey: string;
  hour: number;
  x: number;
  y: number;
};
type SmartScheduleCycle = "single" | "weekly";
type SmartScheduleSlot = {
  id: string;
  startTime: string;
  endTime: string;
  minStaff: number;
  maxStaff: number;
};
type SmartScheduleConfig = {
  cycle: SmartScheduleCycle;
  repeatWeeks: number;
  slots: SmartScheduleSlot[];
};

type GoogleScheduleCalendarProps = {
  schedules: Schedule[];
  technicians: Technician[];
  initialDate?: string;
  onScheduleClick?: (schedule: Schedule) => void;
};

type ScheduleBlock = {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: Schedule["status"];
  orderIds: string[];
  schedules: Schedule[];
};

const todayKey = "2026-04-14";
const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];
const hours = Array.from({ length: 24 }, (_, index) => index);

const viewCopy: Record<CalendarView, string> = {
  day: "日",
  week: "周",
  month: "月"
};

const statusCopy: Record<Schedule["status"], string> = {
  free: "空闲",
  booked: "已预约",
  blocked: "锁定"
};

const statusCellClassName: Record<Schedule["status"], string> = {
  free: "admin-schedule-cell admin-schedule-cell-free",
  booked: "admin-schedule-cell admin-schedule-cell-booked",
  blocked: "admin-schedule-cell admin-schedule-cell-blocked"
};

const statusBarClassName: Record<Schedule["status"], string> = {
  free: "admin-schedule-bar-free",
  booked: "admin-schedule-bar-booked",
  blocked: "admin-schedule-bar-blocked"
};

const statusSoftClassName: Record<Schedule["status"], string> = {
  free: "admin-schedule-soft admin-schedule-soft-free",
  booked: "admin-schedule-soft admin-schedule-soft-booked",
  blocked: "admin-schedule-soft admin-schedule-soft-blocked"
};

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);

  return next;
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function getMonthDates(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  return Array.from({ length: dayCount }, (_, index) => addDays(firstDay, index));
}

function getDisplayDates(date: Date, view: CalendarView) {
  if (view === "month") {
    return getMonthDates(date);
  }

  if (view === "week") {
    const start = startOfWeek(date);

    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }

  return [date];
}

function getCalendarTitle(date: Date, view: CalendarView) {
  if (view === "day") {
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月 ${date.getDate()}日`;
  }

  if (view === "week") {
    const start = startOfWeek(date);
    const end = addDays(start, 6);

    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
  }

  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
}

function formatDateLabel(dateKey: string) {
  const date = parseDateKey(dateKey);

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdayLabels[date.getDay()]}）`;
}

function timeToMinutes(time: string) {
  const [hour = 0, minute = 0] = time.split(":").map(Number);

  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const safeMinutes = Math.max(0, Math.min(1440, minutes));
  const hour = Math.floor(safeMinutes / 60);
  const minute = safeMinutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function minutesToHours(minutes: number) {
  return Math.max(0, Math.round((minutes / 60) * 10) / 10);
}

function scheduleDurationMinutes(schedule: Schedule | ScheduleBlock) {
  return Math.max(0, timeToMinutes(schedule.endTime) - timeToMinutes(schedule.startTime));
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatHourRange(hour: number) {
  return `${formatHour(hour)} - ${formatHour(hour + 1)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snapMinutes(minutes: number, step = 30) {
  return Math.round(minutes / step) * step;
}

function getScheduleBlocks(daySchedules: Schedule[]): ScheduleBlock[] {
  return [...daySchedules]
    .sort((a, b) => a.staffId.localeCompare(b.staffId) || a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .reduce<ScheduleBlock[]>((blocks, schedule) => {
      const last = blocks[blocks.length - 1];
      const canMerge =
        last &&
        last.staffId === schedule.staffId &&
        last.date === schedule.date &&
        last.status === schedule.status &&
        last.endTime === schedule.startTime;

      if (canMerge) {
        last.endTime = schedule.endTime;
        last.schedules.push(schedule);

        if (schedule.orderId) {
          last.orderIds.push(schedule.orderId);
        }

        return blocks;
      }

      blocks.push({
        id: `block-${schedule.id}`,
        staffId: schedule.staffId,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        status: schedule.status,
        orderIds: schedule.orderId ? [schedule.orderId] : [],
        schedules: [schedule]
      });

      return blocks;
    }, []);
}

function getScheduleHours(schedules: Schedule[], status?: Schedule["status"]) {
  return minutesToHours(
    schedules
      .filter((schedule) => !status || schedule.status === status)
      .reduce((sum, schedule) => sum + scheduleDurationMinutes(schedule), 0)
  );
}

function groupSchedulesByStaffDate(schedules: Schedule[]) {
  return schedules.reduce<Record<string, Record<string, Schedule[]>>>((grouped, schedule) => {
    const staffGroup = grouped[schedule.staffId] ?? {};
    const dateSchedules = [...(staffGroup[schedule.date] ?? []), schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));

    grouped[schedule.staffId] = { ...staffGroup, [schedule.date]: dateSchedules };

    return grouped;
  }, {});
}

function groupSchedulesByDate(schedules: Schedule[]) {
  return schedules.reduce<Record<string, Schedule[]>>((grouped, schedule) => {
    grouped[schedule.date] = [...(grouped[schedule.date] ?? []), schedule].sort(
      (a, b) => a.staffId.localeCompare(b.staffId) || a.startTime.localeCompare(b.startTime)
    );

    return grouped;
  }, {});
}

function getBlockGridPlacement(block: ScheduleBlock) {
  const startSlot = Math.max(0, Math.floor(timeToMinutes(block.startTime) / 60));
  const endSlot = Math.min(24, Math.max(startSlot + 1, Math.ceil(timeToMinutes(block.endTime) / 60)));

  return `${startSlot + 1} / ${endSlot + 1}`;
}

function getTimelineStyle(block: ScheduleBlock) {
  const start = Math.max(0, Math.min(1440, timeToMinutes(block.startTime)));
  const end = Math.max(start + 15, Math.min(1440, timeToMinutes(block.endTime)));

  return {
    left: `${(start / 1440) * 100}%`,
    width: `${((end - start) / 1440) * 100}%`
  };
}

function getVerticalTimelineStyle(block: ScheduleBlock) {
  const start = Math.max(0, Math.min(1440, timeToMinutes(block.startTime)));
  const end = Math.max(start + 15, Math.min(1440, timeToMinutes(block.endTime)));

  return {
    top: `${(start / 1440) * 100}%`,
    height: `${((end - start) / 1440) * 100}%`,
    minHeight: "34px"
  };
}

function hasScheduleConflict(schedules: Schedule[], staffId: string, date: string, startTime: string, endTime: string) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  return schedules.some((schedule) => {
    if (schedule.staffId !== staffId || schedule.date !== date) {
      return false;
    }

    return start < timeToMinutes(schedule.endTime) && end > timeToMinutes(schedule.startTime);
  });
}

export function GoogleScheduleCalendar({
  schedules,
  technicians,
  initialDate = todayKey,
  onScheduleClick
}: GoogleScheduleCalendarProps) {
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState(() => parseDateKey(initialDate));
  const [hiddenStaffIds, setHiddenStaffIds] = useState<string[]>([]);
  const [extraSchedules, setExtraSchedules] = useState<Schedule[]>([]);
  const [scheduleEdits, setScheduleEdits] = useState<Record<string, ScheduleEdit>>({});
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [focusStaffId, setFocusStaffId] = useState<string | null>(null);
  const [dayAssistantMode, setDayAssistantMode] = useState<DayAssistantMode>("schedule");
  const [quickQuery, setQuickQuery] = useState("");
  const [smartScheduleOpen, setSmartScheduleOpen] = useState(false);

  const technicianMap = useMemo(() => new Map(technicians.map((technician) => [technician.id, technician])), [technicians]);
  const workingSchedules = useMemo(() => {
    return [...schedules, ...extraSchedules].map((schedule) => ({
      ...schedule,
      ...(scheduleEdits[schedule.id] ?? {})
    }));
  }, [extraSchedules, scheduleEdits, schedules]);
  const hiddenTechnicians = useMemo(() => technicians.filter((technician) => hiddenStaffIds.includes(technician.id)), [hiddenStaffIds, technicians]);
  const filteredTechnicians = useMemo(() => {
    const query = quickQuery.trim().toLowerCase();
    const hidden = new Set(hiddenStaffIds);

    return technicians
      .filter((technician) => !hidden.has(technician.id))
      .filter((technician) => {
        if (!query) {
          return true;
        }

        return [technician.name, technician.serviceAreas.join(" "), technician.skills.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [hiddenStaffIds, quickQuery, technicians]);

  const filteredStaffIds = useMemo(() => new Set(filteredTechnicians.map((technician) => technician.id)), [filteredTechnicians]);
  const filteredSchedules = useMemo(() => workingSchedules.filter((schedule) => filteredStaffIds.has(schedule.staffId)), [filteredStaffIds, workingSchedules]);
  const schedulesByStaffDate = useMemo(() => groupSchedulesByStaffDate(filteredSchedules), [filteredSchedules]);
  const schedulesByDate = useMemo(() => groupSchedulesByDate(filteredSchedules), [filteredSchedules]);
  const displayDates = useMemo(() => getDisplayDates(currentDate, view), [currentDate, view]);
  const selectedDaySchedules = selectedDayKey ? schedulesByDate[selectedDayKey] ?? [] : [];
  const selectedDayScopedSchedules = focusStaffId ? selectedDaySchedules.filter((schedule) => schedule.staffId === focusStaffId) : selectedDaySchedules;
  const selectedDayStats = {
    booked: getScheduleHours(selectedDayScopedSchedules, "booked"),
    free: getScheduleHours(selectedDayScopedSchedules, "free"),
    blocked: getScheduleHours(selectedDayScopedSchedules, "blocked")
  };
  const selectedCount = filteredTechnicians.length;
  const bookedHours = getScheduleHours(filteredSchedules, "booked");
  const freeHours = getScheduleHours(filteredSchedules, "free");
  const blockedHours = getScheduleHours(filteredSchedules, "blocked");
  const firstFreeSchedule = selectedDayScopedSchedules.find((schedule) => schedule.status === "free");
  const firstBookedSchedule = selectedDayScopedSchedules.find((schedule) => schedule.status === "booked");
  const firstFreeTechnician = firstFreeSchedule ? technicianMap.get(firstFreeSchedule.staffId) : undefined;
  const firstBookedTechnician = firstBookedSchedule ? technicianMap.get(firstBookedSchedule.staffId) : undefined;
  const focusTechnician = focusStaffId ? technicianMap.get(focusStaffId) : undefined;

  const jumpDate = (direction: -1 | 1) => {
    if (view === "day") {
      setCurrentDate((date) => addDays(date, direction));
      return;
    }

    if (view === "week") {
      setCurrentDate((date) => addDays(date, direction * 7));
      return;
    }

    setCurrentDate((date) => addMonths(date, direction));
  };

  const hideStaff = (staffId: string) => {
    setHiddenStaffIds((current) => (current.includes(staffId) ? current : [...current, staffId]));
  };

  const restoreStaff = (staffId: string) => {
    setHiddenStaffIds((current) => current.filter((id) => id !== staffId));
  };

  const updateSchedule = (scheduleId: string, changes: ScheduleEdit) => {
    setScheduleEdits((current) => ({
      ...current,
      [scheduleId]: {
        ...(current[scheduleId] ?? {}),
        ...changes
      }
    }));
  };

  const updateScheduleTime = (scheduleId: string, startMinutes: number, endMinutes: number) => {
    updateSchedule(scheduleId, {
      startTime: minutesToTime(startMinutes),
      endTime: minutesToTime(endMinutes)
    });
  };

  const updateBlockTime = (block: ScheduleBlock, mode: BlockInteractionMode, nextStartMinutes: number, nextEndMinutes: number) => {
    const blockSchedules = block.schedules;

    if (blockSchedules.length === 1) {
      updateScheduleTime(blockSchedules[0].id, nextStartMinutes, nextEndMinutes);
      return;
    }

    if (mode === "drag") {
      const originalStart = timeToMinutes(block.startTime);
      const delta = nextStartMinutes - originalStart;
      const firstStart = Math.min(...blockSchedules.map((schedule) => timeToMinutes(schedule.startTime)));
      const lastEnd = Math.max(...blockSchedules.map((schedule) => timeToMinutes(schedule.endTime)));
      const safeDelta = clamp(delta, -firstStart, 1440 - lastEnd);

      blockSchedules.forEach((schedule) => {
        updateScheduleTime(schedule.id, timeToMinutes(schedule.startTime) + safeDelta, timeToMinutes(schedule.endTime) + safeDelta);
      });
      return;
    }

    if (mode === "resize-start") {
      const firstSchedule = blockSchedules[0];
      updateScheduleTime(firstSchedule.id, clamp(nextStartMinutes, 0, timeToMinutes(firstSchedule.endTime) - 30), timeToMinutes(firstSchedule.endTime));
      return;
    }

    const lastSchedule = blockSchedules[blockSchedules.length - 1];
    updateScheduleTime(lastSchedule.id, timeToMinutes(lastSchedule.startTime), clamp(nextEndMinutes, timeToMinutes(lastSchedule.startTime) + 30, 1440));
  };

  const addSchedule = (staffId: string, date: string) => {
    setExtraSchedules((current) => [
      ...current,
      {
        id: `sch-draft-${staffId}-${date}-${current.length + 1}`,
        staffId,
        date,
        startTime: "10:00",
        endTime: "18:00",
        status: "free"
      }
    ]);
  };

  const openDayDetail = (dateKey: string, staffId?: string) => {
    setSelectedDayKey(dateKey);
    setFocusStaffId(staffId ?? null);
    setCurrentDate(parseDateKey(dateKey));
    setDayAssistantMode("schedule");
  };

  const handleScheduleClick = (schedule: Schedule) => {
    onScheduleClick?.(schedule);
  };

  const applySmartSchedule = (config: SmartScheduleConfig) => {
    const baseDate = selectedDayKey ? parseDateKey(selectedDayKey) : currentDate;
    const targetDates =
      config.cycle === "single"
        ? [formatDateKey(baseDate)]
        : Array.from({ length: config.repeatWeeks }, (_, index) => formatDateKey(addDays(baseDate, index * 7)));
    const knownSchedules = [...workingSchedules];
    const plannedSchedules: Schedule[] = [];
    const staffPool = filteredTechnicians;

    targetDates.forEach((dateKey, dateIndex) => {
      config.slots.forEach((slot, slotIndex) => {
        const safeMax = Math.max(slot.minStaff, slot.maxStaff);
        const targetCount = Math.min(safeMax, staffPool.length);
        const rotatedStaff = [...staffPool.slice((dateIndex + slotIndex) % Math.max(staffPool.length, 1)), ...staffPool.slice(0, (dateIndex + slotIndex) % Math.max(staffPool.length, 1))];
        const selectedStaff = rotatedStaff.filter((technician) => {
          if (plannedSchedules.filter((schedule) => schedule.staffId === technician.id && schedule.date === dateKey).length >= 4) {
            return false;
          }

          return !hasScheduleConflict([...knownSchedules, ...plannedSchedules], technician.id, dateKey, slot.startTime, slot.endTime);
        }).slice(0, targetCount);

        selectedStaff.forEach((technician, staffIndex) => {
          plannedSchedules.push({
            id: `sch-smart-${dateKey}-${slot.id}-${technician.id}-${dateIndex}-${slotIndex}-${staffIndex}`,
            staffId: technician.id,
            date: dateKey,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: "free"
          });
        });
      });
    });

    setExtraSchedules((current) => [...current, ...plannedSchedules.map((schedule, index) => ({ ...schedule, id: `${schedule.id}-${current.length + index + 1}` }))]);
    setCurrentDate(baseDate);
    setView(config.cycle === "single" ? "day" : "week");
    setSmartScheduleOpen(false);
  };

  return (
    <>
      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
        <header className="border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <ButtonLike onClick={() => setCurrentDate(parseDateKey(todayKey))}>今天</ButtonLike>
              <ButtonIcon label="上一段" onClick={() => jumpDate(-1)}>‹</ButtonIcon>
              <ButtonIcon label="下一段" onClick={() => jumpDate(1)}>›</ButtonIcon>
              <h2 className="min-w-[180px] text-xl font-black">{getCalendarTitle(currentDate, view)}</h2>
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
              <label className="relative min-w-[240px] max-w-sm flex-1 lg:flex-none">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35">⌕</span>
                <input
                  className="h-10 w-full rounded-full border border-line bg-white pl-10 pr-4 text-sm font-bold outline-none focus:border-moss"
                  onChange={(event) => setQuickQuery(event.target.value)}
                  placeholder="搜索技师 / 区域 / 技能"
                  value={quickQuery}
                />
              </label>
              {[
                ["预约", `${bookedHours}h`, statusSoftClassName.booked],
                ["空闲", `${freeHours}h`, statusSoftClassName.free],
                ["锁定", `${blockedHours}h`, statusSoftClassName.blocked]
              ].map(([label, value, className]) => (
                <span className={`rounded-full px-3 py-2 text-xs font-black ${className}`} key={label}>
                  {label} {value}
                </span>
              ))}
              {hiddenTechnicians.length > 0 ? (
                <span className="rounded-full border border-line bg-paper px-3 py-2 text-xs font-black text-ink/55">
                  已折叠 {hiddenTechnicians.length} 人
                </span>
              ) : null}
              <div className="flex rounded-full border border-line bg-paper p-1">
                {(["day", "week", "month"] as const).map((item) => (
                  <button
                    className={`focus-ring rounded-full px-4 py-2 text-xs font-black transition ${view === item ? "bg-ink text-white shadow-soft" : "text-ink/55 hover:bg-white"}`}
                    key={item}
                    onClick={() => setView(item)}
                    type="button"
                  >
                    {viewCopy[item]}
                  </button>
                ))}
              </div>
              <ButtonLike>新建排班</ButtonLike>
              <ButtonLike onClick={() => setSmartScheduleOpen(true)}>智能排班</ButtonLike>
            </div>
          </div>
          <p className="mt-2 text-xs font-bold text-ink/45">当前显示 {selectedCount} 名技师。点击行头的“折叠”可像 Excel 一样收起不想看的技师行，折叠头像会停在冻结技师列左侧，点击头像即可展开。</p>
        </header>

        <main className="min-w-0">
          {view === "day" ? (
            <DayStaffHourGrid
              currentDate={currentDate}
              hiddenTechnicians={hiddenTechnicians}
              onBlockTimeChange={updateBlockTime}
              onDayClick={openDayDetail}
              onHideStaff={hideStaff}
              onRestoreStaff={restoreStaff}
              onScheduleClick={handleScheduleClick}
              schedulesByStaffDate={schedulesByStaffDate}
              technicians={filteredTechnicians}
            />
          ) : (
            <StaffDateGrid
              dates={displayDates}
              hiddenTechnicians={hiddenTechnicians}
              onDayClick={openDayDetail}
              onHideStaff={hideStaff}
              onRestoreStaff={restoreStaff}
              schedulesByStaffDate={schedulesByStaffDate}
              technicians={filteredTechnicians}
              view={view}
            />
          )}
        </main>
      </section>

      <Drawer open={Boolean(selectedDayKey)} title={selectedDayKey ? `${formatDateLabel(selectedDayKey)}${focusTechnician ? ` · ${focusTechnician.name}` : ""} 排班详细` : "排班详细"} onClose={() => setSelectedDayKey(null)}>
        {selectedDayKey ? (
          <div className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-4">
              {[
                ["总排班", `${getScheduleHours(selectedDayScopedSchedules)}h`, "bg-ink text-white"],
                ["已预约", `${selectedDayStats.booked}h`, statusSoftClassName.booked],
                ["可排班", `${selectedDayStats.free}h`, statusSoftClassName.free],
                ["锁定", `${selectedDayStats.blocked}h`, statusSoftClassName.blocked]
              ].map(([label, value, className]) => (
                <article className={`rounded-lg px-3 py-3 ${className}`} key={label}>
                  <strong className="block text-xl">{value}</strong>
                  <span className="text-xs font-black">{label}</span>
                </article>
              ))}
            </section>

            <section className="rounded-lg border border-line bg-paper p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button className={dayAssistantMode === "schedule" ? "" : "bg-white text-ink hover:border-moss"} variant={dayAssistantMode === "schedule" ? "primary" : "secondary"} onClick={() => setDayAssistantMode("schedule")}>
                  智能排班
                </Button>
                <Button className={dayAssistantMode === "dispatch" ? "" : "bg-white text-ink hover:border-moss"} variant={dayAssistantMode === "dispatch" ? "primary" : "secondary"} onClick={() => setDayAssistantMode("dispatch")}>
                  智能派单
                </Button>
              </div>
              <div className="mt-3 rounded-lg bg-white p-4">
                {dayAssistantMode === "schedule" ? (
                  <div>
                    <h4 className="font-black">智能排班建议</h4>
                    <p className="mt-2 text-sm leading-6 text-ink/60">
                      系统会先合并连续空闲时段，再检查跨区移动、锁定冲突和高峰期缺口。
                      {firstFreeTechnician ? ` 当前最适合补排的是 ${firstFreeTechnician.name}，可覆盖 ${firstFreeTechnician.serviceAreas.slice(0, 2).join("、")}。` : " 当前没有空闲技师，可先释放锁定时段或开启跨店支援。"}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <Button size="sm" onClick={() => setSmartScheduleOpen(true)}>一键生成班表</Button>
                      <Button size="sm" variant="secondary" onClick={() => setSmartScheduleOpen(true)}>补齐高峰空档</Button>
                      <Button size="sm" variant="secondary">检查冲突</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-black">智能派单建议</h4>
                    <p className="mt-2 text-sm leading-6 text-ink/60">
                      系统会综合距离、技能、评分、接单率和是否连续服务来排序，优先派给当天空闲且移动时间最短的人。
                      {firstBookedTechnician ? ` 已预约时段可追踪 ${firstBookedTechnician.name} 的履约状态，并自动准备备选技师。` : " 当天暂无已预约订单，可先从区域派单池导入需求。"}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <Button size="sm">自动派单</Button>
                      <Button size="sm" variant="secondary">查看备选技师</Button>
                      <Button size="sm" variant="secondary">发送确认消息</Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <EditableScheduleList
              focusStaffId={focusStaffId}
              onAddSchedule={addSchedule}
              onScheduleChange={updateSchedule}
              schedulesByStaffDate={schedulesByStaffDate}
              selectedDayKey={selectedDayKey}
              technicians={filteredTechnicians}
            />

            <DayDetailMatrix
              focusStaffId={focusStaffId}
              onScheduleClick={handleScheduleClick}
              schedulesByStaffDate={schedulesByStaffDate}
              selectedDayKey={selectedDayKey}
              technicians={filteredTechnicians}
            />
          </div>
        ) : null}
      </Drawer>
      <SmartScheduleModal
        baseDate={selectedDayKey ? parseDateKey(selectedDayKey) : currentDate}
        onApply={applySmartSchedule}
        onClose={() => setSmartScheduleOpen(false)}
        open={smartScheduleOpen}
        technicianCount={filteredTechnicians.length}
      />
    </>
  );
}

function HiddenTechnicianRail({
  technicians,
  onRestore
}: {
  technicians: Technician[];
  onRestore: (staffId: string) => void;
}) {
  if (technicians.length === 0) {
    return null;
  }

  return (
    <div className="absolute left-3 top-12 z-40 flex max-h-[430px] w-10 flex-col items-center gap-2 overflow-y-auto py-1">
      {technicians.map((technician) => (
        <button
          className="focus-ring group relative h-9 w-9 shrink-0 rounded-full border-2 border-line bg-paper p-0.5 shadow-panel transition hover:border-moss hover:shadow-soft"
          key={technician.id}
          onClick={() => onRestore(technician.id)}
          title={`展开 ${technician.name}`}
          type="button"
        >
          <img alt={technician.name} className="h-full w-full rounded-full object-cover" src={technician.avatar} />
          <span className="sr-only">展开 {technician.name}</span>
          <span className="pointer-events-none absolute left-10 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-line bg-white px-2 py-1 text-[11px] font-black text-ink shadow-panel group-hover:block">
            展开 {technician.name}
          </span>
        </button>
      ))}
    </div>
  );
}

function CollapseStaffButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="focus-ring ml-auto h-9 shrink-0 whitespace-nowrap rounded-full border border-line bg-paper px-3 text-xs font-black text-ink/55 transition hover:border-moss hover:text-moss"
      onClick={onClick}
      type="button"
    >
      折叠
    </button>
  );
}

function StaffDateGrid({
  dates,
  technicians,
  schedulesByStaffDate,
  view,
  onDayClick,
  onHideStaff,
  hiddenTechnicians,
  onRestoreStaff
}: {
  dates: Date[];
  technicians: Technician[];
  schedulesByStaffDate: Record<string, Record<string, Schedule[]>>;
  view: "week" | "month";
  onDayClick: (dateKey: string, staffId?: string) => void;
  onHideStaff: (staffId: string) => void;
  hiddenTechnicians: Technician[];
  onRestoreStaff: (staffId: string) => void;
}) {
  const dateColumnWidth = view === "month" ? "104px" : "minmax(150px, 1fr)";
  const hasFoldedStaff = hiddenTechnicians.length > 0;
  const frozenColumnWidth = hasFoldedStaff ? 260 : 220;

  return (
    <div className="overflow-auto">
      <div className="grid min-w-max" style={{ gridTemplateColumns: `${frozenColumnWidth}px repeat(${dates.length}, ${dateColumnWidth})` }}>
        <div className={`sticky left-0 z-20 overflow-visible border-b border-r border-line bg-paper py-3 pr-4 text-xs font-black text-ink/45 ${hasFoldedStaff ? "pl-16" : "pl-4"}`}>
          <HiddenTechnicianRail technicians={hiddenTechnicians} onRestore={onRestoreStaff} />
          技师 / 日期
        </div>
        {dates.map((date) => {
          const dateKey = formatDateKey(date);
          const activeTechnicianCount = technicians.filter((technician) => (schedulesByStaffDate[technician.id]?.[dateKey] ?? []).length > 0).length;

          return (
            <button
              className={`focus-ring border-b border-r border-line bg-paper px-3 py-3 text-center transition hover:bg-white ${dateKey === todayKey ? "text-moss" : "text-ink/65"}`}
              key={dateKey}
              onClick={() => onDayClick(dateKey)}
              type="button"
            >
              <span className="block text-xs font-black">{weekdayLabels[date.getDay()]}</span>
              <span className="mt-1 block text-lg font-black">{date.getDate()}</span>
              {activeTechnicianCount > 0 ? <span className="mt-1 block text-[10px] font-black text-ink/40">{activeTechnicianCount}人</span> : null}
            </button>
          );
        })}

        {technicians.map((technician) => (
          <StaffDateRow
            dates={dates}
            key={technician.id}
            onDayClick={onDayClick}
            onHideStaff={onHideStaff}
            hasFoldedStaff={hasFoldedStaff}
            schedulesByStaffDate={schedulesByStaffDate}
            technician={technician}
          />
        ))}
      </div>
    </div>
  );
}

function StaffDateRow({
  technician,
  dates,
  schedulesByStaffDate,
  onDayClick,
  onHideStaff,
  hasFoldedStaff
}: {
  technician: Technician;
  dates: Date[];
  schedulesByStaffDate: Record<string, Record<string, Schedule[]>>;
  onDayClick: (dateKey: string, staffId?: string) => void;
  onHideStaff: (staffId: string) => void;
  hasFoldedStaff: boolean;
}) {
  return (
    <>
      <div className={`sticky left-0 z-10 flex min-h-[74px] items-center gap-3 border-b border-r border-line bg-white py-3 pr-4 ${hasFoldedStaff ? "pl-16" : "pl-4"}`}>
        <img alt={technician.name} className="h-10 w-10 rounded-full object-cover" src={technician.avatar} />
        <span className="min-w-0">
          <strong className="block truncate text-sm">{technician.name}</strong>
          <span className="block truncate text-xs text-ink/45">{technician.skills.slice(0, 2).join("、")}</span>
        </span>
        <CollapseStaffButton onClick={() => onHideStaff(technician.id)} />
      </div>
      {dates.map((date) => {
        const dateKey = formatDateKey(date);
        const daySchedules = schedulesByStaffDate[technician.id]?.[dateKey] ?? [];
        const blocks = getScheduleBlocks(daySchedules);
        const totalHours = getScheduleHours(daySchedules);
        const bookedHours = getScheduleHours(daySchedules, "booked");
        const freeHours = getScheduleHours(daySchedules, "free");

        return (
          <button
            className="focus-ring min-h-[74px] border-b border-r border-line bg-white p-2 text-left transition hover:bg-paper/65"
            key={`${technician.id}-${dateKey}`}
            onClick={() => onDayClick(dateKey, technician.id)}
            type="button"
          >
            {daySchedules.length > 0 ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm text-ink">{totalHours}h</strong>
                  <span className="text-[11px] font-black text-ink/45">{daySchedules.length}段</span>
                </div>
                <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-paper">
                  {blocks.map((block) => (
                    <span
                      className={`absolute top-0 h-full rounded-full ${statusBarClassName[block.status]}`}
                      key={block.id}
                      style={getTimelineStyle(block)}
                      title={`${statusCopy[block.status]} ${block.startTime}-${block.endTime}`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {bookedHours > 0 ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${statusSoftClassName.booked}`}>约 {bookedHours}h</span> : null}
                  {freeHours > 0 ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${statusSoftClassName.free}`}>空 {freeHours}h</span> : null}
                </div>
              </>
            ) : (
              <span className="grid h-full min-h-[54px] place-items-center rounded-md border border-dashed border-line text-xs font-black text-ink/30">
                未排
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}

function DayStaffHourGrid({
  currentDate,
  technicians,
  schedulesByStaffDate,
  onDayClick,
  onScheduleClick,
  onHideStaff,
  onBlockTimeChange,
  hiddenTechnicians,
  onRestoreStaff
}: {
  currentDate: Date;
  technicians: Technician[];
  schedulesByStaffDate: Record<string, Record<string, Schedule[]>>;
  onDayClick: (dateKey: string, staffId?: string) => void;
  onScheduleClick: (schedule: Schedule) => void;
  onHideStaff: (staffId: string) => void;
  onBlockTimeChange: (block: ScheduleBlock, mode: BlockInteractionMode, nextStartMinutes: number, nextEndMinutes: number) => void;
  hiddenTechnicians: Technician[];
  onRestoreStaff: (staffId: string) => void;
}) {
  const dateKey = formatDateKey(currentDate);
  const hasFoldedStaff = hiddenTechnicians.length > 0;
  const frozenColumnWidth = hasFoldedStaff ? 260 : 220;

  return (
    <div className="overflow-auto">
      <div className="grid min-w-[1680px]" style={{ gridTemplateColumns: `${frozenColumnWidth}px repeat(24, minmax(58px, 1fr))` }}>
        <div className={`sticky left-0 z-20 overflow-visible border-b border-r border-line bg-paper py-3 pr-4 text-xs font-black text-ink/45 ${hasFoldedStaff ? "pl-16" : "pl-4"}`}>
          <HiddenTechnicianRail technicians={hiddenTechnicians} onRestore={onRestoreStaff} />
          技师 / 24小时
        </div>
        {hours.map((hour) => (
          <div className="border-b border-r border-line bg-paper px-2 py-3 text-center text-[11px] font-black text-ink/45" key={hour}>
            {formatHour(hour)}
          </div>
        ))}

        {technicians.map((technician) => {
          const daySchedules = schedulesByStaffDate[technician.id]?.[dateKey] ?? [];
          const blocks = getScheduleBlocks(daySchedules);

          return (
            <DayStaffHourRow
              blocks={blocks}
              dateKey={dateKey}
              key={technician.id}
              onBlockTimeChange={onBlockTimeChange}
              onDayClick={onDayClick}
              onHideStaff={onHideStaff}
              onScheduleClick={onScheduleClick}
              hasFoldedStaff={hasFoldedStaff}
              technician={technician}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayStaffHourRow({
  technician,
  dateKey,
  blocks,
  onDayClick,
  onScheduleClick,
  onHideStaff,
  onBlockTimeChange,
  hasFoldedStaff
}: {
  technician: Technician;
  dateKey: string;
  blocks: ScheduleBlock[];
  onDayClick: (dateKey: string, staffId?: string) => void;
  onScheduleClick: (schedule: Schedule) => void;
  onHideStaff: (staffId: string) => void;
  onBlockTimeChange: (block: ScheduleBlock, mode: BlockInteractionMode, nextStartMinutes: number, nextEndMinutes: number) => void;
  hasFoldedStaff: boolean;
}) {
  const startBlockInteraction = (event: ReactPointerEvent<HTMLElement>, block: ScheduleBlock, mode: BlockInteractionMode) => {
    event.preventDefault();
    event.stopPropagation();

    const timeline = (event.currentTarget as HTMLElement).closest("[data-schedule-timeline]") as HTMLElement | null;

    if (!timeline) {
      return;
    }

    const rect = timeline.getBoundingClientRect();
    const originalStart = timeToMinutes(block.startTime);
    const originalEnd = timeToMinutes(block.endTime);
    const originalDuration = originalEnd - originalStart;
    const startX = event.clientX;
    let moved = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaMinutes = snapMinutes(((moveEvent.clientX - startX) / rect.width) * 1440);

      if (Math.abs(deltaMinutes) >= 30) {
        moved = true;
      }

      if (mode === "drag") {
        const nextStart = clamp(snapMinutes(originalStart + deltaMinutes), 0, 1440 - originalDuration);
        onBlockTimeChange(block, mode, nextStart, nextStart + originalDuration);
        return;
      }

      if (mode === "resize-start") {
        const nextStart = clamp(snapMinutes(originalStart + deltaMinutes), 0, originalEnd - 30);
        onBlockTimeChange(block, mode, nextStart, originalEnd);
        return;
      }

      const nextEnd = clamp(snapMinutes(originalEnd + deltaMinutes), originalStart + 30, 1440);
      onBlockTimeChange(block, mode, originalStart, nextEnd);
    };

    const stopInteraction = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopInteraction);

      if (!moved && mode === "drag") {
        onScheduleClick(block.schedules[0]);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopInteraction);
  };

  return (
    <>
      <div className={`sticky left-0 z-10 flex min-h-[72px] items-center gap-3 border-b border-r border-line bg-white py-3 pr-4 ${hasFoldedStaff ? "pl-16" : "pl-4"}`}>
        <button className="focus-ring flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => onDayClick(dateKey, technician.id)} type="button">
          <img alt={technician.name} className="h-10 w-10 rounded-full object-cover" src={technician.avatar} />
          <span className="min-w-0">
            <strong className="block truncate text-sm">{technician.name}</strong>
            <span className="block truncate text-xs text-ink/45">{getScheduleHours(blocks.flatMap((block) => block.schedules))}h 已排</span>
          </span>
        </button>
        <CollapseStaffButton onClick={() => onHideStaff(technician.id)} />
      </div>
      <div
        className="relative grid min-h-[72px] border-b border-line bg-white"
        data-schedule-timeline
        style={{ gridColumn: "span 24", gridTemplateColumns: "repeat(24, minmax(58px, 1fr))" }}
      >
        {hours.map((hour) => (
          <button
            aria-label={`${technician.name} ${dateKey} ${formatHour(hour)}`}
            className="border-r border-line/80 transition hover:bg-paper/50"
            key={hour}
            onClick={() => onDayClick(dateKey, technician.id)}
            type="button"
          />
        ))}
        {blocks.map((block) => (
          <button
            className={`focus-ring group relative z-10 m-2 cursor-grab overflow-hidden rounded-md border px-3 py-2 text-left text-xs font-black shadow-panel active:cursor-grabbing ${statusCellClassName[block.status]}`}
            key={block.id}
            onClick={(event) => {
              event.stopPropagation();
              onScheduleClick(block.schedules[0]);
            }}
            onPointerDown={(event) => startBlockInteraction(event, block, "drag")}
            style={{ gridColumn: getBlockGridPlacement(block), gridRow: "1" }}
            type="button"
          >
            <span
              aria-label="向左拉伸"
              className="absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-current opacity-20 transition group-hover:opacity-40"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => startBlockInteraction(event, block, "resize-start")}
              role="button"
              tabIndex={-1}
            />
            <span className="block truncate">{block.startTime}-{block.endTime}</span>
            <span className="block truncate font-bold opacity-75">{statusCopy[block.status]}{block.orderIds[0] ? ` · ${block.orderIds[0]}` : ""}</span>
            <span
              aria-label="向右拉伸"
              className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-current opacity-20 transition group-hover:opacity-40"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => startBlockInteraction(event, block, "resize-end")}
              role="button"
              tabIndex={-1}
            />
          </button>
        ))}
      </div>
    </>
  );
}

function EditableScheduleList({
  selectedDayKey,
  technicians,
  schedulesByStaffDate,
  focusStaffId,
  onScheduleChange,
  onAddSchedule
}: {
  selectedDayKey: string;
  technicians: Technician[];
  schedulesByStaffDate: Record<string, Record<string, Schedule[]>>;
  focusStaffId: string | null;
  onScheduleChange: (scheduleId: string, changes: ScheduleEdit) => void;
  onAddSchedule: (staffId: string, date: string) => void;
}) {
  const targetTechnicians = focusStaffId ? technicians.filter((technician) => technician.id === focusStaffId) : technicians;
  const canEditFuture = selectedDayKey >= todayKey;

  const shiftSchedule = (schedule: Schedule, deltaMinutes: number) => {
    const duration = scheduleDurationMinutes(schedule);
    const nextStart = clamp(timeToMinutes(schedule.startTime) + deltaMinutes, 0, 1440 - duration);

    onScheduleChange(schedule.id, {
      startTime: minutesToTime(nextStart),
      endTime: minutesToTime(nextStart + duration)
    });
  };

  const extendSchedule = (schedule: Schedule, deltaMinutes: number) => {
    onScheduleChange(schedule.id, {
      endTime: minutesToTime(clamp(timeToMinutes(schedule.endTime) + deltaMinutes, timeToMinutes(schedule.startTime) + 30, 1440))
    });
  };

  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black">{focusStaffId ? "该技师当日排班编辑" : "当天排班编辑"}</h3>
          <p className="mt-1 text-sm text-ink/55">未来日期可以直接修改开始时间、结束时间和状态；日视图里也可以拖动或拉伸时间条。</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${canEditFuture ? statusSoftClassName.free : statusSoftClassName.blocked}`}>
          {canEditFuture ? "可修改未来排班" : "历史记录只读"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {targetTechnicians.map((technician) => {
          const schedules = schedulesByStaffDate[technician.id]?.[selectedDayKey] ?? [];

          return (
            <article className="rounded-lg border border-line bg-paper p-3" key={technician.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img alt={technician.name} className="h-10 w-10 rounded-full object-cover" src={technician.avatar} />
                  <div>
                    <strong className="block">{technician.name}</strong>
                    <span className="text-xs font-bold text-ink/45">{getScheduleHours(schedules)}h 已排 · {technician.serviceAreas.slice(0, 2).join(" / ")}</span>
                  </div>
                </div>
                <Button disabled={!canEditFuture} size="sm" variant="secondary" onClick={() => onAddSchedule(technician.id, selectedDayKey)}>
                  新增空闲时段
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {schedules.length > 0 ? (
                  schedules.map((schedule) => (
                    <div className="grid gap-2 rounded-lg border border-line bg-white p-3 md:grid-cols-[1fr,1fr,1fr,auto]" key={schedule.id}>
                      <label className="text-xs font-black text-ink/50">
                        开始
                        <input
                          className="mt-1 h-9 w-full rounded-md border border-line bg-paper px-3 text-sm font-black text-ink outline-none focus:border-moss"
                          disabled={!canEditFuture}
                          onChange={(event) => onScheduleChange(schedule.id, { startTime: event.target.value })}
                          value={schedule.startTime}
                        />
                      </label>
                      <label className="text-xs font-black text-ink/50">
                        结束
                        <input
                          className="mt-1 h-9 w-full rounded-md border border-line bg-paper px-3 text-sm font-black text-ink outline-none focus:border-moss"
                          disabled={!canEditFuture}
                          onChange={(event) => onScheduleChange(schedule.id, { endTime: event.target.value })}
                          value={schedule.endTime}
                        />
                      </label>
                      <label className="text-xs font-black text-ink/50">
                        状态
                        <select
                          className="mt-1 h-9 w-full rounded-md border border-line bg-paper px-3 text-sm font-black text-ink outline-none focus:border-moss"
                          disabled={!canEditFuture}
                          onChange={(event) => onScheduleChange(schedule.id, { status: event.target.value as Schedule["status"] })}
                          value={schedule.status}
                        >
                          <option value="free">空闲</option>
                          <option value="booked">已预约</option>
                          <option value="blocked">锁定</option>
                        </select>
                      </label>
                      <div className="flex flex-wrap items-end gap-2">
                        <Button disabled={!canEditFuture} size="sm" variant="secondary" onClick={() => shiftSchedule(schedule, -30)}>
                          前移
                        </Button>
                        <Button disabled={!canEditFuture} size="sm" variant="secondary" onClick={() => shiftSchedule(schedule, 30)}>
                          后移
                        </Button>
                        <Button disabled={!canEditFuture} size="sm" variant="secondary" onClick={() => extendSchedule(schedule, 30)}>
                          延长
                        </Button>
                      </div>
                      <p className="md:col-span-4 text-xs font-bold text-ink/45">
                        {statusCopy[schedule.status]}{schedule.orderId ? ` · 绑定订单 ${schedule.orderId}` : " · 未绑定订单"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-line bg-white p-4 text-sm font-bold text-ink/45">
                    这一天还没有排班。可以新增一个空闲时段，再由智能排班或店长继续调整。
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DayDetailMatrix({
  selectedDayKey,
  technicians,
  schedulesByStaffDate,
  focusStaffId,
  onScheduleClick
}: {
  selectedDayKey: string;
  technicians: Technician[];
  schedulesByStaffDate: Record<string, Record<string, Schedule[]>>;
  focusStaffId: string | null;
  onScheduleClick: (schedule: Schedule) => void;
}) {
  const visibleTechnicians = focusStaffId ? technicians.filter((technician) => technician.id === focusStaffId) : technicians;
  const detailGridHeight = hours.length * 56;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-black">当天 24 小时明细</h3>
          <p className="mt-1 text-sm text-ink/55">横向是技师和当天工作时间，纵向是 0-23 点。连续空闲或预约会合并成长色块。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["booked", "free", "blocked"] as const).map((status) => (
            <span className={`rounded-full px-3 py-1 text-xs font-black ${statusSoftClassName[status]}`} key={status}>
              {statusCopy[status]}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 overflow-auto rounded-lg border border-line">
        <div className="grid min-w-[980px]" style={{ gridTemplateColumns: `88px repeat(${visibleTechnicians.length}, minmax(160px, 1fr))` }}>
          <div className="sticky left-0 z-20 border-b border-r border-line bg-paper px-3 py-3 text-xs font-black text-ink/45">
            时间
          </div>
          {visibleTechnicians.map((technician) => {
            const daySchedules = schedulesByStaffDate[technician.id]?.[selectedDayKey] ?? [];

            return (
              <div className={`border-b border-r border-line bg-paper px-3 py-3 ${focusStaffId === technician.id ? "admin-schedule-focus" : ""}`} key={technician.id}>
                <div className="flex items-center gap-2">
                  <img alt={technician.name} className="h-8 w-8 rounded-full object-cover" src={technician.avatar} />
                  <span className="min-w-0">
                    <strong className="block truncate text-sm">{technician.name}</strong>
                    <span className="block truncate text-[11px] text-ink/45">{getScheduleHours(daySchedules)}h 已排</span>
                  </span>
                </div>
              </div>
            );
          })}

          <div className="sticky left-0 z-10 border-r border-line bg-white" style={{ height: detailGridHeight }}>
            {hours.map((hour) => (
              <div className="flex h-14 items-start justify-end border-b border-line px-3 py-2 text-xs font-black text-ink/45" key={hour}>
                {formatHour(hour)}
              </div>
            ))}
          </div>
          {visibleTechnicians.map((technician) => {
            const daySchedules = schedulesByStaffDate[technician.id]?.[selectedDayKey] ?? [];
            const blocks = getScheduleBlocks(daySchedules);

            return (
              <div className="relative border-r border-line bg-white" key={`${technician.id}-timeline`} style={{ height: detailGridHeight }}>
                {hours.map((hour) => (
                  <button
                    aria-label={`${technician.name} ${selectedDayKey} ${formatHour(hour)}`}
                    className="absolute left-0 right-0 border-t border-line/80 transition hover:bg-paper/50"
                    key={`${technician.id}-${hour}`}
                    style={{ top: `${(hour / 24) * 100}%`, height: `${100 / 24}%` }}
                    type="button"
                  />
                ))}
                {blocks.map((block) => (
                  <button
                    className={`focus-ring absolute left-2 right-2 z-10 overflow-hidden rounded-md border px-3 py-2 text-left text-xs font-black shadow-panel ${statusCellClassName[block.status]}`}
                    key={block.id}
                    onClick={() => onScheduleClick(block.schedules[0])}
                    style={getVerticalTimelineStyle(block)}
                    type="button"
                  >
                    <span className="block truncate">{block.startTime}-{block.endTime}</span>
                    <span className="block truncate font-bold opacity-75">{statusCopy[block.status]}{block.orderIds[0] ? ` · ${block.orderIds[0]}` : ""}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ButtonLike({ children, onClick }: { children: string; onClick?: () => void }) {
  return (
    <button className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-xs font-black text-ink/65 transition hover:border-moss hover:text-moss" onClick={onClick} type="button">
      {children}
    </button>
  );
}

function ButtonIcon({ children, label, onClick }: { children: string; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-xl font-black text-ink/65 transition hover:border-moss hover:text-moss" onClick={onClick} type="button">
      {children}
    </button>
  );
}
